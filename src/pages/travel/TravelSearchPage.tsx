import { motion } from 'framer-motion'
import { Search, MapPin, Calendar, DollarSign, Star } from 'lucide-react'

const TravelSearchPage = () => {
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
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
          
          <button className="btn-primary">
            Search
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
          {searchResults.map((result, index) => (
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
                
                <button className="w-full btn-primary text-sm">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default TravelSearchPage
