import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Edit, 
  Plus, 
  Trash2, 
  Share2, 
  Download, 
  Printer, 
  Plane, 
  Hotel, 
  UtensilsCrossed,
  Brain,
  Sparkles,
  Map,
  Navigation,
  GripVertical,
  FileText,
  CheckSquare
} from 'lucide-react'
import ActivityModal from '../../components/travel/ActivityModal'
import ShareTripModal from '../../components/travel/ShareTripModal'
import ExportItineraryModal from '../../components/travel/ExportItineraryModal'
import AIItineraryOptimizerModal from '../../components/travel/AIItineraryOptimizerModal'
import AIItinerarySuggestionsModal from '../../components/travel/AIItinerarySuggestionsModal'
import { useToastHelpers } from '../../components/ui/Toast'
import useTravel from '../../hooks/useTravel'
import { useTravelStore } from '../../store/travel'

interface Activity {
  time: string
  activity: string
  location: string
  type?: string
}

interface Day {
  day: number
  date: string
  activities: Activity[]
}

interface ItineraryData {
  trip: {
    destination: string
    dates: string
    image: string
    title?: string
  }
  days: Day[]
}

const ItineraryPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { success, error: showError } = useToastHelpers()
  const { trips, updateTrip } = useTravel()
  const { updateTrip: updateTripInStore } = useTravelStore()
  
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [activityType, setActivityType] = useState<string>('activity')
  const [showShareModal, setShowShareModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [editingActivity, setEditingActivity] = useState<any>(null)
  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [showAIOptimize, setShowAIOptimize] = useState(false)
  const [showAISuggestions, setShowAISuggestions] = useState(false)

  // Find trip by ID
  const trip = trips.find(t => t.id === id)
  
  // Initialize itinerary from trip data or localStorage
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null)

  // Load itinerary from trip or localStorage
  useEffect(() => {
    if (trip && trip.id) {
      // First, try to load from localStorage
      const itineraryKey = `itinerary-${trip.id}`
      const savedItinerary = localStorage.getItem(itineraryKey)
      
      if (savedItinerary) {
        try {
          const parsed = JSON.parse(savedItinerary)
          // Convert saved itinerary to our format
          const days = parsed.map((item: any, index: number) => ({
            day: item.day_number || index + 1,
            date: item.date || new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            activities: item.activities || []
          }))
          
          setItinerary({
            trip: {
              destination: trip.destination,
              dates: `${new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
              image: `https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop`,
              title: trip.title
            },
            days
          })
          return
        } catch (error) {
          console.error('Failed to parse saved itinerary:', error)
        }
      }
      
      // Try to load from trip's itinerary field
      if (trip.itinerary && Array.isArray(trip.itinerary) && trip.itinerary.length > 0) {
        // Convert trip itinerary to our format
        const days = trip.itinerary.map((item: any, index: number) => ({
          day: item.day_number || index + 1,
          date: item.date || new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          activities: item.activities || []
        }))
        
        setItinerary({
          trip: {
            destination: trip.destination,
            dates: `${new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
            image: `https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop`,
            title: trip.title
          },
          days
        })
      } else {
        // Create default itinerary from trip dates
        const startDate = new Date(trip.start_date)
        const endDate = new Date(trip.end_date)
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        
        const days: Day[] = []
        for (let i = 0; i <= daysDiff; i++) {
          const currentDate = new Date(startDate)
          currentDate.setDate(startDate.getDate() + i)
          days.push({
            day: i + 1,
            date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            activities: []
          })
        }
        
        setItinerary({
          trip: {
            destination: trip.destination,
            dates: `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
            image: `https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop`,
            title: trip.title
          },
          days
        })
      }
    } else {
      // Fallback to mock data if no trip found
      setItinerary({
        trip: {
          destination: 'Tokyo, Japan',
          dates: 'Mar 15-22, 2024',
          image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop',
        },
        days: [
          {
            day: 1,
            date: 'Mar 15',
            activities: [
              { time: '09:00', activity: 'Arrive at Narita Airport', location: 'Narita Airport' },
              { time: '11:00', activity: 'Check into hotel', location: 'Shinjuku' },
              { time: '14:00', activity: 'Visit Senso-ji Temple', location: 'Asakusa' },
              { time: '18:00', activity: 'Dinner at local ramen shop', location: 'Shinjuku' },
            ]
          },
          {
            day: 2,
            date: 'Mar 16',
            activities: [
              { time: '08:00', activity: 'Breakfast at hotel', location: 'Hotel' },
              { time: '10:00', activity: 'Visit Tokyo Skytree', location: 'Sumida' },
              { time: '14:00', activity: 'Explore Akihabara', location: 'Akihabara' },
              { time: '19:00', activity: 'Sushi dinner', location: 'Ginza' },
            ]
          },
        ]
      })
    }
  }, [trip, id])

  // Save itinerary to localStorage when it changes
  useEffect(() => {
    if (itinerary && trip && trip.id) {
      // Convert itinerary back to trip format and save to localStorage
      const tripItinerary = itinerary.days.map(day => ({
        day_number: day.day,
        date: day.date,
        activities: day.activities
      }))
      
      // Store itinerary in localStorage
      try {
        const itineraryKey = `itinerary-${trip.id}`
        localStorage.setItem(itineraryKey, JSON.stringify(tripItinerary))
        console.log('[Itinerary] Saved to localStorage:', itineraryKey)
      } catch (error) {
        console.error('Failed to save itinerary to localStorage:', error)
      }
    }
  }, [itinerary, trip])

  const handleAddActivity = (dayIndex: number, type: string = 'activity') => {
    setEditingDay(dayIndex)
    setEditingActivity(null)
    setActivityType(type)
    setShowActivityModal(true)
  }

  const handleEditActivity = (dayIndex: number, activityIndex: number) => {
    if (!itinerary) return
    setEditingDay(dayIndex)
    setEditingActivity(itinerary.days[dayIndex].activities[activityIndex])
    setShowActivityModal(true)
  }

  const handleDeleteActivity = (dayIndex: number, activityIndex: number) => {
    if (!itinerary) return
    if (window.confirm('Are you sure you want to delete this activity?')) {
      const newDays = [...itinerary.days]
      newDays[dayIndex].activities.splice(activityIndex, 1)
      setItinerary({ ...itinerary, days: newDays })
      success('Activity Deleted', 'Activity has been removed')
    }
  }

  const handleSaveActivity = (activityData: any) => {
    if (editingDay === null || !itinerary) return

    const newDays = [...itinerary.days]
    if (editingActivity) {
      // Update existing activity
      const activityIndex = newDays[editingDay].activities.findIndex(
        a => a.activity === editingActivity.activity && a.time === editingActivity.time
      )
      if (activityIndex !== -1) {
        newDays[editingDay].activities[activityIndex] = {
          time: activityData.start_time || '00:00',
          activity: activityData.name,
          location: activityData.location,
          type: activityType
        }
      }
    } else {
      // Add new activity
      newDays[editingDay].activities.push({
        time: activityData.start_time || '00:00',
        activity: activityData.name,
        location: activityData.location,
        type: activityType
      })
      // Sort activities by time
      newDays[editingDay].activities.sort((a, b) => {
        const timeA = a.time.replace(':', '')
        const timeB = b.time.replace(':', '')
        return parseInt(timeA) - parseInt(timeB)
      })
    }
    setItinerary({ ...itinerary, days: newDays })
    setEditingDay(null)
    setEditingActivity(null)
    success('Activity Saved', editingActivity ? 'Activity updated' : 'Activity added')
  }

  const generateItineraryPDF = async () => {
    if (!itinerary) {
      showError('Error', 'No itinerary data available')
      return
    }

    try {
      const doc = new jsPDF()
      
      // Colors
      const primaryColor = [30, 64, 175] as [number, number, number]
      const secondaryColor = [107, 114, 128] as [number, number, number]
      const accentColor = [59, 130, 246] as [number, number, number]
      
      let yPosition = 20
      const pageWidth = 210
      const margin = 20
      const contentWidth = pageWidth - (margin * 2)
      
      // Title
      doc.setFontSize(24)
      doc.setTextColor(...primaryColor)
      doc.setFont('helvetica', 'bold')
      doc.text('TRIP ITINERARY', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 10
      
      // Trip Info
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      doc.text(itinerary.trip.destination, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 7
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...secondaryColor)
      doc.text(itinerary.trip.dates, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 15
      
      // Draw line
      doc.setDrawColor(...primaryColor)
      doc.setLineWidth(0.5)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10
      
      // Iterate through days
      itinerary.days.forEach((day, dayIndex) => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }
        
        // Day Header
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...accentColor)
        doc.text(`Day ${day.day} - ${day.date}`, margin, yPosition)
        yPosition += 8
        
        // Draw line under day header
        doc.setDrawColor(...accentColor)
        doc.setLineWidth(0.3)
        doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2)
        yPosition += 5
        
        // Activities
        if (day.activities.length === 0) {
          doc.setFontSize(10)
          doc.setFont('helvetica', 'italic')
          doc.setTextColor(...secondaryColor)
          doc.text('No activities scheduled', margin + 5, yPosition)
          yPosition += 8
        } else {
          day.activities.forEach((activity) => {
            // Check if we need a new page
            if (yPosition > 250) {
              doc.addPage()
              yPosition = 20
            }
            
            // Time
            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(0, 0, 0)
            doc.text(activity.time, margin, yPosition)
            
            // Activity name
            doc.setFont('helvetica', 'normal')
            doc.text(activity.activity, margin + 25, yPosition)
            
            // Location
            doc.setFontSize(9)
            doc.setTextColor(...secondaryColor)
            doc.text(activity.location, margin + 25, yPosition + 5)
            
            yPosition += 10
          })
        }
        
        yPosition += 5 // Space between days
      })
      
      // Footer
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(...secondaryColor)
        doc.text(
          `Page ${i} of ${totalPages} • Generated on ${new Date().toLocaleDateString()}`,
          pageWidth / 2,
          290,
          { align: 'center' }
        )
      }
      
      // Generate and download PDF
      const fileName = `itinerary-${itinerary.trip.destination.replace(/,/g, '').replace(/\s+/g, '-')}-${Date.now()}.pdf`
      doc.save(fileName)
      
      success('PDF Generated', 'Your itinerary PDF has been downloaded successfully!')
    } catch (error: any) {
      console.error('Failed to generate PDF:', error)
      showError('PDF Generation Failed', error.message || 'Failed to generate PDF. Please try again.')
    }
  }

  const handlePrint = () => {
    generateItineraryPDF()
  }

  const handleExportPDF = () => {
    generateItineraryPDF()
  }

  const handleExportCalendar = () => {
    // Calendar export logic would go here
    success('Export Started', 'Your calendar file is being generated')
  }

  const handleAIOptimize = () => {
    setShowAIOptimize(true)
    // AI optimization logic would go here
    setTimeout(() => {
      success('Itinerary Optimized', 'AI has optimized your itinerary')
      setShowAIOptimize(false)
    }, 2000)
  }

  const handleAISuggestions = () => {
    if (!trip || !itinerary) {
      showError('Error', 'Trip information is required for AI suggestions')
      return
    }
    setShowAISuggestions(true)
  }

  const handleAddAISuggestions = (suggestions: any[]) => {
    if (!itinerary) return
    
    const newDays = [...itinerary.days]
    
    suggestions.forEach((suggestion) => {
      const dayIndex = suggestion.day - 1
      if (dayIndex >= 0 && dayIndex < newDays.length) {
        // Merge activities, avoiding duplicates
        const existingActivities = newDays[dayIndex].activities
        const newActivities = suggestion.activities.filter((newAct: any) => {
          return !existingActivities.some(existing => 
            existing.activity === newAct.activity && existing.time === newAct.time
          )
        })
        newDays[dayIndex].activities = [...existingActivities, ...newActivities]
        // Sort by time
        newDays[dayIndex].activities.sort((a, b) => {
          const timeA = a.time.replace(':', '')
          const timeB = b.time.replace(':', '')
          return parseInt(timeA) - parseInt(timeB)
        })
      }
    })
    
    setItinerary({ ...itinerary, days: newDays })
    success('Suggestions Added', 'AI suggestions have been added to your itinerary')
  }

  const handleApplyOptimization = (optimizedItinerary: any) => {
    if (!itinerary) return
    setItinerary(optimizedItinerary)
    success('Itinerary Optimized', 'Your itinerary has been optimized')
    setShowAIOptimize(false)
  }

  const handleViewMap = () => {
    // Open map view with itinerary locations
    success('Map View', 'Opening map with itinerary locations')
  }

  const handleGetDirections = (location: string) => {
    // Open directions to location
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`
    window.open(mapsUrl, '_blank')
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading itinerary...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white">Trip Itinerary</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              {itinerary.trip.destination} • {itinerary.trip.dates}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleViewMap}
              className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">View Map</span>
            </button>
            <button
              onClick={handleAIOptimize}
              className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
            >
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">AI Optimize</span>
            </button>
            <button
              onClick={handleAISuggestions}
              className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg hover:from-purple-600 hover:to-violet-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">AI Suggestions</span>
            </button>
            <button 
              className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-sky-500 to-cyan-600 text-white rounded-lg hover:from-sky-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
            >
              <CheckSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Edit Itinerary</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Trip Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <img
            src={itinerary.trip.image}
            alt={itinerary.trip.destination}
            className="w-full sm:w-48 h-40 sm:h-32 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900 dark:text-white">{itinerary.trip.destination}</h2>
            <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-sky-500" />
                <span className="text-sm sm:text-base">{itinerary.trip.dates}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span className="text-sm sm:text-base">{itinerary.trip.destination.split(',')[1]?.trim() || 'Location'}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Add Item Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => handleAddActivity(0, 'activity')}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-600 text-white rounded-lg hover:from-sky-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg font-medium text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span>Add Activity</span>
          </button>
          <button
            onClick={() => handleAddActivity(0, 'transport')}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300"
          >
            <Plane className="w-4 h-4" />
            <span>Add Flight</span>
          </button>
          <button
            onClick={() => handleAddActivity(0, 'accommodation')}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300"
          >
            <Hotel className="w-4 h-4" />
            <span>Add Hotel</span>
          </button>
          <button
            onClick={() => handleAddActivity(0, 'restaurant')}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Add Restaurant</span>
          </button>
        </div>
      </motion.div>

      {/* Daily Itinerary */}
      <div className="space-y-6">
        {itinerary.days.map((day, dayIndex) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + dayIndex * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-md border border-gray-100 dark:border-gray-700"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Day {day.day} - {day.date}</h3>
              <button
                onClick={() => handleAddActivity(dayIndex)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 w-fit"
              >
                <Plus className="w-3 h-3" />
                <span>Add Activity</span>
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {day.activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No activities scheduled for this day</p>
                </div>
              ) : (
                day.activities.map((activity, activityIndex) => (
                  <motion.div
                    key={activityIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + dayIndex * 0.1 + activityIndex * 0.05 }}
                    className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex-shrink-0 w-14 sm:w-16 text-right">
                      <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">{activity.time}</span>
                    </div>
                    
                    <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-1.5 sm:mt-2"></div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-1">{activity.activity}</h4>
                      <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{activity.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => handleEditActivity(dayIndex, activityIndex)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleGetDirections(activity.location)}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        title="Get Directions"
                      >
                        <Navigation className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteActivity(dayIndex, activityIndex)}
                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => handleAddActivity(0)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-sky-500 to-cyan-600 text-white rounded-full shadow-lg hover:shadow-xl hover:from-sky-600 hover:to-cyan-700 transition-all flex items-center justify-center z-50"
        title="Add Activity"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Modals */}
      <ActivityModal
        isOpen={showActivityModal}
        onClose={() => {
          setShowActivityModal(false)
          setEditingActivity(null)
          setEditingDay(null)
          setActivityType('activity')
        }}
        activity={editingActivity ? { ...editingActivity, type: activityType } : null}
        onSave={(data) => {
          handleSaveActivity({ ...data, type: activityType })
          setShowActivityModal(false)
        }}
      />

      {trip && trip.id && (
        <ShareTripModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          trip={{
            id: trip.id,
            title: trip.title,
            destination: trip.destination,
            start_date: trip.start_date,
            end_date: trip.end_date
          } as any}
        />
      )}

      {trip && trip.id && (
        <ExportItineraryModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          trip={{
            id: trip.id,
            title: trip.title,
            destination: trip.destination
          } as any}
          onExportPDF={handleExportPDF}
          onExportCalendar={handleExportCalendar}
        />
      )}

      {/* AI Optimizer Modal */}
      {itinerary && (
        <AIItineraryOptimizerModal
          isOpen={showAIOptimize}
          onClose={() => setShowAIOptimize(false)}
          itinerary={itinerary}
          onApplyOptimization={handleApplyOptimization}
        />
      )}

      {/* AI Suggestions Modal */}
      {trip && itinerary && (
        <AIItinerarySuggestionsModal
          isOpen={showAISuggestions}
          onClose={() => setShowAISuggestions(false)}
          trip={{
            destination: trip.destination,
            start_date: trip.start_date,
            end_date: trip.end_date,
            trip_type: trip.trip_type
          }}
          existingDays={itinerary.days}
          onAddSuggestions={handleAddAISuggestions}
        />
      )}
    </div>
  )
}

export default ItineraryPage
