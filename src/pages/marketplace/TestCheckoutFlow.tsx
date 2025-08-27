import React from 'react';
import { useNavigate } from 'react-router-dom';

const TestCheckoutFlow = () => {
  const navigate = useNavigate();

  const testFullCheckoutFlow = () => {
    // Step 1: Create test order data
    const testOrderData = {
      items: [
        {
          id: 1,
          productId: 1,
          product: {
            id: 1,
            name: 'Test Product',
            price: 99.99,
            image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
            brand: 'Test Brand',
            inStock: true
          },
          quantity: 1
        }
      ],
      subtotal: 99.99,
      shipping: 5.99,
      tax: 8.00,
      total: 113.98,
      orderType: 'cart',
      checkoutDate: new Date().toISOString()
    };

    const testAddressData = {
      id: '1',
      type: 'home',
      name: 'John Doe',
      phone: '+1 (555) 123-4567',
      email: 'john@example.com',
      addressLine1: '123 Test Street',
      addressLine2: '',
      city: 'Test City',
      state: 'CA',
      zipCode: '12345',
      country: 'United States',
      isDefault: true
    };

    // Store in session storage
    sessionStorage.setItem('checkoutOrderData', JSON.stringify(testOrderData));
    sessionStorage.setItem('checkoutAddressData', JSON.stringify(testAddressData));
    
    console.log('TestCheckoutFlow: Test data created and stored');
    console.log('TestCheckoutFlow: Order data:', testOrderData);
    console.log('TestCheckoutFlow: Address data:', testAddressData);
    console.log('TestCheckoutFlow: Checkout date:', testOrderData.checkoutDate);
    console.log('TestCheckoutFlow: Checkout date formatted:', new Date(testOrderData.checkoutDate).toLocaleString());
    
    // Navigate to payment page
    navigate('/marketplace/checkout/payment');
  };

  const testInvalidCheckoutError = () => {
    // Clear session storage to simulate invalid checkout data
    sessionStorage.clear();
    console.log('TestCheckoutFlow: Session storage cleared to test error');
    
    // Navigate to payment page to see the error
    navigate('/marketplace/checkout/payment');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test Checkout Flow</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Quick Test</h2>
          <div className="space-y-3">
            <button
              onClick={testFullCheckoutFlow}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Test Full Checkout Flow → Payment Page
            </button>
            <button
              onClick={testInvalidCheckoutError}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-medium"
            >
              Test Invalid Checkout Error (Clear Session Storage)
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Individual Pages</h2>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/marketplace/checkout')}
              className="block w-full text-left bg-gray-100 p-3 rounded hover:bg-gray-200"
            >
              1. Place Order Page
            </button>
            <button
              onClick={() => navigate('/marketplace/checkout/address')}
              className="block w-full text-left bg-gray-100 p-3 rounded hover:bg-gray-200"
            >
              2. Address Page
            </button>
            <button
              onClick={() => navigate('/marketplace/checkout/review')}
              className="block w-full text-left bg-gray-100 p-3 rounded hover:bg-gray-200"
            >
              3. Review Page
            </button>
            <button
              onClick={() => navigate('/marketplace/checkout/payment')}
              className="block w-full text-left bg-gray-100 p-3 rounded hover:bg-gray-200"
            >
              4. Payment Page
            </button>
            <button
              onClick={() => navigate('/marketplace/checkout/success')}
              className="block w-full text-left bg-gray-100 p-3 rounded hover:bg-gray-200"
            >
              5. Success Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCheckoutFlow;
