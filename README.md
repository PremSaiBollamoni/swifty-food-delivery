<div align="center">

# 🍕 Swifty - Modern Food Delivery Platform

<img src="images/logo.png" alt="Swifty Logo" width="120" height="120"/>

### *Order food & groceries. Discover best restaurants. Swifty it!* 🚀

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

[✨ Features](#-features) • [🎯 Demo](#-demo) • [🚀 Quick Start](#-quick-start) • [📱 Screenshots](#-screenshots) • [🛠️ Tech Stack](#️-tech-stack)

</div>

---

## 🌟 What Makes Swifty Stand Out?

Swifty isn't just another food delivery app - it's a **full-stack masterpiece** showcasing modern web development best practices with:

- 🎨 **Stunning UI/UX** - Swiggy-inspired design with smooth animations
- ⚡ **Lightning Fast** - Built with Vite for optimal performance
- 📱 **Fully Responsive** - Seamless experience across all devices
- 🔐 **Secure Authentication** - JWT-based user authentication
- 🎬 **Live Order Tracking** - Real-time animated delivery tracking
- 🎛️ **Powerful Admin Panel** - Complete CRUD operations
- 🔄 **Auto Status Updates** - Time-based order progression
- 🌐 **Cloud Database** - MongoDB Atlas integration

---

## ✨ Features

### 👤 User Features

<table>
<tr>
<td width="50%">

#### 🔐 Authentication System
- User registration & login
- JWT token-based authentication
- Persistent sessions across refreshes
- Secure password handling

#### 🍽️ Restaurant & Menu Browsing
- Browse multiple restaurants
- View detailed menus by restaurant
- Veg/Non-veg filtering
- High-quality food images

</td>
<td width="50%">

#### 🛒 Smart Cart Management
- Add multiple items with quantities
- Restaurant-wise cart separation
- Real-time cart updates
- Clear cart warnings for different restaurants

#### 📦 Order Management
- Place orders with delivery details
- Real-time order tracking with animations
- View order history
- Auto-updating order statuses

</td>
</tr>
</table>

### 🔧 Admin Features

<table>
<tr>
<td width="50%">

#### 📊 Analytics Dashboard
- Real-time statistics
- Total restaurants, menus, orders
- Revenue tracking
- Today's orders count
- Pending orders monitor
- Top-rated restaurants

</td>
<td width="50%">

#### 🎛️ Complete CRUD Operations
- Add/Edit/Delete restaurants
- Add/Edit/Delete menu items
- Bulk data import (JSON)
- Order status management
- Cascade delete (restaurant → menus)
- Image management

</td>
</tr>
</table>

---

## 🎯 Live Order Tracking

<div align="center">

### 🚴 Animated Delivery Journey

```
📍 Restaurant → 🔥 Preparing → 🚴 Out for Delivery → ✅ Delivered
    (0-2 min)      (2-5 min)        (5-10 min)        (10+ min)
```

</div>

---

## 🛠️ Tech Stack

<div align="center">

### Frontend

![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=react-router&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-000000?style=flat-square&logo=react&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white)

### Backend

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=flat-square&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=json-web-tokens&logoColor=white)
![Bcrypt](https://img.shields.io/badge/Bcrypt-003A70?style=flat-square&logo=letsencrypt&logoColor=white)

</div>

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/PremSaiBollamoni/swifty-food-delivery
cd Task2

# Install backend dependencies
cd swifty-backend
npm install

# Install frontend dependencies
cd ../swifty-frontend
npm install
```

### Environment Setup

Create `.env` file in `swifty-backend/`:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=5000
JWT_SECRET=your-secret-key-here
```

### Run the Application

```bash
# Terminal 1 - Start Backend (from swifty-backend/)
npm run dev

# Terminal 2 - Start Frontend (from swifty-frontend/)
npm run dev
```

**Access the application:**
- 🌐 Frontend: http://localhost:5173
- 🔌 Backend API: http://localhost:5000
- 🛡️ Admin Panel: http://localhost:5173/swiftyadmin

### Admin Credentials

```
Email: swifty@admin.sw
Password: swifty-online
```

---

## 📱 Screenshots

<div align="center">

### 🏠 Home Page
*Browse restaurants with beautiful cards and filters*

### 🍔 Restaurant Menu
*Detailed menu items with veg/non-veg indicators*

### 🛒 Shopping Cart
*Smart cart management with restaurant separation*

### 📦 Order Tracking
*Live animated delivery tracking with curved path*

### 🎛️ Admin Dashboard
*Comprehensive analytics and management panel*

</div>

---

## 🎨 Key Highlights

### 🎭 Advanced Features

- **Responsive Design** - Mobile-first approach with adaptive layouts
- **State Management** - Zustand for efficient global state
- **Real-time Updates** - Auto-refresh with polling intervals
- **Smart Filters** - Category, veg/non-veg, search filters
- **Cascade Operations** - Delete restaurant → auto-delete menus
- **Bulk Import** - JSON-based bulk data addition
- **Session Persistence** - Auth state survives page refreshes
- **Error Handling** - Comprehensive error states and fallbacks

### 🔥 Performance Optimizations

- Vite for blazing-fast HMR
- Code-splitting with React Router
- Optimized re-renders with Zustand
- Efficient API calls with Axios
- CSS-in-JS for scoped styling
- Lazy loading for images

### 🎯 Code Quality

- Full TypeScript implementation
- Clean component architecture
- Reusable custom hooks
- Consistent naming conventions
- RESTful API design
- Environment-based configuration

---

## 📂 Project Structure

```
Task2/
├── swifty-frontend/          # React + TypeScript Frontend
│   ├── public/
│   │   ├── images/           # Local images
│   │   │   ├── restaurants/
│   │   │   └── menu-items/
│   │   ├── logo.png
│   │   └── favicon.png
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── services/        # API services
│   │   ├── store/           # Zustand state management
│   │   ├── hooks/           # Custom React hooks
│   │   ├── config/          # Configuration files
│   │   └── main.tsx         # Entry point
│   └── package.json
│
└── swifty-backend/           # Node.js + Express Backend
    ├── src/
    │   ├── routes/          # API routes
    │   │   ├── auth.ts      # Authentication
    │   │   ├── restaurants.ts
    │   │   ├── menus.ts
    │   │   └── orders.ts
    │   ├── db/              # Database connection
    │   ├── middleware/      # Express middleware
    │   ├── scripts/         # Utility scripts
    │   └── index.ts         # Server entry
    └── package.json
```

---

## 🔌 API Endpoints

<details>
<summary><b>Click to expand API documentation</b></summary>

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant by ID
- `POST /api/restaurants` - Add restaurant (Admin)
- `PUT /api/restaurants/:id` - Update restaurant (Admin)
- `DELETE /api/restaurants/:id` - Delete restaurant (Admin)

### Menus
- `GET /api/menus/all` - Get all menu items
- `GET /api/menus/restaurant/:id` - Get menus by restaurant
- `POST /api/menus` - Add menu item (Admin)
- `PUT /api/menus/:id` - Update menu item (Admin)
- `DELETE /api/menus/:id` - Delete menu item (Admin)

### Orders
- `GET /api/orders/all` - Get all orders (Admin)
- `GET /api/orders/user/:userId` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status (Admin)

</details>

---

## 🎓 What I Learned

Building Swifty taught me:

- ✅ Full-stack TypeScript development
- ✅ RESTful API design and implementation
- ✅ MongoDB database design and queries
- ✅ JWT authentication flow
- ✅ State management with Zustand
- ✅ Responsive design patterns
- ✅ Real-time data synchronization
- ✅ React Router navigation
- ✅ SVG animations and graphics
- ✅ Cloud database integration
- ✅ Production deployment strategies

---

## 🚧 Future Enhancements

- [ ] Payment gateway integration
- [ ] Real-time WebSocket notifications
- [ ] Review and rating system
- [ ] Image upload functionality
- [ ] Order cancellation feature
- [ ] Advanced search with filters
- [ ] Dark mode toggle
- [ ] Email notifications
- [ ] Multi-language support
- [ ] Progressive Web App (PWA)

---

## 👨‍💻 Developer

<div align="center">

**Built with ❤️ by Prem Sai Bollamoni**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/PremSaiBollamoni)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/prem-sai-bollamoni-817a18348)
[![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge&logo=google-chrome&logoColor=white)](https://myportfoliobyprem.netlify.app)

</div>

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

### ⭐ Star this repo if you found it helpful!

**Made with 🍕 and lots of ☕**

</div>
