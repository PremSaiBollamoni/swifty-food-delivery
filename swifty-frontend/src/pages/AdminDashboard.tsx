import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useResponsive } from '../hooks/useResponsive';

const API_URL = 'http://localhost:5000/api';

interface Restaurant {
  _id?: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  image: string;
}

interface MenuItem {
  _id?: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  image: string;
}

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isMobile, getPadding } = useResponsive();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'restaurants' | 'menus' | 'orders'>('dashboard');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalMenuItems: 0,
    totalOrders: 0,
    totalRevenue: 0,
    todayOrders: 0,
    pendingOrders: 0,
  });
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkType, setBulkType] = useState<'restaurants' | 'menus'>('restaurants');
  const [bulkData, setBulkData] = useState('');
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'restaurant' | 'menu' | 'bulk-restaurant' | 'bulk-menu'; id?: string; name?: string } | null>(null);
  const [showEditRestaurant, setShowEditRestaurant] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [vegFilter, setVegFilter] = useState('all');
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const autoUpdateOrderStatuses = async () => {
    const now = new Date();
    const updatedOrders: string[] = [];
    
    for (const order of orders) {
      const orderTime = new Date(order.createdAt);
      const minutesElapsed = Math.floor((now.getTime() - orderTime.getTime()) / 60000);
      
      let newStatus = order.status;
      
      // Auto-progress based on time
      if (order.status === 'Confirmed' && minutesElapsed >= 2) {
        newStatus = 'Preparing';
      } else if (order.status === 'Preparing' && minutesElapsed >= 5) {
        newStatus = 'Out for Delivery';
      } else if (order.status === 'Out for Delivery' && minutesElapsed >= 10) {
        newStatus = 'Delivered';
      }
      
      // Update if status changed
      if (newStatus !== order.status && order._id) {
        try {
          await axios.put(`${API_URL}/orders/${order._id}`, { status: newStatus });
          updatedOrders.push(order._id);
        } catch (error) {
          console.error('Failed to auto-update order:', error);
        }
      }
    }
    
    if (updatedOrders.length > 0) {
      await fetchOrders();
    }
  };

  const [newRestaurant, setNewRestaurant] = useState<Restaurant>({
    name: '',
    cuisine: '',
    rating: 4.0,
    deliveryTime: '30-40',
    deliveryFee: 0,
    image: ''
  });

  const [newMenu, setNewMenu] = useState<MenuItem>({
    restaurantId: '',
    name: '',
    description: '',
    price: 0,
    category: '',
    isVeg: true,
    image: ''
  });

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth');
    console.log('Admin auth check:', isAuth);
    if (!isAuth) {
      console.log('Not authenticated, redirecting to login');
      navigate('/swiftyadmin');
      return;
    }
    fetchData();
    
    // Auto-update order statuses every 30 seconds
    const statusInterval = setInterval(() => {
      autoUpdateOrderStatuses();
    }, 30000);
    
    // Refresh data from backend every 10 seconds to stay in sync
    const refreshInterval = setInterval(() => {
      fetchOrders();
    }, 10000);
    
    return () => {
      clearInterval(statusInterval);
      clearInterval(refreshInterval);
    };
  }, [navigate]);

  useEffect(() => {
    calculateStats();
  }, [restaurants, menus, orders]);

  useEffect(() => {
    if (snackbar) {
      setTimeout(() => setSnackbar(null), 3000);
    }
  }, [snackbar]);

  const fetchData = async () => {
    await Promise.all([fetchRestaurants(), fetchMenus(), fetchOrders()]);
  };

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${API_URL}/restaurants`);
      console.log('Restaurants fetched:', response.data);
      setRestaurants(response.data || []);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
      setRestaurants([]);
    }
  };

  const fetchMenus = async () => {
    try {
      const response = await axios.get(`${API_URL}/menus/all`);
      console.log('Menus fetched:', response.data);
      setMenus(response.data || []);
    } catch (error) {
      console.error('Failed to fetch menus:', error);
      setMenus([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/all`);
      console.log('Orders fetched:', response.data);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    }
  };

  const calculateStats = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const today = new Date().toDateString();
    const todayOrders = orders.filter(order => new Date(order.createdAt).toDateString() === today).length;
    const pendingOrders = orders.filter(order => order.status === 'Confirmed' || order.status === 'Preparing').length;

    setStats({
      totalRestaurants: restaurants.length,
      totalMenuItems: menus.length,
      totalOrders: orders.length,
      totalRevenue,
      todayOrders,
      pendingOrders,
    });
  };

  const handleAddRestaurant = async () => {
    try {
      // Check for duplicate restaurant name
      const existingRestaurant = restaurants.find(
        r => r.name.toLowerCase() === newRestaurant.name.toLowerCase()
      );
      if (existingRestaurant) {
        setSnackbar({ message: 'A restaurant with this name already exists!', type: 'error' });
        return;
      }

      await axios.post(`${API_URL}/restaurants`, newRestaurant);
      setSnackbar({ message: 'Restaurant added successfully!', type: 'success' });
      setShowAddRestaurant(false);
      setNewRestaurant({ name: '', cuisine: '', rating: 4.0, deliveryTime: '30-40', deliveryFee: 0, image: '' });
      fetchRestaurants();
    } catch (error) {
      setSnackbar({ message: 'Failed to add restaurant', type: 'error' });
    }
  };

  const handleEditRestaurant = async () => {
    if (!editingRestaurant) return;
    try {
      // Check for duplicate (excluding current restaurant)
      const existingRestaurant = restaurants.find(
        r => r._id !== editingRestaurant._id && r.name.toLowerCase() === editingRestaurant.name.toLowerCase()
      );
      if (existingRestaurant) {
        setSnackbar({ message: 'A restaurant with this name already exists!', type: 'error' });
        return;
      }

      await axios.put(`${API_URL}/restaurants/${editingRestaurant._id}`, editingRestaurant);
      setSnackbar({ message: 'Restaurant updated successfully!', type: 'success' });
      setShowEditRestaurant(false);
      setEditingRestaurant(null);
      fetchRestaurants();
    } catch (error) {
      setSnackbar({ message: 'Failed to update restaurant', type: 'error' });
    }
  };

  const handleAddMenu = async () => {
    try {
      // Check for duplicate menu item name in the same restaurant
      const existingMenuItem = menus.find(
        m => m.restaurantId === newMenu.restaurantId && 
             m.name.toLowerCase() === newMenu.name.toLowerCase()
      );
      if (existingMenuItem) {
        setSnackbar({ message: 'A menu item with this name already exists in this restaurant!', type: 'error' });
        return;
      }

      await axios.post(`${API_URL}/menus`, newMenu);
      setSnackbar({ message: 'Menu item added successfully!', type: 'success' });
      setShowAddMenu(false);
      setNewMenu({ restaurantId: '', name: '', description: '', price: 0, category: '', isVeg: true, image: '' });
      fetchMenus();
    } catch (error) {
      setSnackbar({ message: 'Failed to add menu item', type: 'error' });
    }
  };

  const handleEditMenu = async () => {
    if (!editingMenu) return;
    try {
      // Check for duplicate (excluding current menu)
      const existingMenuItem = menus.find(
        m => m._id !== editingMenu._id && 
             m.restaurantId === editingMenu.restaurantId && 
             m.name.toLowerCase() === editingMenu.name.toLowerCase()
      );
      if (existingMenuItem) {
        setSnackbar({ message: 'A menu item with this name already exists in this restaurant!', type: 'error' });
        return;
      }

      await axios.put(`${API_URL}/menus/${editingMenu._id}`, editingMenu);
      setSnackbar({ message: 'Menu item updated successfully!', type: 'success' });
      setShowEditMenu(false);
      setEditingMenu(null);
      fetchMenus();
    } catch (error) {
      setSnackbar({ message: 'Failed to update menu item', type: 'error' });
    }
  };

  const handleDeleteRestaurant = async (id: string) => {
    const restaurant = restaurants.find(r => r._id === id);
    setDeleteTarget({ type: 'restaurant', id, name: restaurant?.name });
    setShowDeleteDialog(true);
  };

  const handleDeleteMenu = async (id: string) => {
    const menuItem = menus.find(m => m._id === id);
    setDeleteTarget({ type: 'menu', id, name: menuItem?.name });
    setShowDeleteDialog(true);
  };

  const handleBulkDeleteRestaurants = () => {
    if (selectedRestaurants.length === 0) {
      setSnackbar({ message: 'Please select restaurants to delete', type: 'error' });
      return;
    }
    setDeleteTarget({ type: 'bulk-restaurant' });
    setShowDeleteDialog(true);
  };

  const handleBulkDeleteMenus = () => {
    if (selectedMenus.length === 0) {
      setSnackbar({ message: 'Please select menu items to delete', type: 'error' });
      return;
    }
    setDeleteTarget({ type: 'bulk-menu' });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === 'restaurant') {
        await axios.delete(`${API_URL}/restaurants/${deleteTarget.id}`);
        setSnackbar({ message: 'Restaurant deleted successfully!', type: 'success' });
        fetchRestaurants();
      } else if (deleteTarget.type === 'menu') {
        await axios.delete(`${API_URL}/menus/${deleteTarget.id}`);
        setSnackbar({ message: 'Menu item deleted successfully!', type: 'success' });
        fetchMenus();
      } else if (deleteTarget.type === 'bulk-restaurant') {
        await Promise.all(selectedRestaurants.map(id => axios.delete(`${API_URL}/restaurants/${id}`)));
        setSnackbar({ message: `${selectedRestaurants.length} restaurants deleted successfully!`, type: 'success' });
        setSelectedRestaurants([]);
        fetchRestaurants();
      } else if (deleteTarget.type === 'bulk-menu') {
        await Promise.all(selectedMenus.map(id => axios.delete(`${API_URL}/menus/${id}`)));
        setSnackbar({ message: `${selectedMenus.length} menu items deleted successfully!`, type: 'success' });
        setSelectedMenus([]);
        fetchMenus();
      }
    } catch (error) {
      setSnackbar({ message: 'Failed to delete', type: 'error' });
    } finally {
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log('Updating order:', orderId, 'to status:', newStatus);
      const response = await axios.put(`${API_URL}/orders/${orderId}`, { status: newStatus });
      console.log('Update response:', response.data);
      setSnackbar({ message: 'Order status updated successfully!', type: 'success' });
      await fetchOrders();
    } catch (error) {
      console.error('Failed to update order:', error);
      setSnackbar({ message: 'Failed to update order status', type: 'error' });
    }
  };

  const handleBulkAdd = async () => {
    try {
      const items = JSON.parse(bulkData);
      if (!Array.isArray(items)) {
        setSnackbar({ message: 'Data must be an array', type: 'error' });
        return;
      }
      
      if (bulkType === 'restaurants') {
        // Check for duplicates in bulk restaurant data
        const existingNames = restaurants.map(r => r.name.toLowerCase());
        const newNames = items.map((item: Restaurant) => item.name.toLowerCase());
        const duplicates = items.filter((item: Restaurant) => 
          existingNames.includes(item.name.toLowerCase())
        );
        const internalDuplicates = newNames.filter((name, index) => newNames.indexOf(name) !== index);
        
        if (duplicates.length > 0) {
          setSnackbar({ 
            message: `Cannot add: ${duplicates.map((d: Restaurant) => d.name).join(', ')} already exist(s)`, 
            type: 'error' 
          });
          return;
        }
        
        if (internalDuplicates.length > 0) {
          setSnackbar({ 
            message: 'Bulk data contains duplicate restaurant names', 
            type: 'error' 
          });
          return;
        }
      } else {
        // Check for duplicates in bulk menu data
        const duplicates: string[] = [];
        const internalDuplicates: string[] = [];
        const seenItems = new Map<string, Set<string>>();
        
        items.forEach((item: MenuItem) => {
          const key = `${item.restaurantId}:${item.name.toLowerCase()}`;
          
          // Check against existing menus
          const existingItem = menus.find(
            m => m.restaurantId === item.restaurantId && 
                 m.name.toLowerCase() === item.name.toLowerCase()
          );
          if (existingItem && !duplicates.includes(item.name)) {
            duplicates.push(item.name);
          }
          
          // Check for duplicates within bulk data
          if (!seenItems.has(item.restaurantId)) {
            seenItems.set(item.restaurantId, new Set());
          }
          const restaurantItems = seenItems.get(item.restaurantId)!;
          if (restaurantItems.has(item.name.toLowerCase())) {
            if (!internalDuplicates.includes(item.name)) {
              internalDuplicates.push(item.name);
            }
          } else {
            restaurantItems.add(item.name.toLowerCase());
          }
        });
        
        if (duplicates.length > 0) {
          setSnackbar({ 
            message: `Cannot add: ${duplicates.join(', ')} already exist(s) in their restaurant(s)`, 
            type: 'error' 
          });
          return;
        }
        
        if (internalDuplicates.length > 0) {
          setSnackbar({ 
            message: `Bulk data contains duplicate menu items: ${internalDuplicates.join(', ')}`, 
            type: 'error' 
          });
          return;
        }
      }
      
      const endpoint = bulkType === 'restaurants' ? '/restaurants' : '/menus';
      const promises = items.map(item => axios.post(`${API_URL}${endpoint}`, item));
      await Promise.all(promises);
      
      setSnackbar({ message: `${items.length} ${bulkType} added successfully!`, type: 'success' });
      setShowBulkAdd(false);
      setBulkData('');
      if (bulkType === 'restaurants') {
        fetchRestaurants();
      } else {
        fetchMenus();
      }
    } catch (error) {
      setSnackbar({ message: 'Failed to add bulk data. Check JSON format.', type: 'error' });
    }
  };

  // Filter functions
  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredMenus = menus.filter(menu => {
    const matchesSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          menu.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || menu.category === categoryFilter;
    const matchesVeg = vegFilter === 'all' || 
                       (vegFilter === 'veg' && menu.isVeg) || 
                       (vegFilter === 'non-veg' && !menu.isVeg);
    return matchesSearch && matchesCategory && matchesVeg;
  });

  // Get unique categories
  const categories = Array.from(new Set(menus.map(m => m.category).filter(Boolean)));

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/swiftyadmin');
  };

  const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      padding: isMobile ? '16px' : '24px',
      border: '1px solid #E9E9EB',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: isMobile ? '11px' : '14px',
            color: '#686B78',
            fontFamily: 'Poppins, sans-serif',
            marginBottom: '8px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>{title}</div>
          <div style={{
            fontSize: isMobile ? '20px' : '32px',
            fontWeight: 700,
            color: color,
            fontFamily: 'Poppins, sans-serif',
          }}>{value}</div>
        </div>
        {!isMobile && (
          <div style={{
            fontSize: '32px',
            flexShrink: 0,
          }}>{icon}</div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E9E9EB',
        padding: `20px ${getPadding('40px', '16px')}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src="/favicon.png" alt="Swifty" style={{ height: '40px', width: '40px' }} />
          <h1 style={{
            fontSize: isMobile ? '18px' : '24px',
            fontWeight: 700,
            color: '#FF8A00',
            fontFamily: 'Poppins, sans-serif',
            margin: 0,
          }}>
            Swifty Admin Panel
          </h1>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#E74C3C',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
          }}
        >
          Logout
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E9E9EB',
        padding: `0 ${getPadding('40px', '16px')}`,
        display: 'flex',
        gap: isMobile ? '16px' : '32px',
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}>
        {[
          { key: 'dashboard', label: `Dashboard`, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
          { key: 'restaurants', label: `Restaurants (${restaurants.length})`, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg> },
          { key: 'menus', label: `Menu Items (${menus.length})`, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
          { key: 'orders', label: `Orders (${orders.length})`, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '16px 0',
              backgroundColor: 'transparent',
              color: activeTab === tab.key ? '#FF8A00' : '#686B78',
              border: 'none',
              borderBottom: activeTab === tab.key ? '3px solid #FF8A00' : '3px solid transparent',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              fontSize: isMobile ? '13px' : '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {!isMobile && tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: `32px ${getPadding('40px', '16px')}` }}>
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#1A1A1A',
              fontFamily: 'Poppins, sans-serif',
              marginBottom: '24px',
            }}>
              Overview & Analytics
            </h2>
            
            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '150px' : '250px'}, 1fr))`,
              gap: isMobile ? '12px' : '20px',
              marginBottom: '32px',
            }}>
              <StatCard title="Total Restaurants" value={stats.totalRestaurants} icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>} color="#FF8A00" />
              <StatCard title="Total Menu Items" value={stats.totalMenuItems} icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>} color="#60B246" />
              <StatCard title="Total Orders" value={stats.totalOrders} icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>} color="#5B69C3" />
              <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} color="#E74C3C" />
              <StatCard title="Today's Orders" value={stats.todayOrders} icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} color="#FF8A00" />
              <StatCard title="Pending Orders" value={stats.pendingOrders} icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} color="#FFA500" />
            </div>

            {/* Charts Section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '280px' : '400px'}, 1fr))`,
              gap: '20px',
            }}>
              {/* Orders Chart */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #E9E9EB',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#1A1A1A',
                  fontFamily: 'Poppins, sans-serif',
                  marginBottom: '20px',
                }}>
                  Recent Orders Status
                </h3>
                {orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#686B78', fontFamily: 'Poppins, sans-serif' }}>
                    No orders yet
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'].map((status) => {
                      const count = orders.filter(o => o.status === status).length;
                      const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                      return (
                        <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ minWidth: '120px', fontSize: '14px', color: '#686B78', fontFamily: 'Poppins, sans-serif' }}>
                            {status}
                          </div>
                          <div style={{ flex: 1, backgroundColor: '#F5F7FA', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${percentage}%`,
                              height: '100%',
                              backgroundColor: status === 'Delivered' ? '#60B246' : status === 'Out for Delivery' ? '#FF8A00' : '#5B69C3',
                              transition: 'width 0.3s ease',
                            }} />
                          </div>
                          <div style={{ minWidth: '60px', fontSize: '14px', fontWeight: 600, color: '#1A1A1A', fontFamily: 'Poppins, sans-serif', textAlign: 'right' }}>
                            {count} ({percentage.toFixed(0)}%)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Top Restaurants */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #E9E9EB',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#1A1A1A',
                  fontFamily: 'Poppins, sans-serif',
                  marginBottom: '20px',
                }}>
                  Top Rated Restaurants
                </h3>
                {restaurants.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#686B78', fontFamily: 'Poppins, sans-serif' }}>
                    No restaurants yet
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {restaurants
                      .sort((a, b) => b.rating - a.rating)
                      .slice(0, 5)
                      .map((restaurant) => (
                        <div key={restaurant._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#F5F7FA', borderRadius: '8px' }}>
                          {restaurant.image && (
                            <img src={restaurant.image} alt={restaurant.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                          )}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', fontFamily: 'Poppins, sans-serif' }}>
                              {restaurant.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#686B78', fontFamily: 'Poppins, sans-serif' }}>
                              {restaurant.cuisine}
                            </div>
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: 600, color: '#FF8A00', fontFamily: 'Poppins, sans-serif' }}>
                            ⭐ {restaurant.rating}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Restaurants Tab */}
        {activeTab === 'restaurants' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1A', fontFamily: 'Poppins, sans-serif', margin: 0 }}>
                Manage Restaurants
              </h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                {restaurants.length > 0 && (
                  <button
                    onClick={() => {
                      if (selectedRestaurants.length === restaurants.length) {
                        setSelectedRestaurants([]);
                      } else {
                        setSelectedRestaurants(restaurants.map(r => r._id!));
                      }
                    }}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: selectedRestaurants.length === restaurants.length ? '#686B78' : '#5B69C3',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                      <polyline points="9 11 12 14 22 4"/>
                      <path d="M21 12 v7 a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                    {selectedRestaurants.length === restaurants.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
                {selectedRestaurants.length > 0 && (
                  <button
                    onClick={handleBulkDeleteRestaurants}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#E74C3C',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                    Delete Selected ({selectedRestaurants.length})
                  </button>
                )}
                <button
                  onClick={() => { setBulkType('restaurants'); setShowBulkAdd(true); }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#5B69C3',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Bulk Add
                </button>
                <button
                  onClick={() => setShowAddRestaurant(true)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#60B246',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  + Add Restaurant
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="🔍 Search restaurants by name or cuisine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontSize: '15px',
                  borderRadius: '12px',
                  border: '1px solid #E9E9EB',
                  fontFamily: 'Poppins, sans-serif',
                  backgroundColor: '#FFFFFF',
                  color: '#1A1A1A',
                }}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
            }}>
              {filteredRestaurants.map((restaurant) => (
                <div
                  key={restaurant._id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: selectedRestaurants.includes(restaurant._id!) ? '2px solid #FF8A00' : '1px solid #E9E9EB',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    position: 'relative',
                  }}
                >
                  <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
                    <input
                      type="checkbox"
                      checked={selectedRestaurants.includes(restaurant._id!)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRestaurants([...selectedRestaurants, restaurant._id!]);
                        } else {
                          setSelectedRestaurants(selectedRestaurants.filter(id => id !== restaurant._id));
                        }
                      }}
                      style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        accentColor: '#FF8A00',
                      }}
                    />
                  </div>
                  {restaurant.image && (
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      style={{
                        width: '100%',
                        height: '180px',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  <div style={{ padding: '20px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Poppins, sans-serif',
                      margin: '0 0 8px 0',
                    }}>
                      {restaurant.name}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#686B78', margin: '4px 0', fontFamily: 'Poppins, sans-serif' }}>
                      {restaurant.cuisine}
                    </p>
                    <p style={{ fontSize: '14px', color: '#686B78', margin: '4px 0', fontFamily: 'Poppins, sans-serif' }}>
                      ⭐ {restaurant.rating} • {restaurant.deliveryTime} mins
                    </p>
                    <p style={{ fontSize: '14px', color: '#686B78', margin: '4px 0 12px 0', fontFamily: 'Poppins, sans-serif' }}>
                      Delivery: ₹{restaurant.deliveryFee}
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setEditingRestaurant(restaurant);
                          setShowEditRestaurant(true);
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          backgroundColor: '#5B69C3',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: 600,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRestaurant(restaurant._id!)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          backgroundColor: '#E74C3C',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: 600,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menus Tab */}
        {activeTab === 'menus' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1A', fontFamily: 'Poppins, sans-serif', margin: 0 }}>
                Manage Menu Items
              </h2>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {menus.length > 0 && (
                  <button
                    onClick={() => {
                      if (selectedMenus.length === menus.length) {
                        setSelectedMenus([]);
                      } else {
                        setSelectedMenus(menus.map(m => m._id!));
                      }
                    }}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: selectedMenus.length === menus.length ? '#686B78' : '#5B69C3',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                      <polyline points="9 11 12 14 22 4"/>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                    {selectedMenus.length === menus.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
                {selectedMenus.length > 0 && (
                  <button
                    onClick={handleBulkDeleteMenus}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#E74C3C',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                    Delete Selected ({selectedMenus.length})
                  </button>
                )}
                <button
                  onClick={() => { setBulkType('menus'); setShowBulkAdd(true); }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#5B69C3',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Bulk Add
                </button>
                <button
                  onClick={() => setShowAddMenu(true)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#60B246',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  + Add Menu Item
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="🔍 Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontSize: '15px',
                  borderRadius: '12px',
                  border: '1px solid #E9E9EB',
                  fontFamily: 'Poppins, sans-serif',
                  backgroundColor: '#FFFFFF',
                  color: '#1A1A1A',
                  marginBottom: '16px',
                }}
              />
              
              {/* Category Filter Chips */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#686B78', fontFamily: 'Poppins, sans-serif', marginBottom: '8px' }}>
                  CATEGORY
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setCategoryFilter('all')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: categoryFilter === 'all' ? '2px solid #FF8A00' : '1px solid #E9E9EB',
                      backgroundColor: categoryFilter === 'all' ? '#FFF7ED' : '#FFFFFF',
                      color: categoryFilter === 'all' ? '#FF8A00' : '#686B78',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: categoryFilter === cat ? '2px solid #FF8A00' : '1px solid #E9E9EB',
                        backgroundColor: categoryFilter === cat ? '#FFF7ED' : '#FFFFFF',
                        color: categoryFilter === cat ? '#FF8A00' : '#686B78',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Veg/Non-Veg Filter Chips */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#686B78', fontFamily: 'Poppins, sans-serif', marginBottom: '8px' }}>
                  TYPE
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setVegFilter('all')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: vegFilter === 'all' ? '2px solid #FF8A00' : '1px solid #E9E9EB',
                      backgroundColor: vegFilter === 'all' ? '#FFF7ED' : '#FFFFFF',
                      color: vegFilter === 'all' ? '#FF8A00' : '#686B78',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => setVegFilter('veg')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: vegFilter === 'veg' ? '2px solid #60B246' : '1px solid #E9E9EB',
                      backgroundColor: vegFilter === 'veg' ? '#F0FFF4' : '#FFFFFF',
                      color: vegFilter === 'veg' ? '#60B246' : '#686B78',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#60B246' }}></span>
                    Veg Only
                  </button>
                  <button
                    onClick={() => setVegFilter('non-veg')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: vegFilter === 'non-veg' ? '2px solid #E74C3C' : '1px solid #E9E9EB',
                      backgroundColor: vegFilter === 'non-veg' ? '#FFF5F5' : '#FFFFFF',
                      color: vegFilter === 'non-veg' ? '#E74C3C' : '#686B78',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#E74C3C' }}></span>
                    Non-Veg Only
                  </button>
                </div>
              </div>
            </div>

            {restaurants.length === 0 ? (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '60px',
                textAlign: 'center',
                border: '1px solid #E9E9EB',
              }}>
                <div style={{ fontSize: '18px', color: '#686B78', fontFamily: 'Poppins, sans-serif' }}>
                  No restaurants added yet. Add restaurants first to create menu items.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {restaurants.map((restaurant) => {
                  const restaurantMenus = filteredMenus.filter(menu => menu.restaurantId === restaurant._id);
                  
                  return (
                    <div key={restaurant._id} style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      padding: '24px',
                      border: '1px solid #E9E9EB',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid #F5F7FA' }}>
                        {restaurant.image && (
                          <img
                            src={restaurant.image}
                            alt={restaurant.name}
                            style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '12px',
                              objectFit: 'cover',
                            }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#1A1A1A',
                            fontFamily: 'Poppins, sans-serif',
                            margin: '0 0 4px 0',
                          }}>
                            {restaurant.name}
                          </h3>
                          <p style={{ fontSize: '14px', color: '#686B78', margin: 0, fontFamily: 'Poppins, sans-serif' }}>
                            {restaurant.cuisine}
                          </p>
                        </div>
                        <div style={{
                          padding: '8px 16px',
                          backgroundColor: '#FFF7ED',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#FF8A00',
                          fontFamily: 'Poppins, sans-serif',
                        }}>
                          {restaurantMenus.length} Items
                        </div>
                      </div>

                      {restaurantMenus.length === 0 ? (
                        <div style={{
                          padding: '40px',
                          textAlign: 'center',
                          color: '#686B78',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '14px',
                        }}>
                          No menu items yet for this restaurant
                        </div>
                      ) : (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                          gap: '16px',
                        }}>
                          {restaurantMenus.map((menu) => (
                <div
                  key={menu._id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: selectedMenus.includes(menu._id!) ? '2px solid #FF8A00' : '1px solid #E9E9EB',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    position: 'relative',
                  }}
                >
                  <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
                    <input
                      type="checkbox"
                      checked={selectedMenus.includes(menu._id!)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMenus([...selectedMenus, menu._id!]);
                        } else {
                          setSelectedMenus(selectedMenus.filter(id => id !== menu._id));
                        }
                      }}
                      style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        accentColor: '#FF8A00',
                      }}
                    />
                  </div>
                  {menu.image && (
                    <img
                      src={menu.image}
                      alt={menu.name}
                      style={{
                        width: '100%',
                        height: '160px',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: menu.isVeg ? '#60B246' : '#E74C3C',
                        color: '#FFFFFF',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 600,
                      }}>
                        {menu.isVeg ? 'VEG' : 'NON-VEG'}
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: '#FFE8D1',
                        color: '#FF8A00',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 600,
                      }}>
                        {menu.category}
                      </span>
                    </div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Poppins, sans-serif',
                      margin: '0 0 8px 0',
                    }}>
                      {menu.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#686B78', margin: '4px 0', fontFamily: 'Poppins, sans-serif', lineHeight: '1.4' }}>
                      {menu.description}
                    </p>
                    <p style={{ fontSize: '20px', color: '#FF8A00', fontWeight: 700, margin: '12px 0', fontFamily: 'Poppins, sans-serif' }}>
                      ₹{menu.price}
                    </p>
                    <p style={{ fontSize: '12px', color: '#686B78', margin: '4px 0 12px 0', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                      Restaurant: {restaurant.name}
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setEditingMenu(menu);
                          setShowEditMenu(true);
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          backgroundColor: '#5B69C3',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: 600,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMenu(menu._id!)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          backgroundColor: '#E74C3C',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: 600,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                  ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1A', fontFamily: 'Poppins, sans-serif', marginBottom: '24px' }}>
              Order Management
            </h2>
            {orders.length === 0 ? (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '60px',
                textAlign: 'center',
                border: '1px solid #E9E9EB',
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#686B78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                </div>
                <div style={{ fontSize: '18px', color: '#686B78', fontFamily: 'Poppins, sans-serif' }}>
                  No orders yet
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.map((order) => (
                  <div
                    key={order._id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #E9E9EB',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A1A', fontFamily: 'Poppins, sans-serif' }}>
                          Order #{order._id?.slice(-8).toUpperCase()}
                        </div>
                        <div style={{ fontSize: '13px', color: '#686B78', fontFamily: 'Poppons, sans-serif', marginTop: '4px' }}>
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#686B78', fontFamily: 'Poppins, sans-serif' }}>
                          STATUS
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleUpdateOrderStatus(order._id!, status)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: order.status === status ? '2px solid' : '1px solid #E9E9EB',
                                borderColor: order.status === status ? (status === 'Delivered' ? '#60B246' : status === 'Cancelled' ? '#E74C3C' : '#FF8A00') : '#E9E9EB',
                                backgroundColor: order.status === status ? 
                                  (status === 'Delivered' ? '#60B246' : status === 'Cancelled' ? '#E74C3C' : '#FF8A00') : '#FFFFFF',
                                color: order.status === status ? '#FFFFFF' : '#686B78',
                                fontWeight: 600,
                                fontSize: '11px',
                                fontFamily: 'Poppins, sans-serif',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#686B78', fontFamily: 'Poppins, sans-serif', marginBottom: '8px' }}>
                      Items: {order.items?.length || 0}
                    </div>
                    <div style={{ fontSize: '18px', color: '#FF8A00', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                      ₹{order.totalPrice}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Restaurant Modal */}
      {showAddRestaurant && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <h2 style={{ marginBottom: '24px', fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 700 }}>Add Restaurant</h2>
            
            <input
              placeholder="Restaurant Name"
              value={newRestaurant.name}
              onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
              style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #E9E9EB', borderRadius: '8px', fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
            />
            <input
              placeholder="Cuisine (e.g., Italian, Indian)"
              value={newRestaurant.cuisine}
              onChange={(e) => setNewRestaurant({ ...newRestaurant, cuisine: e.target.value })}
              style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #E9E9EB', borderRadius: '8px', fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
            />
            <input
              type="number"
              placeholder="Rating (0-5)"
              step="0.1"
              value={newRestaurant.rating}
              onChange={(e) => setNewRestaurant({ ...newRestaurant, rating: parseFloat(e.target.value) })}
              style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #E9E9EB', borderRadius: '8px', fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
            />
            <input
              placeholder="Delivery Time (e.g., 30-40)"
              value={newRestaurant.deliveryTime}
              onChange={(e) => setNewRestaurant({ ...newRestaurant, deliveryTime: e.target.value })}
              style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #E9E9EB', borderRadius: '8px', fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
            />
            <input
              type="number"
              placeholder="Delivery Fee"
              value={newRestaurant.deliveryFee}
              onChange={(e) => setNewRestaurant({ ...newRestaurant, deliveryFee: parseFloat(e.target.value) })}
              style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #E9E9EB', borderRadius: '8px', fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
            />
            <input
              placeholder="Image URL or /images/restaurants/name.jpg"
              value={newRestaurant.image}
              onChange={(e) => setNewRestaurant({ ...newRestaurant, image: e.target.value })}
              style={{ width: '100%', padding: '12px', marginBottom: '8px', border: '1px solid #E9E9EB', borderRadius: '8px', fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
            />
            <div style={{ fontSize: '12px', color: '#686B78', fontFamily: 'Poppins, sans-serif', marginBottom: '16px' }}>
              Tip: Place images in public/images/restaurants/ folder and use path like: /images/restaurants/pizza-hut.jpg
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleAddRestaurant}
                style={{ flex: 1, padding: '12px', backgroundColor: '#60B246', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}
              >
                Add Restaurant
              </button>
              <button
                onClick={() => setShowAddRestaurant(false)}
                style={{ flex: 1, padding: '12px', backgroundColor: '#E74C3C', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Menu Modal */}
      {showAddMenu && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <h2 style={{ marginBottom: '24px', fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 700 }}>Add Menu Item</h2>
            
            <select
              value={newMenu.restaurantId}
              onChange={(e) => setNewMenu({ ...newMenu, restaurantId: e.target.value })}
              style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #E9E9EB', borderRadius: '8px', fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
            >
              <option value="">Select Restaurant</option>
              {restaurants.map((r) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
            <input
              placeholder="Item Name"
              value={newMenu.name}
              onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
              style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #E9E9EB', borderRadius: '8px', fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
            />
            <textarea
              placeholder="Description"
              value={newMenu.description}
              onChange={(e) => setNewMenu({ ...newMenu, description: e.target.value })}
              style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #E9E9EB', borderRadius: '8px', fontFamily: 'Poppins, sans-serif', minHeight: '80px', boxSizing: 'border-box', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
            />
            <input
              type="number"
              placeholder="Price"
              value={newMenu.price}
              onChange={(e) => setNewMenu({ ...newMenu, price: parseFloat(e.target.value) })}
              style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #E9E9EB', borderRadius: '8px', fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
            />
            <input
              placeholder="Category (e.g., Pizza, Burger)"
              value={newMenu.category}
              onChange={(e) => setNewMenu({ ...newMenu, category: e.target.value })}
              style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #E9E9EB', borderRadius: '8px', fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
            />
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#3E4152' }}>
                <input
                  type="checkbox"
                  checked={newMenu.isVeg}
                  onChange={(e) => setNewMenu({ ...newMenu, isVeg: e.target.checked })}
                  style={{ marginRight: '8px' }}
                />
                Vegetarian
              </label>
            </div>
            <input
              placeholder="Image URL or /images/menu-items/name.jpg"
              value={newMenu.image}
              onChange={(e) => setNewMenu({ ...newMenu, image: e.target.value })}
              style={{ width: '100%', padding: '12px', marginBottom: '8px', border: '1px solid #E9E9EB', borderRadius: '8px', fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
            />
            <div style={{ fontSize: '12px', color: '#686B78', fontFamily: 'Poppins, sans-serif', marginBottom: '16px' }}>
              Tip: Place images in public/images/menu-items/ folder and use path like: /images/menu-items/pizza.jpg
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleAddMenu}
                style={{ flex: 1, padding: '12px', backgroundColor: '#60B246', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}
              >
                Add Menu Item
              </button>
              <button
                onClick={() => setShowAddMenu(false)}
                style={{ flex: 1, padding: '12px', backgroundColor: '#E74C3C', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Add Modal */}
      {showBulkAdd && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <h2 style={{ marginBottom: '12px', fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 700 }}>
              Bulk Add {bulkType === 'restaurants' ? 'Restaurants' : 'Menu Items'}
            </h2>
            <p style={{ fontSize: '14px', color: '#686B78', marginBottom: '20px', fontFamily: 'Poppins, sans-serif' }}>
              Paste JSON array of {bulkType} below. Each item will be added to the database.
            </p>
            
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#F5F7FA', borderRadius: '8px', fontSize: '13px', fontFamily: 'monospace', color: '#1A1A1A' }}>
              <strong>Example format:</strong>
              {bulkType === 'restaurants' ? (
                <pre style={{ margin: '8px 0 0 0', overflow: 'auto' }}>{`[
  {
    "name": "Restaurant Name",
    "cuisine": "Italian, Pizza",
    "rating": 4.5,
    "deliveryTime": "30-40",
    "deliveryFee": 0,
    "image": "https://..."
  }
]`}</pre>
              ) : (
                <pre style={{ margin: '8px 0 0 0', overflow: 'auto' }}>{`[
  {
    "restaurantId": "restaurant_id_here",
    "name": "Item Name",
    "description": "Description",
    "price": 299,
    "category": "Main Course",
    "isVeg": true,
    "image": "https://..."
  }
]`}</pre>
              )}
            </div>

            <textarea
              placeholder={`Paste ${bulkType} JSON array here...`}
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '24px',
                border: '1px solid #E9E9EB',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '13px',
                minHeight: '300px',
                boxSizing: 'border-box',
                backgroundColor: '#FFFFFF',
                color: '#1A1A1A',
              }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleBulkAdd}
                style={{ flex: 1, padding: '12px', backgroundColor: '#60B246', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Bulk Add
              </button>
              <button
                onClick={() => { setShowBulkAdd(false); setBulkData(''); }}
                style={{ flex: 1, padding: '12px', backgroundColor: '#E74C3C', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: snackbar.type === 'success' ? '#60B246' : '#E74C3C',
          color: '#FFFFFF',
          padding: '16px 24px',
          borderRadius: '8px',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600,
          zIndex: 2000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {snackbar.message}
        </div>
      )}

      {/* Edit Restaurant Modal */}
      {showEditRestaurant && editingRestaurant && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1A', fontFamily: 'Poppins, sans-serif', marginBottom: '24px' }}>
              Edit Restaurant
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text"
                placeholder="Restaurant Name"
                value={editingRestaurant.name}
                onChange={(e) => setEditingRestaurant({...editingRestaurant, name: e.target.value})}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E9E9EB', fontFamily: 'Poppins, sans-serif', fontSize: '14px', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
              />
              <input
                type="text"
                placeholder="Cuisine"
                value={editingRestaurant.cuisine}
                onChange={(e) => setEditingRestaurant({...editingRestaurant, cuisine: e.target.value})}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E9E9EB', fontFamily: 'Poppins, sans-serif', fontSize: '14px', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
              />
              <input
                type="number"
                placeholder="Rating"
                value={editingRestaurant.rating}
                onChange={(e) => setEditingRestaurant({...editingRestaurant, rating: parseFloat(e.target.value)})}
                step="0.1"
                min="0"
                max="5"
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E9E9EB', fontFamily: 'Poppins, sans-serif', fontSize: '14px', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
              />
              <input
                type="text"
                placeholder="Delivery Time (e.g., 30-40)"
                value={editingRestaurant.deliveryTime}
                onChange={(e) => setEditingRestaurant({...editingRestaurant, deliveryTime: e.target.value})}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E9E9EB', fontFamily: 'Poppins, sans-serif', fontSize: '14px', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
              />
              <input
                type="number"
                placeholder="Delivery Fee"
                value={editingRestaurant.deliveryFee}
                onChange={(e) => setEditingRestaurant({...editingRestaurant, deliveryFee: parseFloat(e.target.value)})}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E9E9EB', fontFamily: 'Poppins, sans-serif', fontSize: '14px', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
              />
              <input
                type="text"
                placeholder="Image URL or /images/restaurants/name.jpg"
                value={editingRestaurant.image}
                onChange={(e) => setEditingRestaurant({...editingRestaurant, image: e.target.value})}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E9E9EB', fontFamily: 'Poppins, sans-serif', fontSize: '14px', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
              />
              <div style={{ fontSize: '12px', color: '#686B78', fontFamily: 'Poppins, sans-serif', marginTop: '-8px' }}>
                Tip: Place images in public/images/restaurants/ folder
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={() => {
                    setShowEditRestaurant(false);
                    setEditingRestaurant(null);
                  }}
                  style={{ flex: 1, padding: '12px', backgroundColor: '#F5F7FA', color: '#3E4152', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditRestaurant}
                  style={{ flex: 1, padding: '12px', backgroundColor: '#60B246', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Menu Modal */}
      {showEditMenu && editingMenu && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1A', fontFamily: 'Poppins, sans-serif', marginBottom: '24px' }}>
              Edit Menu Item
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <select
                value={editingMenu.restaurantId}
                onChange={(e) => setEditingMenu({...editingMenu, restaurantId: e.target.value})}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E9E9EB', fontFamily: 'Poppins, sans-serif', fontSize: '14px', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
              >
                <option value="">Select Restaurant</option>
                {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
              </select>
              <input
                type="text"
                placeholder="Item Name"
                value={editingMenu.name}
                onChange={(e) => setEditingMenu({...editingMenu, name: e.target.value})}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E9E9EB', fontFamily: 'Poppins, sans-serif', fontSize: '14px', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
              />
              <textarea
                placeholder="Description"
                value={editingMenu.description}
                onChange={(e) => setEditingMenu({...editingMenu, description: e.target.value})}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E9E9EB', fontFamily: 'Poppins, sans-serif', fontSize: '14px', minHeight: '80px', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
              />
              <input
                type="number"
                placeholder="Price"
                value={editingMenu.price}
                onChange={(e) => setEditingMenu({...editingMenu, price: parseFloat(e.target.value)})}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E9E9EB', fontFamily: 'Poppins, sans-serif', fontSize: '14px', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
              />
              <input
                type="text"
                placeholder="Category (e.g., Pizza, Burger)"
                value={editingMenu.category}
                onChange={(e) => setEditingMenu({...editingMenu, category: e.target.value})}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E9E9EB', fontFamily: 'Poppins, sans-serif', fontSize: '14px', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontSize: '14px', color: '#1A1A1A', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>Vegetarian:</label>
                <input
                  type="checkbox"
                  checked={editingMenu.isVeg}
                  onChange={(e) => setEditingMenu({...editingMenu, isVeg: e.target.checked})}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: editingMenu.isVeg ? '#60B246' : '#E74C3C' }}
                />
                <span style={{ fontSize: '14px', color: '#686B78', fontFamily: 'Poppins, sans-serif' }}>
                  {editingMenu.isVeg ? 'Veg' : 'Non-Veg'}
                </span>
              </div>
              <input
                type="text"
                placeholder="Image URL or /images/menu-items/name.jpg"
                value={editingMenu.image}
                onChange={(e) => setEditingMenu({...editingMenu, image: e.target.value})}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E9E9EB', fontFamily: 'Poppins, sans-serif', fontSize: '14px', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
              />
              <div style={{ fontSize: '12px', color: '#686B78', fontFamily: 'Poppins, sans-serif', marginTop: '-8px' }}>
                Tip: Place images in public/images/menu-items/ folder
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={() => {
                    setShowEditMenu(false);
                    setEditingMenu(null);
                  }}
                  style={{ flex: 1, padding: '12px', backgroundColor: '#F5F7FA', color: '#3E4152', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditMenu}
                  style={{ flex: 1, padding: '12px', backgroundColor: '#60B246', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Dialog */}
      {showDeleteDialog && deleteTarget && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '480px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#FFF0F0',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <h2 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#1A1A1A',
                fontFamily: 'Poppins, sans-serif',
                margin: '0 0 12px 0',
              }}>
                Confirm Deletion
              </h2>
              <p style={{
                fontSize: '15px',
                color: '#686B78',
                fontFamily: 'Poppins, sans-serif',
                margin: 0,
                lineHeight: '1.5',
              }}>
                {deleteTarget.type === 'restaurant' && `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
                {deleteTarget.type === 'menu' && `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
                {deleteTarget.type === 'bulk-restaurant' && `Are you sure you want to delete ${selectedRestaurants.length} restaurants? This action cannot be undone.`}
                {deleteTarget.type === 'bulk-menu' && `Are you sure you want to delete ${selectedMenus.length} menu items? This action cannot be undone.`}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteTarget(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#F5F7FA',
                  color: '#3E4152',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  fontSize: '15px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#E74C3C',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  fontSize: '15px',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
