import { motion } from 'framer-motion'
import { Package, CheckCircle, Clock, Truck, Eye } from 'lucide-react'
import { formatCurrency, formatDateTime } from '../../lib/utils'
import { useMarketplaceStore } from '../../store/marketplace'

const OrdersPage = () => {
  const { orders } = useMarketplaceStore()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-500" />
      case 'processing':
        return <Package className="w-5 h-5 text-purple-500" />
      case 'cancelled':
        return <Clock className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-500'
      case 'shipped':
        return 'text-blue-500'
      case 'processing':
        return 'text-purple-500'
      case 'cancelled':
        return 'text-red-500'
      default:
        return 'text-yellow-500'
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center space-x-3">
          <Package className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold mb-2">Orders</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your order history and status
            </p>
          </div>
        </div>
      </motion.div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{order.id}</h3>
                  <p className="text-sm text-gray-500">{formatDateTime(order.orderDate)}</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(order.total)}</p>
                    <p className={`text-sm capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </p>
                  </div>
                  {getStatusIcon(order.status)}
                </div>
              </div>
              
              <div className="space-y-2">
                {order.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex justify-between text-sm">
                    <span>{item.product.name} (x{item.quantity})</span>
                    <span>{formatCurrency(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <p>Shipped to: {order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                </div>
                <Link 
                  to={`/marketplace/orders/${order.id}`}
                  className="btn-secondary text-sm flex items-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersPage
