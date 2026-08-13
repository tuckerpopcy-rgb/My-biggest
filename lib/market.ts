// ============================================================
// Salon na we yon - Market Service
// Buy, sell, and browse marketplace items
// ============================================================

import { db } from './database';
import { awardPoints, POINTS } from './points';
import type { MarketItem } from './types';

export async function getMarketItems(category?: string): Promise<MarketItem[]> {
  const items = await db.get<MarketItem[]>('marketItems') || [];
  const filtered = category && category !== 'All'
    ? items.filter(i => i.category === category)
    : items;
  return filtered.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getMarketItemById(id: string): Promise<MarketItem | null> {
  const items = await db.get<MarketItem[]>('marketItems') || [];
  return items.find(i => i.id === id) || null;
}

export async function createMarketItem(
  sellerId: string,
  sellerName: string,
  sellerAvatar: string | null,
  title: string,
  description: string,
  price: number,
  currency: string,
  category: string,
  location: string,
  condition: 'new' | 'used' | 'refurbished',
  image: string | null = null
): Promise<MarketItem> {
  const item: MarketItem = {
    id: 'mkt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    sellerId, sellerName, sellerAvatar,
    title, description, price, currency, category,
    image, location, condition,
    createdAt: Date.now(),
    likes: [], sold: false, views: 0,
  };

  await db.update('marketItems', (items: MarketItem[]) => [item, ...items]);
  await awardPoints(sellerId, POINTS.POST_CREATE, 'Listed an item in market');
  return item;
}

export async function toggleMarketLike(itemId: string, userId: string): Promise<void> {
  const items = await db.get<MarketItem[]>('marketItems') || [];
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  if (item.likes.includes(userId)) {
    item.likes = item.likes.filter(id => id !== userId);
  } else {
    item.likes.push(userId);
    await awardPoints(userId, POINTS.LIKE, 'Liked a market item');
  }
  await db.set('marketItems', items);
}

export async function incrementMarketViews(itemId: string): Promise<void> {
  const items = await db.get<MarketItem[]>('marketItems') || [];
  const item = items.find(i => i.id === itemId);
  if (item) {
    item.views += 1;
    await db.set('marketItems', items);
  }
}

export async function markItemSold(itemId: string): Promise<void> {
  const items = await db.get<MarketItem[]>('marketItems') || [];
  const item = items.find(i => i.id === itemId);
  if (item) {
    item.sold = true;
    await db.set('marketItems', items);
  }
}

export async function getMyListings(sellerId: string): Promise<MarketItem[]> {
  const items = await db.get<MarketItem[]>('marketItems') || [];
  return items.filter(i => i.sellerId === sellerId).sort((a, b) => b.createdAt - a.createdAt);
}

export const marketCategories = ['All', 'Electronics', 'Fashion', 'Food', 'Arts & Crafts', 'Services', 'Vehicles', 'Real Estate', 'Other'];

export function formatPrice(price: number, currency: string): string {
  if (currency === 'Le') {
    return 'Le ' + price.toLocaleString();
  }
  return currency + ' ' + price.toLocaleString();
}
