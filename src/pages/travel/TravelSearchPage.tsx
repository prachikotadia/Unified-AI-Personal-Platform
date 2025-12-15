import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Star, 
  Filter, 
  ArrowDownUp,
  Eye,
  Heart,
  Brain,
  Bookmark
} from 'lucide-react'
import { useToastHelpers } from '../../components/ui/Toast'
import AISearchAssistantModal from '../../components/marketplace/AISearchAssistantModal'

const TravelSearchPage = () => {
  const navigate = useNavigate()
  const { success } = useToastHelpers()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [savedDestinations, setSavedDestinations] = useState<string[]>([])

  // Mock search results
  const searchResults = [
    { 
      id: 1, 
      destination: 'Bali, Indonesia', 
      price: 1200, 
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=300&h=200&fit=crop',
      rating: 4.8,
      duration: '7 days',
      description: 'Tropical paradise with beautiful beaches and culture'
    },
    { 
      id: 2, 
      destination: 'Santorini, Greece', 
      price: 1800, 
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=300&h=200&fit=crop',
      rating: 4.9,
      duration: '6 days',
      description: 'Stunning sunsets and white-washed buildings'
    },
    { 
      id: 3, 
      destination: 'Kyoto, Japan', 
      price: 2200, 
      image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=300&h=200&fit=crop',
      rating: 4.7,
      duration: '8 days',
      description: 'Traditional temples and cherry blossoms'
    },
  ]

  const handleSearch = () => {
    // Search logic would go here
    success('Searching', 'Searching for destinations...')
  }

  const handleViewDetails = (destination: any) => {
    // Navigate to destination details or open modal
    console.log('View details for:', destination)
  }

  const handlePlanTrip = (destination: any) => {
    // Navigate to trip planning with destination pre-filled
    navigate('/travel', { state: { destination: destination.destination } })
  }

  const handleSaveDestination = (destinationId: number) => {
    setSavedDestinations(prev => 
      prev.includes(destinationId.toString())
        ? prev.filter(id => id !== destinationId.toString())
        : [...prev, destinationId.toString()]
    )
    success('Destination Saved', 'Destination has been saved')
  }

  const handleSort = (sortType: string) => {
    setSortBy(sortType)
    // Sort logic would go here
  }

  const sortedResults = [...searchResults].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        return b.rating - a.rating
      default:
        return 0
    }
  })

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Search Destinations</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Find your perfect travel destination
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Where to?"
              className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-black/50 rounded-lg border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-gradient-from"
            />
          </div>
          
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-black/50 rounded-lg border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-gradient-from"
            />
          </div>
          
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-black/50 rounded-lg border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-gradient-from">
              <option>Any Budget</option>
              <option>$500 - $1000</option>
              <option>$1000 - $2000</option>
              <option>$2000+</option>
            </select>
          </div>
          
          <button 
            onClick={handleSearch}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors pr-8 font-medium shadow-sm appearance-none cursor-pointer"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
            <ArrowDownUp className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-500" />
          </div>
          <button
            onClick={() => setShowAIAssistant(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
          >
            <Brain className="w-4 h-4" />
            AI Destination Finder
          </button>
        </div>
      </motion.div>

      {/* Search Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-6">Search Results</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedResults.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="glass-card p-4 hover:scale-105 transition-transform duration-300"
            >
              <img
                src={result.image}
                alt={result.destination}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{result.destination}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm">{result.rating}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">{result.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{result.duration}</span>
                  <span className="font-semibold text-lg">${result.price}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(result)}
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm flex items-center justify-center gap-1 font-medium shadow-sm"
                  >
                    <Eye className="w-3 h-3" />
                    View Details
                  </button>
                  <button
                    onClick={() => handlePlanTrip(result)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-md hover:shadow-lg"
                  >
                    Plan Trip
                  </button>
                  <button
                    onClick={() => handleSaveDestination(result.id)}
                    className={`px-3 py-2 border rounded-lg transition-colors text-sm font-medium shadow-sm ${
                      savedDestinations.includes(result.id.toString())
                        ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    title="Save"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Search Assistant Modal */}
      <AISearchAssistantModal
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        currentQuery={searchQuery}
        onRefine={(refinedQuery: string, suggestions: string[]) => {
          setSearchQuery(refinedQuery)
          // Apply filters logic would go here
        }}
      />
    </div>
  )
}

export default TravelSearchPage
