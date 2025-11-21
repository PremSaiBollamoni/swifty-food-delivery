import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { RestaurantDetail } from './pages/RestaurantDetail';
import { Cart } from './pages/Cart';
import { Orders } from './pages/Orders';
import { OrderTracking } from './pages/OrderTracking';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';

function AppContent() {
  const location = useLocation();
  const hideHeader = location.pathname === '/login' || 
                     location.pathname === '/register' || 
                     location.pathname.startsWith('/swiftyadmin');

  return (
    <div style={{
      fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#FFFFFF',
      color: '#3E4152',
      minHeight: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
    }}>
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Navigate to="/login" />} />
        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
        <Route path="/search" element={<Home />} />
        <Route path="/swiftyadmin" element={<AdminLogin />} />
        <Route path="/swiftyadmin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
