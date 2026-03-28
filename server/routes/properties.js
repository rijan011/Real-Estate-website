const express = require('express');
const { propertyDB } = require('../database');
const { authMiddleware } = require('../middleware');

const router = express.Router();

// Get all properties (public route)
router.get('/', async (req, res) => {
  try {
    const properties = await propertyDB.getAll();
    res.json({
      success: true,
      properties
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Get single property (public route)
router.get('/:id', async (req, res) => {
  try {
    const property = await propertyDB.getById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json({
      success: true,
      property
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

module.exports = router;
