import { MongoClient, Db } from 'mongodb';

let db: Db;

export async function connectDB(): Promise<Db> {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/swifty-online';
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    await client.connect();
    db = client.db('swifty-online');
    
    // Create collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
      // Create unique index on email
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
    }
    
    if (!collectionNames.includes('restaurants')) {
      await db.createCollection('restaurants');
      // Create indexes for search functionality
      await db.collection('restaurants').createIndex({ name: 'text', cuisine: 'text' });
    }
    
    if (!collectionNames.includes('menus')) {
      await db.createCollection('menus');
      // Create index on restaurantId for efficient queries
      await db.collection('menus').createIndex({ restaurantId: 1 });
    }
    
    if (!collectionNames.includes('orders')) {
      await db.createCollection('orders');
      // Create index on userId for efficient user order queries
      await db.collection('orders').createIndex({ userId: 1 });
      // Create index on createdAt for sorting
      await db.collection('orders').createIndex({ createdAt: -1 });
    }
    
    console.log('✅ MongoDB connected to swifty-online database');
    console.log('✅ Collections created:', ['users', 'restaurants', 'menus', 'orders']);
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

export function getDB(): Db {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
}
