import { useEffect, useState } from 'react';
import { restaurantService } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store';

interface Restaurant {
  _id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  image?: string;
}

export const Home = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [deliveryTimeFilter, setDeliveryTimeFilter] = useState<string>('all');
  const [freeDeliveryFilter, setFreeDeliveryFilter] = useState<boolean>(false);
  const [showRatingDropdown, setShowRatingDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const { items: cartItems, showCartToast, setShowCartToast } = useCartStore();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await restaurantService.getAll();
        setRestaurants(response.data);
        setFilteredRestaurants(response.data);
      } catch (error) {
        console.error('Failed to fetch restaurants:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  // Apply filters whenever search or filter values change
  useEffect(() => {
    let filtered = [...restaurants];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      const minRating = parseFloat(ratingFilter);
      filtered = filtered.filter(r => r.rating >= minRating);
    }

    // Delivery time filter
    if (deliveryTimeFilter !== 'all') {
      const maxTime = parseInt(deliveryTimeFilter);
      filtered = filtered.filter(r => {
        const time = parseInt(r.deliveryTime.split('-')[1]);
        return time <= maxTime;
      });
    }

    // Free delivery filter
    if (freeDeliveryFilter) {
      filtered = filtered.filter(r => r.deliveryFee === 0);
    }

    setFilteredRestaurants(filtered);
  }, [searchQuery, ratingFilter, deliveryTimeFilter, freeDeliveryFilter, restaurants]);

  if (loading) {
    return (
      <div style={{
        padding: '40px 24px',
        textAlign: 'center',
        color: '#93959F',
      }}>
        Loading restaurants...
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      minHeight: 'calc(100vh - 80px)',
      width: '100%',
      paddingTop: '80px',
    }}>
      {/* Hero Section */}
      <div style={{
        backgroundColor: '#FF8A00',
        padding: '60px 40px',
        borderBottom: '1px solid #F87400',
        width: '100%',
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 800,
          color: '#FFFFFF',
          marginBottom: '12px',
          letterSpacing: '-0.5px',
          fontFamily: 'Poppins, sans-serif',
        }}>
          Order food & groceries. Discover best restaurants. Swifty it!
        </h1>
      </div>

      {/* Deals Section */}
      <div style={{
        padding: '40px 40px 20px 40px',
        width: '100%',
        backgroundColor: '#FFFFFF',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#1A1A1A',
            margin: 0,
            fontFamily: 'Poppins, sans-serif',
          }}>
            Deals for you
          </h2>
          <div style={{
            display: 'flex',
            gap: '12px',
          }}>
            <button
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1px solid #E9E9EB',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F5F5F5';
                e.currentTarget.style.borderColor = '#D1D1D6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E9E9EB';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3E4152" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <button
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1px solid #E9E9EB',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F5F5F5';
                e.currentTarget.style.borderColor = '#D1D1D6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E9E9EB';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3E4152" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Deals Cards */}
        <div style={{
          display: 'flex',
          gap: '16px',
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
      </div>

      {/* Restaurants Section */}
      <div style={{
        padding: '40px 40px',
        width: '100%',
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 600,
          color: '#1A1A1A',
          marginBottom: '32px',
        }}>
          All Restaurants
        </h2>

        {/* Search and Filters */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '32px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          {/* Search Bar */}
          <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search restaurants or cuisines..."
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

          {/* Rating Filter */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowRatingDropdown(!showRatingDropdown);
                setShowTimeDropdown(false);
              }}
              style={{
                padding: '12px 16px',
                border: '1px solid #E9E9EB',
                borderRadius: '8px',
                fontSize: '15px',
                fontFamily: 'Poppins, sans-serif',
                cursor: 'pointer',
                backgroundColor: '#FFFFFF',
                color: '#3E4152',
                minWidth: '150px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <span>{ratingFilter === 'all' ? 'All Ratings' : `${ratingFilter}+ Stars`}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>
            {showRatingDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E9E9EB',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 100,
                minWidth: '150px',
                padding: '8px',
              }}>
                {[{ value: 'all', label: 'All Ratings' }, { value: '4.5', label: '4.5+ Stars' }, { value: '4.0', label: '4.0+ Stars' }, { value: '3.5', label: '3.5+ Stars' }].map(option => (
                  <label
                    key={option.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '15px',
                      transition: 'background 0.2s',
                      backgroundColor: ratingFilter === option.value ? '#FFF7ED' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (ratingFilter !== option.value) {
                        e.currentTarget.style.backgroundColor = '#F5F5F5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (ratingFilter !== option.value) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name="rating"
                      value={option.value}
                      checked={ratingFilter === option.value}
                      onChange={() => {
                        setRatingFilter(option.value);
                        setShowRatingDropdown(false);
                      }}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        accentColor: '#FF8A00',
                      }}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Time Filter */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowTimeDropdown(!showTimeDropdown);
                setShowRatingDropdown(false);
              }}
              style={{
                padding: '12px 16px',
                border: '1px solid #E9E9EB',
                borderRadius: '8px',
                fontSize: '15px',
                fontFamily: 'Poppins, sans-serif',
                cursor: 'pointer',
                backgroundColor: '#FFFFFF',
                color: '#3E4152',
                minWidth: '170px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <span>{deliveryTimeFilter === 'all' ? 'All Delivery Times' : `Under ${deliveryTimeFilter} min`}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>
            {showTimeDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E9E9EB',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 100,
                minWidth: '170px',
                padding: '8px',
              }}>
                {[{ value: 'all', label: 'All Delivery Times' }, { value: '20', label: 'Under 20 min' }, { value: '30', label: 'Under 30 min' }, { value: '40', label: 'Under 40 min' }].map(option => (
                  <label
                    key={option.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '15px',
                      transition: 'background 0.2s',
                      backgroundColor: deliveryTimeFilter === option.value ? '#FFF7ED' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (deliveryTimeFilter !== option.value) {
                        e.currentTarget.style.backgroundColor = '#F5F5F5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (deliveryTimeFilter !== option.value) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name="deliveryTime"
                      value={option.value}
                      checked={deliveryTimeFilter === option.value}
                      onChange={() => {
                        setDeliveryTimeFilter(option.value);
                        setShowTimeDropdown(false);
                      }}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        accentColor: '#FF8A00',
                      }}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Free Delivery Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            border: '1px solid #E9E9EB',
            borderRadius: '8px',
            fontSize: '15px',
            fontFamily: 'Poppins, sans-serif',
            backgroundColor: '#FFFFFF',
            color: '#3E4152',
            fontWeight: 500,
          }}>
            <span>Free Delivery</span>
            <div
              onClick={() => setFreeDeliveryFilter(!freeDeliveryFilter)}
              style={{
                width: '44px',
                height: '24px',
                backgroundColor: freeDeliveryFilter ? '#FF8A00' : '#E9E9EB',
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
                left: freeDeliveryFilter ? '22px' : '2px',
                transition: 'left 0.3s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }} />
            </div>
          </div>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 24px',
            color: '#93959F',
          }}>
            <p style={{ fontSize: '18px' }}>No restaurants available</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '32px',
            width: '100%',
          }}>
            {filteredRestaurants.map((restaurant) => (
              <Link 
                key={restaurant._id} 
                to={`/restaurant/${restaurant._id}`} 
                style={{ textDecoration: 'none' }}
              >
                <div 
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    height: '100%',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.transform = 'translateY(-8px)';
                    el.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = 'none';
                  }}
                >
                  {/* Restaurant Image */}
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '180px',
                    backgroundColor: '#F0F0F5',
                    overflow: 'hidden',
                  }}>
                    {restaurant.image && restaurant.image.startsWith('http') ? (
                      <img 
                        src={restaurant.image} 
                        alt={restaurant.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `linear-gradient(135deg, #FF8A00 0%, #F87400 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '72px',
                      }}>
                        {restaurant.image || '🍴'}
                      </div>
                    )}
                    
                    {/* Delivery Time Overlay */}
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      right: '0',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                      padding: '24px 16px 12px',
                      color: '#FFFFFF',
                      fontSize: '18px',
                      fontWeight: 600,
                    }}>
                      {restaurant.deliveryTime} min
                    </div>
                  </div>

                  {/* Restaurant Info */}
                  <div style={{ padding: '16px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#1A1A1A',
                      marginBottom: '6px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {restaurant.name}
                    </h3>

                    <p style={{
                      fontSize: '14px',
                      color: '#686B78',
                      marginBottom: '12px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {restaurant.cuisine}
                    </p>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '12px',
                      borderTop: '1px solid #E9E9EB',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: restaurant.rating >= 4 ? '#48C479' : '#F87400',
                        color: '#FFFFFF',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}>
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                        {restaurant.rating}
                      </div>
                      
                      <span style={{
                        fontSize: '14px',
                        color: '#686B78',
                      }}>
                        {restaurant.deliveryFee > 0 ? `Rs ${restaurant.deliveryFee} delivery` : 'FREE delivery'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Cart Toast - Global */}
      {showCartToast && cartItems.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#FF8A00',
          color: '#FFFFFF',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(255,138,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          zIndex: 9999,
          fontFamily: 'Poppins, sans-serif',
          fontSize: '15px',
          fontWeight: 500,
          minWidth: '300px',
          animation: 'slideUp 0.3s ease-out',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF8A00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <span>{cartItems.length} item{cartItems.length > 1 ? 's' : ''} added to cart</span>
          </div>
          <button
            onClick={() => navigate('/cart')}
            style={{
              background: '#FFFFFF',
              color: '#FF8A00',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FFF7ED';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            View Cart
          </button>
          <button
            onClick={() => setShowCartToast(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontSize: '20px',
              padding: '0',
              lineHeight: 1,
              marginLeft: '8px',
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
