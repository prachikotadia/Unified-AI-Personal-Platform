import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Shirt, Heart, ShoppingCart, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OutfitItem {
  id: number;
  name: string;
  image: string;
  price: number;
  brand: string;
  category: string;
  rating: number;
}

interface Outfit {
  id: string;
  name: string;
  occasion: string;
  items: OutfitItem[];
  totalPrice: number;
  style: string;
  confidence: number;
  reasoning: string;
}

interface AIOutfitRecommendationsProps {
  occasion?: string;
  style?: string;
  budget?: number;
  onOutfitSelected?: (outfit: Outfit) => void;
}

const AIOutfitRecommendations: React.FC<AIOutfitRecommendationsProps> = ({
  occasion,
  style,
  budget,
  onOutfitSelected
}) => {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateOutfits();
  }, [occasion, style, budget]);

  const generateOutfits = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock outfit data
    const mockOutfits: Outfit[] = [
      {
        id: '1',
        name: 'Casual Weekend Look',
        occasion: 'casual',
        style: 'casual',
        items: [
          {
            id: 1,
            name: 'Classic White T-Shirt',
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
            price: 29.99,
            brand: 'Basic Brand',
            category: 'tops',
            rating: 4.5
          },
          {
            id: 2,
            name: 'Slim Fit Jeans',
            image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop',
            price: 79.99,
            brand: 'Denim Co',
            category: 'bottoms',
            rating: 4.7
          },
          {
            id: 3,
            name: 'Sneakers',
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop',
            price: 89.99,
            brand: 'Shoe Brand',
            category: 'shoes',
            rating: 4.6
          }
        ],
        totalPrice: 199.97,
        confidence: 0.92,
        reasoning: 'Perfect for weekend outings. Classic and comfortable pieces that work well together.'
      },
      {
        id: '2',
        name: 'Professional Office Attire',
        occasion: 'business',
        style: 'professional',
        items: [
          {
            id: 4,
            name: 'Button-Down Shirt',
            image: 'https://images.unsplash.com/photo-1594938291221-94f313b0e69e?w=200&h=200&fit=crop',
            price: 59.99,
            brand: 'Formal Wear',
            category: 'tops',
            rating: 4.8
          },
          {
            id: 5,
            name: 'Dress Pants',
            image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=200&h=200&fit=crop',
            price: 99.99,
            brand: 'Professional',
            category: 'bottoms',
            rating: 4.7
          },
          {
            id: 6,
            name: 'Leather Dress Shoes',
            image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop',
            price: 149.99,
            brand: 'Shoe Co',
            category: 'shoes',
            rating: 4.9
          }
        ],
        totalPrice: 309.97,
        confidence: 0.88,
        reasoning: 'Professional and polished look suitable for office environments and business meetings.'
      },
      {
        id: '3',
        name: 'Evening Date Night',
        occasion: 'formal',
        style: 'elegant',
        items: [
          {
            id: 7,
            name: 'Blazer',
            image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&h=200&fit=crop',
            price: 199.99,
            brand: 'Fashion Brand',
            category: 'outerwear',
            rating: 4.6
          },
          {
            id: 8,
            name: 'Dress Shirt',
            image: 'https://images.unsplash.com/photo-1624378515193-9bb7a3c26a5a?w=200&h=200&fit=crop',
            price: 79.99,
            brand: 'Formal',
            category: 'tops',
            rating: 4.7
          },
          {
            id: 9,
            name: 'Dress Shoes',
            image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop',
            price: 179.99,
            brand: 'Luxury',
            category: 'shoes',
            rating: 4.8
          }
        ],
        totalPrice: 459.97,
        confidence: 0.85,
        reasoning: 'Elegant and sophisticated outfit perfect for special occasions and evening events.'
      }
    ];

    // Filter by occasion/style/budget if provided
    let filtered = mockOutfits;
    if (occasion) {
      filtered = filtered.filter(o => o.occasion === occasion.toLowerCase());
    }
    if (style) {
      filtered = filtered.filter(o => o.style === style.toLowerCase());
    }
    if (budget) {
      filtered = filtered.filter(o => o.totalPrice <= budget);
    }

    setOutfits(filtered);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">AI is creating outfit recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="text-blue-600" size={24} />
        <h3 className="text-lg font-semibold">AI Outfit Recommendations</h3>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
          Powered by AI
        </span>
      </div>

      {outfits.length === 0 ? (
        <div className="text-center py-8">
          <Shirt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No outfits found matching your criteria</p>
        </div>
      ) : (
        <div className="space-y-6">
          {outfits.map((outfit, index) => (
            <motion.div
              key={outfit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{outfit.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {outfit.occasion} • {outfit.style}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ${outfit.totalPrice.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${outfit.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {Math.round(outfit.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Outfit Items */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {outfit.items.map((item) => (
                  <div key={item.id} className="text-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                    <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reasoning */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">{outfit.reasoning}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onOutfitSelected?.(outfit)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <ShoppingCart size={16} />
                  Add All to Cart
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Heart size={16} className="text-red-600" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>AI Recommendations:</strong> Outfits are curated using AI based on style trends, color coordination, and occasion appropriateness.
        </p>
      </div>
    </div>
  );
};

export default AIOutfitRecommendations;

