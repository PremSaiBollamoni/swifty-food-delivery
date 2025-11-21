import express, { Request, Response } from 'express';
import { getDB } from '../db/connection';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Get all restaurants
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const restaurantsCollection = db.collection('restaurants');
    const restaurants = await restaurantsCollection.find({}).toArray();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Search restaurants
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const db = getDB();
    const restaurantsCollection = db.collection('restaurants');
    
    const restaurants = await restaurantsCollection.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { cuisine: { $regex: query, $options: 'i' } }
      ]
    }).toArray();
    
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get restaurant by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const restaurantsCollection = db.collection('restaurants');
    const restaurant = await restaurantsCollection.findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
});

// Add restaurant (admin only - for demo)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, cuisine, rating, deliveryTime, deliveryFee, image } = req.body;
    
    const db = getDB();
    const restaurantsCollection = db.collection('restaurants');
    
    const result = await restaurantsCollection.insertOne({
      name,
      cuisine,
      rating: rating || 4.5,
      deliveryTime: deliveryTime || '30-45',
      deliveryFee: deliveryFee || 0,
      image,
      createdAt: new Date()
    });
    
    res.json({ id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add restaurant' });
  }
});

// Delete restaurant (admin only - for demo)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const restaurantsCollection = db.collection('restaurants');
    const menusCollection = db.collection('menus');
    
    console.log('Deleting restaurant with ID:', req.params.id);
    
    // First delete all menu items for this restaurant
    const menuDeleteResult = await menusCollection.deleteMany({ restaurantId: req.params.id });
    console.log('Deleted menu items count:', menuDeleteResult.deletedCount);
    
    // Then delete the restaurant
    const result = await restaurantsCollection.deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    console.log('Deleted restaurant count:', result.deletedCount);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json({ 
      message: 'Restaurant and its menu items deleted successfully',
      menuItemsDeleted: menuDeleteResult.deletedCount
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete restaurant' });
  }
});

// Update restaurant (admin only - for demo)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, cuisine, rating, deliveryTime, deliveryFee, image } = req.body;
    const db = getDB();
    const restaurantsCollection = db.collection('restaurants');
    
    const result = await restaurantsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: {
          name,
          cuisine,
          rating,
          deliveryTime,
          deliveryFee,
          image,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json({ message: 'Restaurant updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update restaurant' });
  }
});

export default router;
