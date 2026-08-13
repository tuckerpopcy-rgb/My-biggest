// ============================================================
// Salon na we yon - Core Type Definitions
// ============================================================

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  bio: string;
  avatar: string | null;
  coverPhoto: string | null;
  points: number;
  followers: string[];
  following: string[];
  isSubscribed: boolean;
  subscriptionTier: 'free' | 'basic' | 'premium';
  subscriptionExpiry: number | null;
  isDeveloper: boolean;
  approvedClasses: string[];
  joinedAt: number;
  lastActive: number;
  quizHighScore: number;
  quizzesCompleted: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  content: string;
  image: string | null;
  likes: string[];
  comments: Comment[];
  createdAt: number;
  tags: string[];
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  content: string;
  createdAt: number;
  likes: string[];
}

export interface Notification {
  id: string;
  type: 'update' | 'like' | 'comment' | 'follow' | 'subscription' | 'quiz' | 'system' | 'market';
  title: string;
  message: string;
  fromUserId: string | null;
  fromUserName: string | null;
  read: boolean;
  createdAt: number;
  data?: any;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizResult {
  id: string;
  userId: string;
  score: number;
  total: number;
  category: string;
  completedAt: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  tier: 'basic' | 'premium';
  lessons: Lesson[];
  icon: string;
  color: string;
  category: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  questions: AIQuestion[];
}

export interface AIQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'voice' | 'video' | 'text';
  participants: string[];
  createdAt: number;
  active: boolean;
  description: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  content: string;
  type: 'text' | 'voice' | 'video' | 'system';
  createdAt: number;
}

export interface Theme {
  id: string;
  name: string;
  isPremium: boolean;
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    accent: string;
    background: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    gradientStart: string;
    gradientEnd: string;
  };
  effects: {
    glow: boolean;
    particles: boolean;
    shimmer: boolean;
    blur: boolean;
  };
}

export interface AppSettings {
  themeId: string;
  uiScale: number;
  fontScale: number;
  reducedMotion: boolean;
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

// ===== Market Types =====
export interface MarketItem {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string | null;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  image: string | null;
  location: string;
  condition: 'new' | 'used' | 'refurbished';
  createdAt: number;
  likes: string[];
  sold: boolean;
  views: number;
}

// ===== News Types =====
export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  image: string | null;
  createdAt: number;
  likes: string[];
  comments: Comment[];
  source: string;
  isFeatured: boolean;
  views: number;
}
