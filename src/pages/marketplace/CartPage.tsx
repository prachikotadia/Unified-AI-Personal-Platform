import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Trash2, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Heart, 
  Shield, 
  Truck, 
  CreditCard, 
  Lock,
  Star,
  Package,
  Check,
  X,
  ChevronRight,
  Loader2
} from 'lucide-react';
import AIRecommendations from '../../components/marketplace/AIRecommendations';
import { useCartStore } from '../../store/cart';
import { useWishlistStore } from '../../store/wishlist';
import { useToastHelpers } from '../../components/ui/Toast';

const CartPage = () => {
  const navigate = useNavigate();
  const { success, error: showError, info } = useToastHelpers();
  
  // Store hooks
  const { 
    cart, 
    fetchCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart,
    isLoading: cartLoading,
    error: cartError
  } = useCartStore();
  
  const { 
    addToWishlist, 
    isLoading: wishlistLoading 
  } = useWishlistStore();

  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Handlers
  const handleUpdateQuantity = async (itemId: number, change: number) => {
    const item = cart.items.find(item => item.id === itemId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      try {
        await updateCartItem(itemId, newQuantity);
        success('Cart Updated', 'Cart updated successfully!');
      } catch (err) {
        showError('Update Failed', 'Failed to update cart');
      }
    }
  };

  const handleRemoveFromCart = async (itemId: number) => {
    try {
      await removeFromCart(itemId);
      success('Item Removed', 'Item removed from cart');
    } catch (err) {
      showError('Remove Failed', 'Failed to remove item');
    }
  };

  const handleMoveToWishlist = async (itemId: number) => {
    const item = cart.items.find(item => item.id === itemId);
    if (item) {
      try {
        await addToWishlist(item.productId);
        await removeFromCart(itemId);
        success('Moved to Wishlist', 'Moved to wishlist successfully!');
      } catch (err) {
        showError('Move Failed', 'Failed to move to wishlist');
      }
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      success('Cart Cleared', 'Cart cleared successfully!');
    } catch (err) {
      showError('Clear Failed', 'Failed to clear cart');
    }
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      showError('Empty Cart', 'Your cart is empty');
      return;
    }

    // Create order data from cart items
    const orderData = {
      items: cart.items.map(item => ({
        id: item.id,
        productId: item.productId,
        product: item.product,
        quantity: item.quantity,
        price: item.product.price
      })),
      subtotal: subtotal,
      shipping: shipping,
      tax: tax,
      total: total,
      orderType: 'cart',
      checkoutDate: new Date().toISOString()
    };

    // Create default address data
    const addressData = {
      id: '1',
      type: 'home',
      name: 'John Doe',
      phone: '+1 (555) 123-4567',
      email: 'john@example.com',
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
    
    console.log('CartPage: Checkout data created and stored');
    console.log('CartPage: Order data:', orderData);
    console.log('CartPage: Address data:', addressData);
    console.log('CartPage: Checkout date:', orderData.checkoutDate);
    console.log('CartPage: Checkout date formatted:', new Date(orderData.checkoutDate).toLocaleString());
    
    navigate('/marketplace/checkout');
  };

  // Calculations
  const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalSavings = cart.items.reduce((sum, item) => {
    const originalPrice = item.product.originalPrice || item.product.price;
    return sum + ((originalPrice - item.product.price) * item.quantity);
  }, 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 35 ? 0 : 5.99; // Free shipping over $35
  const total = subtotal + tax + shipping;

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <X size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading cart</h2>
          <p className="text-gray-600 mb-4">{cartError}</p>
          <button 
            onClick={fetchCart}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
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
                Continue Shopping
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {cart.items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart size={64} className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <Link 
              to="/marketplace" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Cart Items ({cart.items.length})
                    </h2>
                    <button
                      onClick={handleClearCart}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cart.items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-500">{item.product.brand}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-lg font-semibold text-gray-900">
                              ${item.product.price.toFixed(2)}
                            </span>
                            {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                              <span className="ml-2 text-sm text-gray-500 line-through">
                                ${item.product.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            disabled={cartLoading || wishlistLoading}
                            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            disabled={cartLoading || wishlistLoading}
                            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleMoveToWishlist(item.id)}
                            disabled={cartLoading || wishlistLoading}
                            className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50"
                          >
                            <Heart size={16} />
                          </button>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            disabled={cartLoading || wishlistLoading}
                            className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* AI Recommendations */}
              <AIRecommendations type="personalized" />
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({cart.items.length} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Savings</span>
                      <span>-${totalSavings.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={cartLoading || cart.items.length === 0}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex items-center justify-center space-x-2"
                >
                  {cartLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard size={20} />
                      <span>Proceed to Checkout</span>
                    </>
                  )}
                </button>



                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Shield size={16} className="mr-2" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center">
                    <Truck size={16} className="mr-2" />
                    <span>Free shipping on orders over $35</span>
                  </div>
                  <div className="flex items-center">
                    <Package size={16} className="mr-2" />
                    <span>30-day return policy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
