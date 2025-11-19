import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  CheckCircle, 
  Plus,
  Edit,
  Trash2,
  Lock
} from 'lucide-react'
import { formatCurrency } from '../../lib/utils'
import { useMarketplaceStore } from '../../store/marketplace'
import { useNotifications } from '../../contexts/NotificationContext'
import { Link, useNavigate } from 'react-router-dom'

const CheckoutPage = () => {
  const { cart, addresses, paymentMethods, createOrder, clearCart } = useMarketplaceStore()
  const { addNotification } = useNotifications()
  const navigate = useNavigate()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedAddress, setSelectedAddress] = useState(addresses.find(addr => addr.isDefault)?.id || '')
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods.find(pay => pay.isDefault)?.id || '')
  const [isProcessing, setIsProcessing] = useState(false)

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  const shipping = subtotal > 100 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedPayment) {
      addNotification({
        type: 'error',
        title: 'Missing Information',
        message: 'Please select shipping address and payment method'
      })
      return
    }

    setIsProcessing(true)
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const address = addresses.find(addr => addr.id === selectedAddress)!
    const payment = paymentMethods.find(pay => pay.id === selectedPayment)!
    
    createOrder({
      items: cart,
      subtotal,
      shipping,
      tax,
      total,
      status: 'pending',
      shippingAddress: address,
      paymentMethod: payment
    })
    
    clearCart()
    addNotification({
      type: 'success',
      title: 'Order Placed!',
      message: 'Your order has been successfully placed'
    })
    
    navigate('/marketplace/orders')
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <Link to="/marketplace" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center space-x-3">
          <Link to="/marketplace/cart" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold mb-2">Checkout</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Complete your purchase
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checkout Steps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-blue-gradient-from text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                {currentStep > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
              </div>
              <div>
                <h2 className="text-xl font-semibold">Shipping Address</h2>
                <p className="text-sm text-gray-500">Where should we ship your order?</p>
              </div>
            </div>

            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedAddress === address.id
                      ? 'border-blue-gradient-from bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedAddress(address.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{address.firstName} {address.lastName}</h3>
                      <p className="text-sm text-gray-600">{address.address}</p>
                      <p className="text-sm text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
                      <p className="text-sm text-gray-600">{address.phone}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-500 hover:text-blue-500">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-500 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>
          </motion.div>

          {/* Payment Method */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-blue-gradient-from text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                {currentStep > 2 ? <CheckCircle className="w-4 h-4" /> : '2'}
              </div>
              <div>
                <h2 className="text-xl font-semibold">Payment Method</h2>
                <p className="text-sm text-gray-500">How would you like to pay?</p>
              </div>
            </div>

            <div className="space-y-4">
              {paymentMethods.map((payment) => (
                <div
                  key={payment.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedPayment === payment.id
                      ? 'border-blue-gradient-from bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPayment(payment.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5" />
                      <div>
                        <h3 className="font-semibold capitalize">{payment.type}</h3>
                        {payment.last4 && (
                          <p className="text-sm text-gray-600">•••• {payment.last4}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-500 hover:text-blue-500">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-500 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Payment Method</span>
              </button>
            </div>
          </motion.div>

          {/* Order Review */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? 'bg-blue-gradient-from text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                3
              </div>
              <div>
                <h2 className="text-xl font-semibold">Order Review</h2>
                <p className="text-sm text-gray-500">Review your order before placing it</p>
              </div>
            </div>

            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.product.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 h-fit"
        >
          <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal ({cart.length} items)</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
            </div>

            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {subtotal < 100 && (
              <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                Add ${formatCurrency(100 - subtotal)} more for free shipping!
              </div>
            )}

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Lock className="w-4 h-4" />
              <span>Secure checkout powered by Stripe</span>
            </div>
            
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing || !selectedAddress || !selectedPayment}
              className="w-full btn-primary mt-6 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Place Order</span>
                  <Lock className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default CheckoutPage
