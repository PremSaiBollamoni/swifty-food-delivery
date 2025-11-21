import { getDB } from '../db/connection';
import { connectDB } from '../db/connection';

async function seedDatabase() {
  try {
    await connectDB();
    const db = getDB();

    // Seed restaurants with professional data
    const restaurants = [
      {
        name: 'Pizza Hut',
        cuisine: 'Pizzas, Italian',
        rating: 4.3,
        deliveryTime: '30-35',
        deliveryFee: 40,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      },
      {
        name: 'KFC',
        cuisine: 'Burgers, American, Fast Food',
        rating: 4.1,
        deliveryTime: '25-30',
        deliveryFee: 50,
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400',
      },
      {
        name: 'Burger King',
        cuisine: 'Burgers, American',
        rating: 4.2,
        deliveryTime: '20-25',
        deliveryFee: 30,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      },
      {
        name: 'Biryani Blues',
        cuisine: 'Biryani, North Indian, Mughlai',
        rating: 4.5,
        deliveryTime: '35-40',
        deliveryFee: 0,
        image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400',
      },
      {
        name: 'Subway',
        cuisine: 'Healthy Food, Salads, Sandwiches',
        rating: 4.0,
        deliveryTime: '20-25',
        deliveryFee: 35,
        image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400',
      },
      {
        name: 'Dominos Pizza',
        cuisine: 'Pizzas, Italian, Pastas',
        rating: 4.4,
        deliveryTime: '30-35',
        deliveryFee: 40,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
      },
      {
        name: 'Starbucks',
        cuisine: 'Cafe, Beverages, Desserts',
        rating: 4.6,
        deliveryTime: '15-20',
        deliveryFee: 50,
        image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400',
      },
      {
        name: 'McDonalds',
        cuisine: 'Burgers, Fast Food, Beverages',
        rating: 4.3,
        deliveryTime: '25-30',
        deliveryFee: 40,
        image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400',
      },
      {
        name: 'The Belgian Waffle Co',
        cuisine: 'Waffles, Desserts, Ice Cream',
        rating: 4.4,
        deliveryTime: '30-35',
        deliveryFee: 45,
        image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400',
      },
      {
        name: 'Haldirams',
        cuisine: 'Sweets, North Indian, South Indian',
        rating: 4.2,
        deliveryTime: '25-30',
        deliveryFee: 0,
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
      },
      {
        name: 'Wow! Momo',
        cuisine: 'Momos, Tibetan, Chinese',
        rating: 4.1,
        deliveryTime: '20-25',
        deliveryFee: 35,
        image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400',
      },
      {
        name: 'Punjabi Angithi',
        cuisine: 'North Indian, Punjabi, Tandoor',
        rating: 4.5,
        deliveryTime: '35-40',
        deliveryFee: 40,
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
      },
      {
        name: 'Chinese Wok',
        cuisine: 'Chinese, Asian, Thai',
        rating: 4.0,
        deliveryTime: '30-35',
        deliveryFee: 45,
        image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
      },
      {
        name: 'Cafe Coffee Day',
        cuisine: 'Cafe, Beverages, Snacks',
        rating: 3.9,
        deliveryTime: '20-25',
        deliveryFee: 30,
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
      },
      {
        name: 'Baskin Robbins',
        cuisine: 'Ice Cream, Desserts',
        rating: 4.5,
        deliveryTime: '15-20',
        deliveryFee: 40,
        image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400',
      },
    ];

    const restaurantsCol = db.collection('restaurants');
    await restaurantsCol.deleteMany({});
    const restaurantResults = await restaurantsCol.insertMany(restaurants);
    const restaurantIds = Object.values(restaurantResults.insertedIds) as any[];

    console.log('✅ Seeded 15 restaurants');

    // Seed menu items
    const menuItems: any[] = [];

    // Pizza Hut
    menuItems.push(
      { restaurantId: (restaurantIds[0] as any).toString(), name: 'Margherita Pizza', price: 299, description: 'Classic delight with cheese', isVeg: true, category: 'Pizza' },
      { restaurantId: (restaurantIds[0] as any).toString(), name: 'Pepperoni Pizza', price: 449, description: 'American classic', isVeg: false, category: 'Pizza' },
      { restaurantId: (restaurantIds[0] as any).toString(), name: 'Garlic Bread', price: 149, description: 'Crispy garlic bread', isVeg: true, category: 'Sides' },
    );

    // KFC
    menuItems.push(
      { restaurantId: (restaurantIds[1] as any).toString(), name: 'Zinger Burger', price: 199, description: 'Spicy zinger patty', isVeg: false, category: 'Burgers' },
      { restaurantId: (restaurantIds[1] as any).toString(), name: 'Hot Wings', price: 229, description: '4 pc hot wings', isVeg: false, category: 'Chicken' },
      { restaurantId: (restaurantIds[1] as any).toString(), name: 'Popcorn Chicken', price: 179, description: 'Bite-sized chicken', isVeg: false, category: 'Chicken' },
    );

    // Burger King
    menuItems.push(
      { restaurantId: (restaurantIds[2] as any).toString(), name: 'Whopper', price: 219, description: 'Flame-grilled beef burger', isVeg: false, category: 'Burgers' },
      { restaurantId: (restaurantIds[2] as any).toString(), name: 'Veg Whopper', price: 189, description: 'Plant-based whopper', isVeg: true, category: 'Burgers' },
      { restaurantId: (restaurantIds[2] as any).toString(), name: 'Fries', price: 99, description: 'Crispy french fries', isVeg: true, category: 'Sides' },
    );

    // Biryani Blues
    menuItems.push(
      { restaurantId: (restaurantIds[3] as any).toString(), name: 'Hyderabadi Chicken Biryani', price: 349, description: 'Authentic Hyderabadi biryani', isVeg: false, category: 'Biryani' },
      { restaurantId: (restaurantIds[3] as any).toString(), name: 'Veg Biryani', price: 299, description: 'Mixed veg biryani', isVeg: true, category: 'Biryani' },
      { restaurantId: (restaurantIds[3] as any).toString(), name: 'Raita', price: 49, description: 'Cooling yogurt raita', isVeg: true, category: 'Sides' },
    );

    // Subway
    menuItems.push(
      { restaurantId: (restaurantIds[4] as any).toString(), name: 'Veggie Delite Sub', price: 199, description: 'Fresh veggies', isVeg: true, category: 'Subs' },
      { restaurantId: (restaurantIds[4] as any).toString(), name: 'Chicken Teriyaki Sub', price: 269, description: 'Teriyaki chicken', isVeg: false, category: 'Subs' },
      { restaurantId: (restaurantIds[4] as any).toString(), name: 'Cookies', price: 79, description: 'Chocolate chip cookies', isVeg: true, category: 'Desserts' },
    );

    const menusCol = db.collection('menus');
    await menusCol.deleteMany({});
    await menusCol.insertMany(menuItems);

    console.log('✅ Seeded menu items');
    console.log('✅ Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
