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
  ApplicationStatus,
  ClassPayment,
  CloudVideo,
  Comment,
  Conversation,
  CourseId,
  DeveloperProfile,
  LanguageCode,
  LessonTurn,
  Listing,
  ListingCategory,
  Message,
  Post,
  ProfileDraft,
  QuizResult,
  SavedItem,
  StudyApplication,
  User,
} from '../lib/types';
import { hashPassword, now, uid, verifyPassword } from '../lib/hash';
import {
  Database,
  DEFAULT_SETTINGS,
  getDB,
  initDB,
  mutate,
  onDatabaseWrite,
  snapshot,
  subscribe,
} from '../lib/database';
import { writeSession } from '../lib/session';
import { getPalette, Palette } from '../lib/theme';
import { t as translate } from '../lib/i18n';
import { haptic, loadSounds, playClick, playNotify, playSuccess } from '../lib/sounds';
import { pickOneQuiz } from '../lib/quiz';
import { loadSupabaseCfg } from '../lib/supabase';
import { ingestMedia } from '../lib/mediaVault';
import { publishLive, startLiveSync } from '../lib/liveSync';
import { ACADEMY_FEE, ORANGE_MONEY, askTeacher, openingLecture } from '../lib/teachAI';

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
  sendMediaMessage: (conversationId: string, uri: string, kind: 'image' | 'video') => Promise<void>;
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
  applications: StudyApplication[];
  payments: ClassPayment[];
  lessons: LessonTurn[];
  applyForAcademy: (input: {
    fullName: string;
    phone: string;
    reason: string;
    subjects: CourseId[];
  }) => Promise<StudyApplication | null>;
  submitClassPayment: (applicationId: string, senderNumber: string, reference: string) => Promise<boolean>;
  reviewApplication: (applicationId: string, status: 'approved' | 'rejected', note?: string) => Promise<void>;
  myApplication: () => StudyApplication | undefined;
  isAcademyApproved: (userId?: string) => boolean;
  askLecture: (subject: CourseId, question: string) => Promise<string>;
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
  const signedUserId = useRef<string | null>(null);

  useEffect(() => {
    let unsub = () => {};
    let unlive = () => {};
    (async () => {
      await initDB();
      await loadSupabaseCfg();
      await loadSounds();
      onDatabaseWrite(() => publishLive());
      setDb(snapshot());
      setCloudReady(true);
      setReady(true);
      unsub = subscribe(() => {
        tick.current += 1;
        setDb(snapshot());
      });
      unlive = startLiveSync(() => {
        tick.current += 1;
        setDb(snapshot());
      });
    })();
    return () => {
      unsub();
      unlive();
    };
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
    const sid = db.session?.userId;
    if (!sid) {
      signedUserId.current = null;
      return null;
    }
    const found = db.users.find((u) => u.id === sid) || null;
    if (!found) {
      signedUserId.current = null;
      return null;
    }
    signedUserId.current = found.id;
    return publicUser(found);
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
      const session = { userId: nu.id, issuedAt: now() };
      signedUserId.current = nu.id;
      await writeSession(session);
      await mutate((d) => {
        if (!d.users.some((u) => u.id === nu.id || u.username === nu.username || u.email === nu.email)) {
          d.users.push(nu);
        }
        d.session = session;
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
      const session = { userId: found.id, issuedAt: now() };
      signedUserId.current = found.id;
      await writeSession(session);
      await mutate((d) => {
        d.session = session;
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
        const session = { userId: (henry as User).id, issuedAt: now() };
        signedUserId.current = (henry as User).id;
        await writeSession(session);
        await mutate((d) => {
          d.users.push(henry as User);
          d.session = session;
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
        const session = { userId: hid, issuedAt: now() };
        signedUserId.current = hid;
        await writeSession(session);
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
          d.session = session;
        });
      }
      buzz('success');
      return { ok: true, user: henry };
    },
    [lang, buzz]
  );

  const logout = useCallback(async () => {
    tap();
    signedUserId.current = null;
    const snapshot = getDB();
    if (snapshot.session) {
      const u = snapshot.users.find((x) => x.id === snapshot.session?.userId);
      if (u) u.lastSeen = now();
    }
    snapshot.session = null;
    await writeSession(null);
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
      const postId = uid('pst');
      const rawImage = input.image || null;
      const rawVideo = input.video || null;
      await mutate((d) => {
        d.posts.unshift({
          id: postId,
          userId: user.id,
          content: text,
          image: rawImage,
          video: rawVideo,
          mediaPath: rawVideo || rawImage,
          likes: [],
          comments: [],
          createdAt: now(),
          updatedAt: now(),
          boosted: false,
        });
        if (rawVideo) {
          d.videos.unshift({
            id: uid('vid'),
            userId: user.id,
            postId,
            path: rawVideo,
            publicUrl: rawVideo,
            caption: text,
            createdAt: now(),
          });
        }
      });
      buzz('success');
      void (async () => {
        let image = rawImage;
        let video = rawVideo;
        if (rawVideo) video = await ingestMedia(rawVideo, 'video');
        else if (rawImage) image = await ingestMedia(rawImage, 'image');
        if (image === rawImage && video === rawVideo) return;
        await mutate((d) => {
          const p = d.posts.find((x) => x.id === postId);
          if (p) {
            p.image = image;
            p.video = video;
            p.mediaPath = video || image;
            p.updatedAt = now();
          }
          if (video) {
            const v = d.videos.find((x) => x.postId === postId);
            if (v) {
              v.publicUrl = video;
              v.path = video;
            }
          }
        });
      })();
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
        else p.likes.push(user.id);
        p.updatedAt = now();
        if (p.userId !== user.id && p.likes.includes(user.id)) {
          const author = d.users.find((u) => u.id === p.userId);
          if (author) notifyId = author.id;
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
        p.updatedAt = now();
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
      const id = uid('lst');
      const raw = input.image || null;
      await mutate((d) => {
        d.listings.unshift({
          id,
          userId: user.id,
          title: input.title.trim(),
          description: input.description.trim(),
          price: input.price,
          currency: 'SLE',
          category: input.category,
          image: raw,
          location: input.location.trim() || user.location,
          status: 'available',
          createdAt: now(),
          updatedAt: now(),
          boosted: false,
        });
      });
      buzz('success');
      if (raw) {
        void ingestMedia(raw, 'image').then((stored) => {
          if (stored === raw) return;
          return mutate((d) => {
            const l = d.listings.find((x) => x.id === id);
            if (l) l.image = stored;
          });
        });
      }
    },
    [user, buzz]
  );

  const markListingSold = useCallback(async (id: string) => {
    await mutate((d) => {
      const l = d.listings.find((x) => x.id === id);
      if (l) {
        l.status = 'sold';
        l.updatedAt = now();
      }
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
          media: null,
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

  const sendMediaMessage = useCallback(
    async (conversationId: string, uri: string, kind: 'image' | 'video') => {
      if (!user || !uri) return;
      const msgId = uid('msg');
      let other: string | null = null;
      await mutate((d) => {
        const c = d.conversations.find((x) => x.id === conversationId);
        if (!c) return;
        d.messages.push({
          id: msgId,
          conversationId,
          senderId: user.id,
          content: kind === 'video' ? 'Video' : 'Photo',
          createdAt: now(),
          read: false,
          kind,
          media: uri,
        });
        c.lastMessage = kind === 'video' ? 'Sent a video' : 'Sent a photo';
        c.lastMessageAt = now();
        other = c.participants.find((p) => p !== user.id) || null;
      });
      if (other) {
        await pushNotif(
          other,
          'message',
          user.displayName,
          kind === 'video' ? 'Sent a video' : 'Sent a photo',
          conversationId
        );
      }
      const stored = await ingestMedia(uri, kind);
      if (stored !== uri) {
        await mutate((d) => {
          const m = d.messages.find((x) => x.id === msgId);
          if (m) m.media = stored;
        });
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
    const next = { ...patch };
    if (next.image) next.image = await ingestMedia(next.image, 'avatar');
    await mutate((d) => {
      d.developer = { ...d.developer, ...next, updatedAt: now() };
      if (next.image !== undefined) {
        d.users.forEach((u) => {
          if (u.isDeveloper) u.avatar = next.image || u.avatar;
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
        avatar = await ingestMedia(avatar, 'avatar');
      }
      if (coverImage && coverImage !== user.coverImage) {
        coverImage = await ingestMedia(coverImage, 'cover');
      }
      if (introVideo && introVideo !== user.introVideo) {
        introVideo = await ingestMedia(introVideo, 'video');
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

  const applyForAcademy = useCallback(
    async (input: {
      fullName: string;
      phone: string;
      reason: string;
      subjects: CourseId[];
    }) => {
      if (!user) return null;
      const existing = getDB().applications.find(
        (a) => a.userId === user.id && (a.status === 'awaiting_payment' || a.status === 'paid_pending' || a.status === 'approved')
      );
      if (existing && existing.status === 'approved') return existing;
      const id = uid('app');
      const rec: StudyApplication = {
        id,
        userId: user.id,
        fullName: input.fullName.trim() || user.displayName,
        phone: input.phone.trim() || user.phone,
        reason: input.reason.trim(),
        subjects: input.subjects.length ? input.subjects : ['forex', 'office', 'software'],
        status: 'awaiting_payment',
        createdAt: now(),
        updatedAt: now(),
        paymentId: null,
        reviewedBy: null,
        reviewNote: '',
      };
      await mutate((d) => {
        d.applications = d.applications.filter((a) => !(a.userId === user.id && a.status === 'awaiting_payment'));
        d.applications.unshift(rec);
        d.notifications.unshift({
          id: uid('ntf'),
          userId: user.id,
          type: 'academy',
          title: 'Salon Academy',
          body: `Pay Le ${ACADEMY_FEE} via Orange Money ${ORANGE_MONEY} for Forex, Office and Software Engineering.`,
          read: false,
          createdAt: now(),
          relatedId: id,
        });
      });
      buzz('success');
      return rec;
    },
    [user, buzz]
  );

  const submitClassPayment = useCallback(
    async (applicationId: string, senderNumber: string, reference: string) => {
      if (!user) return false;
      const sender = senderNumber.trim();
      const ref = reference.trim();
      if (!sender || !ref) return false;
      const payId = uid('pay');
      await mutate((d) => {
        const a = d.applications.find((x) => x.id === applicationId && x.userId === user.id);
        if (!a || a.status === 'approved') return;
        const p: ClassPayment = {
          id: payId,
          applicationId,
          userId: user.id,
          amount: ACADEMY_FEE,
          currency: 'SLE',
          method: 'orange_money',
          orangeNumber: ORANGE_MONEY,
          senderNumber: sender,
          reference: ref,
          createdAt: now(),
        };
        d.payments.unshift(p);
        a.status = 'paid_pending';
        a.paymentId = payId;
        a.updatedAt = now();
        d.notifications.unshift({
          id: uid('ntf'),
          userId: user.id,
          type: 'academy',
          title: 'Payment received',
          body: `Le ${ACADEMY_FEE} marked paid to ${ORANGE_MONEY}. Waiting for approval.`,
          read: false,
          createdAt: now(),
          relatedId: applicationId,
        });
        d.users
          .filter((u) => u.isDeveloper)
          .forEach((dev) => {
            d.notifications.unshift({
              id: uid('ntf'),
              userId: dev.id,
              type: 'academy',
              title: 'Academy payment',
              body: `${user.displayName} paid Le ${ACADEMY_FEE}. Review the application.`,
              read: false,
              createdAt: now(),
              relatedId: applicationId,
            });
          });
      });
      buzz('success');
      return true;
    },
    [user, buzz]
  );

  const reviewApplication = useCallback(
    async (applicationId: string, status: 'approved' | 'rejected', note?: string) => {
      if (!user?.isDeveloper) return;
      await mutate((d) => {
        const a = d.applications.find((x) => x.id === applicationId);
        if (!a) return;
        a.status = status;
        a.reviewedBy = user.id;
        a.reviewNote = note || '';
        a.updatedAt = now();
        d.notifications.unshift({
          id: uid('ntf'),
          userId: a.userId,
          type: 'academy',
          title: status === 'approved' ? 'You are approved' : 'Application update',
          body:
            status === 'approved'
              ? 'Salon Academy lectures are unlocked. Open Classroom.'
              : `Your study application was not approved. ${note || ''}`.trim(),
          read: false,
          createdAt: now(),
          relatedId: applicationId,
        });
      });
      buzz(status === 'approved' ? 'success' : 'warning');
    },
    [user, buzz]
  );

  const myApplication = useCallback(() => {
    if (!user) return undefined;
    return db.applications.find((a) => a.userId === user.id);
  }, [db.applications, user]);

  const isAcademyApproved = useCallback(
    (userId?: string) => {
      const id = userId || user?.id;
      if (!id) return false;
      const u = db.users.find((x) => x.id === id);
      if (u?.isDeveloper) return true;
      return db.applications.some((a) => a.userId === id && a.status === 'approved');
    },
    [db.applications, db.users, user?.id]
  );

  const askLecture = useCallback(
    async (subject: CourseId, question: string) => {
      if (!user || !isAcademyApproved()) return 'Classroom is locked until your application is approved.';
      const q = question.trim();
      const answer = q ? askTeacher(subject, q) : openingLecture(subject);
      await mutate((d) => {
        if (q) {
          d.lessons.push({
            id: uid('lsn'),
            userId: user.id,
            subject,
            role: 'student',
            text: q,
            createdAt: now(),
          });
        }
        d.lessons.push({
          id: uid('lsn'),
          userId: user.id,
          subject,
          role: 'teacher',
          text: answer,
          createdAt: now() + 1,
        });
      });
      return answer;
    },
    [user, isAcademyApproved]
  );

  const value: AppContextValue = {
    ready,
    db,
    user,
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
    sendMediaMessage,
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
    applications: db.applications,
    payments: db.payments,
    lessons: db.lessons,
    applyForAcademy,
    submitClassPayment,
    reviewApplication,
    myApplication,
    isAcademyApproved,
    askLecture,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp outside provider');
  return ctx;
}
