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
┌─────────────┐      HTTP/REST      ┌─────────────┐      SQL       ┌─────────────┐
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

---

## Interview Preparation Guide

### Q1: Walk me through your authentication flow.

**Answer:**
1. User submits email/password on Login page
2. Frontend POSTs to `/api/auth/login`
3. Server validates with Zod schema
4. Queries SQLite for user by email
5. bcrypt compares plaintext password with stored hash
6. If valid, signs JWT with user ID, email, role (expires 24h)
7. Returns JWT to frontend
8. Frontend stores JWT in localStorage via AuthContext
9. Axios interceptors attach JWT to subsequent requests
10. Protected routes check for valid JWT via AuthContext

**Code references:**
- `server/routes/auth.js:46-82` - Login endpoint
- `server/middleware/index.js` - JWT verification
- `client/src/context/AuthContext.js` - Frontend auth state

---

### Q2: How do you secure passwords?

**Answer:**
- **Hashing:** Use `bcrypt.hashSync(password, 10)` with 10 salt rounds
- **Comparison:** Use `bcrypt.compareSync(password, hashedPassword)` - never compare plaintext
- **Storage:** Store only the hash in SQLite, never the plaintext
- **JWT:** Store user ID in token, not sensitive data

**Code references:**
- `server/database/index.js:167, 201-203` - bcrypt usage

---

### Q3: Why did you choose Context API over Redux?

**Answer:**
- App is small-medium scale (2 global states: auth, theme)
- Context API avoids Redux boilerplate
- No complex state interactions needed
- Built into React, no extra dependencies
- If app grew larger, would consider Redux Toolkit or Zustand

---

### Q4: How do you handle database relationships?

**Answer:**
- **Users → Favorites:** One-to-Many (user can have many favorites)
- **Properties → Favorites:** One-to-Many (property can be favorited by many users)
- **Junction Table:** `favorites` table with `user_id` and `property_id` foreign keys
- **Constraint:** `UNIQUE(user_id, property_id)` prevents duplicate favorites
- **Cascade:** `ON DELETE CASCADE` removes favorites when user/property deleted

**Code references:**
- `server/database/index.js:48-57` - Favorites table schema

---

### Q5: What happens if two users favorite the same property simultaneously?

**Answer:**
- SQLite handles concurrency via file-level locking
- The `UNIQUE` constraint prevents duplicate entries
- If conflict occurs, database returns error which Express catches
- Returns 409 status with "Property already in favorites" message

**Code references:**
- `server/database/index.js:237-239` - Error handling for duplicates

---

### Q6: How would you deploy this?

**Answer:**

**Backend:**
- Use PostgreSQL instead of SQLite (better concurrency)
- Deploy to Render/Railway/Heroku
- Environment variables for JWT_SECRET, DATABASE_URL
- Add rate limiting (express-rate-limit)
- Helmet.js for security headers

**Frontend:**
- Build: `npm run build` creates optimized static files
- Deploy to Vercel/Netlify
- Configure API URL via env variable
- Remove proxy, use full API URL in axios

**Security additions:**
- HTTPS only
- HTTP-only cookies instead of localStorage for JWT
- CORS restricted to specific origins
- Input sanitization

---

### Q7: What is the difference between authentication and authorization in your app?

**Answer:**
- **Authentication:** Verifies who you are (login with email/password, receive JWT)
- **Authorization:** Verifies what you can do (JWT middleware checks if you are allowed to access `/api/favorites`)

**Code references:**
- `server/middleware/index.js` - JWT verification (authorization)
- `server/routes/auth.js` - Login (authentication)

---

### Q8: How does the theme toggle work?

**Answer:**
1. `ThemeContext` stores `isDarkMode` state
2. Toggles via `darkMode` class on HTML element
3. Tailwind `dark:` prefixes apply dark styles
4. Persisted to localStorage for refresh survival
5. `useEffect` syncs localStorage with React state

**Code references:**
- `client/src/context/ThemeContext.js`

---

### Q9: Why SQLite for this project?

**Answer:**
- **Pros:** Zero setup, single file, great for development/small apps, portable
- **Cons:** Not for high concurrency, limited write performance, no user management
- **When to switch:** Production with >100 concurrent users → PostgreSQL

---

### Q10: How would you add a "Forgot Password" feature?

**Answer:**
1. Add `/api/auth/forgot-password` endpoint
2. User submits email
3. Generate reset token (crypto.randomBytes), store hash in DB with expiry
4. Send email with reset link (SendGrid/AWS SES)
5. User clicks link → `/api/auth/reset-password` validates token
6. Accept new password, hash with bcrypt, update DB
7. Invalidate token after use

---

## Common Bug Fix Questions

### Q: Login fails with "Invalid email or password"

**Debug steps:**
1. Check server is running on correct port
2. Verify email exists in database
3. Check bcrypt comparison is using correct order `(password, hash)` not `(hash, password)`
4. Ensure password was hashed during registration
5. Check for trailing spaces in email input

---

## Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run setup` | Install all dependencies |
| `npm run dev` | Start both client and server |
| `npm run server` | Start backend only (nodemon) |
| `npm run client` | Start frontend only |
| `npm run build` | Build for production |

---

## Environment Variables (for production)

Create `.env` in server root:

```env
PORT=5001
JWT_SECRET=your_super_secret_key_here
DATABASE_URL=postgresql://... (for production)
```

**Note:** Never commit `.env` files to git.

---

## Troubleshooting

### Port 5000 is in use (macOS)

macOS Control Center uses port 5000. Changed server to port 5001 in `server/index.js`.

### Database locked error

Stop the server and restart. SQLite does not handle multiple processes well.

### CORS errors

Check that client `proxy` in `package.json` matches server port.

---

**Created by Rijan Bhattarai**
