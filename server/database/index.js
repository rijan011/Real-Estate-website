const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, 'realestate.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'buyer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Properties table (sample data)
    db.run(`
      CREATE TABLE IF NOT EXISTS properties (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        location TEXT NOT NULL,
        bedrooms INTEGER,
        bathrooms INTEGER,
        area_sqft INTEGER,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Favorites table
    db.run(`
      CREATE TABLE IF NOT EXISTS favorites (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        property_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
        UNIQUE(user_id, property_id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating favorites table:', err.message);
      } else {
        seedProperties();
      }
    });
  });
}

function seedProperties() {
  const sampleProperties = [
    {
      id: uuidv4(),
      title: 'Modern Downtown Apartment',
      description: 'Beautiful 2-bedroom apartment in the heart of downtown with stunning city views.',
      price: 450000,
      location: 'Downtown, New York',
      bedrooms: 2,
      bathrooms: 2,
      area_sqft: 1200,
      image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'
    },
    {
      id: uuidv4(),
      title: 'Suburban Family Home',
      description: 'Spacious 4-bedroom home with a large backyard, perfect for families.',
      price: 650000,
      location: 'Suburbia, New Jersey',
      bedrooms: 4,
      bathrooms: 3,
      area_sqft: 2800,
      image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'
    },
    {
      id: uuidv4(),
      title: 'Luxury Beachfront Condo',
      description: 'Stunning oceanfront property with private beach access and premium amenities.',
      price: 1200000,
      location: 'Miami Beach, Florida',
      bedrooms: 3,
      bathrooms: 3,
      area_sqft: 2100,
      image_url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800'
    },
    {
      id: uuidv4(),
      title: 'Cozy Mountain Cabin',
      description: 'Rustic 3-bedroom cabin with breathtaking mountain views and fireplace.',
      price: 380000,
      location: 'Aspen, Colorado',
      bedrooms: 3,
      bathrooms: 2,
      area_sqft: 1600,
      image_url: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800'
    },
    {
      id: uuidv4(),
      title: 'Urban Loft Studio',
      description: 'Chic industrial-style loft in trendy neighborhood with high ceilings.',
      price: 320000,
      location: 'Brooklyn, New York',
      bedrooms: 1,
      bathrooms: 1,
      area_sqft: 800,
      image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
    },
    {
      id: uuidv4(),
      title: 'Historic Townhouse',
      description: 'Beautifully restored 3-story townhouse with original features and modern updates.',
      price: 750000,
      location: 'Georgetown, Washington DC',
      bedrooms: 3,
      bathrooms: 2,
      area_sqft: 2200,
      image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
    }
  ];

  // Check if properties already exist
  db.get('SELECT COUNT(*) as count FROM properties', (err, row) => {
    if (err) {
      console.error('Error checking properties:', err.message);
      return;
    }
    
    if (row.count === 0) {
      const stmt = db.prepare(`
        INSERT INTO properties (id, title, description, price, location, bedrooms, bathrooms, area_sqft, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      sampleProperties.forEach(prop => {
        stmt.run(prop.id, prop.title, prop.description, prop.price, prop.location, 
                 prop.bedrooms, prop.bathrooms, prop.area_sqft, prop.image_url);
      });
      
      stmt.finalize();
      console.log('Sample properties seeded successfully.');
    }
  });
}

// User operations
const userDB = {
  create: (email, password, name, role = 'buyer') => {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const hashedPassword = bcrypt.hashSync(password, 10);
      
      db.run(
        'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
        [id, email, hashedPassword, name, role],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, email, name, role });
          }
        }
      );
    });
  },

  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, email, name, role, created_at FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  verifyPassword: (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
  }
};

// Property operations
const propertyDB = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM properties ORDER BY created_at DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM properties WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};

// Favorites operations
const favoritesDB = {
  add: (userId, propertyId) => {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      db.run(
        'INSERT INTO favorites (id, user_id, property_id) VALUES (?, ?, ?)',
        [id, userId, propertyId],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              reject(new Error('Property already in favorites'));
            } else {
              reject(err);
            }
          } else {
            resolve({ id, user_id: userId, property_id: propertyId });
          }
        }
      );
    });
  },

  remove: (userId, propertyId) => {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM favorites WHERE user_id = ? AND property_id = ?',
        [userId, propertyId],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  },

  getByUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT f.*, p.title, p.description, p.price, p.location, p.bedrooms, 
               p.bathrooms, p.area_sqft, p.image_url
        FROM favorites f
        JOIN properties p ON f.property_id = p.id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
      `, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  isFavorite: (userId, propertyId) => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM favorites WHERE user_id = ? AND property_id = ?',
        [userId, propertyId],
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });
  }
};

module.exports = { userDB, propertyDB, favoritesDB, db };
