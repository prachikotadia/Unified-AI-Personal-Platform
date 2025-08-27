import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye,
  TrendingDown,
  Package,
  Truck,
  Shield,
  ArrowRight,
  RefreshCw,
  Trash2,
  X
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  brand: string;
  category: string;
  subcategory: string;
  inStock: boolean;
  fastDelivery: boolean;
  isPrime: boolean;
  isDeal: boolean;
  dealEndsIn?: string;
  viewedAt: string;
}

interface RecentlyViewedProps {
  limit?: number;
  showTitle?: boolean;
  showClearAll?: boolean;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  onRemoveProduct?: (productId: string) => void;
  onClearAll?: () => void;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  limit = 6,
  showTitle = true,
  showClearAll = false,
  onAddToCart,
  onAddToWishlist,
  onRemoveProduct,
  onClearAll
}) => {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentlyViewed();
  }, []);

  const fetchRecentlyViewed = async () => {
    try {
      setLoading(true);
      
      // Mock data - in real app, this would come from localStorage or API
      const mockRecentlyViewed: Product[] = [
        {
          id: '1',
          name: 'Apple iPhone 15 Pro Max - 256GB - Natural Titanium',
          price: 1199.99,
          originalPrice: 1299.99,
          rating: 4.8,
          reviewCount: 1247,
          image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
          brand: 'Apple',
          category: 'electronics',
          subcategory: 'smartphones',
          inStock: true,
          fastDelivery: true,
          isPrime: true,
          isDeal: true,
          dealEndsIn: '2 days',
          viewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          id: '2',
          name: 'Sony WH-1000XM4 Wireless Noise-Canceling Headphones',
          price: 349.99,
          originalPrice: 399.99,
          rating: 4.8,
          reviewCount: 1892,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
          brand: 'Sony',
          category: 'electronics',
          subcategory: 'headphones',
          inStock: true,
          fastDelivery: true,
          isPrime: true,
          viewedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
        },
        {
          id: '3',
          name: 'Samsung 65" QLED 4K Smart TV',
          price: 1299.99,
          originalPrice: 1799.99,
          rating: 4.6,
          reviewCount: 892,
          image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
          brand: 'Samsung',
          category: 'electronics',
          subcategory: 'tvs',
          inStock: true,
          fastDelivery: true,
          isPrime: true,
          viewedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
        },
        {
          id: '4',
          name: 'Apple MacBook Pro 14" - M3 Pro Chip',
          price: 1999.99,
          originalPrice: 2199.99,
          rating: 4.9,
          reviewCount: 567,
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
          brand: 'Apple',
          category: 'electronics',
          subcategory: 'laptops',
          inStock: true,
          fastDelivery: true,
          isPrime: true,
          viewedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() // 8 hours ago
        },
        {
          id: '5',
          name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
          price: 89.99,
          originalPrice: 119.99,
          rating: 4.7,
          reviewCount: 3421,
          image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
          brand: 'Instant Pot',
          category: 'home',
          subcategory: 'kitchen',
          inStock: true,
          fastDelivery: true,
          isPrime: true,
          viewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
        },
        {
          id: '6',
          name: 'Nike Air Max 270 Running Shoes',
          price: 129.99,
          originalPrice: 150.00,
          rating: 4.5,
          reviewCount: 2156,
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
          brand: 'Nike',
          category: 'fashion',
          subcategory: 'shoes',
          inStock: true,
          fastDelivery: true,
          isPrime: true,
          viewedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 500));
      setRecentlyViewed(mockRecentlyViewed);
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (productId: string) => {
    if (onAddToCart) {
      onAddToCart(productId);
    }
  };

  const handleAddToWishlist = (productId: string) => {
    if (onAddToWishlist) {
      onAddToWishlist(productId);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    if (onRemoveProduct) {
      onRemoveProduct(productId);
    } else {
      setRecentlyViewed(prev => prev.filter(p => p.id !== productId));
    }
  };

  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll();
    } else {
      setRecentlyViewed([]);
    }
  };

  const getTimeAgo = (viewedAt: string) => {
    const now = new Date();
    const viewed = new Date(viewedAt);
    const diffInHours = Math.floor((now.getTime() - viewed.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const displayProducts = recentlyViewed.slice(0, limit);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 rounded-lg h-32 mb-2"></div>
                <div className="bg-gray-300 rounded h-4 mb-1"></div>
                <div className="bg-gray-300 rounded h-3 w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-blue-600">
              <Clock className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-gray-900">Recently Viewed</h3>
            </div>
            <span className="text-sm text-gray-500">({recentlyViewed.length} items)</span>
          </div>
          <div className="flex items-center space-x-2">
            {showClearAll && recentlyViewed.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}
            <Link
              to="/marketplace/recently-viewed"
              className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {displayProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative"
          >
            <Link to={`/marketplace/product/${product.id}`} className="block">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                />
                
                {/* Viewed Time */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-full">
                  {getTimeAgo(product.viewedAt)}
                </div>

                {/* Deal Badge */}
                {product.isDeal && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    Deal
                  </div>
                )}

                {/* Prime Badge */}
                {product.isPrime && (
                  <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    Prime
                  </div>
                )}

                {/* Quick Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    {onAddToWishlist && (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToWishlist(product.id);
                        }}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                    {onAddToCart && (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product.id);
                        }}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                    <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h4>
                
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">({product.reviewCount})</span>
                </div>

                <div className="flex items-center space-x-2 mt-2">
                  <span className="font-bold text-gray-900">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                  )}
                </div>

                {/* Deal Timer */}
                {product.isDeal && product.dealEndsIn && (
                  <div className="flex items-center text-xs text-red-600 mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>Ends in {product.dealEndsIn}</span>
                  </div>
                )}
              </div>
            </Link>

            {/* Remove Button */}
            {onRemoveProduct && (
              <button
                onClick={() => handleRemoveProduct(product.id)}
                className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;
