const jwt = require('jsonwebtoken');
const { z } = require('zod');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['buyer', 'agent']).optional().default('buyer')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const favoriteSchema = z.object({
  propertyId: z.string().uuid('Invalid property ID')
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return res.status(400).json({ error: 'Validation failed', details: errors });
      }
      next(error);
    }
  };
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.message && err.message.includes('UNIQUE constraint failed')) {
    return res.status(409).json({ error: 'Resource already exists' });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = {
  authMiddleware,
  validate,
  registerSchema,
  loginSchema,
  favoriteSchema,
  errorHandler,
  JWT_SECRET
};
