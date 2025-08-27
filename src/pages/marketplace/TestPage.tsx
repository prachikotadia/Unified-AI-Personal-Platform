import React from 'react';
import { useCartStore } from '../../store/cart';
import { useWishlistStore } from '../../store/wishlist';
import { useBuyNowStore } from '../../store/buyNow';
import ProductActionButtons from '../../components/marketplace/ProductActionButtons';

const TestPage = () => {
  const { cart, getCartItemCount } = useCartStore();
  const { items: wishlistItems, getWishlistCount } = useWishlistStore();
  const { currentPurchase } = useBuyNowStore();

  const testProduct = {
    id: 1,
    name: 'Apple iPhone 15 Pro Max - 256GB - Natural Titanium',
    price: 1199.99,
    originalPrice: 1299.99,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
    brand: 'Apple',
    inStock: true
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Marketplace Functionality Test</h1>
        
        {/* Status Display */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Cart</h3>
              <p className="text-2xl font-bold text-blue-600">{getCartItemCount()}</p>
              <p className="text-sm text-blue-700">items</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-medium text-red-900">Wishlist</h3>
              <p className="text-2xl font-bold text-red-600">{getWishlistCount()}</p>
              <p className="text-sm text-red-700">items</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-medium text-orange-900">Buy Now</h3>
              <p className="text-2xl font-bold text-orange-600">
                {currentPurchase ? 'Active' : 'None'}
              </p>
              <p className="text-sm text-orange-700">purchase</p>
            </div>
          </div>
        </div>

        {/* Test Product */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Product</h2>
          <div className="flex items-center space-x-4 mb-4">
            <img
              src={testProduct.image}
              alt={testProduct.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-medium text-gray-900">{testProduct.name}</h3>
              <p className="text-gray-600">{testProduct.brand}</p>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">
                  ${testProduct.price.toFixed(2)}
                </span>
                {testProduct.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    ${testProduct.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <ProductActionButtons
            product={testProduct}
            quantity={1}
            showQuantitySelector={true}
            className="max-w-md"
          />
        </div>

        {/* Cart Items */}
        {cart.items.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cart Items</h2>
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>${cart.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Wishlist Items */}
        {wishlistItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Wishlist Items</h2>
            <div className="space-y-3">
              {wishlistItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">{item.product.brand}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ${item.product.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buy Now Status */}
        {currentPurchase && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Buy Now Status</h2>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="font-medium text-orange-900">
                Ready to purchase: {currentPurchase.product.name}
              </p>
              <p className="text-sm text-orange-700">
                Quantity: {currentPurchase.quantity} | 
                Total: ${(currentPurchase.product.price * currentPurchase.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPage;
