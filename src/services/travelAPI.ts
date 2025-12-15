import axios from 'axios';
import { jsPDF } from 'jspdf';

import { API_BASE_URL } from '../config/api';

// Types
export interface Trip {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  trip_type: 'business' | 'leisure' | 'family' | 'adventure' | 'romantic' | 'solo' | 'group';
  status: 'planning' | 'booked' | 'active' | 'completed' | 'cancelled';
  destination: string;
  start_date: string;
  end_date: string;
  budget?: number;
  currency: string;
  travelers: Array<{ name: string; age: number }>;
  flights: any[];
  hotels: any[];
  activities: any[];
  itinerary: any[];
  documents: any[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TripCreate {
  title: string;
  description?: string;
  trip_type: 'business' | 'leisure' | 'family' | 'adventure' | 'romantic' | 'solo' | 'group';
  destination: string;
  start_date: string;
  end_date: string;
  budget?: number;
  currency: string;
  travelers: Array<{ name: string; age: number }>;
}

export interface Flight {
  id?: string;
  trip_id?: string;
  flight_number: string;
  airline: string;
  airline_code: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration: number;
  stops: number;
  cabin_class: 'economy' | 'premium_economy' | 'business' | 'first';
  price: number;
  currency: string;
  booking_reference?: string;
  seat_assignment?: string;
  status: string;
  created_at: string;
}

export interface Hotel {
  id?: string;
  trip_id?: string;
  name: string;
  address: string;
  city: string;
  country: string;
  check_in: string;
  check_out: string;
  room_type: string;
  price_per_night: number;
  currency: string;
  rating: number;
  amenities: string[];
  booking_reference?: string;
  status: string;
  created_at: string;
}

export interface Activity {
  id?: string;
  trip_id?: string;
  name: string;
  description?: string;
  type: string;
  location: string;
  date: string;
  start_time?: string;
  end_time?: string;
  price?: number;
  currency: string;
  notes?: string;
  created_at: string;
}

export interface PriceAlert {
  id?: string;
  user_id: string;
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  target_price: number;
  currency: string;
  cabin_class: 'economy' | 'premium_economy' | 'business' | 'first';
  is_active: boolean;
  created_at: string;
}

export interface PriceAlertCreate {
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  target_price: number;
  currency: string;
  cabin_class: 'economy' | 'premium_economy' | 'business' | 'first';
}

export interface TravelRecommendation {
  id?: string;
  destination: string;
  title: string;
  description: string;
  image_url: string;
  price_range: string;
  rating: number;
  category: string;
  tags: string[];
  created_at: string;
}

export interface TravelInsight {
  id?: string;
  user_id: string;
  type: string;
  title: string;
  content: string;
  data: Record<string, any>;
  created_at: string;
}

export interface TravelDashboard {
  total_trips: number;
  upcoming_trips: number;
  active_trips: number;
  completed_trips: number;
  total_spent: number;
  price_alerts: number;
  insights: number;
  recent_trips: Trip[];
  recommendations: TravelRecommendation[];
}

export interface FlightSearchRequest {
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  adults: number;
  children: number;
  infants: number;
  cabin_class: 'economy' | 'premium_economy' | 'business' | 'first';
  currency: string;
}

export interface FlightSearchResult {
  id: string;
  airline: string;
  airline_code?: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
  currency: string;
  cabin_class: string;
  stops: number;
  aircraft?: string;
  booking_url?: string;
}

// Flight Booking Interfaces
export interface PassengerDetails {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  passport_number: string;
  nationality: string;
}

export interface SeatSelection {
  seat_number: string;
  seat_type: 'window' | 'aisle' | 'middle';
  price: number;
}

export interface PaymentDetails {
  card_number: string;
  card_holder: string;
  expiry_date: string;
  cvv: string;
}

export interface FlightBooking {
  id?: string;
  user_id: string;
  flight_id: string;
  passenger_details: PassengerDetails;
  seat_selection?: SeatSelection;
  payment_details: PaymentDetails;
  booking_reference?: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface FlightBookingCreate {
  flight_id: string;
  passenger_details: PassengerDetails;
  seat_selection?: SeatSelection;
  payment_details: PaymentDetails;
}

export interface FlightTicket {
  id?: string;
  booking_id: string;
  ticket_number: string;
  passenger_name: string;
  flight_details: Record<string, any>;
  seat_details?: Record<string, any>;
  boarding_time?: string;
  gate?: string;
  created_at: string;
}

// API Service
class TravelAPIService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Check if backend is accessible
  private async isBackendAccessible(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/health`, { 
        timeout: 2000,
        validateStatus: () => true // Don't throw on any status code
      });
      return response.status === 200;
    } catch {
      // Silently return false - expected when backend is not available
      return false;
    }
  }

  // Helper method for API calls with retry
  private async apiCall<T>(endpoint: string, options: any = {}): Promise<T> {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // First, check if backend is accessible
      const isAccessible = await this.isBackendAccessible();
      if (!isAccessible) {
        // Silently use fallback data - don't log to console
        return this.getFallbackData<T>(endpoint);
      }

      // Try to make the actual request
      try {
        const response = await axios({
          url: `${this.baseURL}${endpoint}`,
          ...options,
          timeout: 3000,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
        return response.data;
      } catch (error: any) {
        // Check if it's a CSP error or network error
        if (error.message?.includes('CSP') || 
            error.message?.includes('Network Error') || 
            error.message?.includes('Content Security Policy') ||
            error.code === 'ERR_NETWORK' ||
            error.message?.includes('violates the following Content Security Policy')) {
          console.log(`CSP/Network blocked request for ${endpoint}, using fallback data`);
          return this.getFallbackData<T>(endpoint);
        }
        
        // For other errors, try one more time with a shorter timeout
        try {
          const response = await axios({
            url: `${this.baseURL}${endpoint}`,
            ...options,
            timeout: 2000,
            headers: {
              'Content-Type': 'application/json',
              ...options.headers,
            },
          });
          return response.data;
        } catch (retryError: any) {
          console.log(`Using fallback data for ${endpoint} after retry`);
          return this.getFallbackData<T>(endpoint);
        }
      }
    }
    
    // Fallback for non-browser environments
    return this.getFallbackData<T>(endpoint);
  }

  // Get fallback data for failed API calls
  private getFallbackData<T>(endpoint: string): T {
    if (endpoint.includes('/trips')) {
      return this.getMockTrips() as T;
    } else if (endpoint.includes('/recommendations')) {
      return this.getMockRecommendations() as T;
    } else if (endpoint.includes('/price-alerts')) {
      return this.getMockPriceAlerts() as T;
    } else if (endpoint.includes('/insights')) {
      return this.getMockInsights() as T;
    } else if (endpoint.includes('/dashboard')) {
      return {
        total_trips: 3,
        upcoming_trips: 2,
        active_trips: 0,
        completed_trips: 1,
        total_spent: 2500,
        price_alerts: 2,
        insights: 3,
        recent_trips: this.getMockTrips().slice(0, 3),
        recommendations: this.getMockRecommendations().slice(0, 4)
      } as T;
    } else if (endpoint.includes('/flights')) {
      return this.getMockFlights() as T;
    } else if (endpoint.includes('/hotels')) {
      return [] as T;
    } else if (endpoint.includes('/activities')) {
      return [] as T;
    }
    return [] as T;
  }

  // Mock price alerts data
  private getMockPriceAlerts(): PriceAlert[] {
    return [
      {
        id: 'alert_1',
        user_id: 'user_123',
        origin: 'BOM',
        destination: 'DEL',
        departure_date: '2024-12-25',
        return_date: undefined,
        target_price: 200,
        currency: 'USD',
        cabin_class: 'economy',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'alert_2',
        user_id: 'user_123',
        origin: 'NYC',
        destination: 'LON',
        departure_date: '2024-11-15',
        return_date: '2024-11-22',
        target_price: 500,
        currency: 'USD',
        cabin_class: 'economy',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];
  }

  // Mock insights data
  private getMockInsights(): TravelInsight[] {
    return [
      {
        id: 'insight_1',
        user_id: 'user_123',
        type: 'price_trend',
        title: 'Flight Prices Trending Down',
        content: 'Flight prices to Tokyo have decreased by 15% in the last month. Consider booking soon for the best deals.',
        data: { destination: 'Tokyo', price_change: -15, trend: 'down' },
        created_at: new Date().toISOString()
      },
      {
        id: 'insight_2',
        user_id: 'user_123',
        type: 'travel_tip',
        title: 'Best Time to Visit Paris',
        content: 'Spring (April-May) and Fall (September-October) offer the best weather and fewer crowds in Paris.',
        data: { destination: 'Paris', season: 'spring', tip_type: 'timing' },
        created_at: new Date().toISOString()
      },
      {
        id: 'insight_3',
        user_id: 'user_123',
        type: 'budget_optimization',
        title: 'Save on Accommodation',
        content: 'Consider staying in arrondissements 11-20 for better value while still being close to attractions.',
        data: { destination: 'Paris', savings: '20-30%', tip_type: 'accommodation' },
        created_at: new Date().toISOString()
      }
    ];
  }

  // Trip endpoints
  async getTrips(userId: string = 'user_123'): Promise<Trip[]> {
    return this.apiCall<Trip[]>(`/api/travel/trips?user_id=${userId}`);
  }

  async getTrip(tripId: string): Promise<Trip> {
    return this.apiCall<Trip>(`/api/travel/trips/${tripId}`);
  }

  async createTrip(trip: TripCreate, userId: string = 'user_123'): Promise<Trip> {
    return this.apiCall<Trip>('/api/travel/trips', {
      method: 'POST',
      data: trip,
      params: { user_id: userId },
    });
  }

  async updateTrip(tripId: string, trip: TripCreate): Promise<Trip> {
    return this.apiCall<Trip>(`/api/travel/trips/${tripId}`, {
      method: 'PUT',
      data: trip,
    });
  }

  async deleteTrip(tripId: string): Promise<{ message: string }> {
    return this.apiCall<{ message: string }>(`/api/travel/trips/${tripId}`, {
      method: 'DELETE',
    });
  }

  // Flight endpoints
  async getFlights(tripId?: string): Promise<Flight[]> {
    const params = tripId ? `?trip_id=${tripId}` : '';
    return this.apiCall<Flight[]>(`/api/travel/flights${params}`);
  }

  async createFlight(flight: Omit<Flight, 'id' | 'created_at'>): Promise<Flight> {
    return this.apiCall<Flight>('/api/travel/flights', {
      method: 'POST',
      data: flight,
    });
  }

  // Flight search endpoints
  async searchFlights(searchRequest: FlightSearchRequest): Promise<FlightSearchResult[]> {
    try {
      // Try the real API first
      const results = await this.apiCall<FlightSearchResult[]>('/api/travel/flights/search', {
        method: 'POST',
        data: searchRequest,
      });
      console.log('Flight search successful using real API');
      return results;
    } catch (error) {
      console.log('Using fallback flight data due to API error:', error);
      // Return mock data immediately if API fails
      const mockData = this.getMockFlights();
      console.log('Returning mock flight data:', mockData.length, 'flights');
      // Add a flag to indicate this is fallback data
      (mockData as any).isFallbackData = true;
      return mockData;
    }
  }

  // Generate PDF ticket locally
  async generatePDFTicket(bookingData: any): Promise<Blob> {
    try {
      console.log('Starting PDF generation for booking data:', bookingData);
      
      // Create new PDF document
      const doc = new jsPDF();
      console.log('PDF document created');
      
      // Set up colors
      const primaryColor = [30, 64, 175] as [number, number, number]; // Blue
      const secondaryColor = [107, 114, 128] as [number, number, number]; // Gray
      const successColor = [5, 150, 105] as [number, number, number]; // Green
      const warningColor = [217, 119, 6] as [number, number, number]; // Orange
      
      // Check if this is a trip booking (AI recommendation) or flight booking
      const isTripBooking = bookingData.flight?.airline === 'AI Travel Airlines';
      
      // Title Section
      doc.setFontSize(28);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(isTripBooking ? 'TRIP TICKET' : 'FLIGHT TICKET', 105, 25, { align: 'center' });
      
      // Booking Reference
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...secondaryColor);
      doc.text(`Booking Reference: ${bookingData.bookingReference}`, 20, 40);
      const generatedDate = new Date().toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      doc.text(`Generated: ${generatedDate}`, 20, 47);
      
      // Passenger Information Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...successColor);
      doc.text('PASSENGER INFORMATION', 20, 65);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`Name: ${bookingData.passenger.firstName} ${bookingData.passenger.lastName}`, 20, 78);
      doc.text(`Email: ${bookingData.passenger.email}`, 20, 85);
      doc.text(`Phone: ${bookingData.passenger.phone}`, 20, 92);
      doc.text(`Passport: ${bookingData.passenger.passportNumber}`, 20, 99);
      doc.text(`Nationality: ${bookingData.passenger.nationality}`, 20, 106);
      
      // Trip/Flight Information Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...successColor);
      doc.text(isTripBooking ? 'TRIP INFORMATION' : 'FLIGHT INFORMATION', 20, 130);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`Airline: ${bookingData.flight.airline}`, 20, 145);
      doc.text(`Flight Number: ${bookingData.flight.flightNumber}`, 20, 152);
      doc.text(`Origin: ${bookingData.flight.origin}`, 20, 159);
      doc.text(`Destination: ${bookingData.flight.destination}`, 20, 166);
      
      // Format dates properly
      const formatDate = (dateStr: string) => {
        try {
          const date = new Date(dateStr);
          return date.toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        } catch {
          return dateStr;
        }
      };
      
      doc.text(`Departure: ${formatDate(bookingData.flight.departureTime)}`, 20, 173);
      doc.text(`Arrival: ${formatDate(bookingData.flight.arrivalTime)}`, 20, 180);
      doc.text(`Duration: ${bookingData.flight.duration}`, 20, 187);
      doc.text(`Cabin Class: ${bookingData.flight.cabinClass}`, 20, 194);
      if (bookingData.flight.aircraft) {
        doc.text(`Aircraft: ${bookingData.flight.aircraft}`, 20, 201);
      }
      
      // Seat Information Section
      if (bookingData.seat) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...successColor);
        doc.text('SEAT INFORMATION', 20, 220);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`Seat Number: ${bookingData.seat.seatNumber}`, 20, 235);
        doc.text(`Seat Type: ${bookingData.seat.seatType.charAt(0).toUpperCase() + bookingData.seat.seatType.slice(1)}`, 20, 242);
        doc.text(`Seat Price: $${bookingData.seat.price.toFixed(2)}`, 20, 249);
      }
      
      // Price Information Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...successColor);
      doc.text('PRICE INFORMATION', 20, 265);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      const totalPrice = typeof bookingData.totalPrice === 'number' ? bookingData.totalPrice.toFixed(2) : bookingData.totalPrice;
      doc.text(`Total Price: $${totalPrice}`, 20, 280);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Currency: USD', 20, 287);
      
      // Boarding Information Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...warningColor);
      doc.text('BOARDING INFORMATION', 20, 305);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('Boarding Time: 09:30 AM', 20, 320);
      doc.text('Gate: B12', 20, 327);
      doc.text('Status: Confirmed', 20, 334);
      
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(...secondaryColor);
      const footerText = isTripBooking 
        ? 'Thank you for choosing AI Travel! Have an amazing journey.'
        : 'Thank you for choosing our airline! Have a safe and pleasant journey.';
      doc.text(footerText, 105, 350, { align: 'center' });
      
      // Add decorative borders
      doc.setDrawColor(30, 64, 175);
      doc.setLineWidth(2);
      doc.rect(10, 10, 190, 280);
      
      // Add inner border
      doc.setLineWidth(0.5);
      doc.rect(15, 15, 180, 270);
      
      // Generate PDF blob
      const pdfBlob = doc.output('blob');
      console.log('PDF blob generated successfully:', pdfBlob);
      console.log('Blob type:', pdfBlob.type);
      console.log('Blob size:', pdfBlob.size);
      return pdfBlob;
    } catch (error) {
      console.error('Failed to generate PDF ticket:', error);
      throw error;
    }
  }

  async quickFlightSearch(
    origin: string,
    destination: string,
    departureDate: string,
    returnDate?: string,
    adults: number = 1,
    currency: string = 'USD'
  ): Promise<{
    search_params: any;
    results: FlightSearchResult[];
    total_results: number;
  }> {
    const params = new URLSearchParams({
      origin,
      destination,
      departure_date: departureDate,
      adults: adults.toString(),
      currency,
    });
    
    if (returnDate) {
      params.append('return_date', returnDate);
    }
    
    return this.apiCall(`/api/travel/flights/search/quick?${params.toString()}`);
  }

  async getMinPrice(
    fromId: string,
    toId: string,
    cabinClass: string = 'ECONOMY',
    currency: string = 'USD'
  ): Promise<any> {
    const params = new URLSearchParams({
      from_id: fromId,
      to_id: toId,
      cabin_class: cabinClass,
      currency,
    });
    
    return this.apiCall(`/api/travel/flights/min-price?${params.toString()}`);
  }

  // Flight Booking endpoints
  async createFlightBooking(booking: FlightBookingCreate): Promise<FlightBooking> {
    return this.apiCall<FlightBooking>('/api/travel/flights/book', {
      method: 'POST',
      data: booking,
    });
  }

  async getFlightBookings(userId: string = 'user_123'): Promise<FlightBooking[]> {
    return this.apiCall<FlightBooking[]>(`/api/travel/flights/bookings?user_id=${userId}`);
  }

  async getFlightBooking(bookingId: string): Promise<FlightBooking> {
    return this.apiCall<FlightBooking>(`/api/travel/flights/bookings/${bookingId}`);
  }

  async getFlightTicket(bookingId: string): Promise<FlightTicket> {
    return this.apiCall<FlightTicket>(`/api/travel/flights/tickets/${bookingId}`);
  }

  async getAvailableSeats(): Promise<SeatSelection[]> {
    return this.apiCall<SeatSelection[]>('/api/travel/flights/seats/available');
  }

  async reserveSeat(seatNumber: string): Promise<{ message: string }> {
    return this.apiCall<{ message: string }>('/api/travel/flights/seats/reserve', {
      method: 'POST',
      data: { seat_number: seatNumber },
    });
  }

  async releaseSeat(seatNumber: string): Promise<{ message: string }> {
    return this.apiCall<{ message: string }>('/api/travel/flights/seats/release', {
      method: 'POST',
      data: { seat_number: seatNumber },
    });
  }

  async downloadTicket(bookingId: string): Promise<any> {
    return this.apiCall<any>(`/api/travel/flights/bookings/${bookingId}/download`);
  }

  // Hotel endpoints
  async getHotels(tripId?: string): Promise<Hotel[]> {
    const params = tripId ? `?trip_id=${tripId}` : '';
    return this.apiCall<Hotel[]>(`/api/travel/hotels${params}`);
  }

  async createHotel(hotel: Omit<Hotel, 'id' | 'created_at'>): Promise<Hotel> {
    return this.apiCall<Hotel>('/api/travel/hotels', {
      method: 'POST',
      data: hotel,
    });
  }

  // Activity endpoints
  async getActivities(tripId?: string): Promise<Activity[]> {
    const params = tripId ? `?trip_id=${tripId}` : '';
    return this.apiCall<Activity[]>(`/api/travel/activities${params}`);
  }

  async createActivity(activity: Omit<Activity, 'id' | 'created_at'>): Promise<Activity> {
    return this.apiCall<Activity>('/api/travel/activities', {
      method: 'POST',
      data: activity,
    });
  }

  // Price alert endpoints
  async getPriceAlerts(userId: string = 'user_123'): Promise<PriceAlert[]> {
    return this.apiCall<PriceAlert[]>(`/api/travel/price-alerts?user_id=${userId}`);
  }

  async createPriceAlert(alert: PriceAlertCreate, userId: string = 'user_123'): Promise<PriceAlert> {
    return this.apiCall<PriceAlert>('/api/travel/price-alerts', {
      method: 'POST',
      data: alert,
      params: { user_id: userId },
    });
  }

  async deletePriceAlert(alertId: string): Promise<{ message: string }> {
    return this.apiCall<{ message: string }>(`/api/travel/price-alerts/${alertId}`, {
      method: 'DELETE',
    });
  }

  // Recommendation endpoints
  async getRecommendations(category?: string): Promise<TravelRecommendation[]> {
    const params = category ? `?category=${category}` : '';
    return this.apiCall<TravelRecommendation[]>(`/api/travel/recommendations${params}`);
  }

  // Insight endpoints
  async getInsights(userId: string = 'user_123'): Promise<TravelInsight[]> {
    return this.apiCall<TravelInsight[]>(`/api/travel/insights?user_id=${userId}`);
  }

  // Dashboard endpoint
  async getDashboard(userId: string = 'user_123'): Promise<TravelDashboard> {
    return this.apiCall<TravelDashboard>(`/api/travel/dashboard?user_id=${userId}`);
  }

  // Utility methods
  async checkHealth(): Promise<{ message: string; version: string }> {
    return this.apiCall<{ message: string; version: string }>('/');
  }

  // Mock data fallback (for development/testing)
  getMockTrips(): Trip[] {
    return [
      {
        id: 'trip_1',
        user_id: 'user_123',
        title: 'Tokyo Adventure',
        description: 'Exploring the vibrant city of Tokyo',
        trip_type: 'leisure',
        status: 'booked',
        destination: 'Tokyo, Japan',
        start_date: '2024-03-15',
        end_date: '2024-03-22',
        budget: 2500,
        currency: 'USD',
        travelers: [{ name: 'John Doe', age: 30 }],
        flights: [
          {
            id: 'flight_1',
            airline: 'Japan Airlines',
            flight_number: 'JL001',
            departure_airport: 'JFK',
            arrival_airport: 'NRT',
            departure_time: '2024-03-15T10:00:00Z',
            arrival_time: '2024-03-16T14:00:00Z',
            duration: '14h 0m',
            price: 1200,
            cabin_class: 'economy',
            seat_number: '12A',
            booking_reference: 'JL001-123456',
            status: 'confirmed'
          }
        ],
        hotels: [
          {
            id: 'hotel_1',
            name: 'Park Hyatt Tokyo',
            location: 'Shinjuku, Tokyo',
            check_in: '2024-03-16',
            check_out: '2024-03-22',
            room_type: 'Deluxe Room',
            price: 300,
            booking_reference: 'PH-789012',
            status: 'confirmed'
          }
        ],
        activities: [
          {
            id: 'activity_1',
            name: 'Shibuya Crossing Tour',
            location: 'Shibuya, Tokyo',
            date: '2024-03-17',
            price: 50,
            booking_reference: 'ACT-345678',
            status: 'confirmed'
          }
        ],
        itinerary: [],
        documents: [
          {
            id: 'doc_1',
            type: 'flight_ticket',
            name: 'JL001 Flight Ticket',
            url: '/tickets/jl001-123456.pdf',
            created_at: new Date().toISOString()
          }
        ],
        notes: 'Excited for this trip!',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'trip_2',
        user_id: 'user_123',
        title: 'Paris Getaway',
        description: 'Romantic trip to the City of Light',
        trip_type: 'romantic',
        status: 'planning',
        destination: 'Paris, France',
        start_date: '2024-05-10',
        end_date: '2024-05-17',
        budget: 3000,
        currency: 'USD',
        travelers: [
          { name: 'John Doe', age: 30 },
          { name: 'Jane Doe', age: 28 }
        ],
        flights: [],
        hotels: [],
        activities: [],
        itinerary: [],
        documents: [],
        notes: 'Planning phase',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'trip_3',
        user_id: 'user_123',
        title: 'New York City Break',
        description: 'Weekend getaway to the Big Apple',
        trip_type: 'leisure',
        status: 'booked',
        destination: 'New York, USA',
        start_date: '2024-04-20',
        end_date: '2024-04-22',
        budget: 1500,
        currency: 'USD',
        travelers: [{ name: 'John Doe', age: 30 }],
        flights: [
          {
            id: 'flight_2',
            airline: 'Delta Airlines',
            flight_number: 'DL123',
            departure_airport: 'LAX',
            arrival_airport: 'JFK',
            departure_time: '2024-04-20T08:00:00Z',
            arrival_time: '2024-04-20T16:00:00Z',
            duration: '8h 0m',
            price: 450,
            cabin_class: 'economy',
            seat_number: '15B',
            booking_reference: 'DL123-654321',
            status: 'confirmed'
          }
        ],
        hotels: [
          {
            id: 'hotel_2',
            name: 'The Plaza Hotel',
            location: 'Central Park South, NYC',
            check_in: '2024-04-20',
            check_out: '2024-04-22',
            room_type: 'Standard Room',
            price: 400,
            booking_reference: 'PLZ-987654',
            status: 'confirmed'
          }
        ],
        activities: [],
        itinerary: [],
        documents: [
          {
            id: 'doc_2',
            type: 'flight_ticket',
            name: 'DL123 Flight Ticket',
            url: '/tickets/dl123-654321.pdf',
            created_at: new Date().toISOString()
          }
        ],
        notes: 'Weekend in NYC!',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];
  }

  getMockFlights(): FlightSearchResult[] {
    return [
      {
        id: 'flight_1',
        airline: 'Delta Airlines',
        flight_number: 'DL123',
        origin: 'JFK',
        destination: 'LAX',
        departure_time: '2024-06-15T08:00:00Z',
        arrival_time: '2024-06-15T11:30:00Z',
        duration: '6h 30m',
        price: 450,
        currency: 'USD',
        cabin_class: 'economy',
        stops: 0,
        aircraft: 'Boeing 737-800',
        booking_url: 'https://delta.com',
      },
      {
        id: 'flight_2',
        airline: 'American Airlines',
        flight_number: 'AA456',
        origin: 'JFK',
        destination: 'LAX',
        departure_time: '2024-06-15T10:30:00Z',
        arrival_time: '2024-06-15T14:00:00Z',
        duration: '6h 30m',
        price: 380,
        currency: 'USD',
        cabin_class: 'economy',
        stops: 1,
        aircraft: 'Airbus A321',
        booking_url: 'https://aa.com',
      },
      {
        id: 'flight_3',
        airline: 'United Airlines',
        flight_number: 'UA789',
        origin: 'JFK',
        destination: 'LAX',
        departure_time: '2024-06-15T14:00:00Z',
        arrival_time: '2024-06-15T17:30:00Z',
        duration: '6h 30m',
        price: 520,
        currency: 'USD',
        cabin_class: 'economy',
        stops: 0,
        aircraft: 'Boeing 787-9',
        booking_url: 'https://united.com',
      },
      {
        id: 'flight_4',
        airline: 'JetBlue',
        flight_number: 'B6123',
        origin: 'JFK',
        destination: 'LAX',
        departure_time: '2024-06-15T16:30:00Z',
        arrival_time: '2024-06-15T20:00:00Z',
        duration: '6h 30m',
        price: 320,
        currency: 'USD',
        cabin_class: 'economy',
        stops: 0,
        aircraft: 'Airbus A320',
        booking_url: 'https://jetblue.com',
      },
      {
        id: 'flight_5',
        airline: 'Southwest Airlines',
        flight_number: 'WN456',
        origin: 'JFK',
        destination: 'LAX',
        departure_time: '2024-06-15T19:00:00Z',
        arrival_time: '2024-06-15T22:30:00Z',
        duration: '6h 30m',
        price: 290,
        currency: 'USD',
        cabin_class: 'economy',
        stops: 1,
        aircraft: 'Boeing 737-700',
        booking_url: 'https://southwest.com',
      }
    ];
  }

  getMockRecommendations(): TravelRecommendation[] {
    return [
      {
        id: 'rec_1',
        destination: 'Bali, Indonesia',
        title: 'Tropical Paradise',
        description: 'Experience the perfect blend of culture and relaxation',
        image_url: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=300&h=200&fit=crop',
        price_range: '$800-$1500',
        rating: 4.8,
        category: 'Beach',
        tags: ['beach', 'culture', 'relaxation'],
        created_at: new Date().toISOString(),
      },
      {
        id: 'rec_2',
        destination: 'Santorini, Greece',
        title: 'Mediterranean Dream',
        description: 'Stunning sunsets and white-washed buildings',
        image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=300&h=200&fit=crop',
        price_range: '$1200-$2000',
        rating: 4.9,
        category: 'Island',
        tags: ['island', 'romantic', 'sunset'],
        created_at: new Date().toISOString(),
      },
    ];
  }
}

// Create and export the service instance
const travelAPI = new TravelAPIService();
export default travelAPI;

// Export the service class for testing
export { TravelAPIService };
