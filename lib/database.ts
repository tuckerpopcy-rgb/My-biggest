// ============================================================
// Salon na we yon - Real-Time Database Engine
// Local-first architecture with live sync broadcasting
// Optimized for fast app launch
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

const DB_PREFIX = '@salon_db_';

type Listener = (data: any) => void;

class Database {
  private listeners: Map<string, Set<Listener>> = new Map();
  private cache: Map<string, any> = new Map();
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  async init() {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._init();
    return this.initPromise;
  }

  private async _init() {
    // Load cache from storage in parallel
    const keys = ['users', 'posts', 'notifications', 'chatRooms', 'chatMessages',
      'quizResults', 'subscriptions', 'marketItems', 'newsArticles', 'seeded'];

    const results = await Promise.all(
      keys.map(k => AsyncStorage.getItem(DB_PREFIX + k).then(v => [k, v]))
    );

    for (const [key, value] of results) {
      if (value !== null) {
        this.cache.set(key, JSON.parse(value));
      }
    }

    // Seed if needed
    const seeded = this.cache.get('seeded');
    if (!seeded) {
      await this.seedData();
    }

    this.initialized = true;
  }

  private async seedData() {
    const now = Date.now();

    // Seed developer account - Henry Tucker
    const devUser = {
      id: 'dev_henry_tucker',
      username: 'HenryTucker',
      email: 'henry.tucker@salonnaweyon.dev',
      passwordHash: this.hash('HTucker2024!Dev'),
      displayName: 'Henry Tucker',
      bio: 'Founder & Developer of Salon na we yon. Building the future of Sierra Leone\'s digital community.',
      avatar: null,
      coverPhoto: null,
      points: 99999,
      followers: [],
      following: [],
      isSubscribed: true,
      subscriptionTier: 'premium',
      subscriptionExpiry: null,
      isDeveloper: true,
      approvedClasses: ['all'],
      joinedAt: now - 86400000 * 365,
      lastActive: now,
      quizHighScore: 100,
      quizzesCompleted: 50,
    };

    // Seed posts
    const posts = [
      {
        id: 'post_1', authorId: 'dev_henry_tucker', authorName: 'Henry Tucker', authorAvatar: null,
        content: 'Welcome to Salon na we yon! 🇸🇱 This is our community platform where we celebrate Sierra Leone culture, learn together, and connect. Explore quizzes, join classes, earn points, and make new friends!',
        image: null, likes: [], comments: [], createdAt: now - 3600000, tags: ['welcome', 'community'],
      },
      {
        id: 'post_2', authorId: 'dev_henry_tucker', authorName: 'Henry Tucker', authorAvatar: null,
        content: 'New premium themes are now available! Check out the Themes section in Settings to customize your app with beautiful color schemes and effects. Premium subscribers get access to exclusive animated themes. ✨',
        image: null, likes: [], comments: [], createdAt: now - 7200000, tags: ['update', 'themes'],
      },
      {
        id: 'post_3', authorId: 'dev_henry_tucker', authorName: 'Henry Tucker', authorAvatar: null,
        content: 'Test your knowledge about Sierra Leone! New quiz questions added covering history, geography, culture, and more. Top scorers earn bonus points and climb the leaderboard. 🏆',
        image: null, likes: [], comments: [], createdAt: now - 10800000, tags: ['quiz', 'sierra-leone'],
      },
      {
        id: 'post_4', authorId: 'dev_henry_tucker', authorName: 'Henry Tucker', authorAvatar: null,
        content: 'The Market is now open! 🛍️ Buy and sell items within our community. From electronics to fashion, find great deals from trusted sellers across Sierra Leone.',
        image: null, likes: [], comments: [], createdAt: now - 14400000, tags: ['market', 'community'],
      },
    ];

    // Seed notifications
    const notifications = [
      { id: 'notif_1', type: 'update', title: 'Welcome to Salon na we yon!', message: 'Thank you for joining our community. Explore all features including quizzes, AI classes, market, and more!', fromUserId: 'dev_henry_tucker', fromUserName: 'Henry Tucker', read: false, createdAt: now - 3600000 },
      { id: 'notif_2', type: 'system', title: 'Premium Themes Available', message: 'Unlock exclusive color themes and visual effects with a premium subscription.', fromUserId: 'dev_henry_tucker', fromUserName: 'Henry Tucker', read: false, createdAt: now - 7200000 },
      { id: 'notif_3', type: 'quiz', title: 'New Sierra Leone Quiz!', message: 'Test your knowledge about Sierra Leone and earn points. Are you ready?', fromUserId: 'dev_henry_tucker', fromUserName: 'Henry Tucker', read: false, createdAt: now - 10800000 },
      { id: 'notif_4', type: 'market', title: 'Market is Open! 🛍️', message: 'Browse items for sale or list your own. Great deals from the community!', fromUserId: 'dev_henry_tucker', fromUserName: 'Henry Tucker', read: false, createdAt: now - 14400000 },
    ];

    // Seed chat rooms
    const chatRooms = [
      { id: 'room_general', name: 'General Lounge', type: 'text', participants: ['dev_henry_tucker'], createdAt: now - 86400000, active: true, description: 'General community chat for everyone' },
      { id: 'room_voice', name: 'Voice Chat Room', type: 'voice', participants: [], createdAt: now - 86400000, active: true, description: 'Live voice conversations' },
      { id: 'room_video', name: 'Video Meetup', type: 'video', participants: [], createdAt: now - 86400000, active: true, description: 'Face-to-face video calls' },
      { id: 'room_culture', name: 'Sierra Leone Culture', type: 'text', participants: ['dev_henry_tucker'], createdAt: now - 86400000, active: true, description: 'Discuss culture, music, food, and traditions' },
      { id: 'room_market', name: 'Marketplace Chat', type: 'text', participants: [], createdAt: now - 86400000, active: true, description: 'Discuss deals and items for sale' },
    ];

    // Seed market items
    const marketItems = [
      { id: 'mkt_1', sellerId: 'dev_henry_tucker', sellerName: 'Henry Tucker', sellerAvatar: null, title: 'Samsung Galaxy A54', description: 'Brand new Samsung Galaxy A54, 128GB, excellent condition. Comes with case and charger.', price: 2500000, currency: 'Le', category: 'Electronics', image: null, location: 'Freetown', condition: 'new', createdAt: now - 7200000, likes: [], sold: false, views: 45 },
      { id: 'mkt_2', sellerId: 'dev_henry_tucker', sellerName: 'Henry Tucker', sellerAvatar: null, title: 'African Print Fabric (5 yards)', description: 'Beautiful Sierra Leonean lappa fabric, vibrant colors. Perfect for traditional wear.', price: 150000, currency: 'Le', category: 'Fashion', image: null, location: 'Freetown', condition: 'new', createdAt: now - 14400000, likes: [], sold: false, views: 32 },
      { id: 'mkt_3', sellerId: 'dev_henry_tucker', sellerName: 'Henry Tucker', sellerAvatar: null, title: 'Rice - 50kg Bag', description: 'Premium quality Sierra Leone rice. Wholesale price, delivery available in Freetown.', price: 350000, currency: 'Le', category: 'Food', image: null, location: 'Freetown', condition: 'new', createdAt: now - 21600000, likes: [], sold: false, views: 67 },
      { id: 'mkt_4', sellerId: 'dev_henry_tucker', sellerName: 'Henry Tucker', sellerAvatar: null, title: 'Laptop - HP ProBook', description: 'HP ProBook 450 G8, Core i5, 8GB RAM, 256GB SSD. Great for work and study.', price: 5500000, currency: 'Le', category: 'Electronics', image: null, location: 'Freetown', condition: 'used', createdAt: now - 28800000, likes: [], sold: false, views: 89 },
      { id: 'mkt_5', sellerId: 'dev_henry_tucker', sellerName: 'Henry Tucker', sellerAvatar: null, title: 'Traditional Drum (Dundun)', description: 'Handcrafted traditional Sierra Leone drum. Made from local materials with beautiful carvings.', price: 500000, currency: 'Le', category: 'Arts & Crafts', image: null, location: 'Bo', condition: 'new', createdAt: now - 36000000, likes: [], sold: false, views: 28 },
      { id: 'mkt_6', sellerId: 'dev_henry_tucker', sellerName: 'Henry Tucker', sellerAvatar: null, title: 'Generator - 3.5KVA', description: 'Firman generator, 3.5KVA, key start. Low usage, well maintained. Perfect for home or business.', price: 4500000, currency: 'Le', category: 'Electronics', image: null, location: 'Makeni', condition: 'used', createdAt: now - 43200000, likes: [], sold: false, views: 56 },
    ];

    // Seed news articles
    const newsArticles = [
      { id: 'news_1', title: 'Sierra Leone Economy Shows Strong Growth in 2024', summary: 'The Bank of Sierra Leone reports GDP growth of 4.2%, driven by mining, agriculture, and tech sectors.', content: 'The Bank of Sierra Leone has released its quarterly economic report showing encouraging signs of recovery and growth. The GDP expanded by 4.2% in the first quarter, surpassing expectations. Key drivers include increased iron ore exports, a rebound in agricultural production, and growing activity in the technology sector. The Leone has stabilized against major currencies, and inflation has moderated to 28.5% from a peak of 54% in 2022. Finance Minister Sheku Bangura attributed the improvements to fiscal discipline and structural reforms implemented under the IMF Extended Credit Facility program.', category: 'Economy', author: 'Henry Tucker', image: null, createdAt: now - 1800000, likes: [], comments: [], source: 'Bank of Sierra Leone', isFeatured: true, views: 234 },
      { id: 'news_2', title: 'New University of Science and Technology Opens in Freetown', summary: 'Limkokwing University expands with new STEM campus, offering degrees in AI, data science, and engineering.', content: 'A major expansion of STEM education in Sierra Leone was announced today with the opening of a new science and technology campus in Freetown. The campus will offer undergraduate and graduate programs in artificial intelligence, data science, software engineering, and renewable energy technology. The initiative is supported by partnerships with universities in China, India, and the UK. Education Minister David Sengeh called it "a transformative step for our nation\'s human capital development." The first cohort of 500 students is expected to enroll in September 2024.', category: 'Education', author: 'Henry Tucker', image: null, createdAt: now - 5400000, likes: [], comments: [], source: 'Ministry of Education', isFeatured: true, views: 189 },
      { id: 'news_3', title: 'Sierra Leone Qualifies for AFCON 2025', summary: 'Leone Stars secure qualification for the Africa Cup of Nations with a decisive victory over Guinea-Bissau.', content: 'Celebrations erupted across Sierra Leone as the Leone Stars secured their place at the 2025 Africa Cup of Nations with a commanding 3-1 victory over Guinea-Bissau at the Siaka Stevens Stadium. Goals from Mustapha Bundu, Alhaji Kamara, and Augustus Kargbo sealed the historic qualification. Head Coach John Keister praised the team\'s resilience and tactical discipline. The qualification marks Sierra Leone\'s third AFCON appearance and the first since 2021. Fans flooded the streets of Freetown, Bo, and Kenema in celebration.', category: 'Sports', author: 'Henry Tucker', image: null, createdAt: now - 10800000, likes: [], comments: [], source: 'Sierra Leone Football Association', isFeatured: true, views: 456 },
      { id: 'news_4', title: 'Freetown Launches Smart City Initiative', summary: 'Free Wi-Fi zones, digital services, and solar-powered street lights coming to Freetown.', content: 'The Freetown City Council has launched an ambitious Smart City initiative aimed at transforming the capital into a digital hub. Phase 1 includes installing free public Wi-Fi in 25 locations across the city, launching a mobile app for city services, and deploying 500 solar-powered street lights. Mayor Yvonne Aki-Sawyerr said the initiative will improve safety, connectivity, and economic opportunities for residents. The project is funded by a $15 million grant from the World Bank and technical support from the African Development Bank. Implementation begins in Q3 2024.', category: 'Technology', author: 'Henry Tucker', image: null, createdAt: now - 18000000, likes: [], comments: [], source: 'Freetown City Council', isFeatured: false, views: 167 },
      { id: 'news_5', title: 'Agricultural Export Revenue Reaches $120 Million', summary: 'Cocoa, coffee, and cashew exports drive record agricultural revenue for Sierra Leone.', content: 'Sierra Leone\'s agricultural export sector has achieved a record $120 million in revenue, marking a 35% increase from the previous year. The growth was primarily driven by cocoa exports, which benefited from favorable global prices and improved farming practices introduced through the Ministry of Agriculture\'s extension programs. Coffee and cashew exports also showed strong growth. Agriculture Minister Henry Kpuw said the government is investing in processing facilities to add value to raw exports, which could double revenue within three years. Smallholder farmers across Kenema, Kailahun, and Bo districts have seen their incomes rise significantly.', category: 'Economy', author: 'Henry Tucker', image: null, createdAt: now - 36000000, likes: [], comments: [], source: 'Ministry of Agriculture', isFeatured: false, views: 98 },
      { id: 'news_6', title: 'Health Sector Reform: 500 New Health Workers Deployed', summary: 'Government deploys 500 newly trained health workers to underserved communities across the country.', content: 'The Ministry of Health and Sanitation has deployed 500 newly trained health workers to rural and underserved communities across all districts. The deployment includes 200 community health officers, 150 midwives, and 150 nurses. Health Minister Austin Demby said this is part of the National Health Sector Recovery Plan aimed at reducing maternal and child mortality. The workers will be stationed in newly renovated peripheral health units (PHUs) equipped with essential medical supplies and solar power systems. The initiative is supported by WHO, UNICEF, and the Global Fund.', category: 'Health', author: 'Henry Tucker', image: null, createdAt: now - 50400000, likes: [], comments: [], source: 'Ministry of Health', isFeatured: false, views: 134 },
    ];

    // Write all seed data
    this.cache.set('users', [devUser]);
    this.cache.set('posts', posts);
    this.cache.set('notifications', notifications);
    this.cache.set('chatRooms', chatRooms);
    this.cache.set('chatMessages', []);
    this.cache.set('quizResults', []);
    this.cache.set('subscriptions', []);
    this.cache.set('marketItems', marketItems);
    this.cache.set('newsArticles', newsArticles);
    this.cache.set('seeded', 'true');

    // Persist all to storage in parallel
    await Promise.all([
      AsyncStorage.setItem(DB_PREFIX + 'users', JSON.stringify([devUser])),
      AsyncStorage.setItem(DB_PREFIX + 'posts', JSON.stringify(posts)),
      AsyncStorage.setItem(DB_PREFIX + 'notifications', JSON.stringify(notifications)),
      AsyncStorage.setItem(DB_PREFIX + 'chatRooms', JSON.stringify(chatRooms)),
      AsyncStorage.setItem(DB_PREFIX + 'chatMessages', JSON.stringify([])),
      AsyncStorage.setItem(DB_PREFIX + 'quizResults', JSON.stringify([])),
      AsyncStorage.setItem(DB_PREFIX + 'subscriptions', JSON.stringify([])),
      AsyncStorage.setItem(DB_PREFIX + 'marketItems', JSON.stringify(marketItems)),
      AsyncStorage.setItem(DB_PREFIX + 'newsArticles', JSON.stringify(newsArticles)),
      AsyncStorage.setItem(DB_PREFIX + 'seeded', JSON.stringify('true')),
    ]);
  }

  hash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'h_' + Math.abs(hash).toString(36) + '_' + input.length;
  }

  async get<T>(key: string): Promise<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }
    const raw = await AsyncStorage.getItem(DB_PREFIX + key);
    const data = raw ? JSON.parse(raw) : null;
    this.cache.set(key, data);
    return data;
  }

  async set(key: string, data: any): Promise<void> {
    this.cache.set(key, data);
    await AsyncStorage.setItem(DB_PREFIX + key, JSON.stringify(data));
    this.notify(key, data);
  }

  async update(key: string, updater: (current: any) => any): Promise<void> {
    const current = await this.get(key);
    const updated = updater(current || []);
    await this.set(key, updated);
  }

  subscribe(key: string, listener: Listener): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);
    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }

  private notify(key: string, data: any) {
    this.listeners.get(key)?.forEach(listener => {
      try { listener(data); } catch (e) { /* silent */ }
    });
  }

  async clearAll() {
    const keys = await AsyncStorage.getAllKeys();
    const dbKeys = keys.filter(k => k.startsWith(DB_PREFIX));
    await AsyncStorage.multiRemove(dbKeys);
    this.cache.clear();
    this.listeners.clear();
    this.initialized = false;
    this.initPromise = null;
  }
}

export const db = new Database();
