import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function seedData() {
  console.log('🌱 Seeding database with sample data...\n');

  try {
    // Add restaurants
    console.log('📍 Adding restaurants...');
    const restaurants = [
      {
        name: 'Pizza Hut',
        cuisine: 'Pizzas, Italian',
        rating: 4.3,
        deliveryTime: '30-35',
        deliveryFee: 0,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'
      },
      {
        name: 'KFC',
        cuisine: 'Burgers, American, Fast Food',
        rating: 4.1,
        deliveryTime: '25-30',
        deliveryFee: 0,
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400'
      },
      {
        name: 'Burger King',
        cuisine: 'Burgers, American',
        rating: 4.2,
        deliveryTime: '20-25',
        deliveryFee: 0,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'
      }
    ];

    const restaurantIds: string[] = [];
    for (const restaurant of restaurants) {
      const response = await axios.post(`${API_URL}/restaurants`, restaurant);
      restaurantIds.push(response.data.id);
      console.log(`  ✅ Added: ${restaurant.name}`);
    }

    // Add menu items
    console.log('\n🍕 Adding menu items...');
    const menuItems = [
      {
        restaurantId: restaurantIds[0],
        name: 'Margherita Pizza',
        description: 'Classic delight with 100% real mozzarella cheese',
        price: 299,
        category: 'Pizza',
        isVeg: true,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300'
      },
      {
        restaurantId: restaurantIds[0],
        name: 'Pepperoni Pizza',
        description: 'American classic with pepperoni and cheese',
        price: 449,
        category: 'Pizza',
        isVeg: false,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300'
      },
      {
        restaurantId: restaurantIds[1],
        name: 'Zinger Burger',
        description: 'Crispy chicken fillet with spicy mayo',
        price: 199,
        category: 'Burgers',
        isVeg: false,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300'
      },
      {
        restaurantId: restaurantIds[1],
        name: 'Chicken Popcorn',
        description: 'Bite-sized crispy chicken pieces',
        price: 149,
        category: 'Snacks',
        isVeg: false,
        image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=300'
      },
      {
        restaurantId: restaurantIds[2],
        name: 'Whopper',
        description: 'Flame-grilled beef patty with fresh veggies',
        price: 189,
        category: 'Burgers',
        isVeg: false,
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300'
      },
      {
        restaurantId: restaurantIds[2],
        name: 'Veg Whopper',
        description: 'Flame-grilled veg patty with fresh veggies',
        price: 169,
        category: 'Burgers',
        isVeg: true,
        image: 'https://images.unsplash.com/photo-1585238341710-886a4ab3b6e4?w=300'
      }
    ];

    for (const item of menuItems) {
      await axios.post(`${API_URL}/menus`, item);
      console.log(`  ✅ Added: ${item.name}`);
    }

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`  • Restaurants: ${restaurants.length}`);
    console.log(`  • Menu Items: ${menuItems.length}`);
    console.log('\n🌐 Access admin panel at: http://localhost:5174/swiftyadmin');
    console.log('   Email: swifty@admin.sw');
    console.log('   Password: swifty-online\n');

  } catch (error: any) {
    console.error('❌ Seeding failed:', error.response?.data || error.message);
  }
}

seedData();
