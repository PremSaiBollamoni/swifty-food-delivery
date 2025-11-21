import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI!;

async function checkMenus() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    const db = client.db('swifty-online');
    const menusCollection = db.collection('menus');
    const restaurantsCollection = db.collection('restaurants');
    
    console.log('\n📋 All Restaurants:');
    const restaurants = await restaurantsCollection.find({}).toArray();
    restaurants.forEach(r => {
      console.log(`  ID: ${r._id} | Name: ${r.name}`);
    });
    
    console.log('\n🍕 All Menu Items:');
    const menus = await menusCollection.find({}).toArray();
    menus.forEach(m => {
      console.log(`  Menu: ${m.name} | RestaurantID: ${m.restaurantId} | Type: ${typeof m.restaurantId}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkMenus();
