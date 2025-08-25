import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Grid, List, Star, ShoppingCart, Heart, 
  Eye, TrendingUp, Sparkles, Package, Truck, Shield, 
  CreditCard, Zap, ChevronDown, X, Sliders, SortAsc,
  SortDesc, Filter as FilterIcon, RefreshCw, Loader2
} from 'lucide-react';
import { marketplaceAPI, Product as APIProduct, Category as APICategory } from '../../services/api';
import { useTheme } from '../../store/theme';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  images: string[];
  rating: number;
  review_count: number;
  stock_quantity: number;
  brand: string;
  category: string;
  is_featured: boolean;
  is_deal: boolean;
  is_trending: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

const MarketplacePage: React.FC = () => {
  const { theme } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [showFilters, setShowFilters] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, featuredData, dealsData, trendingData] = await Promise.all([
        marketplaceAPI.getProducts(),
        marketplaceAPI.getCategories(),
        marketplaceAPI.getFeaturedProducts(),
        marketplaceAPI.getDealProducts(),
        marketplaceAPI.getTrendingProducts()
      ]);

      setProducts(productsData.products || []);
      setCategories(categoriesData || []);
      setFeaturedProducts(featuredData || []);
      setDealProducts(dealsData || []);
      setTrendingProducts(trendingData || []);
    } catch (error) {
      console.error('Error loading marketplace data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.brand.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || product.category === selectedCategory.toString();
      
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, priceRange, sortBy, sortOrder]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategorySelect = useCallback((categoryId: number | null) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleAddToCart = useCallback(async (productId: number) => {
    try {
      await marketplaceAPI.addToCart({
        user_id: 'user_123', // Mock user ID
        product_id: productId,
        quantity: 1
      });
      setCartCount(prev => prev + 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }, []);

  const handleAddToWishlist = useCallback(async (productId: number) => {
    try {
      await marketplaceAPI.addToWishlist({
        user_id: 'user_123', // Mock user ID
        product_id: productId
      });
      setWishlistCount(prev => prev + 1);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  }, []);

  const handleViewProduct = useCallback(async (productId: number) => {
    try {
      await marketplaceAPI.addRecentlyViewed({
        user_id: 'user_123',
        product_id: productId
      });
    } catch (error) {
      console.error('Error recording view:', error);
    }
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <motion.div
      variants={itemVariants}
      className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
        theme === 'dark' ? 'border border-gray-700' : 'border border-gray-200'
      }`}
      whileHover={{ y: -4 }}
      onClick={() => handleViewProduct(product.id)}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.images[0] || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_featured && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Sparkles size={12} />
              Featured
            </span>
          )}
          {product.is_deal && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {product.discount_percentage}% OFF
            </span>
          )}
          {product.is_trending && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp size={12} />
              Trending
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="absolute top-2 right-2">
          {product.stock_quantity === 0 ? (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              Out of Stock
            </span>
          ) : product.stock_quantity <= 5 ? (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
              Low Stock
            </span>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToWishlist(product.id);
            }}
            className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Add to wishlist"
          >
            <Heart size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(product.id);
            }}
            className="bg-blue-500 p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
            aria-label="Add to cart"
          >
            <ShoppingCart size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">{product.brand}</span>
          <div className="flex items-center gap-1">
            <Star size={14} className="text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {product.rating} ({product.review_count})
            </span>
          </div>
        </div>

        <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            ${product.price.toFixed(2)}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-sm text-gray-500 line-through">
              ${product.original_price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Package size={12} />
            <span>Free Shipping</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield size={12} />
            <span>Warranty</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-gray-600 dark:text-gray-300">Loading marketplace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className={`sticky top-0 z-50 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Marketplace
            </h1>
            
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className={`pl-10 pr-4 py-2 w-80 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-gray-600 text-blue-500' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-gray-600 text-blue-500' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                  aria-label="List view"
                >
                  <List size={16} />
                </button>
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                } transition-colors`}
                aria-label="Toggle filters"
              >
                <Filter size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="mt-4 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className={`pl-10 pr-4 py-2 w-full rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                className={`lg:w-64 lg:block ${showFilters ? 'block' : 'hidden'}`}
              >
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Categories */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Categories</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleCategorySelect(null)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          selectedCategory === null
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        All Categories
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategorySelect(category.id)}
                          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-blue-500 text-white'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Price Range</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                          className={`w-full px-3 py-2 rounded-md border ${
                            theme === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                          className={`w-full px-3 py-2 rounded-md border ${
                            theme === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Sort By</h4>
                    <div className="space-y-2">
                      {[
                        { value: 'created_at', label: 'Newest' },
                        { value: 'price', label: 'Price' },
                        { value: 'rating', label: 'Rating' },
                        { value: 'name', label: 'Name' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSortBy(option.value)}
                          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                            sortBy === option.value
                              ? 'bg-blue-500 text-white'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort Order */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Order</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSortOrder('asc')}
                        className={`flex-1 px-3 py-2 rounded-md transition-colors ${
                          sortOrder === 'asc'
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <SortAsc size={16} className="inline mr-1" />
                        Asc
                      </button>
                      <button
                        onClick={() => setSortOrder('desc')}
                        className={`flex-1 px-3 py-2 rounded-md transition-colors ${
                          sortOrder === 'desc'
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <SortDesc size={16} className="inline mr-1" />
                        Desc
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            {/* Featured Sections */}
            {featuredProducts.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="text-blue-500" size={20} />
                    Featured Products
                  </h2>
                </div>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {featuredProducts.slice(0, 4).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>
              </section>
            )}

            {dealProducts.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Zap className="text-orange-500" size={20} />
                    Deals & Discounts
                  </h2>
                </div>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {dealProducts.slice(0, 4).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>
              </section>
            )}

            {trendingProducts.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="text-green-500" size={20} />
                    Trending Now
                  </h2>
                </div>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {trendingProducts.slice(0, 4).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>
              </section>
            )}

            {/* All Products */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  All Products ({filteredAndSortedProducts.length})
                </h2>
                <button
                  onClick={loadInitialData}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              {filteredAndSortedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className={`grid gap-4 ${
                    viewMode === 'grid'
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                      : 'grid-cols-1'
                  }`}
                >
                  {filteredAndSortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
