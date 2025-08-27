import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Clock, 
  ArrowLeft, 
  Trash2, 
  Search, 
  Filter, 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye,
  TrendingDown,
  Package,
  Truck,
  Shield,
  RefreshCw,
  Calendar,
  BarChart3,
  X
} from 'lucide-react';
import RecentlyViewed from '../../components/marketplace/RecentlyViewed';

interface RecentlyViewedProduct {
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

const RecentlyViewedPage: React.FC = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'price-high' | 'price-low'>('recent');

  useEffect(() => {
    fetchRecentlyViewed();
  }, []);

  const fetchRecentlyViewed = async () => {
    try {
      setLoading(true);
      
      // Mock data
      const mockRecentlyViewed: RecentlyViewedProduct[] = [
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
          viewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
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
          viewedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
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
          viewedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
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
          viewedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
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
          viewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
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
          viewedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '7',
          name: 'Sony PlayStation 5 Console',
          price: 499.99,
          originalPrice: 599.99,
          rating: 4.7,
          reviewCount: 1893,
          image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop',
          brand: 'Sony',
          category: 'electronics',
          subcategory: 'gaming',
          inStock: true,
          fastDelivery: true,
          isPrime: true,
          viewedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '8',
          name: 'Dyson V15 Detect Absolute Cordless Vacuum',
          price: 699.99,
          originalPrice: 799.99,
          rating: 4.8,
          reviewCount: 1247,
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
          brand: 'Dyson',
          category: 'home',
          subcategory: 'cleaning',
          inStock: true,
          fastDelivery: true,
          isPrime: true,
          viewedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 1000));
      setRecentlyViewed(mockRecentlyViewed);
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setRecentlyViewed(prev => prev.filter(p => p.id !== productId));
  };

  const handleClearAll = () => {
    setRecentlyViewed([]);
  };

  const handleAddToCart = (productId: string) => {
    // Mock add to cart functionality
    console.log('Added to cart:', productId);
  };

  const handleAddToWishlist = (productId: string) => {
    // Mock add to wishlist functionality
    console.log('Added to wishlist:', productId);
  };

  const getFilteredAndSortedProducts = () => {
    let filtered = recentlyViewed;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.viewedAt).getTime() - new Date(b.viewedAt).getTime());
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
    }

    return filtered;
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

  const getCategoryStats = () => {
    const stats = recentlyViewed.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  const filteredProducts = getFilteredAndSortedProducts();
  const categoryStats = getCategoryStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/marketplace" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft size={20} className="mr-2" />
                Back to Marketplace
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-blue-600">
                <Clock className="w-6 h-6" />
                <h1 className="text-2xl font-bold text-gray-900">Recently Viewed</h1>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3" />
                <span>{recentlyViewed.length} Items</span>
              </div>
            </div>
            <button
              onClick={handleClearAll}
              disabled={recentlyViewed.length === 0}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Stats */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Viewing History</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{recentlyViewed.length}</div>
                  <div className="text-sm text-gray-600">Total Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {recentlyViewed.filter(p => p.isDeal).length}
                  </div>
                  <div className="text-sm text-gray-600">Deals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.keys(categoryStats).length}
                  </div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(recentlyViewed.reduce((sum, p) => sum + p.rating, 0) / recentlyViewed.length * 10) / 10}
                  </div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-3">
                {Object.entries(categoryStats).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">{category}</span>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search recently viewed products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="home">Home & Garden</option>
              <option value="fashion">Fashion</option>
              <option value="sports">Sports & Outdoors</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
            </select>

            <button
              onClick={fetchRecentlyViewed}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Products List */}
        <div className="space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery || selectedCategory ? 'No products found' : 'No recently viewed products'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedCategory 
                  ? 'Try adjusting your search or filters'
                  : 'Start browsing products to build your viewing history'
                }
              </p>
              {!searchQuery && !selectedCategory && (
                <Link
                  to="/marketplace"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Browse Products</span>
                </Link>
              )}
            </div>
          ) : (
            filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-start space-x-4">
                  {/* Product Image */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.brand}</p>
                        
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">({product.reviewCount})</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900">${product.price}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-2">
                          {product.isPrime && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              Prime
                            </span>
                          )}
                          {product.isDeal && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                              Deal
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            Viewed {getTimeAgo(product.viewedAt)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAddToWishlist(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAddToCart(product.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/marketplace/product/${product.id}`}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleRemoveProduct(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentlyViewedPage;
