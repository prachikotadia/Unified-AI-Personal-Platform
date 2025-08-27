import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye,
  Zap,
  Brain,
  Target,
  Users,
  Clock,
  ArrowRight
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
  confidence?: number;
  reason?: string;
}

interface AIRecommendationsProps {
  type: 'personalized' | 'customers-also-bought' | 'trending' | 'similar-products';
  productId?: string;
  category?: string;
  limit?: number;
  title?: string;
  showReason?: boolean;
  showConfidence?: boolean;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  type,
  productId,
  category,
  limit = 6,
  title,
  showReason = false,
  showConfidence = false
}) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Mock API call - replace with actual API endpoint
        const mockRecommendations: Product[] = [
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
            confidence: 0.95,
            reason: 'Based on your recent smartphone purchases'
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
            confidence: 0.87,
            reason: 'Popular with iPhone users'
          },
          {
            id: '3',
            name: 'Apple AirPods Pro (2nd Generation)',
            price: 249.99,
            originalPrice: 279.99,
            rating: 4.7,
            reviewCount: 2156,
            image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop',
            brand: 'Apple',
            category: 'electronics',
            subcategory: 'earbuds',
            inStock: true,
            fastDelivery: true,
            isPrime: true,
            confidence: 0.92,
            reason: 'Perfect companion for your iPhone'
          },
          {
            id: '4',
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
            confidence: 0.78,
            reason: 'Similar to products you viewed'
          },
          {
            id: '5',
            name: 'Apple Watch Series 9 - GPS + Cellular',
            price: 499.99,
            originalPrice: 549.99,
            rating: 4.8,
            reviewCount: 1567,
            image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400&h=400&fit=crop',
            brand: 'Apple',
            category: 'electronics',
            subcategory: 'smartwatches',
            inStock: true,
            fastDelivery: true,
            isPrime: true,
            confidence: 0.89,
            reason: 'Complements your Apple ecosystem'
          },
          {
            id: '6',
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
            confidence: 0.76,
            reason: 'Based on your search history'
          }
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Filter recommendations based on type
        let filteredRecommendations = mockRecommendations;
        
        if (type === 'customers-also-bought') {
          filteredRecommendations = mockRecommendations.filter(p => p.confidence && p.confidence > 0.8);
        } else if (type === 'trending') {
          filteredRecommendations = mockRecommendations.filter(p => p.reviewCount > 1000);
        } else if (type === 'similar-products' && category) {
          filteredRecommendations = mockRecommendations.filter(p => p.category === category);
        }

        setRecommendations(filteredRecommendations.slice(0, limit));
      } catch (err) {
        setError('Failed to load recommendations');
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [type, productId, category, limit]);

  const getTypeIcon = () => {
    switch (type) {
      case 'personalized':
        return <Brain className="w-5 h-5" />;
      case 'customers-also-bought':
        return <Users className="w-5 h-5" />;
      case 'trending':
        return <TrendingUp className="w-5 h-5" />;
      case 'similar-products':
        return <Target className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getTypeTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'personalized':
        return 'Recommended for You';
      case 'customers-also-bought':
        return 'Customers Also Bought';
      case 'trending':
        return 'Trending Now';
      case 'similar-products':
        return 'Similar Products';
      default:
        return 'AI Recommendations';
    }
  };

  const getTypeDescription = () => {
    switch (type) {
      case 'personalized':
        return 'Based on your browsing history and preferences';
      case 'customers-also-bought':
        return 'Frequently purchased together';
      case 'trending':
        return 'Popular products this week';
      case 'similar-products':
        return 'Products you might like';
      default:
        return 'AI-powered suggestions';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="animate-pulse bg-gray-300 rounded-full w-5 h-5"></div>
          <div className="animate-pulse bg-gray-300 rounded h-6 w-48"></div>
        </div>
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
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-gray-500">
          <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>Unable to load recommendations</p>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-blue-600">
            {getTypeIcon()}
            <h3 className="text-lg font-semibold text-gray-900">{getTypeTitle()}</h3>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
            <Zap className="w-3 h-3" />
            <span>AI Powered</span>
          </div>
        </div>
        <Link 
          to="/marketplace" 
          className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-6">{getTypeDescription()}</p>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {recommendations.map((product, index) => (
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
                
                {/* Confidence Badge */}
                {showConfidence && product.confidence && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {Math.round(product.confidence * 100)}% match
                  </div>
                )}

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
                    <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                      <ShoppingCart className="w-4 h-4 text-gray-600" />
                    </button>
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

                {/* Reason */}
                {showReason && product.reason && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{product.reason}</p>
                )}

                {/* Deal Timer */}
                {product.isDeal && product.dealEndsIn && (
                  <div className="flex items-center text-xs text-red-600 mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>Ends in {product.dealEndsIn}</span>
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AIRecommendations;
