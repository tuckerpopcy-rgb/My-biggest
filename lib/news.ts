// ============================================================
// Salon na we yon - News Feed Service
// Sierra Leone news and updates
// ============================================================

import { db } from './database';
import { awardPoints, POINTS } from './points';
import type { NewsArticle } from './types';

export async function getNewsArticles(category?: string): Promise<NewsArticle[]> {
  const articles = await db.get<NewsArticle[]>('newsArticles') || [];
  const filtered = category && category !== 'All'
    ? articles.filter(a => a.category === category)
    : articles;
  return filtered.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getFeaturedNews(): Promise<NewsArticle[]> {
  const articles = await db.get<NewsArticle[]>('newsArticles') || [];
  return articles.filter(a => a.isFeatured).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getNewsById(id: string): Promise<NewsArticle | null> {
  const articles = await db.get<NewsArticle[]>('newsArticles') || [];
  return articles.find(a => a.id === id) || null;
}

export async function toggleNewsLike(articleId: string, userId: string): Promise<void> {
  const articles = await db.get<NewsArticle[]>('newsArticles') || [];
  const article = articles.find(a => a.id === articleId);
  if (!article) return;

  if (article.likes.includes(userId)) {
    article.likes = article.likes.filter(id => id !== userId);
  } else {
    article.likes.push(userId);
    await awardPoints(userId, POINTS.LIKE, 'Liked a news article');
  }
  await db.set('newsArticles', articles);
}

export async function incrementNewsViews(articleId: string): Promise<void> {
  const articles = await db.get<NewsArticle[]>('newsArticles') || [];
  const article = articles.find(a => a.id === articleId);
  if (article) {
    article.views += 1;
    await db.set('newsArticles', articles);
  }
}

export async function addNewsComment(
  articleId: string,
  userId: string,
  userName: string,
  userAvatar: string | null,
  content: string
): Promise<void> {
  const articles = await db.get<NewsArticle[]>('newsArticles') || [];
  const article = articles.find(a => a.id === articleId);
  if (!article) return;

  article.comments.push({
    id: 'cmt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    authorId: userId,
    authorName: userName,
    authorAvatar: userAvatar,
    content,
    createdAt: Date.now(),
    likes: [],
  });

  await db.set('newsArticles', articles);
  await awardPoints(userId, POINTS.COMMENT, 'Commented on news article');
}

export async function createNewsArticle(article: Omit<NewsArticle, 'id' | 'createdAt' | 'likes' | 'comments' | 'views'>): Promise<NewsArticle> {
  const newArticle: NewsArticle = {
    ...article,
    id: 'news_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    createdAt: Date.now(),
    likes: [],
    comments: [],
    views: 0,
  };
  await db.update('newsArticles', (articles: NewsArticle[]) => [newArticle, ...articles]);
  return newArticle;
}

export const newsCategories = ['All', 'Economy', 'Education', 'Sports', 'Technology', 'Health', 'Politics', 'Culture'];
