# Real Estate Buyer Portal

## Setup & Run

```bash
# Install dependencies
npm install
cd client && npm install

# Start the app
npm run dev
```

Open http://localhost:3000

## How to Use

1. **Register** at `/register` → Enter name, email, password → Create Account
2. **Login** at `/login` → Enter credentials → Sign In  
3. **Browse** all properties on dashboard
4. **Add Favorites** → Click heart icon on property cards
5. **View Favorites** → Click "My Favorites" tab
6. **Search** properties using the search bar
7. **Dark Mode** → Click moon/sun icon in header to toggle

## Project Structure

```
real-estate-buyer-portal/
├── server/
│   ├── database/         # SQLite DB (users, properties, favorites)
│   ├── middleware/       # JWT auth & validation
│   ├── routes/           # API routes (auth, favorites, properties)
│   └── index.js          # Express server entry
├── client/
│   ├── src/
│   │   ├── components/   # PropertyCard, etc.
│   │   ├── context/      # AuthContext, ThemeContext
│   │   ├── pages/        # Login, Register, Dashboard
│   │   └── services/     # API calls
│   └── public/
└── package.json
```

**Created by Rijan Bhattarai**
