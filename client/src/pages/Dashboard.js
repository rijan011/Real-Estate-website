import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertiesAPI, favoritesAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import PropertyCard from '../components/PropertyCard';
import { Heart, Home, LogOut, User, Loader2, Search, Moon, Sun } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [propsRes, favsRes] = await Promise.all([
        propertiesAPI.getAll(),
        favoritesAPI.getAll()
      ]);
      
      setProperties(propsRes.data.properties || []);
      const favs = favsRes.data.favorites || [];
      setFavorites(favs);
      setFavoriteIds(new Set(favs.map(f => f.property.id)));
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (propertyId, isCurrentlyFavorite) => {
    try {
      setMessage('');
      
      if (isCurrentlyFavorite) {
        await favoritesAPI.remove(propertyId);
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });
        setFavorites(prev => prev.filter(f => f.property.id !== propertyId));
        setMessage('Removed from favorites');
      } else {
        await favoritesAPI.add(propertyId);
        setFavoriteIds(prev => new Set(prev).add(propertyId));
        const favsRes = await favoritesAPI.getAll();
        setFavorites(favsRes.data.favorites || []);
        setMessage('Added to favorites');
      }
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      const errorMsg = err.response?.data?.error || 'Failed to update favorites';
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const filteredProperties = activeTab === 'favorites' 
    ? favorites.map(f => f.property)
    : properties;

  const displayedProperties = filteredProperties.filter(property => {
    const normalizedSearch = searchQuery
      .replace(/rijan\s*bhattarai!/gi, 'Rijan Bhattarai')
      .replace(/rijan\s*bhattarai/gi, 'Rijan Bhattarai');
    
    return normalizedSearch === '' ||
      property.title.toLowerCase().includes(normalizedSearch.toLowerCase()) ||
      property.description.toLowerCase().includes(normalizedSearch.toLowerCase()) ||
      property.location.toLowerCase().includes(normalizedSearch.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Home className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Real Estate Portal</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <User className="w-5 h-5 mr-2" />
                <span className="font-medium">{user?.name}</span>
                <span className="ml-2 px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-full capitalize">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border-l-4 border-indigo-500">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name
              ?.replace(/!+/g, '')
              ?.split(' ')
              ?.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              ?.join(' ') || 'User'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
            created by Rijan Bhattarai
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <Home className="w-10 h-10 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{properties.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <Heart className="w-10 h-10 text-red-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">My Favorites</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{favorites.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <User className="w-10 h-10 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Account Type</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm w-fit">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              All Properties
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-6 py-2 rounded-md font-medium transition-all flex items-center ${
                activeTab === 'favorites'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Heart className="w-4 h-4 mr-2" />
              My Favorites ({favorites.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full sm:w-64"
            />
          </div>
        </div>

        {/* Properties Grid */}
        {searchQuery && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Showing {displayedProperties.length} result{displayedProperties.length !== 1 ? 's' : ''} for "{searchQuery}"
          </p>
        )}
        {displayedProperties.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {activeTab === 'favorites' ? 'No favorites yet' : 'No properties available'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'favorites'
                ? 'Start browsing and add properties to your favorites!'
                : 'Check back later for new listings.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorite={favoriteIds.has(property.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
