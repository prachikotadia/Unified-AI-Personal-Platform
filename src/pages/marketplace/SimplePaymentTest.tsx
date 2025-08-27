import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SimplePaymentTest = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const handlePlaceOrder = () => {
    console.log('SimplePaymentTest: Place order clicked');
    alert('Order placed successfully!');
    navigate('/marketplace');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Simple Payment Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
          
          <div className="space-y-3 mb-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              Cash on Delivery (COD)
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              Credit Card
            </label>
          </div>

          <div className="bg-gray-100 p-4 rounded mb-6">
            <h3 className="font-semibold mb-2">Order Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>$99.99</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>$5.99</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>$8.00</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-1">
                <span>Total:</span>
                <span>$113.98</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
          >
            Place Order
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/marketplace')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimplePaymentTest;
