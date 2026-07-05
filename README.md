# SB Stocks - Paper Trading Platform

A production-quality MERN (MongoDB, Express, React, Node.js) stack paper trading web application that enables users to practice stock trading in real-time with $100,000 USD virtual money. The application follows clean MVC architecture patterns and utilizes a dark theme dashboard design, Recharts data visualization, and an administrative control panel.

---

## Folder Structure

```
sb-stocks/
├── client/                 # React frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/     # Navbar, layouts
│       ├── context/        # AuthContext, MarketContext
│       └── pages/          # Landing, Dashboard, Stocks, StockDetails, Portfolio, Watchlist, etc.
├── server/                 # Express backend
│   ├── package.json
│   ├── server.js           # API entry point
│   ├── config/             # db connection
│   ├── controllers/        # Controllers (Auth, Stocks, Portfolio, Watchlist, Orders, Admin)
│   ├── middleware/         # authMiddleware, adminMiddleware
│   ├── models/             # Mongoose Models (User, Stock, Transaction, Holding, Watchlist, Portfolio)
│   ├── routes/             # Router mappings
│   └── scripts/            # Database seed script
├── mongodb_data/           # Local sandboxed database store
└── README.md               # Documentation
```

---

## Installation & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) installed (v18+ recommended)
- WSL 2 (Windows Subsystem for Linux) installed (Ubuntu-24.04 contains our running MongoDB server database instance)

---

### Step 1: Initialize Database (WSL 2 MongoDB)
The project is configured to run MongoDB inside WSL 2 to avoid requiring Windows admin rights.
In your Windows PowerShell:

1. Start the WSL MongoDB instance:
   ```bash
   wsl -d Ubuntu-24.04 -u root service mongod start
   ```
2. Verify that MongoDB is listening on local port `27017`:
   ```bash
   netstat -ano | findstr 27017
   ```
   *(You should see a listener active on 127.0.0.1:27017)*

---

### Step 2: Configure & Seed Backend Server
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Environment variables are pre-configured in `server/.env`.
3. Seed the database with 200 US stocks, 30 days of historical prices, and test accounts:
   ```bash
   npm run seed
   ```
4. Start the Node/Express backend development server:
   ```bash
   npm run dev
   ```
   *(Server starts running on http://localhost:5000)*

---

### Step 3: Configure & Start Frontend Client
1. In a new terminal window, navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to the application:
   **[http://localhost:3000](http://localhost:3000)**

---

## Test Credentials

Use these pre-seeded accounts to explore the application:

### Standard User Account
- **Email:** `john@example.com`
- **Password:** `password123`
- **Starting Balance:** $100,000.00 USD

### Administrative Account
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Starting Balance:** $100,000.00 USD
- **Privileges:** Access to Admin Portal (Delete/Suspend users, create/edit/delete stocks, trade tracking)

---

## API Endpoints List

### Authentication & Profiles (`/api/auth`)
- `POST /api/auth/register` - Create user account (returns token)
- `POST /api/auth/login` - Authenticate user & issue JWT
- `GET /api/auth/profile` - Retrieve authenticated user profile (protected)
- `PUT /api/auth/profile` - Update user name/email (protected)
- `PUT /api/auth/password` - Change password (protected)

### Market & Stocks (`/api/stocks`)
- `GET /api/stocks` - Get paginated stocks catalog with search/filter/sort (protected)
- `GET /api/stocks/:symbol` - Retrieve single stock details (protected)
- `GET /api/stocks/market/gainers` - Fetch top 5 gainers (protected)
- `GET /api/stocks/market/losers` - Fetch top 5 losers (protected)
- `GET /api/stocks/market/sectors` - Fetch active sectors list (protected)

### Watchlists (`/api/watchlist`)
- `GET /api/watchlist` - Retrieve user's watchlist (protected)
- `POST /api/watchlist` - Add stock symbol to watchlist (protected)
- `DELETE /api/watchlist/:stockId` - Remove stock from watchlist (protected)

### Paper Trading & Portfolios (`/api/orders`, `/api/portfolio`)
- `POST /api/orders/buy` - Place BUY stock order (protected)
- `POST /api/orders/sell` - Place SELL stock order (protected)
- `GET /api/portfolio` - Fetch portfolio metrics, allocation distribution, and NAV growth history (protected)
- `GET /api/transactions` - Fetch user trade ledger records with search/filter/page (protected)

### Admin Operations (`/api/admin`)
- `GET /api/admin/analytics` - View platform trade aggregates and volume (admin-only)
- `GET /api/admin/users` - Paginate/search registered users list (admin-only)
- `PUT /api/admin/users/:id/suspend` - Suspend or activate a user account (admin-only)
- `DELETE /api/admin/users/:id` - Delete user account and cascade delete assets (admin-only)
- `POST /api/admin/stocks` - Register a custom stock listing (admin-only)
- `PUT /api/admin/stocks/:id` - Edit listed stock fields (admin-only)
- `DELETE /api/admin/stocks/:id` - Remove stock asset from catalog (admin-only)

---

## Security Practices Applied
1. **JWT Auth:** Bearer token validation with 30-day cookie/header validation.
2. **Password Cryptography:** Hashing passwords using `bcryptjs` with salt factor 10.
3. **MongoDB Injection Shielding:** Custom middleware utilizing `mongo-sanitize` on `req.body`, `req.query`, and `req.params`.
4. **Header Protection:** Helmet middleware integrating standard HTTP security headers.
5. **API Throttling:** Throttles incoming IP addresses to 300 requests per 15 minutes via `express-rate-limit`.
6. **Cost-Basis Calculation:** Holdings averages calculated utilizing the Weighted Average Cost basis algorithm.
