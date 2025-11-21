import express, { Request, Response } from 'express';
import { getDB } from '../db/connection';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Get all orders (admin)
router.get('/all', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const ordersCollection = db.collection('orders');
    
    const orders = await ordersCollection.find({}).sort({ createdAt: -1 }).toArray();
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all orders' });
  }
});

// Create order
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, restaurantId, items, totalPrice, deliveryAddress } = req.body;
    
    if (!userId || !restaurantId || !items || !totalPrice) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const db = getDB();
    const ordersCollection = db.collection('orders');
    
    const result = await ordersCollection.insertOne({
      userId: new ObjectId(userId),
      restaurantId,
      items,
      totalPrice,
      deliveryAddress,
      status: 'Confirmed',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.json({ 
      orderId: result.insertedId,
      status: 'Confirmed',
      message: 'Order placed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get user orders
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const ordersCollection = db.collection('orders');
    
    const orders = await ordersCollection.find({
      userId: new ObjectId(req.params.userId)
    }).sort({ createdAt: -1 }).toArray();
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const ordersCollection = db.collection('orders');
    
    const order = await ordersCollection.findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const db = getDB();
    const ordersCollection = db.collection('orders');
    
    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ success: true, message: 'Order updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Update order status (PUT)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const db = getDB();
    const ordersCollection = db.collection('orders');
    
    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ success: true, message: 'Order updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

export default router;
