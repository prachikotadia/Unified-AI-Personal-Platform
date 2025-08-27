import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Target, 
  ArrowLeft, 
  Plus, 
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
  Zap,
  BarChart3,
  RefreshCw,
  X
} from 'lucide-react';
import ProductComparison from '../../components/marketplace/ProductComparison';

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
  description: string;
  features: string[];
  specifications: Record<string, string>;
}

const ProductComparisonPage: React.FC = () => {
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showProductSelector, setShowProductSelector] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Mock data
      const mockProducts: Product[] = [
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
          description: 'The most advanced iPhone ever with A17 Pro chip, titanium design, and pro camera system.',
          features: [
            'A17 Pro chip with 6-core GPU',
            'Titanium design',
            'Pro camera system',
            'Action button',
            'USB-C connector'
          ],
          specifications: {
            storage: '256GB',
            color: 'Natural Titanium',
            screen: '6.7 inch Super Retina XDR',
            camera: '48MP Main + 12MP Ultra Wide + 12MP Telephoto',
            processor: 'A17 Pro',
            battery: 'Up to 29 hours video playback',
            connectivity: '5G, Wi-Fi 6E, Bluetooth 5.3'
          }
        },
        {
          id: '2',
          name: 'Samsung Galaxy S24 Ultra - 256GB',
          price: 1299.99,
          originalPrice: 1399.99,
          rating: 4.6,
          reviewCount: 892,
          image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
          brand: 'Samsung',
          category: 'electronics',
          subcategory: 'smartphones',
          inStock: true,
          fastDelivery: true,
          isPrime: true,
          isDeal: false,
          description: 'The most powerful Galaxy smartphone with S Pen and advanced AI features.',
          features: [
            'S Pen included',
            'Advanced AI features',
            'Pro-grade camera system',
            'Titanium frame',
            '200MP camera'
          ],
          specifications: {
            storage: '256GB',
            color: 'Titanium Gray',
            screen: '6.8 inch Dynamic AMOLED 2X',
            camera: '200MP Main + 12MP Ultra Wide + 50MP Telephoto + 10MP Telephoto',
            processor: 'Snapdragon 8 Gen 3',
            battery: '5000mAh',
            connectivity: '5G, Wi-Fi 7, Bluetooth 5.3'
          }
        },
        {
          id: '3',
          name: 'Google Pixel 8 Pro - 128GB',
          price: 999.99,
          originalPrice: 1099.99,
          rating: 4.5,
          reviewCount: 743,
          image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
          brand: 'Google',
          category: 'electronics',
          subcategory: 'smartphones',
          inStock: true,
          fastDelivery: true,
          isPrime: true,
          isDeal: true,
          dealEndsIn: '5 days',
          description: 'The most advanced Pixel with AI-powered features and exceptional camera capabilities.',
          features: [
            'Google Tensor G3',
            'AI-powered features',
            'Pro camera system',
            'Magic Eraser',
            'Call Screen'
          ],
          specifications: {
            storage: '128GB',
            color: 'Obsidian',
            screen: '6.7 inch LTPO OLED',
            camera: '50MP Main + 48MP Ultra Wide + 48MP Telephoto',
            processor: 'Google Tensor G3',
            battery: '4950mAh',
            connectivity: '5G, Wi-Fi 7, Bluetooth 5.3'
          }
        },
        {
          id: '4',
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
          isDeal: true,
          dealEndsIn: '1 day',
          description: 'Industry-leading noise canceling with Dual Noise Sensor technology.',
          features: [
            'Industry-leading noise canceling',
            '30-hour battery life',
            'Touch controls',
            'Speak-to-Chat technology',
            'DSEE Extreme audio upscaling'
          ],
          specifications: {
            type: 'Over-ear',
            connectivity: 'Bluetooth 5.0, NFC',
            battery: '30 hours (NC on), 38 hours (NC off)',
            weight: '254g',
            frequency: '4Hz-40,000Hz',
            impedance: '47 ohms'
          }
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 1000));
      setAvailableProducts(mockProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToComparison = (product: Product) => {
    if (comparisonProducts.length >= 4) {
      alert('You can compare up to 4 products at a time');
      return;
    }
    if (comparisonProducts.find(p => p.id === product.id)) {
      alert('This product is already in your comparison');
      return;
    }
    setComparisonProducts(prev => [...prev, product]);
    setShowProductSelector(false);
  };

  const removeFromComparison = (productId: string) => {
    setComparisonProducts(prev => prev.filter(p => p.id !== productId));
  };

  const addToCart = (productId: string) => {
    // Mock add to cart functionality
    console.log('Added to cart:', productId);
  };

  const addToWishlist = (productId: string) => {
    // Mock add to wishlist functionality
    console.log('Added to wishlist:', productId);
  };

  const getFilteredProducts = () => {
    let filtered = availableProducts;

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
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
                <Target className="w-6 h-6" />
                <h1 className="text-2xl font-bold text-gray-900">Product Comparison</h1>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
                <BarChart3 className="w-3 h-3" />
                <span>{comparisonProducts.length}/4 Products</span>
              </div>
            </div>
            <button
              onClick={() => setShowProductSelector(true)}
              disabled={comparisonProducts.length >= 4}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Product Comparison Component */}
        <ProductComparison
          products={comparisonProducts}
          onRemoveProduct={removeFromComparison}
          onAddToCart={addToCart}
          onAddToWishlist={addToWishlist}
        />

        {/* Product Selector Modal */}
        {showProductSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Target className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Add Product to Comparison</h2>
                </div>
                <button
                  onClick={() => setShowProductSelector(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search and Filters */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
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
                </div>
              </div>

              {/* Products Grid */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="text-center">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-lg mx-auto mb-3"
                          />
                          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">{product.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                          
                          <div className="flex items-center justify-center space-x-2 mb-3">
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

                          <div className="flex items-center justify-center space-x-2 mb-3">
                            <span className="font-bold text-gray-900">${product.price}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                            )}
                          </div>

                          {product.isDeal && (
                            <div className="flex items-center justify-center text-xs text-red-600 mb-3">
                              <TrendingDown className="w-3 h-3 mr-1" />
                              <span>Deal</span>
                            </div>
                          )}

                          <button
                            onClick={() => addToComparison(product)}
                            disabled={comparisonProducts.find(p => p.id === product.id) !== undefined}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                          >
                            {comparisonProducts.find(p => p.id === product.id) ? 'Already Added' : 'Add to Comparison'}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductComparisonPage;
