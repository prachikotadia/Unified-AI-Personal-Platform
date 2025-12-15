import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Heart, Star, Share2, Check } from 'lucide-react';
import { Product } from '../../services/api';
import { useCartStore } from '../../store/cart';
import { useNotifications } from '../../contexts/NotificationContext';

interface ProductQuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart?: (productId: number) => void;
  onAddToWishlist?: (productId: number) => void;
}

const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onAddToWishlist
}) => {
  const { addToCart, isInCart } = useCartStore();
  const { addNotification } = useNotifications();

  if (!product) return null;

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, 1);
      addNotification({
        type: 'success',
        title: 'Added to Cart',
        message: `${product.name} has been added to your cart`,
        duration: 3000
      });
      if (onAddToCart) onAddToCart(product.id);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add product to cart',
        duration: 3000
      });
    }
  };

  const handleAddToWishlist = async () => {
    try {
      if (onAddToWishlist) {
        onAddToWishlist(product.id);
        addNotification({
          type: 'success',
          title: 'Added to Wishlist',
          message: `${product.name} has been added to your wishlist`,
          duration: 3000
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add product to wishlist',
        duration: 3000
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl max-w-[95vw] sm:max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="grid md:grid-cols-2 gap-6 p-6">
                  {/* Product Image */}
                  <div className="relative">
                    <img
                      src={product.images?.[0] || product.image}
                      alt={product.name}
                      className="w-full h-96 object-cover rounded-lg"
                    />
                    {product.isDeal && product.originalPrice && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {product.name}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {product.brand}
                      </p>
                      <div className="flex items-center gap-2 mb-4">
                        {renderStars(product.rating)}
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {product.rating} ({product.reviewCount} reviews)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-700 dark:text-gray-300">
                      {product.description}
                    </p>

                    {product.features && product.features.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Features:</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          {product.features.slice(0, 5).map((feature, i) => (
                            <li key={i}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleAddToCart}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                      >
                        <ShoppingCart size={20} />
                        {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
                      </button>
                      <button
                        onClick={handleAddToWishlist}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Heart size={20} />
                      </button>
                      <button
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: product.name,
                              text: product.description,
                              url: window.location.href
                            });
                          }
                        }}
                      >
                        <Share2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductQuickViewModal;

