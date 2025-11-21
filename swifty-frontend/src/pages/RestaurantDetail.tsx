import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantService, menuService } from '../services/api';
import { Button } from '../components/Button';
import { Snackbar } from '../components/Snackbar';
import { useCartStore } from '../store';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  isVeg: boolean;
  image?: string;
}

interface Restaurant {
  _id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
}

export const RestaurantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [filteredMenu, setFilteredMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [foodTypeFilter, setFoodTypeFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [itemQuantities, setItemQuantities] = useState<{ [key: string]: number }>({});
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [pendingItem, setPendingItem] = useState<MenuItem | null>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const { addItem, updateQuantity, clearCart, restaurantName: cartRestaurantName, items: cartItems } = useCartStore();

  // Sync item quantities with cart items
  useEffect(() => {
    const quantities: { [key: string]: number } = {};
    cartItems.forEach(item => {
      quantities[item.id] = item.quantity;
    });
    setItemQuantities(quantities);
  }, [cartItems]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [restaurantRes, menuRes] = await Promise.all([
          restaurantService.getById(id),
          menuService.getByRestaurant(id),
        ]);
        setRestaurant(restaurantRes.data);
        setMenu(menuRes.data);
        setFilteredMenu(menuRes.data);
      } catch (error) {
        console.error('Failed to fetch restaurant details:', error);
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Apply search and food type filters
  useEffect(() => {
    let filtered = [...menu];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Food type filter
    if (foodTypeFilter === 'veg') {
      filtered = filtered.filter(item => item.isVeg);
    } else if (foodTypeFilter === 'non-veg') {
      filtered = filtered.filter(item => !item.isVeg);
    }

    setFilteredMenu(filtered);
  }, [searchQuery, foodTypeFilter, menu]);

  const handleAddToCart = (item: MenuItem) => {
    const success = addItem({
      id: item._id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image || '',
      restaurantId: id,
      restaurantName: restaurant?.name,
    });

    if (!success) {
      setPendingItem(item);
      setShowReplaceModal(true);
    } else {
      setItemQuantities(prev => ({ ...prev, [item._id]: 1 }));
    }
  };

  const handleQuantityChange = (itemId: string, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity === 0) {
      updateQuantity(itemId, 0);
      setItemQuantities(prev => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
    } else {
      updateQuantity(itemId, newQuantity);
      setItemQuantities(prev => ({ ...prev, [itemId]: newQuantity }));
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#93959F' }}>
        Loading restaurant details...
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#93959F' }}>
        Restaurant not found
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: 'calc(100vh - 80px)', paddingBottom: '40px', width: '100%', paddingTop: '80px' }}>
      <div style={{
        padding: '40px 40px',
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: '#FF8A00',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 600,
            marginBottom: '24px',
            fontFamily: 'Poppins, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#F87400'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#FF8A00'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
          Back
        </button>

        {/* Restaurant Hero Banner */}
        <div style={{
          backgroundColor: 'linear-gradient(135deg, #FF8A00 0%, #F87400 100%)',
          borderRadius: '20px',
          overflow: 'hidden',
          marginBottom: '32px',
          boxShadow: '0 8px 32px rgba(255,138,0,0.2)',
          position: 'relative',
          background: 'linear-gradient(135deg, #FF8A00 0%, #F87400 100%)',
        }}>
          <div style={{
            padding: '48px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}>
            <div>
              <div style={{
                display: 'inline-block',
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                padding: '8px 16px',
                borderRadius: '20px',
                marginBottom: '16px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#FFFFFF',
                fontFamily: 'Poppins, sans-serif',
              }}>
                ⚡ FASTEST DELIVERY
              </div>
              <h1 style={{ 
                color: '#FFFFFF', 
                fontSize: '48px', 
                margin: 0, 
                marginBottom: '16px', 
                fontFamily: 'Poppins, sans-serif', 
                fontWeight: 800,
                textShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}>
                {restaurant.name}
              </h1>

              <div style={{
                display: 'flex',
                gap: '24px',
                fontSize: '16px',
                color: '#FFFFFF',
                flexWrap: 'wrap',
                fontFamily: 'Poppins, sans-serif',
                marginBottom: '20px',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFD700">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                  <span style={{ fontWeight: 700 }}>{restaurant.rating}</span> Rating
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                  <span style={{ fontWeight: 700 }}>{restaurant.deliveryTime}</span> min
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF">
                    <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
                  </svg>
                  {restaurant.cuisine}
                </span>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FFFFFF',
                color: '#FF8A00',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 700,
                fontFamily: 'Poppins, sans-serif',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#60B246">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
                FREE DELIVERY
              </div>
            </div>

            {/* Decorative Elements */}
            <div style={{
              position: 'absolute',
              right: '48px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '180px',
              opacity: 0.1,
              userSelect: 'none',
            }}>
              🍕
            </div>
          </div>
        </div>

        {/* Offers Banner */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '40px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
          {/* Deal 1 */}
          <div style={{
            border: '1px solid #E9E9EB',
            borderRadius: '12px',
            padding: '20px 24px',
            minWidth: '320px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            backgroundColor: '#FFFFFF',
            transition: 'all 0.2s',
            cursor: 'pointer',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                right: '6px',
                fontSize: '10px',
                fontWeight: 700,
                color: '#FFFFFF',
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '4px',
                padding: '2px 4px',
                textAlign: 'center',
                fontFamily: 'Poppins, sans-serif',
                lineHeight: 1,
              }}>
                DEAL
              </div>
              <div style={{
                position: 'absolute',
                bottom: '6px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#FFFFFF',
                fontFamily: 'Poppins, sans-serif',
              }}>
                OF DAY
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#1A1A1A',
                margin: 0,
                marginBottom: '4px',
                fontFamily: 'Poppins, sans-serif',
              }}>
                Items At ₹79
              </h3>
              <p style={{
                fontSize: '13px',
                color: '#93959F',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                fontFamily: 'Poppins, sans-serif',
              }}>
                ON SELECT ITEMS |
              </p>
            </div>
          </div>

          {/* Deal 2 */}
          <div style={{
            border: '1px solid #E9E9EB',
            borderRadius: '12px',
            padding: '20px 24px',
            minWidth: '320px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            backgroundColor: '#FFFFFF',
            transition: 'all 0.2s',
            cursor: 'pointer',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #FF8A00 0%, #F87400 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '32px',
              fontWeight: 900,
              color: '#FFFFFF',
              fontFamily: 'Poppins, sans-serif',
              fontStyle: 'italic',
            }}>
              B
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#1A1A1A',
                margin: 0,
                marginBottom: '4px',
                fontFamily: 'Poppins, sans-serif',
              }}>
                20% Off Upto ₹130
              </h3>
              <p style={{
                fontSize: '13px',
                color: '#93959F',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                fontFamily: 'Poppins, sans-serif',
              }}>
                USE BOBDC130
              </p>
            </div>
          </div>

          {/* Deal 3 */}
          <div style={{
            border: '1px solid #E9E9EB',
            borderRadius: '12px',
            padding: '20px 24px',
            minWidth: '320px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            backgroundColor: '#FFFFFF',
            transition: 'all 0.2s',
            cursor: 'pointer',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #E31E24 0%, #C41E3A 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="#FFFFFF">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#1A1A1A',
                margin: 0,
                marginBottom: '4px',
                fontFamily: 'Poppins, sans-serif',
              }}>
                15% Off Upto ₹100
              </h3>
              <p style={{
                fontSize: '13px',
                color: '#93959F',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                fontFamily: 'Poppins, sans-serif',
              }}>
                USE WELCOME15
              </p>
            </div>
          </div>
        </div>

        <h2 style={{
          color: '#1A1A1A',
          fontSize: '24px',
          marginBottom: '24px',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600,
        }}>
          Menu
        </h2>

        {/* Search and Filters */}
        <div style={{
          marginBottom: '32px',
        }}>
          {/* Search Bar */}
          <div style={{ marginBottom: '16px', position: 'relative', maxWidth: '500px' }}>
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                border: '1px solid #E9E9EB',
                borderRadius: '8px',
                fontSize: '15px',
                fontFamily: 'Poppins, sans-serif',
                outline: 'none',
                transition: 'all 0.2s',
                backgroundColor: '#FFFFFF',
                color: '#1A1A1A',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#FF8A00';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,138,0,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E9E9EB';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <svg 
              style={{ 
                position: 'absolute', 
                left: '14px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                fill: '#93959F'
              }} 
              viewBox="0 0 24 24"
            >
              <path d="M21.71 20.29l-5.4-5.4a8 8 0 1 0-1.42 1.42l5.4 5.4a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42zM10 16a6 6 0 1 1 6-6 6 6 0 0 1-6 6z"/>
            </svg>
          </div>

          {/* Food Type Filter Toggles */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Veg Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 16px',
              border: '1px solid #E9E9EB',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
            }}>
              <span style={{
                fontSize: '15px',
                fontWeight: 500,
                color: '#3E4152',
                fontFamily: 'Poppins, sans-serif',
              }}>Veg</span>
              <div
                onClick={() => setFoodTypeFilter(foodTypeFilter === 'veg' ? 'all' : 'veg')}
                style={{
                  width: '44px',
                  height: '24px',
                  backgroundColor: foodTypeFilter === 'veg' ? '#60B246' : '#E9E9EB',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.3s',
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: foodTypeFilter === 'veg' ? '22px' : '2px',
                  transition: 'left 0.3s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }} />
              </div>
            </div>

            {/* Non-Veg Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 16px',
              border: '1px solid #E9E9EB',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
            }}>
              <span style={{
                fontSize: '15px',
                fontWeight: 500,
                color: '#3E4152',
                fontFamily: 'Poppins, sans-serif',
              }}>Non-Veg</span>
              <div
                onClick={() => setFoodTypeFilter(foodTypeFilter === 'non-veg' ? 'all' : 'non-veg')}
                style={{
                  width: '44px',
                  height: '24px',
                  backgroundColor: foodTypeFilter === 'non-veg' ? '#E03636' : '#E9E9EB',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.3s',
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: foodTypeFilter === 'non-veg' ? '22px' : '2px',
                  transition: 'left 0.3s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
          width: '100%',
        }}>
          {filteredMenu.map((item) => (
            <div
              key={item._id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #E9E9EB',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div>
                {/* Food Image */}
                {item.image && (
                  <div style={{
                    width: '100%',
                    height: '180px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '16px',
                  }}>
                    <img 
                      src={item.image} 
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '12px',
                }}>
                  <h3 style={{ 
                    color: '#1A1A1A', 
                    margin: 0, 
                    fontSize: '18px', 
                    fontFamily: 'Poppins, sans-serif', 
                    fontWeight: 600 
                  }}>
                    {item.name}
                  </h3>
                  <span style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: item.isVeg ? '#E8F5E9' : '#FFEBEE',
                    color: item.isVeg ? '#2E7D32' : '#C62828',
                    fontWeight: 600,
                    border: `1px solid ${item.isVeg ? '#60B246' : '#E03636'}`,
                  }}>
                    {item.isVeg ? '● VEG' : '● NON-VEG'}
                  </span>
                </div>

                <p style={{
                  color: '#686B78',
                  fontSize: '14px',
                  marginBottom: '12px',
                  margin: 0,
                  marginTop: '8px',
                  fontFamily: 'Poppins, sans-serif',
                  lineHeight: '1.5',
                }}>
                  {item.description}
                </p>

                <p style={{ 
                  color: '#FF8A00', 
                  fontWeight: 600, 
                  fontSize: '20px', 
                  margin: 0, 
                  marginTop: '12px',
                  fontFamily: 'Poppins, sans-serif',
                }}>
                  Rs {item.price}
                </p>
              </div>

              <div style={{ marginTop: '20px' }}>
                {itemQuantities[item._id] ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#FFF7ED',
                    border: '2px solid #FF8A00',
                    borderRadius: '8px',
                    padding: '8px 12px',
                  }}>
                    <button
                      onClick={() => handleQuantityChange(item._id, itemQuantities[item._id], -1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#FF8A00',
                        fontSize: '24px',
                        cursor: 'pointer',
                        padding: '0 12px',
                        fontWeight: 600,
                      }}
                    >
                      −
                    </button>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#FF8A00',
                      fontFamily: 'Poppins, sans-serif',
                      minWidth: '30px',
                      textAlign: 'center',
                    }}>
                      {itemQuantities[item._id]}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item._id, itemQuantities[item._id], 1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#FF8A00',
                        fontSize: '24px',
                        cursor: 'pointer',
                        padding: '0 12px',
                        fontWeight: 600,
                      }}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      const success = addItem({
                        id: item._id,
                        name: item.name,
                        price: item.price,
                        quantity: 1,
                        image: item.image || '',
                        restaurantId: id,
                        restaurantName: restaurant?.name,
                      });

                      if (!success) {
                        setPendingItem(item);
                        setShowReplaceModal(true);
                      } else {
                        setItemQuantities(prev => ({ ...prev, [item._id]: 1 }));
                      }
                    }}
                  >
                    Add to Cart
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Replace Cart Modal */}
      {showReplaceModal && pendingItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#1A1A1A',
              marginBottom: '16px',
              fontFamily: 'Poppins, sans-serif',
            }}>
              Replace cart items?
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#686B78',
              marginBottom: '24px',
              fontFamily: 'Poppins, sans-serif',
            }}>
              Your cart contains items from <strong>{cartRestaurantName}</strong>. Do you want to discard those and add items from <strong>{restaurant?.name}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setShowReplaceModal(false);
                  setPendingItem(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  if (pendingItem) {
                    clearCart();
                    addItem({
                      id: pendingItem._id,
                      name: pendingItem.name,
                      price: pendingItem.price,
                      quantity: 1,
                      image: pendingItem.image || '',
                      restaurantId: id,
                      restaurantName: restaurant?.name,
                    });
                    setItemQuantities({ [pendingItem._id]: 1 });
                  }
                  setShowReplaceModal(false);
                  setPendingItem(null);
                }}
              >
                Replace Cart
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar(null)}
        />
      )}
    </div>
  );
};
