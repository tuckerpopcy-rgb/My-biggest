import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import {
  AppNotification,
  AppSettings,
  CloudVideo,
  Comment,
  Conversation,
  DeveloperProfile,
  LanguageCode,
  Listing,
  ListingCategory,
  Message,
  Post,
  ProfileDraft,
  QuizResult,
  SavedItem,
  User,
} from '../lib/types';
import { hashPassword, now, uid, verifyPassword } from '../lib/hash';
import {
  Database,
  DEFAULT_SETTINGS,
  getDB,
  initDB,
  mutate,
  subscribe,
} from '../lib/database';
import { getPalette, Palette } from '../lib/theme';
import { t as translate } from '../lib/i18n';
import { haptic, loadSounds, playClick, playNotify, playSuccess } from '../lib/sounds';
import { pickOneQuiz } from '../lib/quiz';
import { loadSupabaseCfg, uploadSalonMedia } from '../lib/supabase';

interface AuthResult {
  ok: boolean;
  error?: string;
  user?: User;
}

interface AppContextValue {
  ready: boolean;
  db: Database;
  user: User | null;
  users: User[];
  posts: Post[];
  listings: Listing[];
  conversations: Conversation[];
  messages: Message[];
  notifications: AppNotification[];
  follows: Database['follows'];
  settings: AppSettings;
  developer: DeveloperProfile;
  tutorialSeen: boolean;
  palette: Palette;
  dark: boolean;
  lang: LanguageCode;
  t: (key: string) => string;
  tap: () => void;
  buzz: (style?: 'light' | 'medium' | 'success' | 'warning') => void;
  register: (input: {
    username: string;
    email: string;
    password: string;
    displayName: string;
    location: string;
    tribe: string;
    phone: string;
  }) => Promise<AuthResult>;
  login: (usernameOrEmail: string, password: string) => Promise<AuthResult>;
  developerLogin: (passcode: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<User>) => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  markTutorialSeen: () => Promise<void>;
  createPost: (content: string, image?: string | null) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  createListing: (input: {
    title: string;
    description: string;
    price: number;
    category: ListingCategory;
    location: string;
    image?: string | null;
  }) => Promise<void>;
  markListingSold: (id: string) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  followUser: (targetId: string) => Promise<void>;
  isFollowing: (targetId: string) => boolean;
  followerCount: (userId: string) => number;
  followingCount: (userId: string) => number;
  openConversation: (otherId: string) => Promise<string>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  sendQuizMessage: (conversationId: string) => Promise<void>;
  markConversationRead: (conversationId: string) => Promise<void>;
  unreadCount: () => number;
  markNotificationsRead: () => Promise<void>;
  saveQuizResult: (score: number, total: number, category: string) => Promise<void>;
  updateDeveloper: (patch: Partial<DeveloperProfile>) => Promise<void>;
  getUser: (id: string) => User | undefined;
  saveProfile: (draft: ProfileDraft) => Promise<void>;
  createMediaPost: (input: {
    content: string;
    image?: string | null;
    video?: string | null;
  }) => Promise<void>;
  activatePremium: (plan: 'monthly' | 'yearly' | 'founder') => Promise<void>;
  isPremium: (userId?: string) => boolean;
  toggleSavePost: (postId: string) => Promise<void>;
  isSaved: (postId: string) => boolean;
  savedPosts: Post[];
  videos: CloudVideo[];
  boostPost: (postId: string) => Promise<boolean>;
  boostListing: (listingId: string) => Promise<boolean>;
  cloudReady: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

function publicUser(u: User): User {
  return { ...u };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [ready, setReady] = useState(false);
  const [db, setDb] = useState<Database>(getDB());
  const [cloudReady, setCloudReady] = useState(false);
  const tick = useRef(0);

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      await initDB();
      await loadSupabaseCfg();
      await loadSounds();
      setDb({ ...getDB() });
      setCloudReady(true);
      setReady(true);
      unsub = subscribe(() => {
        tick.current += 1;
        setDb({ ...getDB() });
      });
    })();
    return () => unsub();
  }, []);

  const settings = db.settings || DEFAULT_SETTINGS;
  const dark =
    settings.themeMode === 'system' ? system === 'dark' : settings.themeMode === 'dark';
  const palette = useMemo(
    () => getPalette(dark, settings.accent),
    [dark, settings.accent]
  );
  const lang = settings.language;
  const t = useCallback((key: string) => translate(lang, key), [lang]);

  const user = useMemo(() => {
    if (!db.session) return null;
    return db.users.find((u) => u.id === db.session?.userId) || null;
  }, [db.session, db.users]);

  const tap = useCallback(() => {
    playClick(settings.clickSounds);
    haptic(settings.haptics, 'light');
  }, [settings.clickSounds, settings.haptics]);

  const buzz = useCallback(
    (style: 'light' | 'medium' | 'success' | 'warning' = 'medium') => {
      haptic(settings.haptics, style);
      if (style === 'success') playSuccess(settings.clickSounds);
    },
    [settings.haptics, settings.clickSounds]
  );

  const pushNotif = async (
    userId: string,
    type: AppNotification['type'],
    title: string,
    body: string,
    relatedId?: string
  ) => {
    if (!settings.notifications) return;
    await mutate((d) => {
      d.notifications.unshift({
        id: uid('ntf'),
        userId,
        type,
        title,
        body,
        read: false,
        createdAt: now(),
        relatedId,
      });
    });
    playNotify(settings.clickSounds);
    haptic(settings.haptics, 'medium');
  };

  const register = useCallback(
    async (input: {
      username: string;
      email: string;
      password: string;
      displayName: string;
      location: string;
      tribe: string;
      phone: string;
    }): Promise<AuthResult> => {
      const username = input.username.trim().toLowerCase();
      const email = input.email.trim().toLowerCase();
      if (!username || !email || !input.password || !input.displayName.trim()) {
        return { ok: false, error: t('fillAll') };
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { ok: false, error: t('invalidEmail') };
      }
      if (input.password.length < 6) {
        return { ok: false, error: t('weakPassword') };
      }
      const exists = getDB().users.some(
        (u) => u.username === username || u.email === email
      );
      if (exists) return { ok: false, error: t('userExists') };

      const nu: User = {
        id: uid('usr'),
        username,
        email,
        passwordHash: hashPassword(input.password),
        displayName: input.displayName.trim(),
        bio: '',
        avatar: null,
        coverImage: null,
        introVideo: null,
        location: input.location.trim() || 'Sierra Leone',
        tribe: input.tribe.trim() || '',
        language: lang,
        createdAt: now(),
        isDeveloper: false,
        isPremium: false,
        premiumUntil: null,
        verified: false,
        lastSeen: now(),
        phone: input.phone.trim(),
      };
      await mutate((d) => {
        d.users.push(nu);
        d.session = { userId: nu.id, issuedAt: now() };
        d.settings.language = lang;
        d.notifications.unshift({
          id: uid('ntf'),
          userId: nu.id,
          type: 'system',
          title: 'Salone Na We Yon',
          body: t('accountCreated'),
          read: false,
          createdAt: now(),
        });
      });
      buzz('success');
      return { ok: true, user: nu };
    },
    [lang, t, buzz]
  );

  const login = useCallback(
    async (usernameOrEmail: string, password: string): Promise<AuthResult> => {
      const key = usernameOrEmail.trim().toLowerCase();
      if (!key || !password) return { ok: false, error: t('fillAll') };
      const found = getDB().users.find(
        (u) => u.username === key || u.email === key
      );
      if (!found || !verifyPassword(password, found.passwordHash)) {
        buzz('warning');
        return { ok: false, error: t('invalidLogin') };
      }
      await mutate((d) => {
        d.session = { userId: found.id, issuedAt: now() };
        const u = d.users.find((x) => x.id === found.id);
        if (u) u.lastSeen = now();
      });
      buzz('success');
      return { ok: true, user: found };
    },
    [t, buzz]
  );

  const developerLogin = useCallback(
    async (passcode: string): Promise<AuthResult> => {
      if (passcode.trim() !== '8426') {
        buzz('warning');
        return { ok: false, error: 'That code is not valid.' };
      }
      const DEV_EMAIL = 'henry.tucker@salonenaweyon.sl';
      const DEV_USERNAME = 'henrytucker';
      let henry = getDB().users.find(
        (u) => u.isDeveloper || u.username === DEV_USERNAME || u.email === DEV_EMAIL
      );
      if (!henry) {
        henry = {
          id: uid('usr'),
          username: DEV_USERNAME,
          email: DEV_EMAIL,
          passwordHash: hashPassword(`ht-dev-seat-${Date.now()}-8426`),
          displayName: 'Henry Tucker',
          bio: 'Founder & builder of Salone Na We Yon. Designing a digital home for every tribe of Sierra Leone.',
          avatar: getDB().developer.image,
          coverImage: null,
          introVideo: null,
          location: 'Freetown, Sierra Leone',
          tribe: 'Krio',
          language: lang,
          createdAt: now(),
          isDeveloper: true,
          isPremium: true,
          premiumUntil: now() + 1000 * 60 * 60 * 24 * 365 * 20,
          verified: true,
          lastSeen: now(),
          phone: '',
        };
        await mutate((d) => {
          d.users.push(henry as User);
          d.session = { userId: (henry as User).id, issuedAt: now() };
          d.notifications.unshift({
            id: uid('ntf'),
            userId: (henry as User).id,
            type: 'system',
            title: 'Developer seat',
            body: 'Welcome back, Henry. Your photo and tools are live across the platform.',
            read: false,
            createdAt: now(),
          });
        });
      } else {
        const hid = henry.id;
        await mutate((d) => {
          const u = d.users.find((x) => x.id === hid);
          if (u) {
            u.isDeveloper = true;
            u.isPremium = true;
            u.verified = true;
            u.premiumUntil = now() + 1000 * 60 * 60 * 24 * 365 * 20;
            u.displayName = u.displayName || 'Henry Tucker';
            u.lastSeen = now();
            if (d.developer.image && !u.avatar) u.avatar = d.developer.image;
          }
          d.session = { userId: hid, issuedAt: now() };
        });
      }
      buzz('success');
      return { ok: true, user: henry };
    },
    [lang, buzz]
  );

  const logout = useCallback(async () => {
    tap();
    await mutate((d) => {
      d.session = null;
    });
  }, [tap]);

  const updateProfile = useCallback(async (patch: Partial<User>) => {
    if (!user) return;
    await mutate((d) => {
      const u = d.users.find((x) => x.id === user.id);
      if (!u) return;
      Object.assign(u, patch, { lastSeen: now() });
    });
  }, [user]);

  const updateSettings = useCallback(async (patch: Partial<AppSettings>) => {
    await mutate((d) => {
      d.settings = { ...d.settings, ...patch };
      if (user && patch.language) {
        const u = d.users.find((x) => x.id === user.id);
        if (u) u.language = patch.language;
      }
    });
  }, [user]);

  const markTutorialSeen = useCallback(async () => {
    await mutate((d) => {
      d.tutorialSeen = true;
    });
  }, []);

  const createPost = useCallback(
    async (content: string, image?: string | null) => {
      await createMediaPost({ content, image: image || null, video: null });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  );

  const createMediaPost = useCallback(
    async (input: { content: string; image?: string | null; video?: string | null }) => {
      if (!user) return;
      const text = (input.content || '').trim();
      if (!text && !input.image && !input.video) return;
      let image = input.image || null;
      let video = input.video || null;
      let mediaPath: string | null = null;
      if (video) {
        const up = await uploadSalonMedia(user.id, video, 'video');
        video = up.url;
        mediaPath = up.path;
      } else if (image) {
        const up = await uploadSalonMedia(user.id, image, 'image');
        image = up.url;
        mediaPath = up.path;
      }
      const postId = uid('pst');
      await mutate((d) => {
        d.posts.unshift({
          id: postId,
          userId: user.id,
          content: text,
          image,
          video,
          mediaPath,
          likes: [],
          comments: [],
          createdAt: now(),
          boosted: false,
        });
        if (video) {
          d.videos.unshift({
            id: uid('vid'),
            userId: user.id,
            postId,
            path: mediaPath || '',
            publicUrl: video,
            caption: text,
            createdAt: now(),
          });
        }
      });
      buzz('success');
    },
    [user, buzz]
  );

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!user) return;
      tap();
      let notifyId: string | null = null;
      await mutate((d) => {
        const p = d.posts.find((x) => x.id === postId);
        if (!p) return;
        const i = p.likes.indexOf(user.id);
        if (i >= 0) p.likes.splice(i, 1);
        else {
          p.likes.push(user.id);
          if (p.userId !== user.id) {
            const author = d.users.find((u) => u.id === p.userId);
            if (author) notifyId = author.id;
          }
        }
      });
      if (notifyId) {
        await pushNotif(
          notifyId,
          'like',
          'New like',
          `${user.displayName} liked your post`,
          postId
        );
      }
    },
    [user, tap, settings]
  );

  const addComment = useCallback(
    async (postId: string, content: string) => {
      if (!user) return;
      const text = content.trim();
      if (!text) return;
      let notifyTo: string | null = null;
      await mutate((d) => {
        const p = d.posts.find((x) => x.id === postId);
        if (!p) return;
        const c: Comment = {
          id: uid('cmt'),
          userId: user.id,
          content: text,
          createdAt: now(),
        };
        p.comments.push(c);
        if (p.userId !== user.id) notifyTo = p.userId;
      });
      if (notifyTo) {
        await pushNotif(
          notifyTo,
          'comment',
          'New comment',
          `${user.displayName}: ${text.slice(0, 80)}`,
          postId
        );
      }
      buzz('success');
    },
    [user, buzz, settings]
  );

  const deletePost = useCallback(
    async (postId: string) => {
      if (!user) return;
      await mutate((d) => {
        d.posts = d.posts.filter(
          (p) => !(p.id === postId && (p.userId === user.id || user.isDeveloper))
        );
      });
    },
    [user]
  );

  const createListing = useCallback(
    async (input: {
      title: string;
      description: string;
      price: number;
      category: ListingCategory;
      location: string;
      image?: string | null;
    }) => {
      if (!user) return;
      await mutate((d) => {
        d.listings.unshift({
          id: uid('lst'),
          userId: user.id,
          title: input.title.trim(),
          description: input.description.trim(),
          price: input.price,
          currency: 'SLE',
          category: input.category,
          image: input.image || null,
          location: input.location.trim() || user.location,
          status: 'available',
          createdAt: now(),
          boosted: false,
        });
      });
      buzz('success');
    },
    [user, buzz]
  );

  const markListingSold = useCallback(async (id: string) => {
    await mutate((d) => {
      const l = d.listings.find((x) => x.id === id);
      if (l) l.status = 'sold';
    });
  }, []);

  const deleteListing = useCallback(
    async (id: string) => {
      if (!user) return;
      await mutate((d) => {
        d.listings = d.listings.filter(
          (l) => !(l.id === id && (l.userId === user.id || user.isDeveloper))
        );
      });
    },
    [user]
  );

  const followUser = useCallback(
    async (targetId: string) => {
      if (!user || targetId === user.id) return;
      tap();
      let started = false;
      await mutate((d) => {
        const idx = d.follows.findIndex(
          (f) => f.followerId === user.id && f.followingId === targetId
        );
        if (idx >= 0) d.follows.splice(idx, 1);
        else {
          d.follows.push({
            followerId: user.id,
            followingId: targetId,
            createdAt: now(),
          });
          started = true;
        }
      });
      if (started) {
        await pushNotif(
          targetId,
          'follow',
          'New follower',
          `${user.displayName} started following you`,
          user.id
        );
      }
    },
    [user, tap, settings]
  );

  const isFollowing = useCallback(
    (targetId: string) => {
      if (!user) return false;
      return db.follows.some(
        (f) => f.followerId === user.id && f.followingId === targetId
      );
    },
    [db.follows, user]
  );

  const followerCount = useCallback(
    (userId: string) => db.follows.filter((f) => f.followingId === userId).length,
    [db.follows]
  );

  const followingCount = useCallback(
    (userId: string) => db.follows.filter((f) => f.followerId === userId).length,
    [db.follows]
  );

  const openConversation = useCallback(
    async (otherId: string) => {
      if (!user) throw new Error('Not signed in');
      const existing = getDB().conversations.find(
        (c) =>
          c.participants.includes(user.id) && c.participants.includes(otherId)
      );
      if (existing) return existing.id;
      const id = uid('cnv');
      await mutate((d) => {
        d.conversations.unshift({
          id,
          participants: [user.id, otherId],
          lastMessageAt: now(),
          lastMessage: '',
        });
      });
      return id;
    },
    [user]
  );

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      if (!user) return;
      const text = content.trim();
      if (!text) return;
      let other: string | null = null;
      await mutate((d) => {
        const c = d.conversations.find((x) => x.id === conversationId);
        if (!c) return;
        const msg: Message = {
          id: uid('msg'),
          conversationId,
          senderId: user.id,
          content: text,
          createdAt: now(),
          read: false,
          kind: 'text',
        };
        d.messages.push(msg);
        c.lastMessage = text;
        c.lastMessageAt = now();
        other = c.participants.find((p) => p !== user.id) || null;
      });
      if (other) {
        await pushNotif(
          other,
          'message',
          user.displayName,
          text.slice(0, 100),
          conversationId
        );
      }
    },
    [user, settings]
  );

  const sendQuizMessage = useCallback(
    async (conversationId: string) => {
      if (!user) return;
      const q = pickOneQuiz();
      let other: string | null = null;
      await mutate((d) => {
        const c = d.conversations.find((x) => x.id === conversationId);
        if (!c) return;
        const msg: Message = {
          id: uid('msg'),
          conversationId,
          senderId: user.id,
          content: q.question,
          createdAt: now(),
          read: false,
          kind: 'quiz',
          quizPayload: {
            question: q.question,
            options: q.options,
            answerIndex: q.answerIndex,
          },
        };
        d.messages.push(msg);
        c.lastMessage = 'Salone quiz: ' + q.question;
        c.lastMessageAt = now();
        other = c.participants.find((p) => p !== user.id) || null;
      });
      if (other) {
        await pushNotif(
          other,
          'quiz',
          'Salone quiz',
          `${user.displayName} sent you a Sierra Leone quiz`,
          conversationId
        );
      }
      buzz('success');
    },
    [user, buzz, settings]
  );

  const markConversationRead = useCallback(
    async (conversationId: string) => {
      if (!user) return;
      await mutate((d) => {
        d.messages.forEach((m) => {
          if (
            m.conversationId === conversationId &&
            m.senderId !== user.id &&
            !m.read
          ) {
            m.read = true;
          }
        });
      });
    },
    [user]
  );

  const unreadCount = useCallback(() => {
    if (!user) return 0;
    const mine = db.conversations.filter((c) =>
      c.participants.includes(user.id)
    );
    let n = 0;
    mine.forEach((c) => {
      n += db.messages.filter(
        (m) => m.conversationId === c.id && m.senderId !== user.id && !m.read
      ).length;
    });
    n += db.notifications.filter((x) => x.userId === user.id && !x.read).length;
    return n;
  }, [db.conversations, db.messages, db.notifications, user]);

  const markNotificationsRead = useCallback(async () => {
    if (!user) return;
    await mutate((d) => {
      d.notifications.forEach((n) => {
        if (n.userId === user.id) n.read = true;
      });
    });
  }, [user]);

  const saveQuizResult = useCallback(
    async (score: number, total: number, category: string) => {
      if (!user) return;
      await mutate((d) => {
        const r: QuizResult = {
          id: uid('qzr'),
          userId: user.id,
          score,
          total,
          category,
          createdAt: now(),
        };
        d.quizResults.unshift(r);
      });
    },
    [user]
  );

  const updateDeveloper = useCallback(async (patch: Partial<DeveloperProfile>) => {
    await mutate((d) => {
      d.developer = { ...d.developer, ...patch, updatedAt: now() };
      if (patch.image !== undefined) {
        d.users.forEach((u) => {
          if (u.isDeveloper) u.avatar = patch.image || u.avatar;
        });
      }
    });
  }, []);

  const getUser = useCallback(
    (id: string) => db.users.find((u) => u.id === id),
    [db.users]
  );

  const isPremium = useCallback(
    (userId?: string) => {
      const id = userId || user?.id;
      if (!id) return false;
      const u = db.users.find((x) => x.id === id);
      if (!u) return false;
      if (u.isDeveloper) return true;
      if (u.isPremium && (!u.premiumUntil || u.premiumUntil > Date.now())) return true;
      return false;
    },
    [db.users, user?.id]
  );

  const saveProfile = useCallback(
    async (draft: ProfileDraft) => {
      if (!user) return;
      let avatar = draft.avatar;
      let coverImage = draft.coverImage;
      let introVideo = draft.introVideo;
      if (avatar && avatar !== user.avatar) {
        const up = await uploadSalonMedia(user.id, avatar, 'avatar');
        avatar = up.url;
      }
      if (coverImage && coverImage !== user.coverImage) {
        const up = await uploadSalonMedia(user.id, coverImage, 'cover');
        coverImage = up.url;
      }
      if (introVideo && introVideo !== user.introVideo) {
        const up = await uploadSalonMedia(user.id, introVideo, 'video');
        introVideo = up.url;
      }
      await mutate((d) => {
        const u = d.users.find((x) => x.id === user.id);
        if (!u) return;
        u.displayName = draft.displayName.trim() || u.displayName;
        u.bio = draft.bio;
        u.location = draft.location;
        u.tribe = draft.tribe;
        u.avatar = avatar;
        u.coverImage = coverImage;
        u.introVideo = introVideo;
        u.lastSeen = now();
        if (u.isDeveloper && avatar) {
          d.developer.image = avatar;
          d.developer.updatedAt = now();
        }
      });
      buzz('success');
    },
    [user, buzz]
  );

  const activatePremium = useCallback(
    async (plan: 'monthly' | 'yearly' | 'founder') => {
      if (!user) return;
      const days = plan === 'monthly' ? 30 : plan === 'yearly' ? 365 : 3650;
      await mutate((d) => {
        const u = d.users.find((x) => x.id === user.id);
        if (!u) return;
        u.isPremium = true;
        u.verified = true;
        u.premiumUntil = now() + days * 24 * 60 * 60 * 1000;
        d.notifications.unshift({
          id: uid('ntf'),
          userId: u.id,
          type: 'system',
          title: 'Salone Premium',
          body:
            plan === 'founder'
              ? 'Founder circle unlocked. Boosts, HD video and the gold mark are yours.'
              : `Premium is live for ${days} days. Upload video, boost posts and wear the gold mark.`,
          read: false,
          createdAt: now(),
        });
      });
      buzz('success');
    },
    [user, buzz]
  );

  const toggleSavePost = useCallback(
    async (postId: string) => {
      if (!user) return;
      tap();
      await mutate((d) => {
        const i = d.saved.findIndex((s) => s.userId === user.id && s.postId === postId);
        if (i >= 0) d.saved.splice(i, 1);
        else d.saved.unshift({ userId: user.id, postId, createdAt: now() } as SavedItem);
      });
    },
    [user, tap]
  );

  const isSaved = useCallback(
    (postId: string) => {
      if (!user) return false;
      return db.saved.some((s) => s.userId === user.id && s.postId === postId);
    },
    [db.saved, user]
  );

  const savedPosts = useMemo(() => {
    if (!user) return [] as Post[];
    return db.saved
      .filter((s) => s.userId === user.id)
      .map((s) => db.posts.find((p) => p.id === s.postId))
      .filter((p): p is Post => !!p);
  }, [db.saved, db.posts, user]);

  const boostPost = useCallback(
    async (postId: string) => {
      if (!user || !isPremium()) return false;
      await mutate((d) => {
        const p = d.posts.find((x) => x.id === postId && x.userId === user.id);
        if (p) p.boosted = true;
      });
      buzz('success');
      return true;
    },
    [user, isPremium, buzz]
  );

  const boostListing = useCallback(
    async (listingId: string) => {
      if (!user || !isPremium()) return false;
      await mutate((d) => {
        const l = d.listings.find((x) => x.id === listingId && x.userId === user.id);
        if (l) l.boosted = true;
      });
      buzz('success');
      return true;
    },
    [user, isPremium, buzz]
  );

  const value: AppContextValue = {
    ready,
    db,
    user: user ? publicUser(user) : null,
    users: db.users,
    posts: db.posts,
    listings: db.listings,
    conversations: db.conversations,
    messages: db.messages,
    notifications: db.notifications,
    follows: db.follows,
    settings,
    developer: db.developer,
    tutorialSeen: db.tutorialSeen,
    palette,
    dark,
    lang,
    t,
    tap,
    buzz,
    register,
    login,
    developerLogin,
    logout,
    updateProfile,
    updateSettings,
    markTutorialSeen,
    createPost,
    toggleLike,
    addComment,
    deletePost,
    createListing,
    markListingSold,
    deleteListing,
    followUser,
    isFollowing,
    followerCount,
    followingCount,
    openConversation,
    sendMessage,
    sendQuizMessage,
    markConversationRead,
    unreadCount,
    markNotificationsRead,
    saveQuizResult,
    updateDeveloper,
    getUser,
    saveProfile,
    createMediaPost,
    activatePremium,
    isPremium,
    toggleSavePost,
    isSaved,
    savedPosts,
    videos: db.videos,
    boostPost,
    boostListing,
    cloudReady,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp outside provider');
  return ctx;
}
