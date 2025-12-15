import React, { useState } from 'react';
import { motion } from 'framer-motion'
import { 
  Package, 
  CheckCircle, 
  Clock, 
  Truck, 
  Eye,
  Search,
  Filter,
  Download,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  X,
  Star,
  ShoppingCart,
  MapPin
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency, formatDateTime } from '../../lib/utils'
import { useMarketplaceStore } from '../../store/marketplace'
import { useCartStore } from '../../store/cart'
import { useNotifications } from '../../contexts/NotificationContext'
import OrderTrackingModal from '../../components/marketplace/OrderTrackingModal'
import CancelOrderModal from '../../components/marketplace/CancelOrderModal'
import ReturnRefundModal from '../../components/marketplace/ReturnRefundModal'
import ReviewModal from '../../components/marketplace/ReviewModal'
import OrderFilterModal from '../../components/marketplace/OrderFilterModal'

const OrdersPage = () => {
  const { orders } = useMarketplaceStore()
  const { addToCart } = useCartStore()
  const { addNotification } = useNotifications()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<any>({})
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

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

  // Filter and search orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item: any) => item.product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = !filters.status || order.status === filters.status
    const matchesDateRange = !filters.dateRange || filters.dateRange === 'all' || true // Date filtering logic
    const matchesAmount = (!filters.minAmount || order.total >= filters.minAmount) &&
                         (!filters.maxAmount || order.total <= filters.maxAmount)
    
    return matchesSearch && matchesStatus && matchesDateRange && matchesAmount
  })

  const handleTrackOrder = (order: any) => {
    setSelectedOrder(order)
    setShowTrackingModal(true)
  }

  const handleCancelOrder = (order: any) => {
    setSelectedOrder(order)
    setShowCancelModal(true)
  }

  const handleReturnOrder = (order: any) => {
    setSelectedOrder(order)
    setShowReturnModal(true)
  }

  const handleReorder = async (order: any) => {
    try {
      for (const item of order.items) {
        await addToCart(item.product.id, item.quantity)
      }
      addNotification({
        type: 'success',
        title: 'Items Added to Cart',
        message: 'All items from this order have been added to your cart',
        duration: 3000
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add items to cart',
        duration: 3000
      })
    }
  }

  const handleWriteReview = (order: any) => {
    if (order.items.length > 0) {
      setSelectedOrder(order)
      setShowReviewModal(true)
    }
  }

  const handleCancelOrderConfirm = async (reason: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    addNotification({
      type: 'success',
      title: 'Order Cancelled',
      message: `Order ${selectedOrder.id} has been cancelled`,
      duration: 3000
    })
  }

  const handleReturnConfirm = async (returnData: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    addNotification({
      type: 'success',
      title: 'Return Request Submitted',
      message: 'Your return request has been submitted successfully',
      duration: 3000
    })
  }

  const handleReviewSubmit = async (reviewData: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    addNotification({
      type: 'success',
      title: 'Review Submitted',
      message: 'Thank you for your review!',
      duration: 3000
    })
  }

  const handleExportOrders = (format: 'csv' | 'pdf') => {
    // Export logic
    const data = filteredOrders.map(order => ({
      id: order.id,
      date: formatDateTime(order.orderDate),
      status: order.status,
      total: order.total,
      items: order.items.map((item: any) => item.product.name).join(', ')
    }))

    if (format === 'csv') {
      const csv = [
        ['Order ID', 'Date', 'Status', 'Total', 'Items'].join(','),
        ...data.map(row => [
          row.id,
          row.date,
          row.status,
          row.total,
          `"${row.items}"`
        ].join(','))
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    } else {
      // PDF export would require a library like jsPDF
      addNotification({
        type: 'info',
        title: 'PDF Export',
        message: 'PDF export feature coming soon',
        duration: 3000
      })
    }
  }

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters)
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold mb-2">Orders</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your order history and status
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportOrders('csv')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FileSpreadsheet size={16} />
              Export CSV
            </button>
            <button
              onClick={() => handleExportOrders('pdf')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FileText size={16} />
              Export PDF
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowFilterModal(true)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Filter size={16} />
            Filter
          </button>
        </div>
      </motion.div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {orders.length === 0 ? 'No orders yet' : 'No orders match your search'}
          </h3>
          <p className="text-gray-500 mb-6">
            {orders.length === 0 
              ? 'Start shopping to see your orders here'
              : 'Try adjusting your search or filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
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
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-500">
                    <p>Shipped to: {order.shippingAddress?.firstName || 'N/A'} {order.shippingAddress?.lastName || ''}</p>
                    <p>{order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.state || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Link 
                    to={`/marketplace/orders/${order.id}`}
                    className="btn-secondary text-sm flex items-center space-x-1 px-3 py-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </Link>
                  
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <button
                      onClick={() => handleTrackOrder(order)}
                      className="btn-secondary text-sm flex items-center space-x-1 px-3 py-1.5"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Track Order</span>
                    </button>
                  )}
                  
                  {order.status === 'processing' && (
                    <button
                      onClick={() => handleCancelOrder(order)}
                      className="btn-secondary text-sm flex items-center space-x-1 px-3 py-1.5 text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  )}
                  
                  {(order.status === 'delivered' || order.status === 'shipped') && (
                    <button
                      onClick={() => handleReturnOrder(order)}
                      className="btn-secondary text-sm flex items-center space-x-1 px-3 py-1.5"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Return/Refund</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleReorder(order)}
                    className="btn-secondary text-sm flex items-center space-x-1 px-3 py-1.5"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Reorder</span>
                  </button>
                  
                  {order.status === 'delivered' && (
                    <button
                      onClick={() => handleWriteReview(order)}
                      className="btn-secondary text-sm flex items-center space-x-1 px-3 py-1.5"
                    >
                      <Star className="w-4 h-4" />
                      <span>Write Review</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <OrderFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />

      <OrderTrackingModal
        isOpen={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
        orderId={selectedOrder?.id || ''}
        trackingNumber={selectedOrder?.trackingNumber}
      />

      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        orderId={selectedOrder?.id || ''}
        orderNumber={selectedOrder?.id || ''}
        onCancel={handleCancelOrderConfirm}
      />

      <ReturnRefundModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        orderId={selectedOrder?.id || ''}
        orderNumber={selectedOrder?.id || ''}
        items={selectedOrder?.items || []}
        onReturn={handleReturnConfirm}
      />

      {selectedOrder && selectedOrder.items && selectedOrder.items.length > 0 && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false)
            setSelectedOrder(null)
          }}
          productId={selectedOrder.items[0].product.id}
          productName={selectedOrder.items[0].product.name}
          productImage={selectedOrder.items[0].product.image}
          orderId={selectedOrder.id}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  )
}

export default OrdersPage
