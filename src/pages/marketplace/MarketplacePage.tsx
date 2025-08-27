import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  ShoppingCart, 
  Heart,
  ChevronDown,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Zap,
  Crown,
  AlertCircle,
  Loader2,
  Brain
} from 'lucide-react';
import { motion } from 'framer-motion';
import { marketplaceAPI, Product as APIProduct, Category as APICategory, SearchRequest } from '../../services/api';
import { useNotifications } from '../../contexts/NotificationContext';
import AIRecommendations from '../../components/marketplace/AIRecommendations';
import PersonalizedDashboard from '../../components/marketplace/PersonalizedDashboard';
import RecentlyViewed from '../../components/marketplace/RecentlyViewed';

// Use API types directly
type Product = APIProduct;
type Category = APICategory;

const MarketplacePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Product[]>([]);

  // Mock data for development (will be replaced with API calls)
  const mockProducts: Product[] = [
    {
      id: 1,
      name: "iPhone 15 Pro Max",
      description: "The most advanced iPhone ever with A17 Pro chip, titanium design, and pro camera system.",
      price: 1199.99,
      original_price: 1299.99,
      discount_percentage: 7.7,
      category: "electronics",
      subcategory: "smartphones",
      brand: "Apple",
      sku: "IPH15PM-256",
      stock_quantity: 50,
      images: [
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500",
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500"
      ],
      specifications: {
        storage: "256GB",
        color: "Natural Titanium",
        screen: "6.7 inch Super Retina XDR",
        camera: "48MP Main + 12MP Ultra Wide + 12MP Telephoto"
      },
      features: [
        "A17 Pro chip",
        "Titanium design",
        "Pro camera system",
        "Action button",
        "USB-C connector"
      ],
      tags: ["iphone", "smartphone", "apple", "5g", "camera"],
      rating: 4.8,
      review_count: 1250,
      featured: true,
      trending: true,
      prime_eligible: true,
      free_shipping: true,
      status: "active",
      created_at: "2024-01-15T10:00:00Z"
    },
    {
      id: 2,
      name: "MacBook Air M2",
      description: "Supercharged by M2, MacBook Air combines incredible performance and up to 18 hours of battery life.",
      price: 1099.99,
      original_price: 1199.99,
      discount_percentage: 8.3,
      category: "electronics",
      subcategory: "laptops",
      brand: "Apple",
      sku: "MBA-M2-256",
      stock_quantity: 30,
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"
      ],
      specifications: {
        processor: "M2 chip",
        memory: "8GB unified memory",
        storage: "256GB SSD",
        display: "13.6 inch Liquid Retina"
      },
      features: [
        "M2 chip",
        "18-hour battery life",
        "Liquid Retina display",
        "MagSafe charging",
        "Touch ID"
      ],
      tags: ["macbook", "laptop", "apple", "m2", "ultrabook"],
      rating: 4.9,
      review_count: 890,
      featured: true,
      trending: true,
      prime_eligible: true,
      free_shipping: true,
      status: "active",
      created_at: "2024-01-10T10:00:00Z"
    },
    {
      id: 3,
      name: "Sony WH-1000XM5 Wireless Headphones",
      description: "Industry-leading noise canceling with Dual Noise Sensor technology and 30-hour battery life.",
      price: 349.99,
      original_price: 399.99,
      discount_percentage: 12.5,
      category: "electronics",
      subcategory: "headphones",
      brand: "Sony",
      sku: "SONY-WH1000XM5",
      stock_quantity: 75,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
      ],
      specifications: {
        driver: "30mm",
        frequency: "4Hz-40,000Hz",
        battery: "30 hours",
        weight: "250g"
      },
      features: [
        "Industry-leading noise canceling",
        "Dual Noise Sensor technology",
        "30-hour battery life",
        "Quick Charge (3 min = 3 hours)",
        "Touch controls"
      ],
      tags: ["headphones", "wireless", "noise-canceling", "sony", "bluetooth"],
      rating: 4.7,
      review_count: 2100,
      featured: false,
      trending: true,
      prime_eligible: true,
      free_shipping: true,
      status: "active",
      created_at: "2024-01-05T10:00:00Z"
    },
    {
      id: 4,
      name: "Nike Air Max 270",
      description: "The Nike Air Max 270 delivers unrivaled, all-day comfort with the Air unit that's the tallest ever.",
      price: 129.99,
      original_price: 150.00,
      discount_percentage: 13.3,
      category: "fashion",
      subcategory: "shoes",
      brand: "Nike",
      sku: "NIKE-AM270-BLK",
      stock_quantity: 120,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"
      ],
      specifications: {
        material: "Mesh and synthetic",
        sole: "Rubber",
        closure: "Lace-up",
        weight: "340g"
      },
      features: [
        "Tallest Air unit ever",
        "Breathable mesh upper",
        "Foam midsole",
        "Rubber outsole",
        "All-day comfort"
      ],
      tags: ["nike", "shoes", "sneakers", "air-max", "running"],
      rating: 4.6,
      review_count: 3400,
      featured: false,
      trending: true,
      prime_eligible: true,
      free_shipping: true,
      status: "active",
      created_at: "2024-01-12T10:00:00Z"
    },
    {
      id: 5,
      name: "Instant Pot Duo 7-in-1",
      description: "7-in-1 electric pressure cooker that slow cooks, pressure cooks, rice cooks, steams, sautés, and keeps warm.",
      price: 89.99,
      original_price: 119.99,
      discount_percentage: 25.0,
      category: "home",
      subcategory: "kitchen",
      brand: "Instant Pot",
      sku: "INSTANT-DUO-6QT",
      stock_quantity: 200,
      images: [
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500"
      ],
      specifications: {
        capacity: "6 quarts",
        power: "1000W",
        material: "Stainless steel",
        dimensions: "13.4 x 12.2 x 12.5 inches"
      },
      features: [
        "7-in-1 functionality",
        "Pressure cooking",
        "Slow cooking",
        "Rice cooking",
        "Steaming",
        "Sautéing",
        "Keep warm"
      ],
      tags: ["instant-pot", "pressure-cooker", "kitchen", "cooking", "appliance"],
      rating: 4.8,
      review_count: 15600,
      featured: true,
      trending: false,
      prime_eligible: true,
      free_shipping: true,
      status: "active",
      created_at: "2024-01-08T10:00:00Z"
    }
  ];

  const mockCategories: Category[] = [
    {
      id: 1,
      name: "Electronics",
      slug: "electronics",
      description: "Latest gadgets and electronic devices",
      icon: "smartphone",
      color: "#3B82F6",
      sort_order: 1,
      is_active: true,
      created_at: "2024-01-01T10:00:00Z"
    },
    {
      id: 2,
      name: "Fashion",
      slug: "fashion",
      description: "Trendy clothing and accessories",
      icon: "shirt",
      color: "#EC4899",
      sort_order: 2,
      is_active: true,
      created_at: "2024-01-01T10:00:00Z"
    },
    {
      id: 3,
      name: "Home & Garden",
      slug: "home-garden",
      description: "Home improvement and garden supplies",
      icon: "home",
      color: "#10B981",
      sort_order: 3,
      is_active: true,
      created_at: "2024-01-01T10:00:00Z"
    },
    {
      id: 4,
      name: "Sports & Outdoors",
      slug: "sports-outdoors",
      description: "Sports equipment and outdoor gear",
      icon: "dumbbell",
      color: "#F59E0B",
      sort_order: 4,
      is_active: true,
      created_at: "2024-01-01T10:00:00Z"
    },
    {
      id: 5,
      name: "Books",
      slug: "books",
      description: "Books for all ages and interests",
      icon: "book-open",
      color: "#8B5CF6",
      sort_order: 5,
      is_active: true,
      created_at: "2024-01-01T10:00:00Z"
    },
    {
      id: 6,
      name: "Beauty & Personal Care",
      slug: "beauty-personal-care",
      description: "Beauty products and personal care items",
      icon: "sparkles",
      color: "#EF4444",
      sort_order: 6,
      is_active: true,
      created_at: "2024-01-01T10:00:00Z"
    }
  ];

  const { addNotification } = useNotifications();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [productsData, categoriesData, featuredData, trendingData, dealsData] = await Promise.all([
          marketplaceAPI.getProducts(),
          marketplaceAPI.getCategories(),
          marketplaceAPI.getFeaturedProducts(),
          marketplaceAPI.getTrendingProducts(),
          marketplaceAPI.getDeals()
        ]);

        setProducts(productsData.products);
        setCategories(categoriesData);
        setFeaturedProducts(featuredData);
        setTrendingProducts(trendingData);
        setDeals(dealsData);
      } catch (error) {
        console.error('Error fetching marketplace data:', error);
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load marketplace data. Using mock data instead.'
        });
        
        // Fallback to mock data
        setProducts(mockProducts);
        setCategories(mockCategories);
        setFeaturedProducts(mockProducts.filter(p => p.featured));
        setTrendingProducts(mockProducts.filter(p => p.trending));
        setDeals(mockProducts.filter(p => p.discount_percentage && p.discount_percentage > 0));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [addNotification]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSubcategory = !selectedSubcategory || product.subcategory === selectedSubcategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesSubcategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
                 return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

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
      transition={{ duration: 0.3 }}
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
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors mr-2">
            Add to Cart
          </button>
          <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <Heart size={18} />
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                OmniLife Marketplace
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Discover amazing products with AI-powered recommendations
              </p>
            </div>
            <Link
              to="/marketplace/recommendations"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Brain className="w-5 h-5" />
              <span>AI Recommendations</span>
            </Link>
          </div>
        </div>

        {/* Personalized Dashboard */}
        <PersonalizedDashboard />

        {/* Recently Viewed */}
        <RecentlyViewed limit={6} />

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                             <form onSubmit={(e) => {
                 e.preventDefault();
                 if (searchQuery.trim()) {
                   window.location.href = `/marketplace/search?q=${encodeURIComponent(searchQuery.trim())}`;
                 }
               }}>
                 <input
                   type="text"
                   placeholder="Search products..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                 />
               </form>
            </div>
            
            {/* Category Filter */}
                         <select
               value={selectedCategory}
               onChange={(e) => {
                 if (e.target.value) {
                   window.location.href = `/marketplace/category/${e.target.value}`;
                 }
               }}
               className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
             >
               <option value="">All Categories</option>
               {categories.map(category => (
                 <option key={category.id} value={category.slug}>
                   {category.name}
                 </option>
               ))}
             </select>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="newest">Newest Arrivals</option>
            </select>
            
            {/* View Mode */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-3 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-3 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Sections */}
        {featuredProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-yellow-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Products</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {deals.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-orange-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Deals</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {deals.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {trendingProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-green-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trending Now</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* All Products */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              All Products ({sortedProducts.length})
            </h2>
          </div>
          
          {sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <Search size={64} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No products found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {sortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
