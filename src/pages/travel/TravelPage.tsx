import React from 'react'
import { motion } from 'framer-motion'
import { 
  Plane, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Search,
  Heart,
  Star,
  Clock,
  Users,
  ArrowRight,
  Plus,
  Compass,
  Sparkles,
  AlertCircle,
  TrendingUp,
  Globe,
  Briefcase,
  Home,
  Mountain,
  BookOpen,
  Heart as HeartIcon,
  User,
  Users as GroupIcon
} from 'lucide-react'
import { Link } from 'react-router-dom'
import AIInsights from '../../components/ai/AIInsights'
import AIAssistant from '../../components/ai/AIAssistant'
import { SafeImage } from '../../utils/imageUtils'
import useTravel from '../../hooks/useTravel'
import TripModal from '../../components/travel/TripModal'
import FlightSearchModal from '../../components/travel/FlightSearchModal'
import AITravelRecommendations from '../../components/travel/AITravelRecommendations'
import PDFTestButton from '../../components/travel/PDFTestButton'
import { TripCreate } from '../../services/travelAPI'

const TravelPage = () => {
  const {
    // Data
    trips,
    recommendations,
    insights,
    dashboard,
    
    // Loading states
    loading,
    
    // Error states
    errors,
    hasErrors,
    
    // Actions
    createTrip,
    searchFlights,
    
    // Utility functions
    getUpcomingTrips,
    getActiveTrips,
    getCompletedTrips,
    getRecommendationsByCategory,
    
    // Statistics
    stats,
    
    // Utility actions
    clearErrors,
    refreshData,
  } = useTravel()

  const [showTripModal, setShowTripModal] = React.useState(false)
  const [selectedTrip, setSelectedTrip] = React.useState<any>(null)
  const [modalMode, setModalMode] = React.useState<'create' | 'edit'>('create')
  const [showFlightSearchModal, setShowFlightSearchModal] = React.useState(false)

  // Get filtered trips
  const upcomingTrips = getUpcomingTrips()
  const activeTrips = getActiveTrips()
  const completedTrips = getCompletedTrips()

  // Get recommendations by category
  const beachRecommendations = getRecommendationsByCategory('Beach')
  const islandRecommendations = getRecommendationsByCategory('Island')
  const cityRecommendations = getRecommendationsByCategory('City')

  const handleCreateTrip = async (tripData: TripCreate) => {
    try {
      await createTrip(tripData)
      setShowTripModal(false)
    } catch (error) {
      console.error('Failed to create trip:', error)
    }
  }

  const handleEditTrip = (trip: any) => {
    setSelectedTrip(trip)
    setModalMode('edit')
    setShowTripModal(true)
  }

  const handleNewTrip = () => {
    setSelectedTrip(null)
    setModalMode('create')
    setShowTripModal(true)
  }

  const getTripTypeIcon = (type: string) => {
    switch (type) {
      case 'business':
        return <Briefcase className="w-4 h-4" />
      case 'leisure':
        return <Globe className="w-4 h-4" />
      case 'family':
        return <Home className="w-4 h-4" />
      case 'adventure':
        return <Mountain className="w-4 h-4" />
      case 'romantic':
        return <HeartIcon className="w-4 h-4" />
      case 'solo':
        return <User className="w-4 h-4" />
      case 'group':
        return <GroupIcon className="w-4 h-4" />
      default:
        return <Plane className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'booked':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'planning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  if (loading.any) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Travel</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Plan your next adventure with AI-powered recommendations
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Plane className="w-6 h-6 text-blue-500" />
            <span className="text-sm text-gray-500">{stats.totalTrips} total trips</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={handleNewTrip}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Trip</span>
          </button>
          <button
            onClick={() => setShowFlightSearchModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Plane className="w-4 h-4" />
            <span>Search Flights</span>
          </button>
          <button
            onClick={() => setShowFlightSearchModal(true)}
            className="btn-secondary flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
          >
            <BookOpen className="w-4 h-4" />
            <span>Book Flight</span>
          </button>
          <Link to="/travel/search" className="btn-secondary flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <span>Search Destinations</span>
          </Link>
          <Link to="/travel/alerts" className="btn-secondary flex items-center space-x-2">
            <Heart className="w-4 h-4" />
            <span>Price Alerts ({stats.activePriceAlerts})</span>
          </Link>
        </div>
      </motion.div>

      {/* Error Display */}
      {hasErrors.any && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 dark:text-red-400 font-medium">Some data failed to load</span>
          </div>
          <button
            onClick={clearErrors}
            className="text-red-600 dark:text-red-400 text-sm hover:underline mt-1"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Dashboard Stats */}
      {dashboard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-semibold mb-6">Travel Overview</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.upcomingTrips}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.activeTrips}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.completedTrips}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                ${dashboard.total_spent?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Spent</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Upcoming Trips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Upcoming Trips</h2>
          <button
            onClick={handleNewTrip}
            className="btn-secondary flex items-center space-x-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Trip</span>
          </button>
        </div>
        
        {upcomingTrips.length === 0 ? (
          <div className="text-center py-8">
            <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No upcoming trips</h3>
            <p className="text-gray-500 dark:text-gray-500 mb-4">Start planning your next adventure!</p>
            <button
              onClick={handleNewTrip}
              className="btn-primary"
            >
              Plan Your First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="glass-card p-4 hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => handleEditTrip(trip)}
              >
                <SafeImage
                  src={`https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop`}
                  alt={trip.destination}
                  category="travel"
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{trip.title}</h3>
                    {getTripTypeIcon(trip.trip_type)}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{trip.destination}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {trip.budget && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <DollarSign className="w-4 h-4" />
                      <span>Budget: ${trip.budget.toLocaleString()} {trip.currency}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(trip.status)}`}>
                      {trip.status}
                    </span>
                    
                    <button className="btn-secondary text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-6">AI Recommendations</h2>
        
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-500">Loading recommendations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 6).map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="glass-card p-4 hover:scale-105 transition-transform duration-300"
              >
                <SafeImage
                  src={rec.image_url}
                  alt={rec.destination}
                  category="travel"
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{rec.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{rec.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm">{rec.rating}</span>
                    </div>
                    
                    <span className="font-semibold">{rec.price_range}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {rec.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <button className="w-full btn-primary text-sm">
                    Plan Trip
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Active Trips */}
      {activeTrips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-semibold mb-6">Currently Traveling</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="glass-card p-4 border-2 border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Currently Active</span>
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{trip.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">{trip.destination}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                  </span>
                  <button className="btn-secondary text-sm">
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* PDF Test Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <PDFTestButton />
      </motion.div>

      {/* AI Travel Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Sparkles className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold mb-1">AI Travel Recommendations</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Personalized destinations with complete trip planning
            </p>
          </div>
        </div>
        
        <AITravelRecommendations 
          type="personalized" 
          limit={6} 
          showReason={true}
          showConfidence={true}
        />
      </motion.div>

      {/* AI Travel Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass-card p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Sparkles className="w-8 h-8 text-orange-500" />
          <div>
            <h2 className="text-2xl font-bold mb-1">AI Travel Insights</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Smart travel recommendations and planning tips
            </p>
          </div>
        </div>
        
        <AIInsights type="travel" limit={3} />
      </motion.div>

      {/* AI Assistant */}
      <AIAssistant module="travel" />

      {/* Trip Modal */}
      <TripModal
        isOpen={showTripModal}
        onClose={() => setShowTripModal(false)}
        onSubmit={handleCreateTrip}
        trip={selectedTrip}
        mode={modalMode}
      />

      {/* Flight Search Modal */}
      <FlightSearchModal
        isOpen={showFlightSearchModal}
        onClose={() => setShowFlightSearchModal(false)}
        onSearch={searchFlights}
        onSelectFlight={(flight) => {
          console.log('Selected flight:', flight)
          // You can add logic here to save the flight to a trip
        }}
      />
    </div>
  )
}

export default TravelPage
