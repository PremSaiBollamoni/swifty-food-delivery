import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

async function clearData() {
  try {
    const uri = process.env.MONGODB_URI || '';
    console.log('🔄 Connecting to MongoDB...');
    
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    await client.connect();
    
    const db = client.db('swifty-online');
    console.log('✅ Connected to database:', db.databaseName);
    
    // Clear all collections
    console.log('\n🗑️  Clearing collections...');
    
    const menusResult = await db.collection('menus').deleteMany({});
    console.log(`✅ Deleted ${menusResult.deletedCount} menu items`);
    
    const restaurantsResult = await db.collection('restaurants').deleteMany({});
    console.log(`✅ Deleted ${restaurantsResult.deletedCount} restaurants`);
    
    const ordersResult = await db.collection('orders').deleteMany({});
    console.log(`✅ Deleted ${ordersResult.deletedCount} orders`);
    
    console.log('\n✅ All data cleared successfully!');
    
    await client.close();
    console.log('👋 Connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearData();
