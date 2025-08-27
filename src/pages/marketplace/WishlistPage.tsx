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
import { useWishlistStore } from '../../store/wishlist';
import { useCartStore } from '../../store/cart';
import { useToastHelpers } from '../../components/ui/Toast';

const WishlistPage: React.FC = () => {
  const { success, error: showError } = useToastHelpers();
  
  // Store hooks
  const { 
    items: wishlistItems, 
    fetchWishlist, 
    removeFromWishlist, 
    moveToCart,
    isLoading: wishlistLoading,
    error: wishlistError
  } = useWishlistStore();
  
  const { 
    isLoading: cartLoading 
  } = useCartStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await removeFromWishlist(productId);
      success('Removed', 'Item removed from wishlist');
    } catch (err) {
      showError('Remove Failed', 'Failed to remove item from wishlist');
    }
  };

  const handleMoveToCart = async (productId: number) => {
    try {
      await moveToCart(productId, 1);
      success('Moved to Cart', 'Item moved to your cart');
    } catch (err) {
      showError('Move Failed', 'Failed to move item to cart');
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

  if (wishlistLoading) {
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
                <Link to={`/marketplace/product/${product.product.id}`}>
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.product.image}
                      alt={product.product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.product.originalPrice && product.product.originalPrice > product.product.price && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{Math.round(((product.product.originalPrice - product.product.price) / product.product.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>
                </Link>
                
                <div className="p-4">
                  <Link to={`/marketplace/product/${product.product.id}`}>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {product.product.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(product.product.rating)}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({product.product.reviewCount})
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${product.product.price.toFixed(2)}
                    </span>
                    {product.product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                                        <button 
                      onClick={() => handleMoveToCart(product.productId)}
                      disabled={cartLoading || wishlistLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                      {cartLoading || wishlistLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <ShoppingCart size={16} />
                      )}
                      {cartLoading || wishlistLoading ? 'Adding...' : 'Add to Cart'}
                    </button>
                    <button 
                      onClick={() => handleRemoveFromWishlist(product.productId)}
                      disabled={wishlistLoading}
                      className="p-2 text-gray-400 hover:text-red-500 disabled:text-gray-300 transition-colors"
                      title="Remove from wishlist"
                    >
                      {wishlistLoading ? (
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
