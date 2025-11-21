import express, { Request, Response } from 'express';
import { getDB } from '../db/connection';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Get all menu items
router.get('/all', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const menusCollection = db.collection('menus');
    
    const menuItems = await menusCollection.find({}).toArray();
    
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all menus' });
  }
});

// Get menu items for a restaurant
router.get('/restaurant/:restaurantId', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const menusCollection = db.collection('menus');
    
    const menuItems = await menusCollection.find({
      restaurantId: req.params.restaurantId
    }).toArray();
    
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Get menu item by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const menusCollection = db.collection('menus');
    
    const menuItem = await menusCollection.findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
});

// Add menu item (admin only - for demo)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { restaurantId, name, description, price, image, isVeg, category } = req.body;
    
    const db = getDB();
    const menusCollection = db.collection('menus');
    
    const result = await menusCollection.insertOne({
      restaurantId,
      name,
      description,
      price,
      image,
      isVeg: isVeg || false,
      category: category || 'Main',
      createdAt: new Date()
    });
    
    res.json({ id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add menu item' });
  }
});

// Delete menu item (admin only - for demo)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const menusCollection = db.collection('menus');
    
    const result = await menusCollection.deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// Update menu item (admin only - for demo)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { restaurantId, name, description, price, image, isVeg, category } = req.body;
    const db = getDB();
    const menusCollection = db.collection('menus');
    
    const result = await menusCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: {
          restaurantId,
          name,
          description,
          price,
          image,
          isVeg,
          category,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json({ message: 'Menu item updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

export default router;
