const express = require('express');
const { favoritesDB, propertyDB } = require('../database');
const { authMiddleware, validate, favoriteSchema } = require('../middleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get user's favorites
router.get('/', async (req, res) => {
  try {
    const favorites = await favoritesDB.getByUser(req.user.id);
    res.json({
      success: true,
      favorites: favorites.map(f => ({
        id: f.id,
        property: {
          id: f.property_id,
          title: f.title,
          description: f.description,
          price: f.price,
          location: f.location,
          bedrooms: f.bedrooms,
          bathrooms: f.bathrooms,
          area_sqft: f.area_sqft,
          image_url: f.image_url
        },
        created_at: f.created_at
      }))
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add to favorites
router.post('/', validate(favoriteSchema), async (req, res) => {
  try {
    const { propertyId } = req.body;
    
    // Check if property exists
    const property = await propertyDB.getById(propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Add to favorites
    const favorite = await favoritesDB.add(req.user.id, propertyId);
    
    res.status(201).json({
      message: 'Added to favorites successfully',
      favorite: {
        id: favorite.id,
        property_id: favorite.property_id
      }
    });
  } catch (error) {
    if (error.message === 'Property already in favorites') {
      return res.status(409).json({ error: 'Property is already in your favorites' });
    }
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// Remove from favorites
router.delete('/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const result = await favoritesDB.remove(req.user.id, propertyId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }
    
    res.json({
      message: 'Removed from favorites successfully'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

// Check if property is in favorites
router.get('/check/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const isFavorite = await favoritesDB.isFavorite(req.user.id, propertyId);
    res.json({ isFavorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
});

module.exports = router;
