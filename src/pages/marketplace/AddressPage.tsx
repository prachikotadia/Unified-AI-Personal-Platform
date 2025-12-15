import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Package, 
  Truck, 
  CreditCard,
  CheckCircle,
  Plus,
  MapPin,
  Edit,
  Trash2,
  Home,
  Building,
  User,
  Phone,
  Mail,
  Star
} from 'lucide-react';
import { useToastHelpers } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/auth';
import AddressModal from '../../components/marketplace/AddressModal';

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  name: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressFormData {
  type: 'home' | 'work' | 'other';
  name: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const AddressPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToastHelpers();
  const { user } = useAuthStore();
  
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'home',
      name: user?.displayName || user?.username || 'User',
      phone: '+1 (555) 123-4567',
      email: user?.email || '',
      addressLine1: '123 Main Street',
      addressLine2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      isDefault: true
    },
    {
      id: '2',
      type: 'work',
      name: user?.displayName || user?.username || 'User',
      phone: '+1 (555) 123-4567',
      email: user?.email || '',
      addressLine1: '456 Business Ave',
      addressLine2: 'Suite 200',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      country: 'United States',
      isDefault: false
    }
  ]);
  
  const [selectedAddressId, setSelectedAddressId] = useState<string>('1');
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const orderData = sessionStorage.getItem('checkoutOrderData');
    if (!orderData) {
      showError('No order data found', 'Please start the checkout process again');
      navigate('/marketplace/cart');
    }
  }, [navigate, showError]);

  const handleSaveAddress = async (addressData: Omit<Address, 'id'>): Promise<void> => {
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      if (editingAddress) {
        // Update existing address
        setAddresses(prev => prev.map(addr => {
          if (addr.id === editingAddress.id) {
            const updated = { ...addr, ...addressData };
            // If setting as default, unset others
            if (addressData.isDefault) {
              return updated;
            }
            return updated;
          }
          // Unset other defaults if this is being set as default
          if (addressData.isDefault) {
            return { ...addr, isDefault: false };
          }
          return addr;
        }));
        success('Address updated successfully', 'Your address has been updated');
      } else {
        // Add new address
        const newAddress: Address = {
          id: Date.now().toString(),
          ...addressData,
          isDefault: addresses.length === 0 || addressData.isDefault
        };

        // If setting as default, unset others
        if (addressData.isDefault) {
          setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: false })));
        }

        setAddresses(prev => [...prev, newAddress]);
        setSelectedAddressId(newAddress.id);
        success('Address added successfully', 'Your new address has been saved');
      }

      setEditingAddress(null);
      setShowAddressModal(false);
    } catch (error) {
      showError('Failed to save address', 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAddress = (address: Address): void => {
    setEditingAddress(address);
    setShowAddressModal(true);
  };

  const handleSetAsDefault = async (addressId: string): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      })));
      success('Default address updated', 'Default address has been changed');
    } catch (error) {
      showError('Failed to update default address', 'Please try again');
    }
  };

  const handleDeleteAddress = async (addressId: string): Promise<void> => {
    if (addresses.length <= 1) {
      showError('Cannot delete address', 'You must have at least one address');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      if (selectedAddressId === addressId) {
        setSelectedAddressId(addresses[0]?.id || '');
      }
      success('Address deleted successfully', 'Address has been removed');
    } catch (error) {
      showError('Failed to delete address', 'Please try again');
    }
  };

  const handleContinue = (): void => {
    if (!selectedAddressId) {
      showError('Please select an address', 'You must select a delivery address');
      return;
    }

    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
    if (!selectedAddress) {
      showError('Invalid address selected', 'Please select a valid address');
      return;
    }

    // Store address data in session storage
    sessionStorage.setItem('checkoutAddressData', JSON.stringify(selectedAddress));
    console.log('AddressPage: Address data stored:', selectedAddress);
    navigate('/marketplace/checkout/payment');
  };

  const handleBack = (): void => {
    navigate('/marketplace/cart');
  };

  const getAddressIcon = (type: string): JSX.Element => {
    switch (type) {
      case 'home':
        return <Home className="w-4 h-4" />;
      case 'work':
        return <Building className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Delivery Address</h1>
            <button
              onClick={handleBack}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Review Items</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300 mx-4"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full">
                <Package className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Address</span>
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
          {/* Address Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Select Delivery Address</h2>
                <button
                  onClick={() => {
                    setEditingAddress(null);
                    setShowAddressModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add New Address
                </button>
              </div>
              
              <div className="space-y-4">
                {addresses.map((address) => (
                  <motion.div
                    key={address.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedAddressId === address.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAddressId(address.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                          {getAddressIcon(address.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900">{address.name}</h3>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                              {address.type}
                            </span>
                            {address.isDefault && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{address.phone}</p>
                          <p className="text-sm text-gray-600 mb-1">{address.email}</p>
                          <p className="text-sm text-gray-900">
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </p>
                          <p className="text-sm text-gray-900">
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                          <p className="text-sm text-gray-600">{address.country}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!address.isDefault && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetAsDefault(address.id);
                            }}
                            className="text-gray-400 hover:text-yellow-600 transition-colors"
                            title="Set as Default"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAddress(address);
                          }}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {addresses.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(address.id);
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>


          {/* Continue Button */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Selected Address</h2>
              
              {selectedAddress && (
                <div className="mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      {getAddressIcon(selectedAddress.type)}
                      <span className="font-medium text-gray-900">{selectedAddress.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{selectedAddress.phone}</p>
                    <p className="text-sm text-gray-600 mb-1">{selectedAddress.email}</p>
                    <p className="text-sm text-gray-900">
                      {selectedAddress.addressLine1}
                      {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}
                    </p>
                    <p className="text-sm text-gray-900">
                      {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
                    </p>
                    <p className="text-sm text-gray-600">{selectedAddress.country}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleContinue}
                disabled={!selectedAddressId}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <span>Continue to Review</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Address Modal */}
        <AddressModal
          isOpen={showAddressModal}
          onClose={() => {
            setShowAddressModal(false);
            setEditingAddress(null);
          }}
          onSave={handleSaveAddress}
          editingAddress={editingAddress}
        />
      </div>
    </div>
  );
};

export default AddressPage;
