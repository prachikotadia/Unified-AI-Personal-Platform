import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Grid, 
  List, 
  Star, 
  ShoppingCart, 
  Heart,
  ChevronDown,
  Crown,
  Loader2,
  ArrowLeft,
  Filter,
  X
} from 'lucide-react';
import { marketplaceAPI, Product, Category } from '../../services/api';
import { useNotifications } from '../../contexts/NotificationContext';

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [addingToCart, setAddingToCart] = useState<Set<number>>(new Set());
  const [addingToWishlist, setAddingToWishlist] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const { addNotification } = useNotifications();

  // Filter states
  const [filters, setFilters] = useState({
    subcategory: '',
    min_price: '',
    max_price: '',
    brand: '',
    rating: '',
    in_stock: false,
    prime_eligible: false,
    free_shipping: false,
  });

  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (slug) {
      fetchCategoryData();
    }
  }, [slug]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      
      // Fetch category and products in parallel
      const [categoryData, productsData] = await Promise.all([
        marketplaceAPI.getCategoryBySlug(slug!),
        marketplaceAPI.getProducts({
          filters: { category: slug },
          sort_by: sortBy,
          sort_order: sortOrder,
          page: 1,
          limit: 50
        })
      ]);

      setCategory(categoryData);
      setProducts(productsData.products);
    } catch (error) {
      console.error('Error fetching category data:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load category data'
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Filter products based on current filters
    let filteredProducts = products;

    if (filters.subcategory) {
      filteredProducts = filteredProducts.filter(p => p.subcategory === filters.subcategory);
    }

    if (filters.min_price) {
      filteredProducts = filteredProducts.filter(p => p.price >= Number(filters.min_price));
    }

    if (filters.max_price) {
      filteredProducts = filteredProducts.filter(p => p.price <= Number(filters.max_price));
    }

    if (filters.brand) {
      filteredProducts = filteredProducts.filter(p => p.brand.toLowerCase().includes(filters.brand.toLowerCase()));
    }

    if (filters.rating) {
      filteredProducts = filteredProducts.filter(p => p.rating >= Number(filters.rating));
    }

    if (filters.in_stock) {
      filteredProducts = filteredProducts.filter(p => p.stock_quantity > 0);
    }

    if (filters.prime_eligible) {
      filteredProducts = filteredProducts.filter(p => p.prime_eligible);
    }

    if (filters.free_shipping) {
      filteredProducts = filteredProducts.filter(p => p.free_shipping);
    }

    return filteredProducts;
  };

  const clearFilters = () => {
    setFilters({
      subcategory: '',
      min_price: '',
      max_price: '',
      brand: '',
      rating: '',
      in_stock: false,
      prime_eligible: false,
      free_shipping: false,
    });
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

  const addToWishlist = async (productId: number) => {
    try {
      setAddingToWishlist(prev => new Set(prev).add(productId));
      await marketplaceAPI.addToWishlist(productId);
      addNotification({
        type: 'success',
        title: 'Added to Wishlist',
        message: 'Item added to your wishlist'
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add item to wishlist'
      });
    } finally {
      setAddingToWishlist(prev => {
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

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
        
        <div className="flex items-center justify-between">
          <button 
            onClick={() => addToCart(product.id)}
            disabled={addingToCart.has(product.id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors mr-2 flex items-center justify-center gap-2"
          >
            {addingToCart.has(product.id) ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ShoppingCart size={16} />
            )}
            {addingToCart.has(product.id) ? 'Adding...' : 'Add to Cart'}
          </button>
          <button 
            onClick={() => addToWishlist(product.id)}
            disabled={addingToWishlist.has(product.id)}
            className="p-2 text-gray-400 hover:text-red-500 disabled:text-gray-300 transition-colors"
            title="Add to wishlist"
          >
            {addingToWishlist.has(product.id) ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Heart size={18} />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
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

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Category not found
            </h3>
            <Link 
              to="/marketplace" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredProducts = applyFilters();
  const subcategories = [...new Set(products.map(p => p.subcategory))];
  const brands = [...new Set(products.map(p => p.brand))];

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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {category.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {category.description}
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter size={20} />
                Filters
                <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {Object.values(filters).some(v => v !== '' && v !== false) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <X size={16} />
                  Clear All
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="relevance">Relevance</option>
                <option value="price">Price</option>
                <option value="rating">Customer Rating</option>
                <option value="newest">Newest Arrivals</option>
              </select>
              
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
              
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subcategory
                  </label>
                  <select
                    value={filters.subcategory}
                    onChange={(e) => setFilters(prev => ({ ...prev, subcategory: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All Subcategories</option>
                    {subcategories.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Brand
                  </label>
                  <select
                    value={filters.brand}
                    onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All Brands</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.min_price}
                      onChange={(e) => setFilters(prev => ({ ...prev, min_price: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.max_price}
                      onChange={(e) => setFilters(prev => ({ ...prev, max_price: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Availability
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.in_stock}
                        onChange={(e) => setFilters(prev => ({ ...prev, in_stock: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">In Stock</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.prime_eligible}
                        onChange={(e) => setFilters(prev => ({ ...prev, prime_eligible: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Prime Eligible</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.free_shipping}
                        onChange={(e) => setFilters(prev => ({ ...prev, free_shipping: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Free Shipping</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            {filteredProducts.length} products found
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Try adjusting your filters
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
