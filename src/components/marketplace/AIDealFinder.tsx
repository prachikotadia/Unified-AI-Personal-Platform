import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Tag, TrendingDown, Clock, Star, ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Deal {
  id: number;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;
  discountPercentage: number;
  brand: string;
  category: string;
  rating: number;
  reviewCount: number;
  dealEndsIn: string;
  savings: number;
  confidence: number;
  reasoning: string;
  urgency: 'high' | 'medium' | 'low';
}

interface AIDealFinderProps {
  preferences?: {
    categories?: string[];
    maxPrice?: number;
    minDiscount?: number;
    brands?: string[];
  };
  onDealSelected?: (deal: Deal) => void;
}

const AIDealFinder: React.FC<AIDealFinderProps> = ({
  preferences,
  onDealSelected
}) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');

  useEffect(() => {
    findDeals();
  }, [preferences]);

  const findDeals = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock deals data
    const mockDeals: Deal[] = [
      {
        id: 1,
        name: 'Apple iPhone 15 Pro Max - 256GB',
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop',
        price: 1099.99,
        originalPrice: 1299.99,
        discount: 200,
        discountPercentage: 15,
        brand: 'Apple',
        category: 'electronics',
        rating: 4.8,
        reviewCount: 1247,
        dealEndsIn: '2 days',
        savings: 200,
        confidence: 0.95,
        reasoning: 'Historical price data shows this is the lowest price in 6 months. Rare discount on premium product.',
        urgency: 'high'
      },
      {
        id: 2,
        name: 'Sony WH-1000XM4 Wireless Headphones',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
        price: 299.99,
        originalPrice: 399.99,
        discount: 100,
        discountPercentage: 25,
        brand: 'Sony',
        category: 'electronics',
        rating: 4.8,
        reviewCount: 1892,
        dealEndsIn: '5 days',
        savings: 100,
        confidence: 0.88,
        reasoning: '25% discount is above average for this product. Popular item with high ratings.',
        urgency: 'medium'
      },
      {
        id: 3,
        name: 'Nike Air Max 270 Running Shoes',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop',
        price: 99.99,
        originalPrice: 150.00,
        discount: 50.01,
        discountPercentage: 33,
        brand: 'Nike',
        category: 'fashion',
        rating: 4.5,
        reviewCount: 2156,
        dealEndsIn: '1 day',
        savings: 50.01,
        confidence: 0.92,
        reasoning: 'Exceptional 33% discount. Limited time offer on popular athletic shoes.',
        urgency: 'high'
      },
      {
        id: 4,
        name: 'Samsung 65" QLED 4K Smart TV',
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200&h=200&fit=crop',
        price: 999.99,
        originalPrice: 1799.99,
        discount: 800,
        discountPercentage: 44,
        brand: 'Samsung',
        category: 'electronics',
        rating: 4.6,
        reviewCount: 892,
        dealEndsIn: '3 days',
        savings: 800,
        confidence: 0.90,
        reasoning: 'Massive 44% discount. Best price seen this year. Premium TV at mid-range price.',
        urgency: 'high'
      }
    ];

    // Apply filters
    let filtered = mockDeals;
    if (preferences?.categories && preferences.categories.length > 0) {
      filtered = filtered.filter(d => preferences.categories!.includes(d.category));
    }
    if (preferences?.maxPrice) {
      filtered = filtered.filter(d => d.price <= preferences.maxPrice!);
    }
    if (preferences?.minDiscount) {
      filtered = filtered.filter(d => d.discountPercentage >= preferences.minDiscount!);
    }
    if (preferences?.brands && preferences.brands.length > 0) {
      filtered = filtered.filter(d => preferences.brands!.includes(d.brand));
    }

    // Sort by confidence and savings
    filtered.sort((a, b) => {
      const scoreA = a.confidence * 100 + a.savings;
      const scoreB = b.confidence * 100 + b.savings;
      return scoreB - scoreA;
    });

    setDeals(filtered);

    // Generate summary
    const totalSavings = filtered.reduce((sum, d) => sum + d.savings, 0);
    setSummary(
      `Found ${filtered.length} great deals! Total potential savings: $${totalSavings.toFixed(2)}. ` +
      `These deals are ranked by AI confidence and value.`
    );

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">AI is finding the best deals for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="text-blue-600" size={24} />
        <h3 className="text-lg font-semibold">AI Deal Finder</h3>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
          Powered by AI
        </span>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">{summary}</p>
        </div>
      )}

      {/* Deals Grid */}
      {deals.length === 0 ? (
        <div className="text-center py-8">
          <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No deals found matching your preferences</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deals.map((deal, index) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-4">
                <img
                  src={deal.image}
                  alt={deal.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                        {deal.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{deal.brand}</p>
                    </div>
                    {deal.urgency === 'high' && (
                      <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded">
                        Hot Deal
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${deal.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ${deal.originalPrice.toFixed(2)}
                    </span>
                    <span className="text-sm font-bold text-red-600">
                      -{deal.discountPercentage}%
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {deal.rating} ({deal.reviewCount})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                      <Clock size={14} />
                      <span className="text-xs">Ends in {deal.dealEndsIn}</span>
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles size={12} className="text-blue-600" />
                      <strong>AI Insight:</strong>
                    </div>
                    {deal.reasoning}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/marketplace/product/${deal.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <ShoppingCart size={16} />
                      View Deal
                    </Link>
                    <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Heart size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>AI Deal Finder:</strong> Deals are identified using AI analysis of historical prices, market trends, and discount patterns. 
          Prices and availability are subject to change.
        </p>
      </div>
    </div>
  );
};

export default AIDealFinder;

