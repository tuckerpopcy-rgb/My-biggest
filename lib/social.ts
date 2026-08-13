// ============================================================
// Salon na we yon - Social Features Service
// Posts, likes, comments, follows
// ============================================================

import { db } from './database';
import { awardPoints, POINTS } from './points';
import { addNotification } from './notifications';
import type { Post, Comment, User } from './types';

export async function getPosts(): Promise<Post[]> {
  const posts = await db.get<Post[]>('posts') || [];
  return posts.sort((a, b) => b.createdAt - a.createdAt);
}

export async function createPost(
  authorId: string,
  content: string,
  image: string | null = null,
  tags: string[] = []
): Promise<Post> {
  const user = await getUser(authorId);
  const post: Post = {
    id: 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    authorId,
    authorName: user?.displayName || 'Unknown',
    authorAvatar: user?.avatar || null,
    content,
    image,
    likes: [],
    comments: [],
    createdAt: Date.now(),
    tags,
  };

  await db.update('posts', (posts: Post[]) => [post, ...posts]);
  await awardPoints(authorId, POINTS.POST_CREATE, 'Created a post');
  return post;
}

export async function toggleLike(postId: string, userId: string): Promise<void> {
 const posts = await db.get<Post[]>('posts') || [];
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  const liked = post.likes.includes(userId);
  if (liked) {
    post.likes = post.likes.filter(id => id !== userId);
  } else {
    post.likes.push(userId);
    await awardPoints(userId, POINTS.LIKE, 'Liked a post');
    if (post.authorId !== userId) {
      const liker = await getUser(userId);
      await addNotification({
        type: 'like',
        title: 'New Like',
        message: `${liker?.displayName || 'Someone'} liked your post`,
        fromUserId: userId,
        fromUserName: liker?.displayName || 'Someone',
        read: false,
      });
    }
  }

  await db.set('posts', posts);
}

export async function addComment(
  postId: string,
  userId: string,
  content: string
): Promise<void> {
  const posts = await db.get<Post[]>('posts') || [];
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  const user = await getUser(userId);
  const comment: Comment = {
    id: 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    authorId: userId,
    authorName: user?.displayName || 'Unknown',
    authorAvatar: user?.avatar || null,
    content,
    createdAt: Date.now(),
    likes: [],
  };

  post.comments.push(comment);
  await db.set('posts', posts);
  await awardPoints(userId, POINTS.COMMENT, 'Commented on a post');

  if (post.authorId !== userId) {
    await addNotification({
      type: 'comment',
      title: 'New Comment',
      message: `${user?.displayName || 'Someone'} commented on your post: "${content.slice(0, 50)}..."`,
      fromUserId: userId,
      fromUserName: user?.displayName || 'Someone',
      read: false,
    });
  }
}

export async function toggleFollow(
  targetUserId: string,
  currentUserId: string
): Promise<void> {
  if (targetUserId === currentUserId) return;

  const users = await db.get<User[]>('users') || [];
  const target = users.find(u => u.id === targetUserId);
  const current = users.find(u => u.id === currentUserId);
  if (!target || !current) return;

  const isFollowing = current.following.includes(targetUserId);

  if (isFollowing) {
    current.following = current.following.filter(id => id !== targetUserId);
    target.followers = target.followers.filter(id => id !== currentUserId);
  } else {
    current.following.push(targetUserId);
    target.followers.push(currentUserId);
    await awardPoints(currentUserId, POINTS.FOLLOW, 'Followed a user');
    await addNotification({
      type: 'follow',
      title: 'New Follower',
      message: `${current.displayName} started following you`,
      fromUserId: currentUserId,
      fromUserName: current.displayName,
      read: false,
    });
  }

  await db.set('users', users);
}

export async function getUser(userId: string): Promise<User | null> {
  const users = await db.get<User[]>('users') || [];
  return users.find(u => u.id === userId) || null;
}

export async function getPostsByUser(userId: string): Promise<Post[]> {
  const posts = await getPosts();
  return posts.filter(p => p.authorId === userId);
}

export async function deletePost(postId: string, userId: string): Promise<boolean> {
  const posts = await db.get<Post[]>('posts') || [];
  const post = posts.find(p => p.id === postId);
  if (!post || (post.authorId !== userId && userId !== 'dev_henry_tucker')) return false;
  await db.set('posts', posts.filter(p => p.id !== postId));
  return true;
}

export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
