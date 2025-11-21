import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store';
import { useAuthStore } from '../store';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import { Snackbar } from '../components/Snackbar';

export const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [placing, setPlacing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showAllCoupons, setShowAllCoupons] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const subtotal = getTotal();
  const finalTotal = subtotal - discount;

  // Define available coupons
  const availableCoupons = [
    { code: 'TRYNEW', title: '50% OFF Available!', description: 'Get 50% off on your order', minOrder: 499, discount: 50, icon: 'deal' },
    { code: 'DEAL79', title: 'Deal of the Day', description: 'Special 50% discount', minOrder: 499, discount: 50, icon: 'deal' },
    { code: 'BOBDC130', title: '20% Off Upto ₹130', description: 'Save up to ₹130 on this order', minOrder: 300, discount: 20, icon: 'brand' },
    { code: 'WELCOME15', title: '15% Off Upto ₹100', description: 'Welcome offer for new users', minOrder: 200, discount: 15, icon: 'star' },
  ];

  // Auto-apply TRYNEW coupon if order is above 499
  const checkAutoApplyCoupon = () => {
    if (subtotal >= 499 && !appliedCoupon) {
      setCouponCode('TRYNEW');
    }
  };

  const applyCoupon = () => {
    const code = couponCode.toUpperCase();
    applyCouponByCode(code);
  };

  const applyCouponByCode = (code: string) => {
    // Define available coupons
    const coupons: { [key: string]: { minOrder: number; discount: number; type: 'percentage' | 'flat' } } = {
      'TRYNEW': { minOrder: 499, discount: 50, type: 'percentage' },
      'DEAL79': { minOrder: 499, discount: 50, type: 'percentage' },
      'BOBDC130': { minOrder: 300, discount: 20, type: 'percentage' },
      'WELCOME15': { minOrder: 200, discount: 15, type: 'percentage' },
    };

    if (coupons[code]) {
      const coupon = coupons[code];
      if (subtotal >= coupon.minOrder) {
        const discountAmount = (subtotal * coupon.discount) / 100;
        setDiscount(discountAmount);
        setAppliedCoupon(code);
        setCouponCode('');
        setShowAllCoupons(false);
        setSnackbar({ message: `Coupon applied successfully! ${coupon.discount}% OFF`, type: 'success' });
      } else {
        setSnackbar({ message: `Minimum order of Rs ${coupon.minOrder} required for this coupon`, type: 'error' });
      }
    } else {
      setSnackbar({ message: 'Invalid coupon code', type: 'error' });
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setAppliedCoupon('');
    setDiscount(0);
  };

  // Auto-fill coupon code when subtotal reaches 499
  useEffect(() => {
    checkAutoApplyCoupon();
    
    // Auto-remove coupon if subtotal falls below minimum requirement
    if (appliedCoupon) {
      const coupons: { [key: string]: { minOrder: number; discount: number } } = {
        'TRYNEW': { minOrder: 499, discount: 50 },
        'DEAL79': { minOrder: 499, discount: 50 },
        'BOBDC130': { minOrder: 300, discount: 20 },
        'WELCOME15': { minOrder: 200, discount: 15 },
      };
      
      const currentCoupon = coupons[appliedCoupon];
      if (currentCoupon && subtotal < currentCoupon.minOrder) {
        removeCoupon();
        setSnackbar({ message: 'Coupon removed: Minimum order amount not met', type: 'warning' });
      }
    }
  }, [subtotal]);

  const handleCheckout = async () => {
    if (!user) {
      setSnackbar({ message: 'Please login to place order', type: 'warning' });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    if (!deliveryAddress.trim()) {
      setSnackbar({ message: 'Please enter delivery address', type: 'error' });
      return;
    }

    if (!selectedPayment) {
      setSnackbar({ message: 'Please select a payment method', type: 'error' });
      return;
    }

    setPlacing(true);
    try {
      const response = await orderService.create(
        user.id,
        'restaurant-placeholder',
        items,
        finalTotal,
        deliveryAddress
      );
      const orderId = response.data.orderId || 'ORD' + Date.now();
      clearCart();
      removeCoupon();
      navigate(`/order-tracking/${orderId}`);
    } catch (error: any) {
      console.error('Order failed', error);
      setSnackbar({ message: 'Failed to place order. Please try again.', type: 'error' });
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '80px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <svg width="120" height="120" viewBox="0 0 24 24" fill="#E9E9EB" style={{ marginBottom: '24px' }}>
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
          <h2 style={{ color: '#1A1A1A', margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '28px', fontWeight: 600 }}>Your Cart is Empty</h2>
          <p style={{ color: '#686B78', margin: '12px 0 32px 0', fontFamily: 'Poppins, sans-serif', fontSize: '16px' }}>Add some delicious food to get started</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Explore Restaurants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      minHeight: 'calc(100vh - 80px)',
      padding: '40px 40px',
      width: '100%',
      paddingTop: '120px',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 420px',
        gap: '40px',
      }}>
        <div>
          <h1 style={{ 
            color: '#1A1A1A', 
            fontSize: '32px', 
            marginBottom: '24px', 
            fontFamily: 'Poppins, sans-serif', 
            fontWeight: 600 
          }}>
            Your Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>

          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid #E9E9EB',
          }}>
            {items.map((item, index) => (
              <div
                key={item.id}
                style={{
                  padding: '24px',
                  borderBottom: index < items.length - 1 ? '1px solid #E9E9EB' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#FFF7ED',
                    borderRadius: '12px',
                    border: '1px solid #FFE8D1',
                    overflow: 'hidden',
                  }}>
                    {item.image && item.image.startsWith('http') ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="#FF8A00">
                        <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
                      </svg>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      color: '#1A1A1A', 
                      margin: 0, 
                      marginBottom: '8px', 
                      fontFamily: 'Poppins, sans-serif', 
                      fontSize: '18px', 
                      fontWeight: 600 
                    }}>
                      {item.name}
                    </h3>
                    <p style={{ 
                      color: '#FF8A00', 
                      fontWeight: 600, 
                      margin: 0, 
                      fontFamily: 'Poppins, sans-serif', 
                      fontSize: '18px' 
                    }}>
                      Rs {item.price}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginRight: '20px',
                }}>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={{
                      width: '36px',
                      height: '36px',
                      border: '2px solid #FF8A00',
                      backgroundColor: '#FFFFFF',
                      color: '#FF8A00',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '20px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFF7ED';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    −
                  </button>
                  <span style={{ 
                    minWidth: '32px', 
                    textAlign: 'center', 
                    fontWeight: 600, 
                    fontSize: '18px',
                    fontFamily: 'Poppins, sans-serif',
                    color: '#1A1A1A',
                  }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{
                      width: '36px',
                      height: '36px',
                      border: '2px solid #FF8A00',
                      backgroundColor: '#FF8A00',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '20px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F87400';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FF8A00';
                    }}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#E03636',
                    cursor: 'pointer',
                    fontSize: '20px',
                    padding: '8px',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFF0F0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '28px',
            position: 'sticky',
            top: '100px',
            border: '1px solid #E9E9EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{ 
              color: '#1A1A1A', 
              fontSize: '24px', 
              margin: '0 0 24px 0', 
              fontFamily: 'Poppins, sans-serif', 
              fontWeight: 600 
            }}>
              Order Summary
            </h2>

            <div style={{
              marginBottom: '24px',
              paddingBottom: '24px',
              borderBottom: '1px solid #E9E9EB',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '14px',
                color: '#3E4152',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '16px',
              }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 500 }}>Rs {subtotal.toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '14px',
                color: '#3E4152',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '16px',
              }}>
                <span>Delivery Fee</span>
                <span style={{ fontWeight: 500, color: '#60B246' }}>FREE</span>
              </div>
              {discount > 0 && (appliedCoupon === 'TRYNEW' || appliedCoupon === 'DEAL79') && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  color: '#60B246',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                }}>
                  <span>Discount (50% OFF)</span>
                  <span>- Rs {discount.toFixed(2)}</span>
                </div>
              )}
              {discount > 0 && appliedCoupon === 'BOBDC130' && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  color: '#60B246',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                }}>
                  <span>Discount (20% OFF)</span>
                  <span>- Rs {discount.toFixed(2)}</span>
                </div>
              )}
              {discount > 0 && appliedCoupon === 'WELCOME15' && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  color: '#60B246',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                }}>
                  <span>Discount (15% OFF)</span>
                  <span>- Rs {discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Coupon Code Section */}
            <div style={{
              marginBottom: '24px',
              paddingBottom: '24px',
              borderBottom: '1px solid #E9E9EB',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF8A00">
                  <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
                </svg>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#1A1A1A',
                  margin: 0,
                  fontFamily: 'Poppins, sans-serif',
                }}>Apply Coupon</h3>
              </div>

              {subtotal >= 499 && !appliedCoupon && (
                <div style={{
                  background: 'linear-gradient(135deg, #FFF7ED 0%, #FFE8D1 100%)',
                  border: '2px solid #FF8A00',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <span style={{ fontSize: '24px' }}>🎉</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#FF8A00',
                      fontFamily: 'Poppins, sans-serif',
                      marginBottom: '2px',
                    }}>50% OFF Available!</div>
                    <div style={{
                      fontSize: '12px',
                      color: '#686B78',
                      fontFamily: 'Poppins, sans-serif',
                    }}>Use code: TRYNEW</div>
                  </div>
                  <button
                    onClick={() => {
                      setCouponCode('TRYNEW');
                      const discountAmount = subtotal * 0.5;
                      setDiscount(discountAmount);
                      setAppliedCoupon('TRYNEW');
                      setSnackbar({ message: 'Coupon applied successfully! 50% OFF', type: 'success' });
                    }}
                    style={{
                      background: '#FF8A00',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    Apply
                  </button>
                </div>
              )}

              {!appliedCoupon ? (
                <>
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    marginBottom: '12px',
                    padding: '12px',
                    backgroundColor: '#F5F5F5',
                    borderRadius: '12px',
                  }}>
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '1px solid #E9E9EB',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'Poppins, sans-serif',
                        outline: 'none',
                        textTransform: 'uppercase',
                        backgroundColor: '#FFFFFF',
                        color: '#1A1A1A',
                      }}
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={!couponCode}
                      style={{
                        padding: '12px 24px',
                        background: couponCode ? '#FF8A00' : '#E9E9EB',
                        color: couponCode ? '#FFFFFF' : '#93959F',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: couponCode ? 'pointer' : 'not-allowed',
                        fontFamily: 'Poppins, sans-serif',
                        transition: 'all 0.2s',
                      }}
                    >
                      Apply
                    </button>
                  </div>

                  {/* Show All Coupons Button */}
                  <button
                    onClick={() => setShowAllCoupons(!showAllCoupons)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: '1px solid #FF8A00',
                      borderRadius: '8px',
                      color: '#FF8A00',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Poppins, sans-serif',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFF7ED';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
                    </svg>
                    {showAllCoupons ? 'Hide coupons' : 'Show all applicable coupons'}
                  </button>

                  {/* All Coupons List */}
                  {showAllCoupons && (
                    <div style={{
                      marginTop: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}>
                      {availableCoupons.map((coupon) => {
                        const isEligible = subtotal >= coupon.minOrder;
                        return (
                          <div
                            key={coupon.code}
                            style={{
                              border: isEligible ? '2px solid #FF8A00' : '1px solid #E9E9EB',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              background: isEligible ? 'linear-gradient(135deg, #FFF7ED 0%, #FFE8D1 100%)' : '#F5F5F5',
                              opacity: isEligible ? 1 : 0.6,
                              transition: 'all 0.2s',
                            }}
                          >
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              marginBottom: '8px',
                            }}>
                              {/* Icon */}
                              <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '8px',
                                background: coupon.icon === 'deal' 
                                  ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)'
                                  : coupon.icon === 'brand'
                                  ? 'linear-gradient(135deg, #FF8A00 0%, #F87400 100%)'
                                  : 'linear-gradient(135deg, #E31E24 0%, #C41E3A 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                position: 'relative',
                              }}>
                                {coupon.icon === 'deal' && (
                                  <>
                                    <div style={{
                                      position: 'absolute',
                                      top: '4px',
                                      left: '4px',
                                      right: '4px',
                                      fontSize: '8px',
                                      fontWeight: 700,
                                      color: '#FFFFFF',
                                      backgroundColor: 'rgba(0,0,0,0.2)',
                                      borderRadius: '3px',
                                      padding: '2px 3px',
                                      textAlign: 'center',
                                      fontFamily: 'Poppins, sans-serif',
                                      lineHeight: 1,
                                    }}>
                                      DEAL
                                    </div>
                                    <div style={{
                                      position: 'absolute',
                                      bottom: '4px',
                                      fontSize: '9px',
                                      fontWeight: 600,
                                      color: '#FFFFFF',
                                      fontFamily: 'Poppins, sans-serif',
                                    }}>
                                      OF DAY
                                    </div>
                                  </>
                                )}
                                {coupon.icon === 'brand' && (
                                  <div style={{
                                    fontSize: '26px',
                                    fontWeight: 900,
                                    color: '#FFFFFF',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontStyle: 'italic',
                                  }}>
                                    B
                                  </div>
                                )}
                                {coupon.icon === 'star' && (
                                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#FFFFFF">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                                  </svg>
                                )}
                              </div>

                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontSize: '14px',
                                  fontWeight: 700,
                                  color: isEligible ? '#FF8A00' : '#686B78',
                                  fontFamily: 'Poppins, sans-serif',
                                  marginBottom: '2px',
                                }}>
                                  {coupon.title}
                                </div>
                                <div style={{
                                  fontSize: '12px',
                                  color: '#686B78',
                                  fontFamily: 'Poppins, sans-serif',
                                }}>
                                  {coupon.description}
                                </div>
                              </div>
                              {isEligible ? (
                                <button
                                  onClick={() => applyCouponByCode(coupon.code)}
                                  style={{
                                    background: '#FF8A00',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '6px 16px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontFamily: 'Poppins, sans-serif',
                                    transition: 'all 0.2s',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#F87400';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#FF8A00';
                                  }}
                                >
                                  Apply
                                </button>
                              ) : (
                                <div style={{
                                  fontSize: '11px',
                                  color: '#93959F',
                                  fontFamily: 'Poppins, sans-serif',
                                  textAlign: 'right',
                                }}>
                                  Min ₹{coupon.minOrder}
                                </div>
                              )}
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              paddingTop: '8px',
                              borderTop: '1px solid rgba(0,0,0,0.08)',
                            }}>
                              <div style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#FF8A00',
                                fontFamily: 'Poppins, sans-serif',
                                backgroundColor: '#FFFFFF',
                                padding: '4px 8px',
                                borderRadius: '4px',
                              }}>
                                {coupon.code}
                              </div>
                              <div style={{
                                fontSize: '11px',
                                color: '#686B78',
                                fontFamily: 'Poppins, sans-serif',
                              }}>
                                Min order: ₹{coupon.minOrder} • {coupon.discount}% OFF
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                  border: '2px solid #60B246',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#60B246">
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                    </svg>
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#2E7D32',
                        fontFamily: 'Poppins, sans-serif',
                      }}>{appliedCoupon} Applied!</div>
                      <div style={{
                        fontSize: '12px',
                        color: '#686B78',
                        fontFamily: 'Poppins, sans-serif',
                      }}>
                        {appliedCoupon === 'TRYNEW' || appliedCoupon === 'DEAL79' ? '50' : 
                         appliedCoupon === 'BOBDC130' ? '20' : '15'}% discount applied
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#E03636',
                      cursor: 'pointer',
                      fontSize: '20px',
                      padding: '4px',
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '28px',
              fontSize: '20px',
              fontWeight: 600,
              color: '#1A1A1A',
              fontFamily: 'Poppins, sans-serif',
            }}>
              <span>Total</span>
              <span style={{ color: '#FF8A00' }}>
                Rs {finalTotal.toFixed(2)}
              </span>
            </div>

            <Input
              label="Delivery Address"
              placeholder="Enter your delivery address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />

            {/* Payment Options */}
            <div style={{ marginTop: '24px', marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#1A1A1A',
                marginBottom: '16px',
                fontFamily: 'Poppins, sans-serif',
              }}>Payment Method</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* UPI */}
                <div
                  onClick={() => setSelectedPayment('UPI')}
                  style={{
                    border: selectedPayment === 'UPI' ? '2px solid #FF8A00' : '1px solid #E9E9EB',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    backgroundColor: selectedPayment === 'UPI' ? '#FFF7ED' : '#FFFFFF',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: '#F5F5F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#60B246">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Poppins, sans-serif',
                    }}>UPI</div>
                    <div style={{
                      fontSize: '13px',
                      color: '#686B78',
                      fontFamily: 'Poppins, sans-serif',
                    }}>Google Pay, PhonePe, Paytm</div>
                  </div>
                  {selectedPayment === 'UPI' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#60B246">
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                    </svg>
                  )}
                </div>

                {/* Credit/Debit Card */}
                <div
                  onClick={() => setSelectedPayment('CARD')}
                  style={{
                    border: selectedPayment === 'CARD' ? '2px solid #FF8A00' : '1px solid #E9E9EB',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    backgroundColor: selectedPayment === 'CARD' ? '#FFF7ED' : '#FFFFFF',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: '#F5F5F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF8A00">
                      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Poppins, sans-serif',
                    }}>Credit / Debit Card</div>
                    <div style={{
                      fontSize: '13px',
                      color: '#686B78',
                      fontFamily: 'Poppins, sans-serif',
                    }}>Visa, Mastercard, Rupay</div>
                  </div>
                  {selectedPayment === 'CARD' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#60B246">
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                    </svg>
                  )}
                </div>

                {/* Wallets */}
                <div
                  onClick={() => setSelectedPayment('WALLET')}
                  style={{
                    border: selectedPayment === 'WALLET' ? '2px solid #FF8A00' : '1px solid #E9E9EB',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    backgroundColor: selectedPayment === 'WALLET' ? '#FFF7ED' : '#FFFFFF',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: '#F5F5F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#9C27B0">
                      <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Poppins, sans-serif',
                    }}>Wallets</div>
                    <div style={{
                      fontSize: '13px',
                      color: '#686B78',
                      fontFamily: 'Poppins, sans-serif',
                    }}>Paytm, PhonePe, Amazon Pay</div>
                  </div>
                  {selectedPayment === 'WALLET' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#60B246">
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                    </svg>
                  )}
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setSelectedPayment('COD')}
                  style={{
                    border: selectedPayment === 'COD' ? '2px solid #FF8A00' : '1px solid #E9E9EB',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    backgroundColor: selectedPayment === 'COD' ? '#FFF7ED' : '#FFFFFF',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: '#F5F5F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#60B246">
                      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Poppins, sans-serif',
                    }}>Cash on Delivery</div>
                    <div style={{
                      fontSize: '13px',
                      color: '#686B78',
                      fontFamily: 'Poppins, sans-serif',
                    }}>Pay when you receive</div>
                  </div>
                  {selectedPayment === 'COD' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#60B246">
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                    </svg>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              size="lg"
              disabled={placing}
              onClick={handleCheckout}
            >
              {placing ? 'Processing...' : 'Checkout'}
            </Button>

            <div style={{ marginTop: '12px' }}>
              <Button
                variant="outline"
                fullWidth
                size="md"
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>

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
