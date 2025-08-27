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
          set(state => ({ 
            loading: { ...state.loading, trips: true },
            errors: { ...state.errors, trips: null }
          }))
          
          try {
            const trips = await travelAPI.getTrips(userId)
            set(state => ({ 
              trips,
              loading: { ...state.loading, trips: false }
            }))
          } catch (error: any) {
            set(state => ({ 
              loading: { ...state.loading, trips: false },
              errors: { ...state.errors, trips: error.message }
            }))
            console.error('Failed to fetch trips:', error)
          }
        },
        
        createTrip: async (trip: TripCreate, userId = 'user_123') => {
          set(state => ({ 
            loading: { ...state.loading, trips: true },
            errors: { ...state.errors, trips: null }
          }))
          
          try {
            const newTrip = await travelAPI.createTrip(trip, userId)
            set(state => ({ 
              trips: [...state.trips, newTrip],
              loading: { ...state.loading, trips: false }
            }))
            return newTrip
          } catch (error: any) {
            set(state => ({ 
              loading: { ...state.loading, trips: false },
              errors: { ...state.errors, trips: error.message }
            }))
            console.error('Failed to create trip:', error)
            return null
          }
        },
        
        updateTrip: async (tripId: string, trip: TripCreate) => {
          set(state => ({ 
            loading: { ...state.loading, trips: true },
            errors: { ...state.errors, trips: null }
          }))
          
          try {
            const updatedTrip = await travelAPI.updateTrip(tripId, trip)
            set(state => ({ 
              trips: state.trips.map(t => t.id === tripId ? updatedTrip : t),
              loading: { ...state.loading, trips: false }
            }))
            return updatedTrip
          } catch (error: any) {
            set(state => ({ 
              loading: { ...state.loading, trips: false },
              errors: { ...state.errors, trips: error.message }
            }))
            console.error('Failed to update trip:', error)
            return null
          }
        },
        
        deleteTrip: async (tripId: string) => {
          set(state => ({ 
            loading: { ...state.loading, trips: true },
            errors: { ...state.errors, trips: null }
          }))
          
          try {
            await travelAPI.deleteTrip(tripId)
            set(state => ({ 
              trips: state.trips.filter(t => t.id !== tripId),
              loading: { ...state.loading, trips: false }
            }))
            return true
          } catch (error: any) {
            set(state => ({ 
              loading: { ...state.loading, trips: false },
              errors: { ...state.errors, trips: error.message }
            }))
            console.error('Failed to delete trip:', error)
            return false
          }
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
        name: 'travel-storage',
        partialize: (state) => ({
          trips: state.trips,
          priceAlerts: state.priceAlerts,
          recommendations: state.recommendations,
        }),
      }
    ),
    {
      name: 'travel-store',
    }
  )
)
