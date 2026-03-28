import React, { useState, useEffect } from 'react';
import { propertiesAPI, favoritesAPI } from '../services/api';
import { Heart, MapPin, Bed, Bath, Maximize, Loader2 } from 'lucide-react';

const PropertyCard = ({ property, isFavorite, onToggleFavorite }) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    await onToggleFavorite(property.id, isFavorite);
    setLoading(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img
          src={property.image_url}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
            isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-600 hover:text-red-500'
          } disabled:opacity-50`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          )}
        </button>
        <div className="absolute bottom-3 left-3 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {formatPrice(property.price)}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
          {property.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {property.description}
        </p>
        
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="truncate">{property.location}</span>
        </div>
        
        <div className="flex items-center justify-between text-gray-600 text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              <span>{property.bedrooms} beds</span>
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              <span>{property.bathrooms} baths</span>
            </div>
            <div className="flex items-center">
              <Maximize className="w-4 h-4 mr-1" />
              <span>{property.area_sqft} sqft</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
