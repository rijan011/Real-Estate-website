const express = require('express');
const jwt = require('jsonwebtoken');
const { userDB } = require('../database');
const { validate, registerSchema, loginSchema, JWT_SECRET } = require('../middleware');

const router = express.Router();

// Register
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Check if user already exists
    const existingUser = await userDB.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }
    
    // Create new user
    const user = await userDB.create(email, password, name, role);
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await userDB.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Verify password
    const isValidPassword = userDB.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

module.exports = router;
