import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'placed' | 'preparing' | 'out-for-delivery' | 'delivered'>('placed');
  const [bikePosition, setBikePosition] = useState(0); // 0 to 100 percentage

  useEffect(() => {
    // Fetch actual order from database
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${API_URL}/orders/${orderId}`);
        const order = response.data;
        // Map database status to tracking status
        const statusMap: any = {
          'Confirmed': 'placed',
          'Preparing': 'preparing',
          'Out for Delivery': 'out-for-delivery',
          'Delivered': 'delivered'
        };
        setStatus(statusMap[order.status] || 'placed');
      } catch (error) {
        console.error('Failed to fetch order:', error);
      }
    };
    fetchOrder();

    // Auto-update order status in database
    const updateOrderStatus = async (newStatus: string) => {
      try {
        await axios.put(`${API_URL}/orders/${orderId}`, { status: newStatus });
      } catch (error) {
        console.error('Failed to update order status:', error);
      }
    };

    const timer1 = setTimeout(() => {
      setStatus('preparing');
      updateOrderStatus('Preparing');
    }, 3000);

    const timer2 = setTimeout(() => {
      setStatus('out-for-delivery');
      updateOrderStatus('Out for Delivery');
      // Start bike animation
      const interval = setInterval(() => {
        setBikePosition(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 100);

      return () => clearInterval(interval);
    }, 6000);

    const timer3 = setTimeout(() => {
      setStatus('delivered');
      setBikePosition(100);
      updateOrderStatus('Delivered');
    }, 12000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [orderId]);

  // Calculate bike position along curved path
  const getBikePositionOnPath = (progress: number) => {
    // Simulate curved path positions
    const x = 10 + (progress * 0.8); // Horizontal movement
    const y = 50 - Math.sin(progress / 100 * Math.PI) * 20; // Curved vertical movement
    return { x, y };
  };

  const currentPosition = getBikePositionOnPath(bikePosition);

  const getStatusStep = () => {
    switch (status) {
      case 'placed': return 1;
      case 'preparing': return 2;
      case 'out-for-delivery': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  const currentStep = getStatusStep();

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      minHeight: 'calc(100vh - 80px)',
      padding: '40px 40px',
      paddingTop: '120px',
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: status === 'delivered' ? '#E8F5E9' : '#FFF7ED',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            {status === 'delivered' ? (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#60B246">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
            ) : (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#FF8A00">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            )}
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#1A1A1A',
            marginBottom: '8px',
            fontFamily: 'Poppins, sans-serif',
          }}>
            {status === 'delivered' ? 'Order Delivered!' : 'Tracking Your Order'}
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#686B78',
            fontFamily: 'Poppins, sans-serif',
          }}>
            Order ID: <span style={{ fontWeight: 600, color: '#FF8A00' }}>{orderId}</span>
          </p>
        </div>

        {/* Map with Animated Bike */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E9E9EB',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#1A1A1A',
            marginBottom: '20px',
            fontFamily: 'Poppins, sans-serif',
          }}>Live Tracking</h2>

          {/* Map Container */}
          <div style={{
            width: '100%',
            height: '300px',
            backgroundColor: '#F5F5F5',
            borderRadius: '12px',
            position: 'relative',
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}>
            {/* Restaurant Marker */}
            <div style={{
              position: 'absolute',
              left: '10%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2,
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                backgroundColor: '#FF8A00',
                borderRadius: '50% 50% 50% 0',
                transform: 'rotate(-45deg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255,138,0,0.4)',
                border: '3px solid #FFFFFF',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF" style={{ transform: 'rotate(45deg)' }}>
                  <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
                </svg>
              </div>
              <div style={{
                position: 'absolute',
                top: '60px',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                backgroundColor: '#FFFFFF',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#FF8A00',
                fontFamily: 'Poppins, sans-serif',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}>Restaurant</div>
            </div>

            {/* Delivery Location Marker */}
            <div style={{
              position: 'absolute',
              right: '10%',
              top: '50%',
              transform: 'translate(50%, -50%)',
              zIndex: 2,
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                backgroundColor: '#60B246',
                borderRadius: '50% 50% 50% 0',
                transform: 'rotate(-45deg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(96,178,70,0.4)',
                border: '3px solid #FFFFFF',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF" style={{ transform: 'rotate(45deg)' }}>
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              </div>
              <div style={{
                position: 'absolute',
                top: '60px',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                backgroundColor: '#FFFFFF',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#60B246',
                fontFamily: 'Poppins, sans-serif',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}>Your Location</div>
            </div>

            {/* Curved Route - Changes from dotted to solid when out for delivery */}
            <svg style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }} preserveAspectRatio="none" viewBox="0 0 100 100">
              <path
                d="M 10 50 Q 30 20, 50 30 T 90 50"
                stroke={status === 'out-for-delivery' || status === 'delivered' ? '#FF8A00' : '#000000'}
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={status === 'out-for-delivery' || status === 'delivered' ? '0' : '3,3'}
                vectorEffect="non-scaling-stroke"
                style={{
                  transition: 'stroke 0.5s ease, stroke-dasharray 0.5s ease',
                }}
              />
            </svg>

            {/* Animated Delivery Bike */}
            {status === 'out-for-delivery' || status === 'delivered' ? (
              <div style={{
                position: 'absolute',
                left: `${currentPosition.x}%`,
                top: `${currentPosition.y}%`,
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.1s linear',
                zIndex: 3,
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  border: '3px solid #FF8A00',
                }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FF8A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="7" cy="17" r="2"/>
                    <circle cx="17" cy="17" r="2"/>
                    <path d="M5 17H3V6h10v11h4"/>
                    <path d="M13 6l5 5h3v6h-2"/>
                    <path d="M8 11V6"/>
                  </svg>
                </div>
                {/* Speed lines */}
                <div style={{
                  position: 'absolute',
                  left: '-30px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}>
                  <div style={{ height: '2px', width: '20px', backgroundColor: '#FF8A00', opacity: 0.6, marginBottom: '4px' }} />
                  <div style={{ height: '2px', width: '15px', backgroundColor: '#FF8A00', opacity: 0.4, marginBottom: '4px' }} />
                  <div style={{ height: '2px', width: '10px', backgroundColor: '#FF8A00', opacity: 0.2 }} />
                </div>
              </div>
            ) : null}
          </div>

          {/* Delivery Info */}
          <div style={{
            marginTop: '20px',
            padding: '16px',
            backgroundColor: '#FFF7ED',
            borderRadius: '8px',
            border: '1px solid #FFE8D1',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                fontSize: '24px',
              }}>🚨</div>
              <div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#1A1A1A',
                  fontFamily: 'Poppins, sans-serif',
                  marginBottom: '4px',
                }}>
                  {status === 'delivered' ? 'Order Delivered!' : 
                   status === 'out-for-delivery' ? 'Rider is on the way' :
                   status === 'preparing' ? 'Preparing your order' :
                   'Order confirmed'}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#686B78',
                  fontFamily: 'Poppins, sans-serif',
                }}>
                  {status === 'delivered' ? 'Enjoy your meal!' :
                   status === 'out-for-delivery' ? 'Your food will arrive soon' :
                   status === 'preparing' ? 'Restaurant is preparing your food' :
                   'We are processing your order'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E9E9EB',
          borderRadius: '16px',
          padding: '40px',
          marginBottom: '32px',
        }}>
          <div style={{
            position: 'relative',
          }}>
            {/* Progress Line */}
            <div style={{
              position: 'absolute',
              left: '24px',
              top: '24px',
              bottom: '24px',
              width: '4px',
              backgroundColor: '#E9E9EB',
            }}>
              <div style={{
                width: '100%',
                height: `${((currentStep - 1) / 3) * 100}%`,
                backgroundColor: '#60B246',
                transition: 'height 0.5s ease',
              }} />
            </div>

            {/* Steps */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '40px',
            }}>
              {/* Step 1: Order Placed */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '20px',
                position: 'relative',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: currentStep >= 1 ? '#60B246' : '#E9E9EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.3s',
                  zIndex: 1,
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                  </svg>
                </div>
                <div style={{ flex: 1, paddingTop: '8px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: currentStep >= 1 ? '#1A1A1A' : '#93959F',
                    marginBottom: '4px',
                    fontFamily: 'Poppins, sans-serif',
                  }}>Order Placed</h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#686B78',
                    fontFamily: 'Poppins, sans-serif',
                  }}>Your order has been confirmed</p>
                </div>
              </div>

              {/* Step 2: Preparing */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '20px',
                position: 'relative',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: currentStep >= 2 ? '#60B246' : '#E9E9EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.3s',
                  zIndex: 1,
                }}>
                  {currentStep >= 2 ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#93959F">
                      <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, paddingTop: '8px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: currentStep >= 2 ? '#1A1A1A' : '#93959F',
                    marginBottom: '4px',
                    fontFamily: 'Poppins, sans-serif',
                  }}>Preparing Your Food</h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#686B78',
                    fontFamily: 'Poppins, sans-serif',
                  }}>Restaurant is preparing your order</p>
                </div>
              </div>

              {/* Step 3: Out for Delivery */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '20px',
                position: 'relative',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: currentStep >= 3 ? '#60B246' : '#E9E9EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.3s',
                  zIndex: 1,
                }}>
                  {currentStep >= 3 ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#93959F">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, paddingTop: '8px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: currentStep >= 3 ? '#1A1A1A' : '#93959F',
                    marginBottom: '4px',
                    fontFamily: 'Poppins, sans-serif',
                  }}>Out for Delivery</h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#686B78',
                    fontFamily: 'Poppins, sans-serif',
                  }}>Your order is on the way</p>
                </div>
              </div>

              {/* Step 4: Delivered */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '20px',
                position: 'relative',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: currentStep >= 4 ? '#60B246' : '#E9E9EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.3s',
                  zIndex: 1,
                }}>
                  {currentStep >= 4 ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#93959F">
                      <path d="M12 2L3.5 20.5h17L12 2z"/>
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, paddingTop: '8px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: currentStep >= 4 ? '#60B246' : '#93959F',
                    marginBottom: '4px',
                    fontFamily: 'Poppins, sans-serif',
                  }}>Delivered</h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#686B78',
                    fontFamily: 'Poppins, sans-serif',
                  }}>Enjoy your meal!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
        }}>
          <Button
            variant="primary"
            onClick={() => navigate('/')}
          >
            Order Again
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/orders')}
          >
            View All Orders
          </Button>
        </div>
      </div>
    </div>
  );
};
