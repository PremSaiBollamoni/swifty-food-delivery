import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/api';
import { useAuthStore } from '../store';
import { COLORS } from '../config/colors';
import { Button } from '../components/Button';

interface Order {
  _id: string;
  userId?: string;
  items: any[];
  totalPrice: number;
  status: string;
  deliveryAddress: string;
  paymentMethod?: string;
  createdAt: string;
}

export const Orders = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await orderService.getUserOrders(user.id);
        setOrders(response.data);
      } catch (error: any) {
        console.error('Failed to fetch orders', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
    
    // Auto-refresh orders every 5 seconds to show updated status
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [user, navigate]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading your orders...</div>;
  }

  return (
    <div style={{
      backgroundColor: COLORS.cream,
      minHeight: 'calc(100vh - 80px)',
      padding: '40px 24px',
      paddingTop: '120px',
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        <h1 style={{ color: COLORS.charcoal, fontSize: '32px', marginBottom: '32px' }}>
          Your Orders
        </h1>

        {orders.length === 0 ? (
          <div style={{
            backgroundColor: COLORS.white,
            borderRadius: '12px',
            padding: '60px 24px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '48px', margin: 0 }}>📦</p>
            <h2 style={{ color: COLORS.charcoal, marginTop: '16px' }}>No orders yet</h2>
            <p style={{ color: COLORS.grey, marginBottom: '24px' }}>
              Start ordering delicious food now!
            </p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Explore Restaurants
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '24px' }}>
            {orders.map((order) => (
              <div
                key={order._id}
                style={{
                  backgroundColor: COLORS.white,
                  borderRadius: '12px',
                  padding: '24px',
                  border: `2px solid ${
                    order.status === 'Delivered'
                      ? COLORS.success
                      : order.status === 'Cancelled'
                        ? COLORS.error
                        : COLORS.primary
                  }`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <h3 style={{ color: COLORS.charcoal, margin: '0 0 8px 0' }}>
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <p style={{ color: COLORS.grey, margin: 0, fontSize: '14px' }}>
                      {new Date(order.createdAt).toLocaleDateString()} -{' '}
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>

                  <span
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor:
                        order.status === 'Delivered'
                          ? COLORS.success
                          : order.status === 'Cancelled'
                            ? COLORS.error
                            : COLORS.primary,
                      color: COLORS.white,
                      fontWeight: '600',
                      fontSize: '14px',
                    }}
                  >
                    {order.status}
                  </span>
                </div>

                <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: `1px solid ${COLORS.borderGrey}` }}>
                  <h4 style={{ color: COLORS.charcoal, margin: '0 0 12px 0' }}>Items:</h4>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                      <span>{item.name} x {item.quantity}</span>
                      <span style={{ fontWeight: '600' }}>Rs {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: COLORS.softBlack, margin: 0, fontSize: '14px', marginBottom: '8px' }}>
                    <strong>Delivery Address:</strong> {order.deliveryAddress}
                  </p>
                  <p style={{ color: COLORS.charcoal, margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                    Total: Rs {order.totalPrice.toFixed(2)}
                  </p>
                </div>

                {order.status === 'Confirmed' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/order-tracking/${order._id}`)}
                  >
                    Track Order
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
