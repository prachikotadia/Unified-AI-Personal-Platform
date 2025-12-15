import React from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, ShoppingCart, ArrowRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AddToCartConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: number;
    name: string;
    image: string;
    price: number;
    quantity: number;
  };
  onViewCart?: () => void;
  onContinueShopping?: () => void;
  onAddToWishlist?: () => void;
}

const AddToCartConfirmationModal: React.FC<AddToCartConfirmationModalProps> = ({
  isOpen,
  onClose,
  product,
  onViewCart,
  onContinueShopping,
  onAddToWishlist
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-600" size={24} />
            <h2 className="text-xl font-semibold">Added to Cart</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <img
              src={product.image}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Quantity: {product.quantity}
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ${(product.price * product.quantity).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Link
              to="/marketplace/cart"
              onClick={() => {
                onViewCart?.();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ShoppingCart size={18} />
              View Cart
              <ArrowRight size={18} />
            </Link>
            <button
              onClick={() => {
                onContinueShopping?.();
                onClose();
              }}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Continue Shopping
            </button>
            {onAddToWishlist && (
              <button
                onClick={() => {
                  onAddToWishlist();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Heart size={18} />
                Add to Wishlist
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AddToCartConfirmationModal;

