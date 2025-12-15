import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isBackendAvailable } from '../../config/api';
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
  Brain,
  Bell,
  Eye,
  GitCompare,
  Bookmark,
  Package,
  X,
  Share2,
  Save,
  RefreshCw,
  CheckSquare,
  Square,
  Wifi,
  WifiOff
} from 'lucide-react';
import { motion } from 'framer-motion';
import { marketplaceAPI, Product as APIProduct, Category as APICategory, SearchRequest } from '../../services/api';
import { useNotifications } from '../../contexts/NotificationContext';
import { useCartStore } from '../../store/cart';
import { useWishlistStore } from '../../store/wishlist';
import { useMarketplaceStore } from '../../store/marketplace';
import { mockMarketplaceAPI } from '../../services/mockMarketplaceAPI';
import AIRecommendations from '../../components/marketplace/AIRecommendations';
import PersonalizedDashboard from '../../components/marketplace/PersonalizedDashboard';
import RecentlyViewed from '../../components/marketplace/RecentlyViewed';
import ProductQuickViewModal from '../../components/marketplace/ProductQuickViewModal';
import AIProductFinderModal from '../../components/marketplace/AIProductFinderModal';

// Use API types directly
type Product = APIProduct;
type Category = APICategory;

const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart, getCartItemCount, isInCart } = useCartStore();
  const { addNotification } = useNotifications();
  
  // Use marketplace store for persistent state
  const {
    compareList,
    recentlyViewed,
    savedSearches,
    addToCompare,
    removeFromCompare,
    addToRecentlyViewed,
    saveSearch,
    removeSavedSearch
  } = useMarketplaceStore();
  
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
  
  // Modal states
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAIFinder, setShowAIFinder] = useState(false);
  const [displayedProducts, setDisplayedProducts] = useState(20);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  
  // Use wishlist from store
  const { items: wishlistItems, isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();

  // Mock data for development (will be replaced with API calls)
  const mockProducts: any[] = [
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

  const mockCategories: any[] = [
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

  // Track product views for recently viewed
  useEffect(() => {
    // When a product is viewed, add to recently viewed
    // This will be triggered when navigating to product pages
  }, []);

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
        setFeaturedProducts(mockProducts.filter(p => p.isDeal));
        setTrendingProducts(mockProducts.slice(0, 4));
        setDeals(mockProducts.filter(p => p.isDeal && p.originalPrice));
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
        return (b.rating || 0) - (a.rating || 0);
      case 'newest':
        // Sort by ID as proxy for newest (higher ID = newer)
        return b.id - a.id;
      default:
        return 0;
    }
  });

  const displayedProductsList = sortedProducts.slice(0, displayedProducts);

  // Handlers for missing features
  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, 1);
      addNotification({
        type: 'success',
        title: 'Added to Cart',
        message: `${product.name} has been added to your cart${isUsingMockData ? ' (saved locally)' : ''}`,
        duration: 3000
      });
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to add product to cart';
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMsg,
        duration: 3000
      });
      // Still add to cart locally even if API fails
      if (isBackendOnline === false) {
        try {
          await addToCart(product.id, 1);
          addNotification({
            type: 'info',
            title: 'Saved Locally',
            message: `${product.name} has been added to your cart (saved locally)`,
            duration: 3000
          });
        } catch (localError) {
          console.error('Failed to add to cart locally:', localError);
        }
      }
    }
  };

  const handleAddToWishlist = async (product: Product) => {
    try {
      await addToWishlist(product.id);
      addNotification({
        type: 'success',
        title: 'Added to Wishlist',
        message: `${product.name} has been added to your wishlist${isUsingMockData ? ' (saved locally)' : ''}`,
        duration: 3000
      });
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to add product to wishlist';
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMsg,
        duration: 3000
      });
      // Still add to wishlist locally even if API fails
      if (isBackendOnline === false) {
        try {
          await addToWishlist(product.id);
          addNotification({
            type: 'info',
            title: 'Saved Locally',
            message: `${product.name} has been added to your wishlist (saved locally)`,
            duration: 3000
          });
        } catch (localError) {
          console.error('Failed to add to wishlist locally:', localError);
        }
      }
    }
  };

  const handleRemoveFromWishlist = async (product: Product) => {
    try {
      await removeFromWishlist(product.id);
      addNotification({
        type: 'success',
        title: 'Removed from Wishlist',
        message: `${product.name} has been removed from your wishlist`,
        duration: 3000
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove product from wishlist',
        duration: 3000
      });
    }
  };

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  const handleCompareToggle = (product: Product) => {
    if (compareList.includes(product.id)) {
      removeFromCompare(product.id);
    } else {
      if (compareList.length >= 4) {
        addNotification({
          type: 'warning',
          title: 'Limit Reached',
          message: 'You can compare up to 4 products at a time',
          duration: 3000
        });
        return;
      }
      addToCompare(product.id);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setPriceRange([0, 2000]);
    setSortBy('relevance');
    setDisplayedProducts(20);
  };

  const handleSaveSearch = () => {
    const searchParams = {
      query: searchQuery,
      category: selectedCategory,
      priceRange,
      sortBy
    };
    const searchString = JSON.stringify(searchParams);
    // Check if search already exists
    const exists = savedSearches.some(s => JSON.stringify({
      query: s.query,
      category: s.category,
      priceRange: s.priceRange,
      sortBy: s.sortBy
    }) === searchString);
    
    if (!exists) {
      saveSearch({
        query: searchQuery,
        category: selectedCategory || undefined,
        priceRange: priceRange,
        sortBy: sortBy
      });
      addNotification({
        type: 'success',
        title: 'Search Saved',
        message: 'Your search has been saved',
        duration: 3000
      });
    } else {
      addNotification({
        type: 'info',
        title: 'Already Saved',
        message: 'This search is already saved',
        duration: 3000
      });
    }
  };

  const handleShareSearch = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('q', searchQuery);
    if (selectedCategory) url.searchParams.set('category', selectedCategory);
    url.searchParams.set('sort', sortBy);
    
    if (navigator.share) {
      navigator.share({
        title: 'Check out these products',
        text: `Search results for: ${searchQuery}`,
        url: url.toString()
      });
    } else {
      navigator.clipboard.writeText(url.toString());
      addNotification({
        type: 'success',
        title: 'Link Copied',
        message: 'Search link has been copied to clipboard',
        duration: 3000
      });
    }
  };

  const handleLoadMore = () => {
    setDisplayedProducts(prev => prev + 20);
  };

  const handleAISearch = (query: string) => {
    setSearchQuery(query);
    setShowAIFinder(false);
    navigate(`/marketplace/search?q=${encodeURIComponent(query)}`);
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

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const productInWishlist = isInWishlist(product.id);
    const productInCompare = compareList.includes(product.id);
    const inCart = isInCart(product.id);
    
    // Track product view when card is rendered (only once per product)
    useEffect(() => {
      // Only track if product is not already in recently viewed (to avoid duplicates on re-renders)
      const isAlreadyViewed = recentlyViewed.some(p => p.id === product.id);
      if (!isAlreadyViewed) {
        addToRecentlyViewed({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice || (product as any).original_price,
          image: product.images?.[0] || product.image,
          brand: product.brand,
          category: product.category,
          subcategory: product.subcategory,
          rating: product.rating,
          reviewCount: product.reviewCount || (product as any).review_count,
          inStock: product.inStock !== false,
          viewedAt: new Date().toISOString()
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product.id]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden group relative"
      >
        {/* Compare Checkbox */}
        <div className="absolute top-2 left-2 z-10">
            <button
              onClick={() => handleCompareToggle(product)}
              className={`p-1.5 rounded-full ${
                productInCompare 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-400'
              } hover:bg-blue-600 hover:text-white transition-colors`}
              title={productInCompare ? 'Remove from comparison' : 'Add to comparison'}
            >
              {productInCompare ? <CheckSquare size={16} /> : <Square size={16} />}
            </button>
        </div>

        <Link to={`/marketplace/product/${product.id}`}>
          <div className="relative aspect-square overflow-hidden">
            <img
              src={product.images?.[0] || product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {product.isDeal && product.originalPrice && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </div>
            )}
            {product.isPrime && (
              <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                <Crown size={12} />
                Prime
              </div>
            )}
            {product.fastDelivery && (
              <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
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
            {renderStars(product.rating || 0)}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({product.reviewCount || 0})
            </span>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAddToCart(product)}
              className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition-colors ${
                inCart
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {inCart ? 'In Cart' : 'Add to Cart'}
            </button>
            <button
              onClick={() => productInWishlist ? handleRemoveFromWishlist(product) : handleAddToWishlist(product)}
              className={`p-2 rounded-md transition-colors ${
                productInWishlist
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              title={productInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={18} className={productInWishlist ? 'fill-current' : ''} />
            </button>
            <button
              onClick={() => handleQuickView(product)}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Quick View"
            >
              <Eye size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

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
        {/* Connection Status Banner */}
        {isUsingMockData && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Showing sample products. Connect to backend for real-time inventory and pricing.
              </p>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {isBackendOnline !== null && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                isBackendOnline 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' 
                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
              }`}>
                {isBackendOnline ? (
                  <>
                    <Wifi className="w-4 h-4" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                OmniLife Marketplace
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Discover amazing products with AI-powered recommendations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/marketplace/cart"
                className="relative flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px] text-sm sm:text-base"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Cart</span>
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </Link>
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Link
              to="/marketplace/recommendations"
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Brain className="w-4 h-4" />
              <span>AI Recommendations</span>
            </Link>
            <Link
              to="/marketplace/price-alerts"
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span>Price Alerts</span>
            </Link>
            <Link
              to="/marketplace/recently-viewed"
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Recently Viewed</span>
            </Link>
            <Link
              to="/marketplace/compare"
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <GitCompare className="w-4 h-4" />
              <span>Compare Products</span>
              {compareList.length > 0 && (
                <span className="bg-white text-indigo-600 text-xs font-bold rounded-full px-2 py-0.5">
                  {compareList.length}
                </span>
              )}
            </Link>
            <Link
              to="/marketplace/wishlist"
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span>My Wishlist</span>
              {wishlistItems.length > 0 && (
                <span className="bg-white text-red-600 text-xs font-bold rounded-full px-2 py-0.5">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link
              to="/marketplace/orders"
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>My Orders</span>
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
                  navigate(`/marketplace/search?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-20 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowAIFinder(true)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  title="AI Product Finder"
                >
                  <Brain size={18} />
                </button>
              </form>
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border rounded-lg transition-colors flex items-center gap-2 ${
                showFilters
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Filter size={18} />
              <span>Filters</span>
            </button>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                if (e.target.value) {
                  navigate(`/marketplace/category/${e.target.value}`);
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
                className={`px-3 py-3 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                title="Grid View"
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-3 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                title="List View"
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <RefreshCw size={16} />
              Clear Filters
            </button>
            <button
              onClick={handleSaveSearch}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Save size={16} />
              Save Search
            </button>
            <button
              onClick={handleShareSearch}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Share2 size={16} />
              Share Search
            </button>
          </div>

          {/* Filter Sidebar */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      placeholder="Min"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      placeholder="Max"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subcategory
                  </label>
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All Subcategories</option>
                    {/* Add subcategories here */}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
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
            <>
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {displayedProductsList.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {sortedProducts.length > displayedProducts && (
                <div className="mt-8 text-center">
                  <button
                    onClick={handleLoadMore}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Load More ({sortedProducts.length - displayedProducts} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Compare Products Button */}
        {compareList.length > 0 && (
          <div className="fixed bottom-4 right-4 z-40">
            <Link
              to="/marketplace/compare"
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
            >
              <GitCompare size={20} />
              <span>Compare ({compareList.length})</span>
            </Link>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductQuickViewModal
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        product={selectedProduct}
        onAddToCart={(productId) => {
          if (selectedProduct) handleAddToCart(selectedProduct);
        }}
        onAddToWishlist={(productId) => {
          if (selectedProduct) handleAddToWishlist(selectedProduct);
        }}
      />

      <AIProductFinderModal
        isOpen={showAIFinder}
        onClose={() => setShowAIFinder(false)}
        onSearch={handleAISearch}
      />
    </div>
  );
};

export default MarketplacePage;
