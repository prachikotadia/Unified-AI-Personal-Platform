import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye, 
  Trash2, 
  Plus, 
  Check, 
  X, 
  Minus,
  TrendingDown,
  TrendingUp,
  Package,
  Truck,
  Shield,
  Zap,
  Target,
  BarChart3
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
  description: string;
  features: string[];
  specifications: Record<string, string>;
}

interface ProductComparisonProps {
  products: Product[];
  onRemoveProduct: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  onAddToWishlist: (productId: string) => void;
}

const ProductComparison: React.FC<ProductComparisonProps> = ({
  products,
  onRemoveProduct,
  onAddToCart,
  onAddToWishlist
}) => {
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  useEffect(() => {
    if (products.length > 0) {
      // Get all unique specification keys from all products
      const allSpecs = new Set<string>();
      products.forEach(product => {
        Object.keys(product.specifications).forEach(key => {
          allSpecs.add(key);
        });
      });
      setSelectedSpecs(Array.from(allSpecs));
    }
  }, [products]);

  const getAllSpecifications = () => {
    const allSpecs = new Set<string>();
    products.forEach(product => {
      Object.keys(product.specifications).forEach(key => {
        allSpecs.add(key);
      });
    });
    return Array.from(allSpecs);
  };

  const getSpecificationValue = (product: Product, specKey: string) => {
    return product.specifications[specKey] || 'N/A';
  };

  const getPriceDifference = (product1: Product, product2: Product) => {
    const diff = product1.price - product2.price;
    const percentage = (diff / product2.price) * 100;
    return { diff, percentage };
  };

  const getBestValue = () => {
    if (products.length < 2) return null;
    
    // Simple algorithm: consider price, rating, and review count
    const scores = products.map(product => ({
      product,
      score: (product.rating * product.reviewCount) / product.price
    }));
    
    return scores.reduce((best, current) => 
      current.score > best.score ? current : best
    ).product;
  };

  const bestValue = getBestValue();

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No products to compare</h3>
        <p className="text-gray-600 mb-6">Add products to your comparison to see detailed specifications side by side.</p>
        <Link
          to="/marketplace"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Browse Products</span>
        </Link>
      </div>
    );
  }

  const allSpecs = getAllSpecifications();
  const displaySpecs = showAllSpecs ? allSpecs : allSpecs.slice(0, 8);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Product Comparison</h2>
            <span className="text-sm text-gray-500">({products.length} products)</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAllSpecs(!showAllSpecs)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>{showAllSpecs ? 'Show Less' : 'Show All Specs'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Row */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${products.length + 1}, minmax(250px, 1fr))` }}>
            {/* Header Column */}
            <div className="border-r border-gray-200">
              <div className="p-4 bg-gray-50 h-32"></div>
              <div className="p-4 bg-gray-50 h-12 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Price</span>
              </div>
              <div className="p-4 bg-gray-50 h-12 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Rating</span>
              </div>
              <div className="p-4 bg-gray-50 h-12 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Brand</span>
              </div>
              <div className="p-4 bg-gray-50 h-12 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Availability</span>
              </div>
              <div className="p-4 bg-gray-50 h-12 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Delivery</span>
              </div>
              {displaySpecs.map((spec, index) => (
                <div key={spec} className="p-4 bg-gray-50 h-12 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700 capitalize">{spec.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>

            {/* Product Columns */}
            {products.map((product, index) => (
              <div key={product.id} className="border-r border-gray-200 last:border-r-0">
                {/* Product Header */}
                <div className="p-4 relative">
                  <button
                    onClick={() => onRemoveProduct(product.id)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className="text-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded-lg mx-auto mb-3"
                    />
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">{product.name}</h3>
                    
                    {/* Best Value Badge */}
                    {bestValue?.id === product.id && (
                      <div className="inline-flex items-center space-x-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">
                        <Target className="w-3 h-3" />
                        <span>Best Value</span>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => onAddToWishlist(product.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onAddToCart(product.id)}
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
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="p-4 h-12 border-t border-gray-200 flex items-center">
                  <div className="text-center w-full">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="font-bold text-gray-900">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                      )}
                    </div>
                    {product.isDeal && (
                      <div className="flex items-center justify-center text-xs text-red-600 mt-1">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        <span>Deal</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="p-4 h-12 border-t border-gray-200 flex items-center">
                  <div className="text-center w-full">
                    <div className="flex items-center justify-center space-x-1">
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
                </div>

                {/* Brand */}
                <div className="p-4 h-12 border-t border-gray-200 flex items-center">
                  <span className="text-sm text-gray-700">{product.brand}</span>
                </div>

                {/* Availability */}
                <div className="p-4 h-12 border-t border-gray-200 flex items-center">
                  <div className="flex items-center space-x-2">
                    {product.inStock ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">In Stock</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600">Out of Stock</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Delivery */}
                <div className="p-4 h-12 border-t border-gray-200 flex items-center">
                  <div className="flex items-center space-x-2">
                    {product.fastDelivery && (
                      <Truck className="w-4 h-4 text-blue-600" />
                    )}
                    {product.isPrime && (
                      <Shield className="w-4 h-4 text-blue-600" />
                    )}
                    <span className="text-sm text-gray-700">
                      {product.fastDelivery ? 'Fast Delivery' : 'Standard'}
                    </span>
                  </div>
                </div>

                {/* Specifications */}
                {displaySpecs.map((spec) => (
                  <div key={spec} className="p-4 h-12 border-t border-gray-200 flex items-center">
                    <span className="text-sm text-gray-700">
                      {getSpecificationValue(product, spec)}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Price Comparison Summary */}
      {products.length >= 2 && (
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Comparison Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product, index) => {
              if (index === 0) return null;
              const { diff, percentage } = getPriceDifference(products[0], product);
              return (
                <div key={product.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">vs {products[0].brand}</span>
                    <span className={`text-sm font-medium ${diff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {diff > 0 ? '+' : ''}${Math.abs(diff).toFixed(2)} ({percentage > 0 ? '+' : ''}{percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {product.brand}: ${product.price} | {products[0].brand}: ${products[0].price}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductComparison;
