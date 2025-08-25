import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  ChevronRight
} from 'lucide-react';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  inStock: boolean;
  fastDelivery: boolean;
  isPrime: boolean;
  brand: string;
  rating: number;
  reviewCount: number;
}

interface SavedItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand: string;
  rating: number;
  reviewCount: number;
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      const mockCartItems: CartItem[] = [
        {
          id: '1',
          productId: '1',
          name: 'Apple iPhone 15 Pro Max - 256GB - Natural Titanium',
          price: 1199.99,
          originalPrice: 1299.99,
          image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
          quantity: 1,
          inStock: true,
          fastDelivery: true,
          isPrime: true,
          brand: 'Apple',
          rating: 4.8,
          reviewCount: 1247
        },
        {
          id: '2',
          productId: '5',
          name: 'Sony WH-1000XM4 Wireless Noise-Canceling Headphones',
          price: 349.99,
          originalPrice: 399.99,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
          quantity: 2,
          inStock: true,
          fastDelivery: true,
          isPrime: true,
          brand: 'Sony',
          rating: 4.8,
          reviewCount: 1892
        },
        {
          id: '3',
          productId: '4',
          name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
          price: 89.99,
          originalPrice: 119.99,
          image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
          quantity: 1,
          inStock: true,
          fastDelivery: true,
          isPrime: true,
          brand: 'Instant Pot',
          rating: 4.7,
          reviewCount: 3421
        }
      ];

      const mockSavedItems: SavedItem[] = [
        {
          id: '1',
          productId: '2',
          name: 'Samsung 65" QLED 4K Smart TV',
          price: 1299.99,
          originalPrice: 1799.99,
          image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
          brand: 'Samsung',
          rating: 4.6,
          reviewCount: 892
        },
        {
          id: '2',
          productId: '8',
          name: 'Apple MacBook Pro 14" - M3 Pro Chip',
          price: 1999.99,
          originalPrice: 2199.99,
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
          brand: 'Apple',
          rating: 4.9,
          reviewCount: 567
        }
      ];

      setCartItems(mockCartItems);
      setSavedItems(mockSavedItems);
      setLoading(false);
    }, 1000);
  }, []);

  const updateQuantity = (itemId: string, change: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const moveToSaved = (itemId: string) => {
    const item = cartItems.find(cartItem => cartItem.id === itemId);
    if (item) {
      const savedItem: SavedItem = {
        id: item.id,
        productId: item.productId,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
        brand: item.brand,
        rating: item.rating,
        reviewCount: item.reviewCount
      };
      setSavedItems(prev => [...prev, savedItem]);
      removeFromCart(itemId);
    }
  };

  const moveToCart = (itemId: string) => {
    const item = savedItems.find(savedItem => savedItem.id === itemId);
    if (item) {
      const cartItem: CartItem = {
        ...item,
        quantity: 1,
        inStock: true,
        fastDelivery: true,
        isPrime: true
      };
      setCartItems(prev => [...prev, cartItem]);
      setSavedItems(prev => prev.filter(savedItem => savedItem.id !== itemId));
    }
  };

  const removeFromSaved = (itemId: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== itemId));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalSavings = cartItems.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + ((item.originalPrice - item.price) * item.quantity);
    }
    return sum;
  }, 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 35 ? 0 : 5.99; // Free shipping over $35
  const total = subtotal + tax + shipping;

  if (loading) {
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
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart size={48} className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Link
              to="/marketplace"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Cart ({cartItems.length} items)
                </h2>
                
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                            <p className="text-sm text-gray-600">{item.brand}</p>
                            <div className="flex items-center mt-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    className={i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600 ml-1">({item.reviewCount})</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 mt-2">
                              {item.isPrime && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  Prime
                                </span>
                              )}
                              {item.fastDelivery && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  Fast Delivery
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-gray-900">${item.price}</span>
                              {item.originalPrice && (
                                <span className="text-sm text-gray-500 line-through">${item.originalPrice}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-12 text-center py-1 border border-gray-300 rounded">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => moveToSaved(item.id)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Save for later
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                  ))}
                </div>
              </div>

              {/* Saved Items */}
              {savedItems.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Saved for later ({savedItems.length} items)
                  </h2>
                  
                  <div className="space-y-4">
                    {savedItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                              <p className="text-sm text-gray-600">{item.brand}</p>
                              <div className="flex items-center mt-1">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={14}
                                      className={i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600 ml-1">({item.reviewCount})</span>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-gray-900">${item.price}</span>
                                {item.originalPrice && (
                                  <span className="text-sm text-gray-500 line-through">${item.originalPrice}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <button
                              onClick={() => moveToCart(item.id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                              Move to Cart
                            </button>
                            
                            <button
                              onClick={() => removeFromSaved(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Total Savings</span>
                      <span>-${totalSavings.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mt-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      Apply
                    </button>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-4 flex items-center justify-center space-x-2"
                >
                  <Lock size={16} />
                  <span>Proceed to Checkout</span>
                  <ChevronRight size={16} />
                </button>

                {/* Security Notice */}
                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <Shield size={16} className="mr-1" />
                    <span>Secure checkout</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Truck size={16} className="mr-2" />
                    <span>Free delivery by {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Package size={16} className="mr-2" />
                    <span>30-day return policy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Checkout</h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <CreditCard size={48} className="text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Methods</h3>
                <p className="text-gray-600 mb-4">Choose your preferred payment method</p>
              </div>
              
              <div className="space-y-3">
                <button className="w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center space-x-3">
                    <CreditCard size={20} className="text-blue-600" />
                    <div>
                      <div className="font-medium">Credit/Debit Card</div>
                      <div className="text-sm text-gray-600">Visa, Mastercard, American Express</div>
                    </div>
                  </div>
                </button>
                
                <button className="w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center space-x-3">
                    <Package size={20} className="text-green-600" />
                    <div>
                      <div className="font-medium">PayPal</div>
                      <div className="text-sm text-gray-600">Pay with your PayPal account</div>
                    </div>
                  </div>
                </button>
                
                <button className="w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center space-x-3">
                    <Truck size={20} className="text-orange-600" />
                    <div>
                      <div className="font-medium">Cash on Delivery</div>
                      <div className="text-sm text-gray-600">Pay when you receive your order</div>
                    </div>
                  </div>
                </button>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
