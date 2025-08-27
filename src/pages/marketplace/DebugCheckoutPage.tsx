import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DebugCheckoutPage = () => {
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState<any>({});

  useEffect(() => {
    // Log all session storage data
    const allData: any = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        try {
          allData[key] = JSON.parse(sessionStorage.getItem(key) || '');
        } catch {
          allData[key] = sessionStorage.getItem(key);
        }
      }
    }
    setSessionData(allData);
  }, []);

  const createTestData = () => {
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
      orderType: 'cart'
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

    sessionStorage.setItem('checkoutOrderData', JSON.stringify(testOrderData));
    sessionStorage.setItem('checkoutAddressData', JSON.stringify(testAddressData));
    
    // Refresh the page to show updated data
    window.location.reload();
  };

  const clearAllData = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  const goToPaymentPage = () => {
    navigate('/marketplace/checkout/payment');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Checkout Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Session Storage Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            <button
              onClick={createTestData}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create Test Data
            </button>
            
            <button
              onClick={clearAllData}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 ml-4"
            >
              Clear All Data
            </button>
            
            <button
              onClick={goToPaymentPage}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-4"
            >
              Go to Payment Page
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Checkout Flow Test</h2>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugCheckoutPage;
