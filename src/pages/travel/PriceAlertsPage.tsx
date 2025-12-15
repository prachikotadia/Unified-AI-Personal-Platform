import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  Bell, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Edit, 
  Eye,
  ToggleLeft,
  ToggleRight,
  Plane
} from 'lucide-react'
import { useToastHelpers } from '../../components/ui/Toast'
import PriceAlertModal from '../../components/travel/PriceAlertModal'

const PriceAlertsPage = () => {
  const { success, error: showError } = useToastHelpers()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAlert, setEditingAlert] = useState<any>(null)
  const [allAlertsEnabled, setAllAlertsEnabled] = useState(true)

  const [mockAlerts, setMockAlerts] = useState([
    {
      id: 1,
      route: 'New York → London',
      currentPrice: 450,
      targetPrice: 400,
      status: 'active',
      lastChecked: '2 hours ago',
      trend: 'down'
    },
    {
      id: 2,
      route: 'San Francisco → Tokyo',
      currentPrice: 1200,
      targetPrice: 1000,
      status: 'triggered',
      lastChecked: '1 day ago',
      trend: 'up'
    },
    {
      id: 3,
      route: 'Paris → Rome',
      currentPrice: 180,
      targetPrice: 150,
      status: 'active',
      lastChecked: '3 hours ago',
      trend: 'down'
    },
    {
      id: 4,
      route: 'Sydney → Bali',
      currentPrice: 650,
      targetPrice: 500,
      status: 'active',
      lastChecked: '5 hours ago',
      trend: 'up'
    }
  ])

  const handleCreateAlert = () => {
    setEditingAlert(null)
    setShowCreateModal(true)
  }

  const handleEditAlert = (alert: any) => {
    setEditingAlert(alert)
    setShowCreateModal(true)
  }

  const handleDeleteAlert = (alertId: number) => {
    if (window.confirm('Are you sure you want to delete this price alert?')) {
      setMockAlerts(prev => prev.filter(a => a.id !== alertId))
      success('Alert Deleted', 'Price alert has been removed')
    }
  }

  const handleToggleAllAlerts = () => {
    setAllAlertsEnabled(!allAlertsEnabled)
    setMockAlerts(prev => prev.map(a => ({ ...a, status: !allAlertsEnabled ? 'active' : 'disabled' })))
    success('Alerts Updated', `All alerts ${!allAlertsEnabled ? 'enabled' : 'disabled'}`)
  }

  const handleViewFlight = (alert: any) => {
    // Navigate to flight search or details
    success('Viewing Flight', `Opening flight details for ${alert.route}`)
  }

  const handleSaveAlert = (alertData: any) => {
    if (editingAlert) {
      setMockAlerts(prev => prev.map(a => 
        a.id === editingAlert.id ? { ...a, ...alertData } : a
      ))
      success('Alert Updated', 'Price alert has been updated')
    } else {
      const newAlert = {
        id: mockAlerts.length + 1,
        ...alertData,
        status: 'active',
        lastChecked: 'Just now',
        trend: 'stable'
      }
      setMockAlerts(prev => [...prev, newAlert])
      success('Alert Created', 'New price alert has been created')
    }
    setShowCreateModal(false)
    setEditingAlert(null)
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Bell className="w-8 h-8 text-orange-500" />
            <div>
              <h1 className="text-3xl font-bold mb-2">Price Alerts</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track flight prices and get notified when they drop
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {allAlertsEnabled ? (
                <ToggleRight 
                  className="w-6 h-6 text-green-600 cursor-pointer" 
                  onClick={handleToggleAllAlerts}
                />
              ) : (
                <ToggleLeft 
                  className="w-6 h-6 text-gray-400 cursor-pointer" 
                  onClick={handleToggleAllAlerts}
                />
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {allAlertsEnabled ? 'Disable All' : 'Enable All'}
              </span>
            </div>
            <button 
              onClick={handleCreateAlert}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Alert</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">4</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-green-500">1</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Price Drops</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">$150</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Saved</div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        {mockAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold">{alert.route}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alert.status === 'active'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}
                  >
                    {alert.status === 'active' ? 'Active' : 'Triggered'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Current Price</div>
                    <div className="font-semibold">${alert.currentPrice}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Target Price</div>
                    <div className="font-semibold">${alert.targetPrice}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Last Checked</div>
                    <div className="font-semibold">{alert.lastChecked}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Trend</div>
                    <div className="flex items-center space-x-1">
                      {alert.trend === 'down' ? (
                        <TrendingDown className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-semibold capitalize">{alert.trend}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleViewFlight(alert)}
                  className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                  title="View Flight"
                >
                  <Plane className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditAlert(alert)}
                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-4">Create New Price Alert</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">From</label>
            <input
              type="text"
              placeholder="Departure city"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">To</label>
            <input
              type="text"
              placeholder="Destination city"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Target Price</label>
            <input
              type="number"
              placeholder="Enter target price"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Travel Dates</label>
            <input
              type="text"
              placeholder="Select dates"
              className="input-field"
            />
          </div>
        </div>
        <div className="mt-4">
          <button 
            onClick={handleCreateAlert}
            className="btn-primary"
          >
            Create Alert
          </button>
        </div>
      </motion.div>

      {/* Price Alert Modal */}
      <PriceAlertModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setEditingAlert(null)
        }}
        alert={editingAlert}
        onSave={handleSaveAlert}
      />
    </div>
  )
}

export default PriceAlertsPage
