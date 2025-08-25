import { motion } from 'framer-motion'
import { Bell, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react'

const PriceAlertsPage = () => {
  const mockAlerts = [
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
  ]

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
          <button className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Alert</span>
          </button>
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
                <button className="p-2 text-gray-500 hover:text-blue-500 transition-colors">
                  <Bell className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-red-500 transition-colors">
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
          <button className="btn-primary">Create Alert</button>
        </div>
      </motion.div>
    </div>
  )
}

export default PriceAlertsPage
