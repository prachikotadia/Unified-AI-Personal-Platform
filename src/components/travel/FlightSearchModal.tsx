import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Plane, Clock, DollarSign, Star, ExternalLink, BookOpen, Wifi, WifiOff, AlertCircle } from 'lucide-react'
import { FlightSearchRequest, FlightSearchResult } from '../../services/travelAPI'
import FlightBookingModal from './FlightBookingModal'
import { useToastHelpers } from '../ui/Toast'
import { isBackendAvailable } from '../../config/api'

interface FlightSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (searchRequest: FlightSearchRequest) => Promise<FlightSearchResult[]>
  onSelectFlight?: (flight: FlightSearchResult) => void
}

const FlightSearchModal: React.FC<FlightSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  onSelectFlight
}) => {
  const { info, error } = useToastHelpers();
  
  const [searchData, setSearchData] = useState<FlightSearchRequest>({
    origin: '',
    destination: '',
    departure_date: '',
    return_date: '',
    adults: 1,
    children: 0,
    infants: 0,
    cabin_class: 'economy',
    currency: 'USD'
  })

  const [isRoundTrip, setIsRoundTrip] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<FlightSearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedFlight, setSelectedFlight] = useState<FlightSearchResult | null>(null)
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null)
  const [isUsingFallback, setIsUsingFallback] = useState(false)

  // Check backend availability on mount
  useEffect(() => {
    if (isOpen) {
      checkBackendStatus()
    }
  }, [isOpen])

  const checkBackendStatus = async () => {
    try {
      const available = await isBackendAvailable()
      setIsBackendOnline(available)
      if (!available) {
        info('Offline Mode', 'Flight search is using sample data. Connect to backend for real-time flight prices.')
      }
    } catch (err) {
      setIsBackendOnline(false)
    }
  }

  const handleInputChange = (field: keyof FlightSearchRequest, value: any) => {
    setSearchData(prev => ({ ...prev, [field]: value }))
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchData.origin || !searchData.destination || !searchData.departure_date) {
      error('Please fill in all required fields')
      return
    }

    setLoading(true)
    setIsUsingFallback(false)
    try {
      const results = await onSearch(searchData)
      setSearchResults(results)
      setHasSearched(true)
      
      // Check if we're using fallback data
      const usingFallback = (results as any).isFallbackData || !isBackendOnline
      setIsUsingFallback(usingFallback)
      
      if (results.length > 0) {
        if (usingFallback) {
          info('Sample Flights', `Showing ${results.length} sample flights (offline mode). Connect to backend for real-time prices.`)
        } else {
          info('Flights Found', `Found ${results.length} flights for your search`)
        }
      } else {
        info('No Results', 'No flights found for your search criteria. Try different dates or destinations.')
      }
    } catch (err: any) {
      console.error('Flight search failed:', err)
      setIsUsingFallback(true)
      error('Search Error', err.message || 'Flight search failed. Using sample data.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectFlight = (flight: FlightSearchResult) => {
    if (onSelectFlight) {
      onSelectFlight(flight)
    }
    onClose()
  }

  const handleBookFlight = (flight: FlightSearchResult) => {
    setSelectedFlight(flight)
    setShowBookingModal(true)
  }

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString)
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    } catch {
      return timeString
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price)
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Flight Search</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Connection Status Indicator */}
              {isBackendOnline !== null && (
                <div className={`mb-4 flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isBackendOnline 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
                    : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                }`}>
                  {isBackendOnline ? (
                    <>
                      <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm text-emerald-700 dark:text-emerald-300">Real-time flight search available</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm text-amber-700 dark:text-amber-300">Offline mode - showing sample flights</span>
                    </>
                  )}
                </div>
              )}

              {/* Search Form */}
              <form onSubmit={handleSearch} className="space-y-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      From *
                    </label>
                    <input
                      type="text"
                      value={searchData.origin}
                      onChange={(e) => handleInputChange('origin', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Airport code (e.g., BOM, DEL)"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      To *
                    </label>
                    <input
                      type="text"
                      value={searchData.destination}
                      onChange={(e) => handleInputChange('destination', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Airport code (e.g., DEL, BOM)"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Departure Date *
                    </label>
                    <input
                      type="date"
                      value={searchData.departure_date}
                      onChange={(e) => handleInputChange('departure_date', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Return Date {isRoundTrip && '*'}
                    </label>
                    <input
                      type="date"
                      value={searchData.return_date}
                      onChange={(e) => handleInputChange('return_date', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!isRoundTrip}
                      required={isRoundTrip}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isRoundTrip}
                      onChange={(e) => setIsRoundTrip(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Round Trip</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Adults
                    </label>
                    <input
                      type="number"
                      value={searchData.adults}
                      onChange={(e) => handleInputChange('adults', parseInt(e.target.value) || 1)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="9"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Children
                    </label>
                    <input
                      type="number"
                      value={searchData.children}
                      onChange={(e) => handleInputChange('children', parseInt(e.target.value) || 0)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="9"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Infants
                    </label>
                    <input
                      type="number"
                      value={searchData.infants}
                      onChange={(e) => handleInputChange('infants', parseInt(e.target.value) || 0)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="9"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Cabin Class
                    </label>
                    <select
                      value={searchData.cabin_class}
                      onChange={(e) => handleInputChange('cabin_class', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="economy">Economy</option>
                      <option value="premium_economy">Premium Economy</option>
                      <option value="business">Business</option>
                      <option value="first">First Class</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  <span>{loading ? 'Searching...' : 'Search Flights'}</span>
                </button>
              </form>

              {/* Search Results */}
              {hasSearched && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Search Results ({searchResults.length} flights found)
                  </h3>
                  
                  {searchResults.length === 0 ? (
                    <div className="text-center py-8">
                      <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No flights found for your search criteria.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {searchResults.map((flight) => (
                        <motion.div
                          key={flight.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => handleSelectFlight(flight)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                <div className="font-semibold">{flight.airline}</div>
                                <div className="text-sm text-gray-500">{flight.flight_number}</div>
                              </div>
                              
                              <div className="flex items-center space-x-4">
                                <div className="text-center">
                                  <div className="font-semibold">{formatTime(flight.departure_time)}</div>
                                  <div className="text-sm text-gray-500">{flight.origin}</div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 h-px bg-gray-300"></div>
                                  <Plane className="w-4 h-4 text-blue-500" />
                                  <div className="w-16 h-px bg-gray-300"></div>
                                </div>
                                
                                <div className="text-center">
                                  <div className="font-semibold">{formatTime(flight.arrival_time)}</div>
                                  <div className="text-sm text-gray-500">{flight.destination}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center space-x-2 mb-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-500">{flight.duration}</span>
                                {flight.stops > 0 && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                    {flight.stops} stop{flight.stops > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                              
                              <div className="font-bold text-lg">
                                {formatPrice(flight.price, flight.currency)}
                              </div>
                              
                              <div className="text-sm text-gray-500">
                                {flight.cabin_class} class
                              </div>
                            </div>
                          </div>
                          
                          {flight.aircraft && (
                            <div className="mt-2 text-sm text-gray-500">
                              Aircraft: {flight.aircraft}
                            </div>
                          )}
                          
                          <div className="mt-2 flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleBookFlight(flight)
                              }}
                              className="inline-flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
                            >
                              <BookOpen className="w-4 h-4" />
                              <span>Book Now</span>
                            </button>
                            {flight.booking_url && (
                              <a
                                href={flight.booking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-4 h-4" />
                                <span>External Booking</span>
                              </a>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Flight Booking Modal */}
    {selectedFlight && (
      <FlightBookingModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false)
          setSelectedFlight(null)
        }}
        flight={selectedFlight}
      />
    )}
  </>
  )
}

export default FlightSearchModal
