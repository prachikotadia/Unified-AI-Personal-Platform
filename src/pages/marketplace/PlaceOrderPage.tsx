import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  ShoppingCart, 
  Package, 
  Truck, 
  CreditCard,
  CheckCircle,
  Edit,
  Trash2,
  Plus,
  Minus
} from 'lucide-react';
import { useBuyNowStore } from '../../store/buyNow';
import { useCartStore } from '../../store/cart';

const PlaceOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentPurchase, clearBuyNowItem } = useBuyNowStore();
  const { cart, updateCartItem, removeFromCart } = useCartStore();
  
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [orderType, setOrderType] = useState<'buyNow' | 'cart'>('cart');

  useEffect(() => {
    console.log('PlaceOrderPage: Component mounted');
    
    // Check if there's existing session storage data
    const existingOrderData = sessionStorage.getItem('checkoutOrderData');
    const existingAddressData = sessionStorage.getItem('checkoutAddressData');
    
    console.log('PlaceOrderPage: Existing order data:', existingOrderData);
    console.log('PlaceOrderPage: Existing address data:', existingAddressData);
    
    if (existingOrderData && existingAddressData) {
      try {
        const parsedOrderData = JSON.parse(existingOrderData);
        console.log('PlaceOrderPage: Using existing session storage data:', parsedOrderData);
        
        // Use existing session storage data
        setOrderItems(parsedOrderData.items || []);
        setOrderType(parsedOrderData.orderType || 'cart');
        return;
      } catch (error) {
        console.log('PlaceOrderPage: Error parsing existing data, creating new data');
      }
    }
    
    // Create new data if no existing session storage data
    if (currentPurchase) {
      setOrderItems([{
        id: Date.now(),
        productId: currentPurchase.productId,
        product: currentPurchase.product,
        quantity: currentPurchase.quantity,
        price: currentPurchase.product.price
      }]);
      setOrderType('buyNow');
    } else if (cart.items.length > 0) {
      setOrderItems(cart.items.map(item => ({
        id: item.id,
        productId: item.productId,
        product: item.product,
        quantity: item.quantity,
        price: item.product.price
      })));
      setOrderType('cart');
    } else {
      // No items to order, redirect to marketplace
      navigate('/marketplace');
    }
  }, [currentPurchase, cart.items, navigate]);

  const updateQuantity = (itemId: number, newQuantity: number): void => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    if (orderType === 'cart') {
      updateCartItem(itemId, newQuantity);
    } else {
      setOrderItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeItem = (itemId: number): void => {
    if (orderType === 'cart') {
      removeFromCart(itemId);
    } else {
      setOrderItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const getSubtotal = (): number => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getShipping = (): number => {
    return getSubtotal() > 50 ? 0 : 5.99; // Free shipping over $50
  };

  const getTax = (): number => {
    return getSubtotal() * 0.08; // 8% tax
  };

  const getTotal = (): number => {
    return getSubtotal() + getShipping() + getTax();
  };

  const handleContinue = (): void => {
    if (orderItems.length === 0) {
      return;
    }

    // Get existing address data if available
    const existingAddressData = sessionStorage.getItem('checkoutAddressData');
    let addressData = null;
    
    if (existingAddressData) {
      try {
        addressData = JSON.parse(existingAddressData);
        console.log('PlaceOrderPage: Preserving existing address data:', addressData);
      } catch (error) {
        console.log('PlaceOrderPage: Error parsing existing address data');
      }
    }

    // Store order data in session storage for the checkout flow
    const orderData = {
      items: orderItems,
      subtotal: getSubtotal(),
      shipping: getShipping(),
      tax: getTax(),
      total: getTotal(),
      orderType,
      checkoutDate: new Date().toISOString()
    };
    sessionStorage.setItem('checkoutOrderData', JSON.stringify(orderData));
    
    // Preserve existing address data if available
    if (addressData) {
      sessionStorage.setItem('checkoutAddressData', JSON.stringify(addressData));
    }
    
    console.log('PlaceOrderPage: Order data stored:', orderData);
    console.log('PlaceOrderPage: Checkout date:', orderData.checkoutDate);
    console.log('PlaceOrderPage: Checkout date formatted:', new Date(orderData.checkoutDate).toLocaleString());
    
    navigate('/marketplace/checkout/address');
  };

  const handleBackToCart = (): void => {
    if (orderType === 'buyNow') {
      clearBuyNowItem();
    }
    navigate('/marketplace/cart');
  };

  if (orderItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Items to Order</h2>
          <p className="text-gray-600 mb-4">Please add items to your cart first</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Place Order</h1>
            <button
              onClick={handleBackToCart}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to Cart
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Review Items</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300 mx-4"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full">
                <Package className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Address</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300 mx-4"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full">
                <Truck className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Review</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300 mx-4"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
              
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 line-clamp-2">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600">{item.product.brand}</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 mt-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {getShipping() === 0 ? 'Free' : `$${getShipping().toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${getTax().toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleContinue}
                disabled={orderItems.length === 0}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <span>Continue to Address</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderPage;
