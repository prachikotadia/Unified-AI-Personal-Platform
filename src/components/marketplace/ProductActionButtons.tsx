import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Heart, 
  Zap, 
  Check,
  Loader2
} from 'lucide-react';
import { useCartStore } from '../../store/cart';
import { useWishlistStore } from '../../store/wishlist';
import { useBuyNowStore } from '../../store/buyNow';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/auth';

interface ProductActionButtonsProps {
  product: {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    brand: string;
    inStock: boolean;
  };
  quantity?: number;
  className?: string;
  showQuantitySelector?: boolean;
}

const ProductActionButtons: React.FC<ProductActionButtonsProps> = ({
  product,
  quantity = 1,
  className = '',
  showQuantitySelector = false
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // Store hooks
  const { 
    addToCart, 
    isInCart, 
    isLoading: cartLoading 
  } = useCartStore();
  
  const { 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist, 
    isLoading: wishlistLoading 
  } = useWishlistStore();
  
  const { 
    setBuyNowItem, 
    processBuyNow, 
    isLoading: buyNowLoading 
  } = useBuyNowStore();

  // Local state
  const [localQuantity, setLocalQuantity] = useState(quantity);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handlers
  const handleAddToCart = async () => {
    if (!product.inStock) {
      showToast('Product is out of stock', 'error');
      return;
    }

    console.log('Adding to cart:', product.id, localQuantity);
    setIsProcessing(true);
    try {
      await addToCart(product.id, localQuantity);
      showToast('Added to cart successfully!', 'success');
    } catch (error) {
      console.error('Add to cart error:', error);
      showToast('Failed to add to cart', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product.inStock) {
      showToast('Product is out of stock', 'error');
      return;
    }

    console.log('Buying now:', product.id, localQuantity);
    setIsProcessing(true);
    try {
      setBuyNowItem(product.id, localQuantity, product);
      
      // Create order data for buy now
      const subtotal = product.price * localQuantity;
      const shipping = subtotal > 35 ? 0 : 5.99; // Free shipping over $35
      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + shipping + tax;
      
      const orderData = {
        items: [{
          id: Date.now(),
          productId: product.id,
          product: product,
          quantity: localQuantity,
          price: product.price
        }],
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        total: total,
        orderType: 'buyNow',
        checkoutDate: new Date().toISOString()
      };

      // Create default address data using actual user data
      const { user } = useAuthStore.getState();
      const addressData = {
        id: '1',
        type: 'home',
        name: user?.displayName || user?.username || 'User',
        phone: '+1 (555) 123-4567',
        email: user?.email || '',
        addressLine1: '123 Main Street',
        addressLine2: '',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
        isDefault: true
      };

      // Store in session storage for checkout flow
      sessionStorage.setItem('checkoutOrderData', JSON.stringify(orderData));
      sessionStorage.setItem('checkoutAddressData', JSON.stringify(addressData));
      
      console.log('ProductActionButtons: Buy now data created and stored');
      console.log('ProductActionButtons: Order data:', orderData);
      console.log('ProductActionButtons: Address data:', addressData);
      console.log('ProductActionButtons: Checkout date:', orderData.checkoutDate);
      console.log('ProductActionButtons: Checkout date formatted:', new Date(orderData.checkoutDate).toLocaleString());
      
      showToast('Redirecting to checkout...', 'success');
      navigate('/marketplace/checkout');
    } catch (error) {
      console.error('Buy now error:', error);
      showToast('Failed to process purchase', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWishlistToggle = async () => {
    console.log('Toggling wishlist:', product.id);
    setIsProcessing(true);
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
        showToast('Removed from wishlist', 'success');
      } else {
        await addToWishlist(product.id);
        showToast('Added to wishlist!', 'success');
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      showToast('Failed to update wishlist', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const isInCartState = isInCart(product.id);
  const isInWishlistState = isInWishlist(product.id);
  const isLoading = cartLoading || wishlistLoading || buyNowLoading || isProcessing;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Quantity Selector */}
      {showQuantitySelector && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quantity:
          </label>
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
            <button
              type="button"
              onClick={() => setLocalQuantity(Math.max(1, localQuantity - 1))}
              disabled={isLoading}
              className="px-3 py-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            >
              -
            </button>
            <span className="px-3 py-1 text-sm font-medium min-w-[3rem] text-center">
              {localQuantity}
            </span>
            <button
              type="button"
              onClick={() => setLocalQuantity(localQuantity + 1)}
              disabled={isLoading}
              className="px-3 py-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isLoading || !product.inStock || isInCartState}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            isInCartState
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 cursor-not-allowed'
              : !product.inStock
              ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
          } disabled:opacity-50`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isInCartState ? (
            <Check className="w-4 h-4" />
          ) : (
            <ShoppingCart className="w-4 h-4" />
          )}
          {isInCartState ? 'In Cart' : 'Add to Cart'}
        </button>

        {/* Buy Now Button */}
        <button
          onClick={handleBuyNow}
          disabled={isLoading || !product.inStock}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            !product.inStock
              ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
              : 'bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600'
          } disabled:opacity-50`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          Buy Now
        </button>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={isLoading}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            isInWishlistState
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          } disabled:opacity-50`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Heart className={`w-4 h-4 ${isInWishlistState ? 'fill-current' : ''}`} />
          )}
        </button>
      </div>

      {/* Stock Status */}
      {!product.inStock && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center">
          Out of Stock
        </p>
      )}

      {/* Price Display */}
      <div className="text-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          ${product.price.toFixed(2)}
        </span>
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="ml-2 text-sm text-gray-500 line-through">
            ${product.originalPrice.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductActionButtons;
