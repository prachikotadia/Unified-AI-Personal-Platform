import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import travelAPI, { 
  Trip, 
  TripCreate, 
  Flight, 
  Hotel, 
  Activity, 
  PriceAlert, 
  PriceAlertCreate,
  TravelRecommendation,
  TravelInsight,
  TravelDashboard,
  FlightSearchRequest,
  FlightSearchResult
} from '../services/travelAPI'

interface TravelState {
  // Data
  trips: Trip[]
  flights: Flight[]
  hotels: Hotel[]
  activities: Activity[]
  priceAlerts: PriceAlert[]
  recommendations: TravelRecommendation[]
  insights: TravelInsight[]
  dashboard: TravelDashboard | null
  flightSearchResults: FlightSearchResult[]
  
  // Loading states
  loading: {
    trips: boolean
    flights: boolean
    hotels: boolean
    activities: boolean
    priceAlerts: boolean
    recommendations: boolean
    insights: boolean
    dashboard: boolean
    flightSearch: boolean
  }
  
  // Error states
  errors: {
    trips: string | null
    flights: string | null
    hotels: string | null
    activities: string | null
    priceAlerts: string | null
    recommendations: string | null
    insights: string | null
    dashboard: string | null
    flightSearch: string | null
  }
  
  // Actions
  // Trip actions
  fetchTrips: (userId?: string) => Promise<void>
  createTrip: (trip: TripCreate, userId?: string) => Promise<Trip | null>
  updateTrip: (tripId: string, trip: TripCreate) => Promise<Trip | null>
  deleteTrip: (tripId: string) => Promise<boolean>
  
  // Flight actions
  fetchFlights: (tripId?: string) => Promise<void>
  createFlight: (flight: Omit<Flight, 'id' | 'created_at'>) => Promise<Flight | null>
  
  // Hotel actions
  fetchHotels: (tripId?: string) => Promise<void>
  createHotel: (hotel: Omit<Hotel, 'id' | 'created_at'>) => Promise<Hotel | null>
  
  // Activity actions
  fetchActivities: (tripId?: string) => Promise<void>
  createActivity: (activity: Omit<Activity, 'id' | 'created_at'>) => Promise<Activity | null>
  
  // Price alert actions
  fetchPriceAlerts: (userId?: string) => Promise<void>
  createPriceAlert: (alert: PriceAlertCreate, userId?: string) => Promise<PriceAlert | null>
  deletePriceAlert: (alertId: string) => Promise<boolean>
  
  // Recommendation actions
  fetchRecommendations: (category?: string) => Promise<void>
  
  // Insight actions
  fetchInsights: (userId?: string) => Promise<void>
  
  // Dashboard actions
  fetchDashboard: (userId?: string) => Promise<void>
  
  // Flight search actions
  searchFlights: (searchRequest: FlightSearchRequest) => Promise<FlightSearchResult[]>
  quickFlightSearch: (origin: string, destination: string, departureDate: string, returnDate?: string, adults?: number, currency?: string) => Promise<any>
  getMinPrice: (fromId: string, toId: string, cabinClass?: string, currency?: string) => Promise<any>
  
  // Utility actions
  clearErrors: () => void
  resetState: () => void
}

const initialState = {
  trips: [],
  flights: [],
  hotels: [],
  activities: [],
  priceAlerts: [],
  recommendations: [],
  insights: [],
  dashboard: null,
  flightSearchResults: [],
  loading: {
    trips: false,
    flights: false,
    hotels: false,
    activities: false,
    priceAlerts: false,
    recommendations: false,
    insights: false,
    dashboard: false,
    flightSearch: false,
  },
  errors: {
    trips: null,
    flights: null,
    hotels: null,
    activities: null,
    priceAlerts: null,
    recommendations: null,
    insights: null,
    dashboard: null,
    flightSearch: null,
  },
}

export const useTravelStore = create<TravelState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Trip actions
        fetchTrips: async (userId = 'user_123') => {
          // Trips are automatically loaded from localStorage by Zustand persist
          // Only fetch from API if we're in logged-in mode and want to sync
          const currentTrips = get().trips;
          
          // If we have trips from localStorage, we're good - Zustand persist handles loading
          // Only try API sync if backend is available (optional enhancement)
          if (currentTrips.length > 0) {
            // Trips already loaded from localStorage, no need to fetch
            return;
          }
          
          set(state => ({ 
            loading: { ...state.loading, trips: true },
            errors: { ...state.errors, trips: null }
          }))
          
          try {
            const apiTrips = await travelAPI.getTrips(userId)
            // Merge API trips with existing local trips (local trips take precedence if same ID)
            set(state => {
              const existingTrips = state.trips || []
              const apiTripsMap = new Map(apiTrips.map(t => [t.id, t]))
              const localTripsMap = new Map(existingTrips.map(t => [t.id, t]))
              
              // Merge: Local trips take precedence, then API trips that don't exist locally
              const mergedTrips = [
                ...Array.from(localTripsMap.values()),
                ...Array.from(apiTripsMap.values()).filter(t => !localTripsMap.has(t.id))
              ]
              
              return {
                trips: mergedTrips,
                loading: { ...state.loading, trips: false }
              }
            })
          } catch (error: any) {
            // Don't overwrite existing trips if API fails - keep what's in localStorage
            set(state => ({ 
              loading: { ...state.loading, trips: false },
              errors: { ...state.errors, trips: null } // Don't show error, just use local data
            }))
          }
        },
        
        createTrip: async (trip: TripCreate, userId = 'user_123') => {
          set(state => ({ 
            loading: { ...state.loading, trips: true },
            errors: { ...state.errors, trips: null }
          }))
          
          // Generate a unique ID for the trip
          const tripId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          const now = new Date().toISOString()
          
          // Create trip object with all required fields
          const newTrip: Trip = {
            id: tripId,
            user_id: userId,
            title: trip.title,
            description: trip.description || '',
            trip_type: trip.trip_type || 'leisure',
            destination: trip.destination,
            start_date: trip.start_date,
            end_date: trip.end_date,
            status: 'planning',
            budget: trip.budget,
            currency: trip.currency || 'USD',
            travelers: trip.travelers || [],
            flights: [],
            hotels: [],
            activities: [],
            itinerary: [],
            documents: [],
            created_at: now,
            updated_at: now,
          }
          
          // Always add trip to local state first (for immediate UI update)
          set(state => ({ 
            trips: [...state.trips, newTrip],
            loading: { ...state.loading, trips: false }
          }))
          
          // Try to sync with backend (but don't fail if it doesn't work)
          try {
            const apiTrip = await travelAPI.createTrip(trip, userId)
            // If API returns a trip with an ID, update our local trip with the API ID
            if (apiTrip && apiTrip.id && apiTrip.id !== tripId) {
              set(state => ({
                trips: state.trips.map(t => 
                  t.id === tripId ? { ...t, id: apiTrip.id } : t
                )
              }))
            }
          } catch (error: any) {
            // Silently fail - trip is already in local state and will persist
            // Don't set error state as the trip was successfully created locally
          }
          
          return newTrip
        },
        
        updateTrip: async (tripId: string, trip: TripCreate) => {
          set(state => ({ 
            loading: { ...state.loading, trips: true },
            errors: { ...state.errors, trips: null }
          }))
          
          // Find existing trip to preserve its ID and other fields
          const existingTrip = get().trips.find(t => t.id === tripId)
          if (!existingTrip) {
            set(state => ({ 
              loading: { ...state.loading, trips: false },
              errors: { ...state.errors, trips: 'Trip not found' }
            }))
            return null
          }
          
          // Create updated trip object
          const updatedTrip: Trip = {
            ...existingTrip,
            title: trip.title,
            description: trip.description || existingTrip.description,
            trip_type: trip.trip_type || existingTrip.trip_type,
            destination: trip.destination,
            start_date: trip.start_date,
            end_date: trip.end_date,
            budget: trip.budget,
            currency: trip.currency || existingTrip.currency,
            travelers: trip.travelers || existingTrip.travelers,
            updated_at: new Date().toISOString(),
          }
          
          // Update local state immediately
          set(state => ({ 
            trips: state.trips.map(t => t.id === tripId ? updatedTrip : t),
            loading: { ...state.loading, trips: false }
          }))
          
          // Try to sync with backend (but don't fail if it doesn't work)
          try {
            const apiTrip = await travelAPI.updateTrip(tripId, trip)
            if (apiTrip) {
              // Update with API response if available
              set(state => ({
                trips: state.trips.map(t => t.id === tripId ? { ...updatedTrip, ...apiTrip } : t)
              }))
            }
          } catch (error: any) {
            // Silently fail - trip is already updated locally and will persist
          }
          
          return updatedTrip
        },
        
        deleteTrip: async (tripId: string) => {
          set(state => ({ 
            loading: { ...state.loading, trips: true },
            errors: { ...state.errors, trips: null }
          }))
          
          // Remove from local state immediately
          set(state => ({ 
            trips: state.trips.filter(t => t.id !== tripId),
            loading: { ...state.loading, trips: false }
          }))
          
          // Try to sync with backend (but don't fail if it doesn't work)
          try {
            await travelAPI.deleteTrip(tripId)
          } catch (error: any) {
            // Silently fail - trip is already deleted locally and will persist
          }
          
          return true
        },
        
        // Flight actions
        fetchFlights: async (tripId?: string) => {
          set(state => ({ 
            loading: { ...state.loading, flights: true },
            errors: { ...state.errors, flights: null }
          }))
          
          try {
            const flights = await travelAPI.getFlights(tripId)
            set(state => ({ 
              flights,
              loading: { ...state.loading, flights: false }
            }))
          } catch (error: any) {
            set(state => ({ 
              loading: { ...state.loading, flights: false },
              errors: { ...state.errors, flights: error.message }
            }))
            console.error('Failed to fetch flights:', error)
          }
        },
        
        createFlight: async (flight: Omit<Flight, 'id' | 'created_at'>) => {
          set(state => ({ 
            loading: { ...state.loading, flights: true },
            errors: { ...state.errors, flights: null }
          }))
          
          try {
            const newFlight = await travelAPI.createFlight(flight)
            set(state => ({ 
              flights: [...state.flights, newFlight],
              loading: { ...state.loading, flights: false }
            }))
            return newFlight
          } catch (error: any) {
            set(state => ({ 
              loading: { ...state.loading, flights: false },
              errors: { ...state.errors, flights: error.message }
            }))
            console.error('Failed to create flight:', error)
            return null
          }
        },
        
        // Hotel actions
        fetchHotels: async (tripId?: string) => {
          set(state => ({ 
            loading: { ...state.loading, hotels: true },
            errors: { ...state.errors, hotels: null }
          }))
          
          try {
            const hotels = await travelAPI.getHotels(tripId)
            set(state => ({ 
              hotels,
              loading: { ...state.loading, hotels: false }
            }))
          } catch (error: any) {
            set(state => ({ 
              loading: { ...state.loading, hotels: false },
              errors: { ...state.errors, hotels: error.message }
            }))
            console.error('Failed to fetch hotels:', error)
          }
        },
        
        createHotel: async (hotel: Omit<Hotel, 'id' | 'created_at'>) => {
          set(state => ({ 
            loading: { ...state.loading, hotels: true },
            errors: { ...state.errors, hotels: null }
          }))
          
          try {
            const newHotel = await travelAPI.createHotel(hotel)
            set(state => ({ 
              hotels: [...state.hotels, newHotel],
              loading: { ...state.loading, hotels: false }
            }))
            return newHotel
          } catch (error: any) {
            set(state => ({ 
              loading: { ...state.loading, hotels: false },
              errors: { ...state.errors, hotels: error.message }
            }))
            console.error('Failed to create hotel:', error)
            return null
          }
        },
        
        // Activity actions
        fetchActivities: async (tripId?: string) => {
          set(state => ({ 
            loading: { ...state.loading, activities: true },
            errors: { ...state.errors, activities: null }
          }))
          
          try {
            const activities = await travelAPI.getActivities(tripId)
            set(state => ({ 
              activities,
              loading: { ...state.loading, activities: false }
            }))
          } catch (error: any) {
            set(state => ({ 
              loading: { ...state.loading, activities: false },
              errors: { ...state.errors, activities: error.message }
            }))
            console.error('Failed to fetch activities:', error)
          }
        },
        
        createActivity: async (activity: Omit<Activity, 'id' | 'created_at'>) => {
          set(state => ({ 
            loading: { ...state.loading, activities: true },
            errors: { ...state.errors, activities: null }
          }))
          
          try {
            const newActivity = await travelAPI.createActivity(activity)
            set(state => ({ 
              activities: [...state.activities, newActivity],
              loading: { ...state.loading, activities: false }
            }))
            return newActivity
          } catch (error: any) {
            set(state => ({ 
              loading: { ...state.loading, activities: false },
              errors: { ...state.errors, activities: error.message }
            }))
            console.error('Failed to create activity:', error)
            return null
          }
        },
        
        // Price alert actions
        fetchPriceAlerts: async (userId = 'user_123') => {
          set(state => ({ 
            loading: { ...state.loading, priceAlerts: true },
            errors: { ...state.errors, priceAlerts: null }
          }))
          
          try {
            const priceAlerts = await travelAPI.getPriceAlerts(userId)
            set(state => ({ 
              priceAlerts,
              loading: { ...state.loading, priceAlerts: false }
            }))
          } catch (error: any) {
            set(state => ({ 
              loading: { ...state.loading, priceAlerts: false },
              errors: { ...state.errors, priceAlerts: error.message }
            }))
            console.error('Failed to fetch price alerts:', error)
          }
        },
        
        createPriceAlert: async (alert: PriceAlertCreate, userId = 'user_123') => {
          set(state => ({ 
            loading: { ...state.loading, priceAlerts: true },
            errors: { ...state.errors, priceAlerts: null }
          }))
          
          try {
            const newAlert = await travelAPI.createPriceAlert(alert, userId)
            set(state => ({ 
              priceAlerts: [...state.priceAlerts, newAlert],
              loading: { ...state.loading, priceAlerts: false }
            }))
            return newAlert
          } catch (error: any) {
            set(state => ({ 
              loading: { ...state.loading, priceAlerts: false },
              errors: { ...state.errors, priceAlerts: error.message }
            }))
            console.error('Failed to create price alert:', error)
            return null
          }
        },
        
        deletePriceAlert: async (alertId: string) => {
          set(state => ({ 
            loading: { ...state.loading, priceAlerts: true },
            errors: { ...state.errors, priceAlerts: null }
          }))
          
          try {
            await travelAPI.deletePriceAlert(alertId)
            set(state => ({ 
              priceAlerts: state.priceAlerts.filter(a => a.id !== alertId),
              loading: { ...state.loading, priceAlerts: false }
            }))
            return true
          } catch (error: any) {
            set(state => ({ 
              loading: { ...state.loading, priceAlerts: false },
              errors: { ...state.errors, priceAlerts: error.message }
            }))
            console.error('Failed to delete price alert:', error)
            return false
          }
        },
        
        // Recommendation actions
        fetchRecommendations: async (category?: string) => {
          set(state => ({ 
            loading: { ...state.loading, recommendations: true },
            errors: { ...state.errors, recommendations: null }
          }))
          
          try {
            const recommendations = await travelAPI.getRecommendations(category)
            set(state => ({ 
              recommendations,
              loading: { ...state.loading, recommendations: false }
            }))
          } catch (error: any) {
            set(state => ({ 
              loading: { ...state.loading, recommendations: false },
              errors: { ...state.errors, recommendations: error.message }
            }))
            console.error('Failed to fetch recommendations:', error)
          }
        },
        
        // Insight actions
        fetchInsights: async (userId = 'user_123') => {
          set(state => ({ 
            loading: { ...state.loading, insights: true },
            errors: { ...state.errors, insights: null }
          }))
          
          try {
            const insights = await travelAPI.getInsights(userId)
            set(state => ({ 
              insights,
              loading: { ...state.loading, insights: false }
            }))
          } catch (error: any) {
            set(state => ({ 
              loading: { ...state.loading, insights: false },
              errors: { ...state.errors, insights: error.message }
            }))
            console.error('Failed to fetch insights:', error)
          }
        },
        
        // Dashboard actions
        fetchDashboard: async (userId = 'user_123') => {
          set(state => ({ 
            loading: { ...state.loading, dashboard: true },
            errors: { ...state.errors, dashboard: null }
          }))
          
          try {
            const dashboard = await travelAPI.getDashboard(userId)
            set(state => ({ 
              dashboard,
              loading: { ...state.loading, dashboard: false }
            }))
          } catch (error: any) {
            set(state => ({ 
              loading: { ...state.loading, dashboard: false },
              errors: { ...state.errors, dashboard: error.message }
            }))
            console.error('Failed to fetch dashboard:', error)
          }
        },
        
        // Flight search actions
        searchFlights: async (searchRequest: FlightSearchRequest) => {
          set(state => ({ 
            loading: { ...state.loading, flightSearch: true },
            errors: { ...state.errors, flightSearch: null }
          }))
          
          try {
            const results = await travelAPI.searchFlights(searchRequest)
            set(state => ({ 
              flightSearchResults: results,
              loading: { ...state.loading, flightSearch: false }
            }))
            return results
          } catch (error: any) {
            set(state => ({ 
              loading: { ...state.loading, flightSearch: false },
              errors: { ...state.errors, flightSearch: error.message }
            }))
            console.error('Failed to search flights:', error)
            return []
          }
        },
        
        quickFlightSearch: async (origin: string, destination: string, departureDate: string, returnDate?: string, adults: number = 1, currency: string = 'USD') => {
          set(state => ({ 
            loading: { ...state.loading, flightSearch: true },
            errors: { ...state.errors, flightSearch: null }
          }))
          
          try {
            const result = await travelAPI.quickFlightSearch(origin, destination, departureDate, returnDate, adults, currency)
            set(state => ({ 
              flightSearchResults: result.results,
              loading: { ...state.loading, flightSearch: false }
            }))
            return result
          } catch (error: any) {
            set(state => ({ 
              loading: { ...state.loading, flightSearch: false },
              errors: { ...state.errors, flightSearch: error.message }
            }))
            console.error('Failed to quick search flights:', error)
            return { results: [], total_results: 0 }
          }
        },
        
        getMinPrice: async (fromId: string, toId: string, cabinClass: string = 'ECONOMY', currency: string = 'USD') => {
          try {
            return await travelAPI.getMinPrice(fromId, toId, cabinClass, currency)
          } catch (error: any) {
            console.error('Failed to get min price:', error)
            return { error: 'Failed to get minimum price' }
          }
        },
        
        // Utility actions
        clearErrors: () => {
          set(state => ({
            errors: {
              trips: null,
              flights: null,
              hotels: null,
              activities: null,
              priceAlerts: null,
              recommendations: null,
              insights: null,
              dashboard: null,
              flightSearch: null,
            }
          }))
        },
        
        resetState: () => {
          set(initialState)
        },
      }),
      {
        name: 'travel-store',
        version: 1,
        partialize: (state) => ({
          trips: state.trips,
          priceAlerts: state.priceAlerts,
          recommendations: state.recommendations,
        }),
        migrate: (persistedState: any, version: number) => {
          if (version === 0) {
            return {
              ...persistedState,
              trips: persistedState.trips || [],
              priceAlerts: persistedState.priceAlerts || [],
              recommendations: persistedState.recommendations || [],
            };
          }
          return persistedState;
        },
        storage: {
          getItem: (name) => {
            try {
              const str = localStorage.getItem(name);
              if (!str) return null;
              const parsed = JSON.parse(str);
              if (!parsed.state) {
                console.warn(`[Travel Store] Invalid localStorage structure for ${name}, resetting...`);
                return null;
              }
              return parsed;
            } catch (error) {
              console.error(`[Travel Store] Failed to parse localStorage for ${name}:`, error);
              return null;
            }
          },
          setItem: (name, value) => {
            try {
              localStorage.setItem(name, JSON.stringify(value));
            } catch (error) {
              console.error(`[Travel Store] Failed to save to localStorage for ${name}:`, error);
            }
          },
          removeItem: (name) => {
            try {
              localStorage.removeItem(name);
            } catch (error) {
              console.error(`[Travel Store] Failed to remove from localStorage for ${name}:`, error);
            }
          },
        },
      }
    ),
    {
      name: 'travel-store-devtools',
    }
  )
)
