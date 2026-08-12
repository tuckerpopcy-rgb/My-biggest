export type LanguageCode =
  | 'en'
  | 'kri'
  | 'men'
  | 'tem'
  | 'lma'
  | 'kno'
  | 'ful'
  | 'man'
  | 'lok'
  | 'she';

export type ThemeMode = 'light' | 'dark' | 'system';

export type AccentName = 'flag' | 'gold' | 'ocean' | 'forest' | 'sunset' | 'royal';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  bio: string;
  avatar: string | null;
  coverImage: string | null;
  introVideo: string | null;
  location: string;
  tribe: string;
  language: LanguageCode;
  createdAt: number;
  isDeveloper: boolean;
  isPremium: boolean;
  premiumUntil: number | null;
  verified: boolean;
  lastSeen: number;
  phone: string;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: number;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  image: string | null;
  video: string | null;
  mediaPath: string | null;
  likes: string[];
  comments: Comment[];
  createdAt: number;
  boosted: boolean;
}

export type ListingCategory =
  | 'food'
  | 'fashion'
  | 'electronics'
  | 'agriculture'
  | 'services'
  | 'crafts'
  | 'transport'
  | 'property'
  | 'other';

export interface Listing {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: ListingCategory;
  image: string | null;
  location: string;
  status: 'available' | 'sold';
  createdAt: number;
  boosted: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessageAt: number;
  lastMessage: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: number;
  read: boolean;
  kind: 'text' | 'quiz';
  quizPayload?: {
    question: string;
    options: string[];
    answerIndex: number;
  };
}

export type NotificationType =
  | 'like'
  | 'comment'
  | 'message'
  | 'follow'
  | 'system'
  | 'market'
  | 'quiz'
  | 'video';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
  relatedId?: string;
}

export interface QuizResult {
  id: string;
  userId: string;
  score: number;
  total: number;
  category: string;
  createdAt: number;
}

export interface Follow {
  followerId: string;
  followingId: string;
  createdAt: number;
}

export interface SavedItem {
  userId: string;
  postId: string;
  createdAt: number;
}

export interface CloudVideo {
  id: string;
  userId: string;
  postId: string | null;
  path: string;
  publicUrl: string;
  caption: string;
  createdAt: number;
}

export interface AppSettings {
  themeMode: ThemeMode;
  accent: AccentName;
  language: LanguageCode;
  haptics: boolean;
  clickSounds: boolean;
  notifications: boolean;
}

export interface DeveloperProfile {
  name: string;
  title: string;
  bio: string;
  image: string | null;
  email: string;
  location: string;
  updatedAt: number;
}

export interface Session {
  userId: string;
  issuedAt: number;
}

export interface ProfileDraft {
  displayName: string;
  bio: string;
  location: string;
  tribe: string;
  avatar: string | null;
  coverImage: string | null;
  introVideo: string | null;
}
