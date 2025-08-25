import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Save,
  X,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { marketplaceAPI, Address, PaymentMethod } from '../../services/api';
import { useNotifications } from '../../contexts/NotificationContext';

const AccountSettingsPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const { addNotification } = useNotifications();

  // Form states
  const [addressForm, setAddressForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    is_default: false
  });

  const [paymentForm, setPaymentForm] = useState({
    type: 'card',
    last4: '',
    brand: '',
    is_default: false
  });

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      // Note: These endpoints would need to be implemented in the backend
      // For now, we'll use mock data
      const mockAddresses: Address[] = [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          address: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zip_code: '10001',
          country: 'United States',
          is_default: true
        }
      ];

      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: '1',
          type: 'card',
          last4: '4242',
          brand: 'Visa',
          is_default: true
        }
      ];

      setAddresses(mockAddresses);
      setPaymentMethods(mockPaymentMethods);
    } catch (error) {
      console.error('Error fetching account data:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load account data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAddress) {
        // Update existing address
        const updatedAddress = { ...editingAddress, ...addressForm };
        setAddresses(prev => prev.map(addr => 
          addr.id === editingAddress.id ? updatedAddress : addr
        ));
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Address updated successfully'
        });
      } else {
        // Add new address
        const newAddress: Address = {
          id: `addr_${Date.now()}`,
          ...addressForm
        };
        setAddresses(prev => [...prev, newAddress]);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Address added successfully'
        });
      }
      
      resetAddressForm();
    } catch (error) {
      console.error('Error saving address:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save address'
      });
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPayment) {
        // Update existing payment method
        const updatedPayment = { ...editingPayment, ...paymentForm };
        setPaymentMethods(prev => prev.map(pay => 
          pay.id === editingPayment.id ? updatedPayment : pay
        ));
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Payment method updated successfully'
        });
      } else {
        // Add new payment method
        const newPayment: PaymentMethod = {
          id: `pay_${Date.now()}`,
          ...paymentForm
        };
        setPaymentMethods(prev => [...prev, newPayment]);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Payment method added successfully'
        });
      }
      
      resetPaymentForm();
    } catch (error) {
      console.error('Error saving payment method:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save payment method'
      });
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Address deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete address'
      });
    }
  };

  const deletePaymentMethod = async (paymentId: string) => {
    try {
      setPaymentMethods(prev => prev.filter(pay => pay.id !== paymentId));
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Payment method deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting payment method:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete payment method'
      });
    }
  };

  const editAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      first_name: address.first_name,
      last_name: address.last_name,
      email: address.email,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
      country: address.country,
      is_default: address.is_default
    });
    setShowAddressForm(true);
  };

  const editPaymentMethod = (payment: PaymentMethod) => {
    setEditingPayment(payment);
    setPaymentForm({
      type: payment.type,
      last4: payment.last4 || '',
      brand: payment.brand || '',
      is_default: payment.is_default
    });
    setShowPaymentForm(true);
  };

  const resetAddressForm = () => {
    setAddressForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
      is_default: false
    });
    setEditingAddress(null);
    setShowAddressForm(false);
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      type: 'card',
      last4: '',
      brand: '',
      is_default: false
    });
    setEditingPayment(null);
    setShowPaymentForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              to="/marketplace" 
              className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Account Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your addresses and payment methods
              </p>
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Shipping Addresses
              </h2>
            </div>
            <button
              onClick={() => setShowAddressForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus size={16} />
              Add Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No addresses saved yet
              </p>
              <button
                onClick={() => setShowAddressForm(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Add Your First Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <div key={address.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {address.first_name} {address.last_name}
                      </h3>
                      {address.is_default && (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => editAddress(address)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteAddress(address.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>{address.address}</p>
                    <p>{address.city}, {address.state} {address.zip_code}</p>
                    <p>{address.country}</p>
                    <p>Phone: {address.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Payment Methods Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Payment Methods
              </h2>
            </div>
            <button
              onClick={() => setShowPaymentForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus size={16} />
              Add Payment Method
            </button>
          </div>

          {paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No payment methods saved yet
              </p>
              <button
                onClick={() => setShowPaymentForm(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Add Your First Payment Method
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((payment) => (
                <div key={payment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                        {payment.brand} {payment.type}
                      </h3>
                      {payment.is_default && (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => editPaymentMethod(payment)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deletePaymentMethod(payment.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>•••• •••• •••• {payment.last4}</p>
                    <p className="capitalize">{payment.type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Address Form Modal */}
        {showAddressForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button
                  onClick={resetAddressForm}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.first_name}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, first_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.last_name}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, last_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={addressForm.email}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.address}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.state}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.zip_code}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, zip_code: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.country}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={addressForm.is_default}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, is_default: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Set as default address
                  </span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetAddressForm}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {editingAddress ? 'Update' : 'Add'} Address
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Payment Form Modal */}
        {showPaymentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingPayment ? 'Edit Payment Method' : 'Add Payment Method'}
                </h3>
                <button
                  onClick={resetPaymentForm}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Card Type
                  </label>
                  <select
                    value={paymentForm.type}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="card">Credit/Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="apple-pay">Apple Pay</option>
                    <option value="google-pay">Google Pay</option>
                  </select>
                </div>

                {paymentForm.type === 'card' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Card Brand
                      </label>
                      <select
                        value={paymentForm.brand}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, brand: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select Brand</option>
                        <option value="Visa">Visa</option>
                        <option value="Mastercard">Mastercard</option>
                        <option value="American Express">American Express</option>
                        <option value="Discover">Discover</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Last 4 Digits
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        pattern="[0-9]{4}"
                        value={paymentForm.last4}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, last4: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="1234"
                      />
                    </div>
                  </>
                )}

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={paymentForm.is_default}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, is_default: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Set as default payment method
                  </span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetPaymentForm}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {editingPayment ? 'Update' : 'Add'} Payment Method
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettingsPage;
