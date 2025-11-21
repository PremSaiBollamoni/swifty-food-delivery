import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

async function initializeCollections() {
  try {
    const uri = process.env.MONGODB_URI || '';
    console.log('🔄 Connecting to MongoDB...');
    
    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('swifty-online');
    console.log('✅ Connected to database:', db.databaseName);
    
    // Get existing collections
    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map(c => c.name);
    console.log('📋 Existing collections:', existingNames.join(', ') || 'None');
    
    // Create users collection
    if (!existingNames.includes('users')) {
      await db.createCollection('users');
      console.log('✅ Created collection: users');
    } else {
      console.log('ℹ️  Collection already exists: users');
    }
    // Create unique index on email
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('  📌 Index created: email (unique)');
    
    // Create restaurants collection
    if (!existingNames.includes('restaurants')) {
      await db.createCollection('restaurants');
      console.log('✅ Created collection: restaurants');
    } else {
      console.log('ℹ️  Collection already exists: restaurants');
    }
    // Create text indexes for search
    await db.collection('restaurants').createIndex({ name: 'text', cuisine: 'text' });
    console.log('  📌 Index created: name, cuisine (text search)');
    
    // Create menus collection
    if (!existingNames.includes('menus')) {
      await db.createCollection('menus');
      console.log('✅ Created collection: menus');
    } else {
      console.log('ℹ️  Collection already exists: menus');
    }
    // Create index on restaurantId
    await db.collection('menus').createIndex({ restaurantId: 1 });
    console.log('  📌 Index created: restaurantId');
    
    // Create orders collection
    if (!existingNames.includes('orders')) {
      await db.createCollection('orders');
      console.log('✅ Created collection: orders');
    } else {
      console.log('ℹ️  Collection already exists: orders');
    }
    // Create indexes
    await db.collection('orders').createIndex({ userId: 1 });
    console.log('  📌 Index created: userId');
    await db.collection('orders').createIndex({ createdAt: -1 });
    console.log('  📌 Index created: createdAt (descending)');
    
    // Verify all collections
    const finalCollections = await db.listCollections().toArray();
    console.log('\n📊 Final collections in database:');
    finalCollections.forEach(col => {
      console.log(`  • ${col.name}`);
    });
    
    // Get collection stats
    console.log('\n📈 Collection Statistics:');
    for (const col of finalCollections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`  ${col.name}: ${count} documents`);
    }
    
    await client.close();
    console.log('\n✅ All collections initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize collections:', error);
    process.exit(1);
  }
}

initializeCollections();
