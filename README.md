# Real Estate Buyer Portal

A full-stack web application for property buyers to browse listings, save favorites, and manage their preferences. Built with React, Express, and SQLite.

---

## Quick Start

```bash
# Install dependencies
npm run setup

# Start both servers
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

---

## Technical Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 | UI components |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Routing** | React Router | Client-side navigation |
| **State** | Context API | Global auth/theme state |
| **HTTP** | Axios | API requests |
| **Icons** | Lucide React | SVG icons |
| **Backend** | Express.js | REST API server |
| **Database** | SQLite | Local data storage |
| **Auth** | JWT + bcrypt | Token-based authentication |
| **Validation** | Zod | Schema validation |

---

## Architecture Overview

```
┌─────────────┐      HTTP/REST     ┌─────────────┐      SQL       ┌─────────────┐
│   React     │ ←────────────────→ │   Express   │ ←────────────→ │   SQLite    │
│  (Client)   │    JWT Tokens      │   (Server)  │                │   (Data)    │
└─────────────┘                    └─────────────┘                └─────────────┘
      │                                  │
      ├─ AuthContext (JWT storage)       ├─ Routes (/api/auth, /api/favorites)
      ├─ ThemeContext (dark mode)        ├─ Middleware (auth, validation)
      └─ Services (API calls)            └─ Database (models/queries)
```

---

## Project Structure

```
real-estate-buyer-portal/
├── server/
│   ├── index.js              # Express entry point (port 5001)
│   ├── routes/
│   │   ├── auth.js           # Login/register endpoints
│   │   ├── favorites.js      # CRUD for user favorites
│   │   ├── properties.js     # Property listings
│   │   └── user.js           # User profile
│   ├── middleware/
│   │   └── index.js          # JWT auth, Zod validation
│   └── database/
│       ├── index.js          # SQLite models (userDB, propertyDB, favoritesDB)
│       └── realestate.db     # SQLite file (excluded from git)
├── client/
│   ├── src/
│   │   ├── App.js            # Routes & layout
│   │   ├── pages/
│   │   │   ├── Dashboard.js  # Main property listing
│   │   │   ├── Login.js      # Login form
│   │   │   └── Register.js   # Registration form
│   │   ├── components/
│   │   │   └── PropertyCard.js  # Property display component
│   │   ├── context/
│   │   │   ├── AuthContext.js   # Auth state & provider
│   │   │   └── ThemeContext.js  # Dark mode state
│   │   └── services/
│   │       └── api.js       # Axios HTTP client
│   └── package.json
├── package.json
└── .gitignore               # Excludes node_modules, .db, .env
```

---

## Key Features

1. **Authentication** - JWT-based auth with secure password hashing (bcrypt)
2. **Favorites System** - Users can save/remove property favorites
3. **Dark Mode** - Theme toggle with Context API
4. **Search** - Filter properties by location, price, bedrooms
5. **Responsive** - Mobile-friendly Tailwind CSS


**Created by Rijan Bhattarai**
