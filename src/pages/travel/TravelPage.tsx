import React, { useState, useEffect } from 'react'
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
  Users as GroupIcon,
  CheckCircle,
  Wifi,
  WifiOff
} from 'lucide-react'
import { Link } from 'react-router-dom'
import AIInsights from '../../components/ai/AIInsights'
import AIAssistant from '../../components/ai/AIAssistant'
import { SafeImage } from '../../utils/imageUtils'
import useTravel from '../../hooks/useTravel'
import TripModal from '../../components/travel/TripModal'
import FlightSearchModal from '../../components/travel/FlightSearchModal'
import FlightBookingModal from '../../components/travel/FlightBookingModal'
import AITravelRecommendations from '../../components/travel/AITravelRecommendations'
import PDFTestButton from '../../components/travel/PDFTestButton'
import ShareTripModal from '../../components/travel/ShareTripModal'
import DuplicateTripModal from '../../components/travel/DuplicateTripModal'
import ExportItineraryModal from '../../components/travel/ExportItineraryModal'
import ImportTripModal from '../../components/travel/ImportTripModal'
import AITravelPlannerModal from '../../components/travel/AITravelPlannerModal'
import { TripCreate } from '../../services/travelAPI'
import { useNavigate } from 'react-router-dom'
import { useToastHelpers } from '../../components/ui/Toast'
import { isBackendAvailable } from '../../config/api'
import { 
  Edit, 
  Trash2, 
  Share2, 
  Copy, 
  FileText, 
  Download, 
  Upload, 
  Brain,
  Bookmark,
  Eye
} from 'lucide-react'

const TravelPage = () => {
  const navigate = useNavigate()
  const { success, error: showError, info } = useToastHelpers()
  
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
    updateTrip,
    deleteTrip,
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
  const [showFlightBookingModal, setShowFlightBookingModal] = React.useState(false)
  const [selectedFlight, setSelectedFlight] = React.useState<any>(null)
  const [showShareModal, setShowShareModal] = React.useState(false)
  const [showDuplicateModal, setShowDuplicateModal] = React.useState(false)
  const [showExportModal, setShowExportModal] = React.useState(false)
  const [showImportModal, setShowImportModal] = React.useState(false)
  const [showAIPlannerModal, setShowAIPlannerModal] = React.useState(false)
  const [savedRecommendations, setSavedRecommendations] = React.useState<string[]>([])
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null)
  const [isUsingMockRecommendations, setIsUsingMockRecommendations] = useState(false)

  // Get filtered trips - ensure we're using the latest trips from store
  const upcomingTrips = getUpcomingTrips()
  const activeTrips = getActiveTrips()
  const completedTrips = getCompletedTrips()

  // Get recommendations by category
  const beachRecommendations = getRecommendationsByCategory('Beach')
  const islandRecommendations = getRecommendationsByCategory('Island')
  const cityRecommendations = getRecommendationsByCategory('City')

  // Check backend availability on mount
  useEffect(() => {
    checkBackendStatus()
  }, [])

  const checkBackendStatus = async () => {
    try {
      const available = await isBackendAvailable()
      setIsBackendOnline(available)
      // Check if recommendations are from mock data
      // If backend is offline, recommendations are likely mock data
      setIsUsingMockRecommendations(!available)
      if (!available && recommendations.length > 0) {
        info('Offline Mode', 'Travel recommendations are using sample data. Connect to backend for personalized recommendations.')
      }
    } catch (err) {
      setIsBackendOnline(false)
      setIsUsingMockRecommendations(true)
    }
  }

  const handleCreateTrip = async (tripData: TripCreate) => {
    try {
      const newTrip = await createTrip(tripData)
      if (newTrip) {
        success('Trip Created', `"${tripData.title}" has been created successfully`)
        setShowTripModal(false)
        setSelectedTrip(null)
        setModalMode('create')
      }
    } catch (error) {
      console.error('Failed to create trip:', error)
      showError('Failed to Create Trip', 'Could not create trip. Please try again.')
    }
  }

  const handleEditTrip = (trip: any) => {
    setSelectedTrip(trip)
    setModalMode('edit')
    setShowTripModal(true)
  }
  
  const handleUpdateTrip = async (tripData: TripCreate) => {
    if (!selectedTrip) return
    try {
      const updatedTrip = await updateTrip(selectedTrip.id, tripData)
      if (updatedTrip) {
        success('Trip Updated', `"${tripData.title}" has been updated successfully`)
        setShowTripModal(false)
        setSelectedTrip(null)
        setModalMode('create')
      }
    } catch (error) {
      console.error('Failed to update trip:', error)
      showError('Failed to Update Trip', 'Could not update trip. Please try again.')
    }
  }

  const handleNewTrip = () => {
    setSelectedTrip(null)
    setModalMode('create')
    setShowTripModal(true)
  }

  const handleDeleteTrip = async (trip: any) => {
    if (window.confirm(`Are you sure you want to delete "${trip.title}"?`)) {
      try {
        await deleteTrip(trip.id)
        success('Trip Deleted', 'Trip has been deleted successfully')
      } catch (error) {
        showError('Failed to Delete', 'Could not delete trip')
      }
    }
  }

  const handleViewItinerary = (trip: any) => {
    navigate(`/travel/itinerary/${trip.id}`)
  }

  const handleShareTrip = (trip: any) => {
    setSelectedTrip(trip)
    setShowShareModal(true)
  }

  const handleDuplicateTrip = (trip: any) => {
    setSelectedTrip(trip)
    setShowDuplicateModal(true)
  }

  const handleDuplicateTripConfirm = async (newTripData: {
    title: string;
    start_date: string;
    end_date: string;
  }) => {
    if (!selectedTrip) return
    
    try {
      const tripData: TripCreate = {
        title: newTripData.title,
        destination: selectedTrip.destination,
        trip_type: selectedTrip.trip_type,
        start_date: newTripData.start_date,
        end_date: newTripData.end_date,
        currency: selectedTrip.currency,
        budget: selectedTrip.budget,
        travelers: selectedTrip.travelers || []
      }
      await createTrip(tripData)
      success('Trip Duplicated', 'Trip has been duplicated successfully')
    } catch (error) {
      showError('Failed to Duplicate', 'Could not duplicate trip')
    }
  }

  const handleExportItinerary = (trip: any) => {
    setSelectedTrip(trip)
    setShowExportModal(true)
  }

  const handleExportPDF = () => {
    if (!selectedTrip) return
    // PDF export logic would go here
    success('Export Started', 'Your itinerary PDF is being generated')
  }

  const handleExportCalendar = () => {
    if (!selectedTrip) return
    // Calendar export logic would go here
    success('Export Started', 'Your calendar file is being generated')
  }

  const handleImportFromFile = (file: File) => {
    // File import logic would go here
    success('Import Started', 'Trip is being imported from file')
  }

  const handlePlanFromRecommendation = async (rec: any) => {
    try {
      const tripData: TripCreate = {
        title: `Trip to ${rec.destination}`,
        destination: rec.destination,
        trip_type: 'leisure',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currency: 'USD',
        travelers: []
      }
      await createTrip(tripData)
      success('Trip Created', 'Trip has been created from recommendation')
    } catch (error) {
      showError('Failed to Create Trip', 'Could not create trip from recommendation')
    }
  }

  const handleSaveRecommendation = (recId: string) => {
    setSavedRecommendations(prev => 
      prev.includes(recId) 
        ? prev.filter(id => id !== recId)
        : [...prev, recId]
    )
    success('Recommendation Saved', 'Recommendation has been saved for later')
  }

  const handleAIPlanTrip = async (planData: {
    destination: string;
    startDate: string;
    endDate: string;
    travelers: number;
    budget?: number;
    preferences: string[];
  }) => {
    try {
      const tripData: TripCreate = {
        title: `AI-Planned Trip to ${planData.destination}`,
        destination: planData.destination,
        trip_type: 'leisure',
        start_date: planData.startDate,
        end_date: planData.endDate,
        currency: 'USD',
        budget: planData.budget,
        travelers: Array.from({ length: planData.travelers }, (_, i) => ({
          name: `Traveler ${i + 1}`,
          age: 30
        }))
      }
      const newTrip = await createTrip(tripData)
      if (newTrip) {
        success('Trip Planned', 'AI has created your trip itinerary')
        navigate(`/travel/itinerary/${newTrip.id}`)
      }
    } catch (error) {
      showError('Failed to Plan Trip', 'Could not create AI-planned trip')
    }
  }

  const handleBookFlight = (flight: any) => {
    setSelectedFlight(flight)
    setShowFlightBookingModal(true)
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
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'planning':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      case 'active':
        return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
      case 'completed':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  if (loading.any) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="animate-pulse">
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
        className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 md:p-8 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">Travel Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg">
              Plan your next adventure with AI-powered recommendations
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/20 px-4 sm:px-5 py-3 rounded-xl border border-sky-200 dark:border-sky-800">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
              <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Total Trips</span>
              <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{stats.totalTrips}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          <button
            onClick={handleNewTrip}
            className="flex flex-col items-center justify-center space-y-1.5 sm:space-y-2 p-3 sm:p-5 bg-gradient-to-br from-sky-500 to-cyan-600 text-white rounded-xl hover:from-sky-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 min-h-[80px] sm:min-h-[100px]"
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs sm:text-sm font-medium text-center">New Trip</span>
          </button>
          <button
            onClick={() => setShowFlightSearchModal(true)}
            className="flex flex-col items-center justify-center space-y-1.5 sm:space-y-2 p-3 sm:p-5 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 min-h-[80px] sm:min-h-[100px]"
          >
            <Plane className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs sm:text-sm font-medium text-center">Search Flights</span>
          </button>
          <button
            onClick={() => setShowFlightSearchModal(true)}
            className="flex flex-col items-center justify-center space-y-1.5 sm:space-y-2 p-3 sm:p-5 bg-gradient-to-br from-violet-500 to-violet-600 text-white rounded-xl hover:from-violet-600 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 min-h-[80px] sm:min-h-[100px]"
          >
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs sm:text-sm font-medium text-center">Book Flight</span>
          </button>
          <Link 
            to="/travel/search" 
            className="flex flex-col items-center justify-center space-y-1.5 sm:space-y-2 p-3 sm:p-5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 min-h-[80px] sm:min-h-[100px]"
          >
            <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs sm:text-sm font-medium text-center">Search Destinations</span>
          </Link>
          <Link 
            to="/travel/alerts" 
            className="flex flex-col items-center justify-center space-y-1.5 sm:space-y-2 p-3 sm:p-5 bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 relative min-h-[80px] sm:min-h-[100px]"
          >
            <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs sm:text-sm font-medium text-center">Price Alerts</span>
            {stats.activePriceAlerts > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-rose-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {stats.activePriceAlerts}
              </span>
            )}
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center justify-center space-x-2 p-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <Download className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Export</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center justify-center space-x-2 p-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <Upload className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Import</span>
          </button>
          <button
            onClick={() => setShowAIPlannerModal(true)}
            className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:from-indigo-600 hover:to-violet-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Brain className="w-5 h-5" />
            <span className="text-sm font-medium">AI Planner</span>
          </button>
          <Link
            to="/travel/search"
            className="flex items-center justify-center space-x-2 p-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <Compass className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Explore</span>
          </Link>
        </div>
      </motion.div>

      {/* Error Display */}
      {hasErrors.any && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border-2 border-red-200 dark:border-red-800 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 dark:text-red-400 font-semibold">Some data failed to load</span>
            </div>
            <button
              onClick={clearErrors}
              className="text-red-600 dark:text-red-400 text-sm font-medium hover:text-red-700 dark:hover:text-red-300 px-3 py-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}

      {/* Dashboard Stats */}
      {dashboard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-md border border-gray-100 dark:border-gray-700"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">Travel Overview</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            <div className="bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/20 rounded-xl p-4 sm:p-6 border border-sky-200 dark:border-sky-800">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.upcomingTrips}</div>
              <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming Trips</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 sm:p-6 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.activeTrips}</div>
              <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Active Trips</div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-500 to-gray-600 rounded-lg flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.completedTrips}</div>
              <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-4 sm:p-6 border border-violet-200 dark:border-violet-800">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                ${dashboard.total_spent?.toLocaleString() || '0'}
              </div>
              <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Upcoming Trips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Upcoming Trips</h2>
          <button
            onClick={handleNewTrip}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-600 text-white rounded-lg hover:from-sky-600 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Trip</span>
          </button>
        </div>
        
        {upcomingTrips.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-cyan-100 dark:from-sky-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plane className="w-10 h-10 text-sky-600 dark:text-sky-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">No upcoming trips</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">Start planning your next adventure!</p>
            <button
              onClick={handleNewTrip}
              className="px-4 sm:px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-600 text-white rounded-lg hover:from-sky-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm sm:text-base min-h-[44px]"
            >
              Plan Your First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {upcomingTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden group"
              >
                <SafeImage
                  src={`https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop`}
                  alt={trip.destination}
                  category="travel"
                  className="w-full h-40 object-cover rounded-xl mb-4 group-hover:scale-105 transition-transform duration-300"
                />
                
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate flex-1 min-w-0">{trip.title}</h3>
                    <div className="flex-shrink-0 ml-2">{getTripTypeIcon(trip.trip_type)}</div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 text-sky-500 flex-shrink-0" />
                    <span className="font-medium truncate">{trip.destination}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span className="truncate">
                      {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {trip.budget && (
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <DollarSign className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="font-semibold truncate">${trip.budget.toLocaleString()} {trip.currency}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className={`text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium ${getStatusColor(trip.status)}`}>
                      {trip.status}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewItinerary(trip)
                      }}
                      className="flex-1 px-3 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-600 text-white rounded-lg hover:from-sky-600 hover:to-cyan-700 transition-all duration-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-1 shadow-sm min-h-[44px]"
                      title="View Itinerary"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Itinerary</span>
                      <span className="sm:hidden">View</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditTrip(trip)
                      }}
                      className="px-3 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Edit Trip"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShareTrip(trip)
                      }}
                      className="px-3 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Share Trip"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDuplicateTrip(trip)
                      }}
                      className="px-3 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Duplicate Trip"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteTrip(trip)
                      }}
                      className="px-3 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Delete Trip"
                    >
                      <Trash2 className="w-4 h-4" />
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
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Recommendations</h2>
          </div>
          <button
            onClick={() => {
              refreshData()
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <ArrowRight className="w-4 h-4" />
            <span>View All</span>
          </button>
        </div>
        
        {recommendations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-violet-600 dark:text-violet-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading recommendations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(recommendations || []).slice(0, 6).map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden group"
              >
                <SafeImage
                  src={rec.image_url}
                  alt={rec.destination}
                  category="travel"
                  className="w-full h-40 object-cover rounded-xl mb-4 group-hover:scale-105 transition-transform duration-300"
                />
                
                <div className="space-y-3">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{rec.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{rec.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{rec.rating}</span>
                    </div>
                    
                    <span className="font-bold text-gray-900 dark:text-white">{rec.price_range}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {(rec.tags || []).slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-xs px-3 py-1 bg-gradient-to-r from-sky-100 to-cyan-100 dark:from-sky-900/30 dark:to-cyan-900/30 text-sky-700 dark:text-sky-300 rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handlePlanFromRecommendation(rec)}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-600 text-white rounded-lg hover:from-sky-600 hover:to-cyan-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                    >
                      Plan Trip
                    </button>
                    <button
                      onClick={() => handleSaveRecommendation(rec.id)}
                      className={`px-4 py-2.5 rounded-lg transition-all duration-200 ${
                        savedRecommendations.includes(rec.id) 
                          ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      title="Save for Later"
                    >
                      <Bookmark className={`w-4 h-4 ${savedRecommendations.includes(rec.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
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
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Currently Traveling</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-5 border-2 border-emerald-200 dark:border-emerald-800 shadow-md"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-sm">Currently Active</span>
                </div>
                
                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{trip.title}</h3>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-4">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium">{trip.destination}</span>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-emerald-200 dark:border-emerald-800">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => handleViewItinerary(trip)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All Trips Section - Show all trips that aren't cancelled */}
      {trips.filter(t => t.status !== 'cancelled').length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All My Trips</h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {trips.filter(t => t.status !== 'cancelled').length} total
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips
              .filter(t => t.status !== 'cancelled')
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{trip.title || 'Untitled Trip'}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(trip.status)}`}>
                      {trip.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'No date'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEditTrip(trip)}
                      className="flex-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleViewItinerary(trip)}
                      className="flex-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      View
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
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <PDFTestButton />
      </motion.div>

      {/* AI Travel Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">AI Travel Recommendations</h2>
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
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">AI Travel Insights</h2>
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
        onClose={() => {
          setShowTripModal(false)
          setSelectedTrip(null)
          setModalMode('create')
        }}
        onSubmit={modalMode === 'edit' ? handleUpdateTrip : handleCreateTrip}
        trip={selectedTrip}
        mode={modalMode}
      />

      {/* Flight Search Modal */}
      <FlightSearchModal
        isOpen={showFlightSearchModal}
        onClose={() => setShowFlightSearchModal(false)}
        onSearch={searchFlights}
        onSelectFlight={(flight) => {
          handleBookFlight(flight)
        }}
      />

      {/* Flight Booking Modal */}
      {selectedFlight && (
        <FlightBookingModal
          isOpen={showFlightBookingModal}
          onClose={() => {
            setShowFlightBookingModal(false)
            setSelectedFlight(null)
          }}
          flight={selectedFlight}
        />
      )}

      {/* Share Trip Modal */}
      {selectedTrip && (
        <ShareTripModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false)
            setSelectedTrip(null)
          }}
          trip={selectedTrip}
        />
      )}

      {/* Duplicate Trip Modal */}
      {selectedTrip && (
        <DuplicateTripModal
          isOpen={showDuplicateModal}
          onClose={() => {
            setShowDuplicateModal(false)
            setSelectedTrip(null)
          }}
          trip={selectedTrip}
          onDuplicate={handleDuplicateTripConfirm}
        />
      )}

      {/* Export Itinerary Modal */}
      {selectedTrip && (
        <ExportItineraryModal
          isOpen={showExportModal}
          onClose={() => {
            setShowExportModal(false)
            setSelectedTrip(null)
          }}
          trip={selectedTrip}
          onExportPDF={handleExportPDF}
          onExportCalendar={handleExportCalendar}
        />
      )}

      {/* Import Trip Modal */}
      <ImportTripModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportFromFile={handleImportFromFile}
      />

      {/* AI Travel Planner Modal */}
      <AITravelPlannerModal
        isOpen={showAIPlannerModal}
        onClose={() => setShowAIPlannerModal(false)}
        onPlanTrip={handleAIPlanTrip}
      />
    </div>
  )
}

export default TravelPage
