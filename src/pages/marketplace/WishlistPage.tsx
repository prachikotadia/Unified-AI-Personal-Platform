import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Star, 
  Crown,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { marketplaceAPI, Product } from '../../services/api';
import { useNotifications } from '../../contexts/NotificationContext';

const WishlistPage: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState<Set<number>>(new Set());
  const [addingToCart, setAddingToCart] = useState<Set<number>>(new Set());
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const items = await marketplaceAPI.getWishlist();
      setWishlistItems(items);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load wishlist items'
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    try {
      setRemovingItems(prev => new Set(prev).add(productId));
      await marketplaceAPI.removeFromWishlist(productId);
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
      addNotification({
        type: 'success',
        title: 'Removed',
        message: 'Item removed from wishlist'
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove item from wishlist'
      });
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const addToCart = async (productId: number) => {
    try {
      setAddingToCart(prev => new Set(prev).add(productId));
      await marketplaceAPI.addToCart(productId, 1);
      addNotification({
        type: 'success',
        title: 'Added to Cart',
        message: 'Item added to your cart'
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add item to cart'
      });
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={`${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              to="/marketplace" 
              className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Wishlist
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Save items for later purchase
              </p>
            </div>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <Heart size={64} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start shopping to add items to your wishlist
            </p>
            <Link 
              to="/marketplace" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden group"
              >
                <Link to={`/marketplace/product/${product.id}`}>
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.discount_percentage && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{product.discount_percentage}%
                      </div>
                    )}
                    {product.prime_eligible && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                        <Crown size={12} />
                        Prime
                      </div>
                    )}
                    {product.free_shipping && (
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Free Shipping
                      </div>
                    )}
                  </div>
                </Link>
                
                <div className="p-4">
                  <Link to={`/marketplace/product/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(product.rating)}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({product.review_count})
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.original_price && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.original_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => addToCart(product.id)}
                      disabled={addingToCart.has(product.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                      {addingToCart.has(product.id) ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <ShoppingCart size={16} />
                      )}
                      {addingToCart.has(product.id) ? 'Adding...' : 'Add to Cart'}
                    </button>
                    <button 
                      onClick={() => removeFromWishlist(product.id)}
                      disabled={removingItems.has(product.id)}
                      className="p-2 text-gray-400 hover:text-red-500 disabled:text-gray-300 transition-colors"
                      title="Remove from wishlist"
                    >
                      {removingItems.has(product.id) ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
