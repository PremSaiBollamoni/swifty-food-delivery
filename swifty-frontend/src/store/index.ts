import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  setUser: (user: User | null, token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => {
  // Initialize from localStorage on page load
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  
  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken,
    isLoggedIn: !!storedToken,
    setUser: (user, token) => {
      if (token) {
        localStorage.setItem('token', token);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      set({ user, token, isLoggedIn: !!user });
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isLoggedIn: false });
    },
  };
});

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  restaurantId?: string;
  restaurantName?: string;
}

interface CartStore {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  showCartToast: boolean;
  appliedCoupon: { code: string; discount: number; minOrder: number } | null;
  addItem: (item: CartItem) => boolean;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  setShowCartToast: (show: boolean) => void;
  applyCoupon: (code: string, discount: number, minOrder: number) => void;
  removeCoupon: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  restaurantId: null,
  restaurantName: null,
  showCartToast: false,
  appliedCoupon: null,
  addItem: (item) => {
    const { restaurantId, items } = get();
    
    // Check if cart has items from different restaurant
    if (restaurantId && item.restaurantId && restaurantId !== item.restaurantId) {
      return false; // Return false to trigger confirmation dialog
    }
    
    const existing = items.find(i => i.id === item.id);
    if (existing) {
      set({
        items: items.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        ),
      });
    } else {
      set({ 
        items: [...items, item],
        restaurantId: item.restaurantId || restaurantId,
        restaurantName: item.restaurantName || get().restaurantName,
      });
    }
    set({ showCartToast: true });
    return true;
  },
  removeItem: (id) => {
    const newItems = get().items.filter(i => i.id !== id);
    set({ 
      items: newItems,
      restaurantId: newItems.length > 0 ? get().restaurantId : null,
      restaurantName: newItems.length > 0 ? get().restaurantName : null,
    });
  },
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      const newItems = get().items.filter(i => i.id !== id);
      set({ 
        items: newItems,
        restaurantId: newItems.length > 0 ? get().restaurantId : null,
        restaurantName: newItems.length > 0 ? get().restaurantName : null,
      });
    } else {
      set({
        items: get().items.map(i =>
          i.id === id ? { ...i, quantity } : i
        ),
      });
    }
  },
  clearCart: () => set({ items: [], restaurantId: null, restaurantName: null, showCartToast: false, appliedCoupon: null }),
  getTotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  setShowCartToast: (show) => set({ showCartToast: show }),
  applyCoupon: (code, discount, minOrder) => set({ appliedCoupon: { code, discount, minOrder } }),
  removeCoupon: () => set({ appliedCoupon: null }),
}));
