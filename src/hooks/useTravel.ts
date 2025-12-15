import { useEffect, useCallback } from 'react'
import { useTravelStore } from '../store/travel'
import { TripCreate, PriceAlertCreate } from '../services/travelAPI'

export const useTravel = (userId: string = 'user_123') => {
  const {
    // Data
    trips,
    flights,
    hotels,
    activities,
    priceAlerts,
    recommendations,
    insights,
    dashboard,
    flightSearchResults,
    
    // Loading states
    loading,
    
    // Error states
    errors,
    
    // Actions
    fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    fetchFlights,
    createFlight,
    fetchHotels,
    createHotel,
    fetchActivities,
    createActivity,
    fetchPriceAlerts,
    createPriceAlert,
    deletePriceAlert,
    fetchRecommendations,
    fetchInsights,
    fetchDashboard,
    searchFlights,
    quickFlightSearch,
    getMinPrice,
    clearErrors,
    resetState,
  } = useTravelStore()

  // Auto-fetch data on mount
  useEffect(() => {
    fetchTrips(userId)
    fetchPriceAlerts(userId)
    fetchRecommendations()
    fetchInsights(userId)
    fetchDashboard(userId)
  }, [userId, fetchTrips, fetchPriceAlerts, fetchRecommendations, fetchInsights, fetchDashboard])

  // Trip management
  const handleCreateTrip = useCallback(async (tripData: TripCreate) => {
    const newTrip = await createTrip(tripData, userId)
    if (newTrip) {
      // Refresh trips after creation
      await fetchTrips(userId)
      return newTrip
    }
    return null
  }, [createTrip, fetchTrips, userId])

  const handleUpdateTrip = useCallback(async (tripId: string, tripData: TripCreate) => {
    const updatedTrip = await updateTrip(tripId, tripData)
    if (updatedTrip) {
      // Refresh trips after update
      await fetchTrips(userId)
      return updatedTrip
    }
    return null
  }, [updateTrip, fetchTrips, userId])

  const handleDeleteTrip = useCallback(async (tripId: string) => {
    const success = await deleteTrip(tripId)
    if (success) {
      // Refresh trips after deletion
      await fetchTrips(userId)
    }
    return success
  }, [deleteTrip, fetchTrips, userId])

  // Flight management
  const handleCreateFlight = useCallback(async (flightData: any) => {
    const newFlight = await createFlight(flightData)
    if (newFlight) {
      // Refresh flights after creation
      await fetchFlights(flightData.trip_id)
      return newFlight
    }
    return null
  }, [createFlight, fetchFlights])

  // Hotel management
  const handleCreateHotel = useCallback(async (hotelData: any) => {
    const newHotel = await createHotel(hotelData)
    if (newHotel) {
      // Refresh hotels after creation
      await fetchHotels(hotelData.trip_id)
      return newHotel
    }
    return null
  }, [createHotel, fetchHotels])

  // Activity management
  const handleCreateActivity = useCallback(async (activityData: any) => {
    const newActivity = await createActivity(activityData)
    if (newActivity) {
      // Refresh activities after creation
      await fetchActivities(activityData.trip_id)
      return newActivity
    }
    return null
  }, [createActivity, fetchActivities])

  // Price alert management
  const handleCreatePriceAlert = useCallback(async (alertData: PriceAlertCreate) => {
    const newAlert = await createPriceAlert(alertData, userId)
    if (newAlert) {
      // Refresh price alerts after creation
      await fetchPriceAlerts(userId)
      return newAlert
    }
    return null
  }, [createPriceAlert, fetchPriceAlerts, userId])

  const handleDeletePriceAlert = useCallback(async (alertId: string) => {
    const success = await deletePriceAlert(alertId)
    if (success) {
      // Refresh price alerts after deletion
      await fetchPriceAlerts(userId)
    }
    return success
  }, [deletePriceAlert, fetchPriceAlerts, userId])

  // Utility functions
  const getTripById = useCallback((tripId: string) => {
    return trips.find(trip => trip.id === tripId)
  }, [trips])

  const getTripsByStatus = useCallback((status: string) => {
    return trips.filter(trip => trip.status === status)
  }, [trips])

  const getUpcomingTrips = useCallback(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return trips.filter(trip => {
      if (!trip.start_date) return false
      if (trip.status === 'cancelled') return false
      // Include trips that are planning, booked, or have future start dates
      if (trip.status === 'planning' || trip.status === 'booked') return true
      const startDate = new Date(trip.start_date)
      startDate.setHours(0, 0, 0, 0)
      return startDate >= now
    }).sort((a, b) => {
      const aDate = new Date(a.start_date).getTime()
      const bDate = new Date(b.start_date).getTime()
      return aDate - bDate
    })
  }, [trips])

  const getActiveTrips = useCallback(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return trips.filter(trip => {
      if (!trip.start_date || !trip.end_date) return false
      const startDate = new Date(trip.start_date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(trip.end_date)
      endDate.setHours(23, 59, 59, 999)
      return startDate <= now && endDate >= now && (trip.status === 'active' || trip.status === 'booked')
    })
  }, [trips])

  const getCompletedTrips = useCallback(() => {
    const now = new Date()
    return trips.filter(trip => {
      const endDate = new Date(trip.end_date)
      return endDate < now || trip.status === 'completed'
    }).sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())
  }, [trips])

  const getFlightsForTrip = useCallback((tripId: string) => {
    return flights.filter(flight => flight.trip_id === tripId)
  }, [flights])

  const getHotelsForTrip = useCallback((tripId: string) => {
    return hotels.filter(hotel => hotel.trip_id === tripId)
  }, [hotels])

  const getActivitiesForTrip = useCallback((tripId: string) => {
    return activities.filter(activity => activity.trip_id === tripId)
  }, [activities])

  const getActivePriceAlerts = useCallback(() => {
    return priceAlerts.filter(alert => alert.is_active)
  }, [priceAlerts])

  const getRecommendationsByCategory = useCallback((category: string) => {
    return recommendations.filter(rec => 
      rec?.category && rec.category.toLowerCase() === category.toLowerCase()
    )
  }, [recommendations])

  const getInsightsByType = useCallback((type: string) => {
    return insights.filter(insight => insight.type === type)
  }, [insights])

  // Flight search handlers
  const handleSearchFlights = useCallback(async (searchRequest: any) => {
    return await searchFlights(searchRequest)
  }, [searchFlights])

  const handleQuickFlightSearch = useCallback(async (origin: string, destination: string, departureDate: string, returnDate?: string, adults: number = 1, currency: string = 'USD') => {
    return await quickFlightSearch(origin, destination, departureDate, returnDate, adults, currency)
  }, [quickFlightSearch])

  const handleGetMinPrice = useCallback(async (fromId: string, toId: string, cabinClass: string = 'ECONOMY', currency: string = 'USD') => {
    return await getMinPrice(fromId, toId, cabinClass, currency)
  }, [getMinPrice])

  // Loading states
  const isLoading = {
    trips: loading.trips,
    flights: loading.flights,
    hotels: loading.hotels,
    activities: loading.activities,
    priceAlerts: loading.priceAlerts,
    recommendations: loading.recommendations,
    insights: loading.insights,
    dashboard: loading.dashboard,
    flightSearch: loading.flightSearch,
    any: Object.values(loading).some(Boolean),
  }

  // Error states
  const hasErrors = {
    trips: !!errors.trips,
    flights: !!errors.flights,
    hotels: !!errors.hotels,
    activities: !!errors.activities,
    priceAlerts: !!errors.priceAlerts,
    recommendations: !!errors.recommendations,
    insights: !!errors.insights,
    dashboard: !!errors.dashboard,
    any: Object.values(errors).some(Boolean),
  }

  // Statistics
  const stats = {
    totalTrips: trips.length,
    upcomingTrips: getUpcomingTrips().length,
    activeTrips: getActiveTrips().length,
    completedTrips: getCompletedTrips().length,
    totalFlights: flights.length,
    totalHotels: hotels.length,
    totalActivities: activities.length,
    activePriceAlerts: getActivePriceAlerts().length,
    totalRecommendations: recommendations.length,
    totalInsights: insights.length,
  }

  return {
    // Data
    trips,
    flights,
    hotels,
    activities,
    priceAlerts,
    recommendations,
    insights,
    dashboard,
    flightSearchResults,
    
    // Loading states
    loading: isLoading,
    
    // Error states
    errors,
    hasErrors,
    
    // Actions
    createTrip: handleCreateTrip,
    updateTrip: handleUpdateTrip,
    deleteTrip: handleDeleteTrip,
    createFlight: handleCreateFlight,
    createHotel: handleCreateHotel,
    createActivity: handleCreateActivity,
    createPriceAlert: handleCreatePriceAlert,
    deletePriceAlert: handleDeletePriceAlert,
    searchFlights: handleSearchFlights,
    quickFlightSearch: handleQuickFlightSearch,
    getMinPrice: handleGetMinPrice,
    
    // Utility functions
    getTripById,
    getTripsByStatus,
    getUpcomingTrips,
    getActiveTrips,
    getCompletedTrips,
    getFlightsForTrip,
    getHotelsForTrip,
    getActivitiesForTrip,
    getActivePriceAlerts,
    getRecommendationsByCategory,
    getInsightsByType,
    
    // Statistics
    stats,
    
    // Utility actions
    clearErrors,
    resetState,
    refreshData: () => {
      fetchTrips(userId)
      fetchPriceAlerts(userId)
      fetchRecommendations()
      fetchInsights(userId)
      fetchDashboard(userId)
    },
  }
}

export default useTravel
