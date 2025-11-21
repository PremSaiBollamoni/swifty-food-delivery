import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

async function testConnection() {
  try {
    const uri = process.env.MONGODB_URI || '';
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📍 URI:', uri.replace(/:[^:@]+@/, ':****@')); // Hide password in logs
    
    const client = new MongoClient(uri);
    await client.connect();
    
    console.log('✅ MongoDB connection successful!');
    
    // Test database access
    const db = client.db('swifty-online');
    console.log('📊 Database name:', db.databaseName);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📋 Existing collections:', collections.map(c => c.name).join(', ') || 'None');
    
    // Test ping
    await db.admin().ping();
    console.log('🏓 Ping successful!');
    
    await client.close();
    console.log('👋 Connection closed successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error(error);
    process.exit(1);
  }
}

testConnection();
