import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bell, 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  TrendingDown, 
  TrendingUp,
  Target,
  Calendar,
  Mail,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Filter,
  Search,
  RefreshCw,
  Settings,
  X
} from 'lucide-react';
import PriceAlertModal from '../../components/marketplace/PriceAlertModal';

interface PriceAlert {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  brand: string;
  currentPrice: number;
  targetPrice: number;
  alertType: 'drop' | 'increase';
  notificationType: 'email' | 'push' | 'both';
  status: 'active' | 'triggered' | 'expired' | 'cancelled';
  createdAt: string;
  triggeredAt?: string;
  expiresAt: string;
}

const PriceAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'triggered' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      // Mock data
      const mockAlerts: PriceAlert[] = [
        {
          id: '1',
          productId: '1',
          productName: 'Apple iPhone 15 Pro Max - 256GB - Natural Titanium',
          productImage: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
          brand: 'Apple',
          currentPrice: 1199.99,
          targetPrice: 1099.99,
          alertType: 'drop',
          notificationType: 'both',
          status: 'active',
          createdAt: '2024-01-15T10:00:00Z',
          expiresAt: '2024-02-15T10:00:00Z'
        },
        {
          id: '2',
          productId: '2',
          productName: 'Sony WH-1000XM4 Wireless Noise-Canceling Headphones',
          productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
          brand: 'Sony',
          currentPrice: 349.99,
          targetPrice: 299.99,
          alertType: 'drop',
          notificationType: 'email',
          status: 'triggered',
          createdAt: '2024-01-10T10:00:00Z',
          triggeredAt: '2024-01-20T10:00:00Z',
          expiresAt: '2024-02-10T10:00:00Z'
        },
        {
          id: '3',
          productId: '3',
          productName: 'Samsung 65" QLED 4K Smart TV',
          productImage: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
          brand: 'Samsung',
          currentPrice: 1299.99,
          targetPrice: 1399.99,
          alertType: 'increase',
          notificationType: 'push',
          status: 'active',
          createdAt: '2024-01-12T10:00:00Z',
          expiresAt: '2024-02-12T10:00:00Z'
        },
        {
          id: '4',
          productId: '4',
          productName: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
          productImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
          brand: 'Instant Pot',
          currentPrice: 89.99,
          targetPrice: 79.99,
          alertType: 'drop',
          notificationType: 'both',
          status: 'expired',
          createdAt: '2023-12-15T10:00:00Z',
          expiresAt: '2024-01-15T10:00:00Z'
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 1000));
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = (alert: any) => {
    setAlerts(prev => [alert, ...prev]);
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleEditAlert = (alert: PriceAlert) => {
    setSelectedProduct({
      id: alert.productId,
      name: alert.productName,
      price: alert.currentPrice,
      image: alert.productImage,
      brand: alert.brand
    });
    setShowCreateModal(true);
  };

  const getFilteredAlerts = () => {
    let filtered = alerts;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(alert => alert.status === filter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(alert =>
        alert.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'triggered':
        return 'text-blue-600 bg-blue-100';
      case 'expired':
        return 'text-gray-600 bg-gray-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4" />;
      case 'triggered':
        return <CheckCircle className="w-4 h-4" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'push':
        return <Smartphone className="w-4 h-4" />;
      case 'both':
        return <div className="flex space-x-1"><Mail className="w-4 h-4" /><Smartphone className="w-4 h-4" /></div>;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const filteredAlerts = getFilteredAlerts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
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
                Back to Marketplace
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-blue-600">
                <Bell className="w-6 h-6" />
                <h1 className="text-2xl font-bold text-gray-900">Price Alerts</h1>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
                <Bell className="w-3 h-3" />
                <span>{alerts.length} Active</span>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Alert</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'All', count: alerts.length },
                { value: 'active', label: 'Active', count: alerts.filter(a => a.status === 'active').length },
                { value: 'triggered', label: 'Triggered', count: alerts.filter(a => a.status === 'triggered').length },
                { value: 'expired', label: 'Expired', count: alerts.filter(a => a.status === 'expired').length }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label} ({option.count})
                </button>
              ))}
            </div>

            <button
              onClick={fetchAlerts}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery || filter !== 'all' ? 'No alerts found' : 'No price alerts yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first price alert to get notified when prices drop'
                }
              </p>
              {!searchQuery && filter === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Alert</span>
                </button>
              )}
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-start space-x-4">
                  {/* Product Image */}
                  <img
                    src={alert.productImage}
                    alt={alert.productName}
                    className="w-20 h-20 object-cover rounded-lg"
                  />

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{alert.productName}</h3>
                        <p className="text-sm text-gray-600">{alert.brand}</p>
                        
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Current:</span>
                            <span className="font-semibold text-gray-900">${alert.currentPrice}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Target:</span>
                            <span className="font-semibold text-blue-600">${alert.targetPrice}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {alert.alertType === 'drop' ? (
                              <TrendingDown className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingUp className="w-4 h-4 text-red-600" />
                            )}
                            <span className="text-sm text-gray-600 capitalize">{alert.alertType}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                          {getStatusIcon(alert.status)}
                          <span className="capitalize">{alert.status}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {getNotificationIcon(alert.notificationType)}
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEditAlert(alert)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/marketplace/product/${alert.productId}`}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Created {new Date(alert.createdAt).toLocaleDateString()}</span>
                        </div>
                        {alert.triggeredAt && (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Triggered {new Date(alert.triggeredAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Expires {new Date(alert.expiresAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {alert.status === 'active' && (
                        <div className="text-sm text-gray-600">
                          {Math.ceil((new Date(alert.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Create Alert Modal */}
      {showCreateModal && (
        <PriceAlertModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct || {
            id: '',
            name: 'Select a product',
            price: 0,
            image: '',
            brand: ''
          }}
          onAlertCreated={handleCreateAlert}
        />
      )}
    </div>
  );
};

export default PriceAlertsPage;
