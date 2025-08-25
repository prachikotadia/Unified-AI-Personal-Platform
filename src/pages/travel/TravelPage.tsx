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
  Sparkles
} from 'lucide-react'
import { Link } from 'react-router-dom'
import AIInsights from '../../components/ai/AIInsights'
import AIAssistant from '../../components/ai/AIAssistant'

const TravelPage = () => {
  // Mock travel data
  const upcomingTrips = [
    { 
      id: 1, 
      destination: 'Tokyo, Japan', 
      dates: 'Mar 15-22, 2024', 
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop',
      budget: 2500,
      status: 'confirmed'
    },
    { 
      id: 2, 
      destination: 'Paris, France', 
      dates: 'May 10-17, 2024', 
      image: 'https://images.unsplash.com/photo-1502602898535-0b7b0b7b0b7b?w=300&h=200&fit=crop',
      budget: 3000,
      status: 'planning'
    },
  ]

  const recommendations = [
    { 
      id: 1, 
      destination: 'Bali, Indonesia', 
      price: 1200, 
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=300&h=200&fit=crop',
      rating: 4.8
    },
    { 
      id: 2, 
      destination: 'Santorini, Greece', 
      price: 1800, 
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=300&h=200&fit=crop',
      rating: 4.9
    },
  ]

  return (
    <div className="space-y-6">
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
            <span className="text-sm text-gray-500">{upcomingTrips.length} upcoming trips</span>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-4">
          <Link to="/travel/search" className="btn-secondary flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <span>Search Destinations</span>
          </Link>
          <Link to="/travel/alerts" className="btn-secondary flex items-center space-x-2">
            <Heart className="w-4 h-4" />
            <span>Price Alerts</span>
          </Link>
        </div>
      </motion.div>

      {/* Upcoming Trips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-6">Upcoming Trips</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingTrips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="glass-card p-4 hover:scale-105 transition-transform duration-300"
            >
              <img
                src={trip.image}
                alt={trip.destination}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{trip.destination}</h3>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{trip.dates}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <DollarSign className="w-4 h-4" />
                  <span>Budget: ${trip.budget.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    trip.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}>
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
      </motion.div>

      {/* AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-6">AI Recommendations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="glass-card p-4 hover:scale-105 transition-transform duration-300"
            >
              <img
                src={rec.image}
                alt={rec.destination}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{rec.destination}</h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm">{rec.rating}</span>
                  </div>
                  
                  <span className="font-semibold">${rec.price}</span>
                </div>
                
                <button className="w-full btn-primary text-sm">
                  Plan Trip
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Travel Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
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
    </div>
  )
}

export default TravelPage
