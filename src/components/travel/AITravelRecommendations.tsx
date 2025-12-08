import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  Star, 
  Heart, 
  MapPin,
  Zap,
  Brain,
  Target,
  Users,
  Clock,
  ArrowRight,
  Plane,
  Calendar,
  DollarSign,
  Globe,
  Eye,
  CheckCircle,
  Download
} from 'lucide-react';
import { useToastHelpers } from '../ui/Toast';
import travelAPI from '../../services/travelAPI';
import { useAuthStore } from '../../store/auth';

interface TravelDestination {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  duration: string;
  bestTime: string;
  category: string;
  tags: string[];
  confidence?: number;
  reason?: string;
  isDeal?: boolean;
  dealEndsIn?: string;
}

interface AITravelRecommendationsProps {
  type: 'personalized' | 'trending' | 'budget-friendly' | 'luxury' | 'adventure';
  limit?: number;
  title?: string;
  showReason?: boolean;
  showConfidence?: boolean;
}

const AITravelRecommendations: React.FC<AITravelRecommendationsProps> = ({
  type,
  limit = 6,
  title,
  showReason = false,
  showConfidence = false
}) => {
  const { info, success } = useToastHelpers();
  const [recommendations, setRecommendations] = useState<TravelDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<TravelDestination | null>(null);
  const [showTripModal, setShowTripModal] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Mock AI travel recommendations
        const mockRecommendations: TravelDestination[] = [
          {
            id: '1',
            name: 'Bali',
            country: 'Indonesia',
            description: 'Tropical paradise with stunning beaches, ancient temples, and vibrant culture',
            image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop',
            rating: 4.8,
            reviewCount: 1247,
            priceRange: '$800-$1500',
            duration: '7-10 days',
            bestTime: 'April-October',
            category: 'Beach',
            tags: ['beach', 'culture', 'relaxation', 'temple'],
            confidence: 0.95,
            reason: 'Based on your love for tropical destinations',
            isDeal: true,
            dealEndsIn: '3 days'
          },
          {
            id: '2',
            name: 'Paris',
            country: 'France',
            description: 'The City of Light with iconic landmarks, world-class cuisine, and romantic atmosphere',
            image: 'https://images.unsplash.com/photo-1502602898535-0b7b0b7b0b7b?w=400&h=300&fit=crop',
            rating: 4.7,
            reviewCount: 1892,
            priceRange: '$1200-$2000',
            duration: '5-7 days',
            bestTime: 'April-May, September-October',
            category: 'City',
            tags: ['culture', 'romance', 'food', 'art'],
            confidence: 0.92,
            reason: 'Perfect for your cultural interests'
          },
          {
            id: '3',
            name: 'Tokyo',
            country: 'Japan',
            description: 'Futuristic metropolis blending tradition with cutting-edge technology',
            image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
            rating: 4.9,
            reviewCount: 1567,
            priceRange: '$1500-$2500',
            duration: '7-10 days',
            bestTime: 'March-May, September-November',
            category: 'City',
            tags: ['technology', 'culture', 'food', 'shopping'],
            confidence: 0.88,
            reason: 'Matches your tech and culture preferences'
          },
          {
            id: '4',
            name: 'Santorini',
            country: 'Greece',
            description: 'Stunning volcanic island with white-washed buildings and breathtaking sunsets',
            image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop',
            rating: 4.8,
            reviewCount: 987,
            priceRange: '$1000-$1800',
            duration: '5-7 days',
            bestTime: 'June-September',
            category: 'Island',
            tags: ['romance', 'beach', 'sunset', 'relaxation'],
            confidence: 0.90,
            reason: 'Ideal for romantic getaways',
            isDeal: true,
            dealEndsIn: '1 week'
          },
          {
            id: '5',
            name: 'Machu Picchu',
            country: 'Peru',
            description: 'Ancient Incan citadel high in the Andes mountains',
            image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400&h=300&fit=crop',
            rating: 4.9,
            reviewCount: 756,
            priceRange: '$800-$1200',
            duration: '4-6 days',
            bestTime: 'April-October',
            category: 'Adventure',
            tags: ['adventure', 'history', 'mountains', 'culture'],
            confidence: 0.85,
            reason: 'Perfect for adventure seekers'
          },
          {
            id: '6',
            name: 'Maldives',
            country: 'Maldives',
            description: 'Pristine coral islands with crystal-clear waters and overwater bungalows',
            image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&h=300&fit=crop',
            rating: 4.9,
            reviewCount: 634,
            priceRange: '$2000-$4000',
            duration: '7-10 days',
            bestTime: 'November-April',
            category: 'Luxury',
            tags: ['luxury', 'beach', 'relaxation', 'romance'],
            confidence: 0.93,
            reason: 'Ultimate luxury beach experience'
          }
        ];

        // Filter based on type
        let filteredRecommendations = mockRecommendations;
        switch (type) {
          case 'budget-friendly':
            filteredRecommendations = mockRecommendations.filter(dest => 
              dest.priceRange.includes('$800') || dest.priceRange.includes('$1000')
            );
            break;
          case 'luxury':
            filteredRecommendations = mockRecommendations.filter(dest => 
              dest.priceRange.includes('$2000') || dest.priceRange.includes('$2500')
            );
            break;
          case 'adventure':
            filteredRecommendations = mockRecommendations.filter(dest => 
              dest.tags.includes('adventure') || dest.tags.includes('mountains')
            );
            break;
          default:
            break;
        }

        setRecommendations(filteredRecommendations.slice(0, limit));
             } catch (error: any) {
         setError('Failed to load recommendations');
         console.error('Error fetching recommendations:', error);
       } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [type, limit]);

  const getTypeIcon = () => {
    switch (type) {
      case 'personalized':
        return <Brain className="w-5 h-5" />;
      case 'trending':
        return <TrendingUp className="w-5 h-5" />;
      case 'budget-friendly':
        return <DollarSign className="w-5 h-5" />;
      case 'luxury':
        return <Star className="w-5 h-5" />;
      case 'adventure':
        return <Target className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getTypeTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'personalized':
        return 'Recommended for You';
      case 'trending':
        return 'Trending Destinations';
      case 'budget-friendly':
        return 'Budget-Friendly Trips';
      case 'luxury':
        return 'Luxury Escapes';
      case 'adventure':
        return 'Adventure Destinations';
      default:
        return 'AI Travel Recommendations';
    }
  };

  const getTypeDescription = () => {
    switch (type) {
      case 'personalized':
        return 'Based on your travel preferences and history';
      case 'trending':
        return 'Most popular destinations this season';
      case 'budget-friendly':
        return 'Amazing experiences under $1500';
      case 'luxury':
        return 'Premium travel experiences';
      case 'adventure':
        return 'Thrilling destinations for explorers';
      default:
        return 'AI-powered travel suggestions';
    }
  };

  const handlePlanTrip = (destination: TravelDestination) => {
    setSelectedDestination(destination);
    setShowTripModal(true);
    success(`Planning trip to ${destination.name}, ${destination.country}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="animate-pulse bg-gray-300 rounded-full w-5 h-5"></div>
          <div className="animate-pulse bg-gray-300 rounded h-6 w-48"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 rounded-lg h-48 mb-3"></div>
              <div className="bg-gray-300 rounded h-4 mb-2"></div>
              <div className="bg-gray-300 rounded h-3 w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-gray-500">
          <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>Unable to load recommendations</p>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-blue-600">
              {getTypeIcon()}
              <h3 className="text-lg font-semibold text-gray-900">{getTypeTitle()}</h3>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
              <Zap className="w-3 h-3" />
              <span>AI Powered</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-6">{getTypeDescription()}</p>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((destination, index) => (
            <motion.div
              key={destination.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                />
                
                {/* Confidence Badge */}
                {showConfidence && destination.confidence && (
                  <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {Math.round(destination.confidence * 100)}% match
                  </div>
                )}

                {/* Deal Badge */}
                {destination.isDeal && (
                  <div className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    Deal
                  </div>
                )}

                {/* Quick Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{destination.country}</span>
                </div>

                <h4 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                  {destination.name}
                </h4>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {destination.description}
                </p>

                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.floor(destination.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">({destination.reviewCount})</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{destination.priceRange}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{destination.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {destination.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Reason */}
                {showReason && destination.reason && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-1">{destination.reason}</p>
                )}

                {/* Deal Timer */}
                {destination.isDeal && destination.dealEndsIn && (
                  <div className="flex items-center text-xs text-red-600 mb-3">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>Deal ends in {destination.dealEndsIn}</span>
                  </div>
                )}

                {/* Plan Trip Button */}
                <button
                  onClick={() => handlePlanTrip(destination)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plane className="w-4 h-4" />
                  <span>Plan Trip</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trip Planning Modal */}
      {showTripModal && selectedDestination && (
        <TripPlanningModal
          destination={selectedDestination}
          isOpen={showTripModal}
          onClose={() => setShowTripModal(false)}
        />
      )}
    </>
  );
};

// Trip Planning Modal Component
interface TripPlanningModalProps {
  destination: TravelDestination;
  isOpen: boolean;
  onClose: () => void;
}

const TripPlanningModal: React.FC<TripPlanningModalProps> = ({
  destination,
  isOpen,
  onClose
}) => {
  const { success, error } = useToastHelpers();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [tripDetails, setTripDetails] = useState({
    startDate: '',
    endDate: '',
    travelers: 1,
    budget: '',
    accommodation: 'hotel',
    activities: [] as string[]
  });
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingReference, setBookingReference] = useState('');

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTripDetailsChange = (field: string, value: any) => {
    setTripDetails(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentDetailsChange = (field: string, value: string) => {
    setPaymentDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirmBooking = async () => {
    try {
      // Simulate booking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      const ref = `TRIP${Date.now()}`;
      setBookingReference(ref);
      setBookingComplete(true);
      setCurrentStep(4);
      success('Trip booked successfully!');
         } catch (error: any) {
       error('Booking failed. Please try again.');
     }
  };

  const handleDownloadTicket = async () => {
    try {
      console.log('Starting trip ticket download...');
      
      // Create trip booking data for PDF generation
      const tripBookingData = {
        bookingReference,
        passenger: {
          firstName: 'Trip',
          lastName: 'Traveler',
          email: 'trip@example.com',
          phone: '+1-555-0123',
          passportNumber: 'TRIP123456',
          nationality: 'International'
        },
        flight: {
          airline: 'AI Travel Airlines',
          flightNumber: `AI-${bookingReference}`,
          origin: 'Your Location',
          destination: destination.name,
          departureTime: tripDetails.startDate,
          arrivalTime: tripDetails.endDate,
          duration: `${tripDetails.travelers} travelers`,
          cabinClass: 'Economy',
          aircraft: 'AI Travel Jet'
        },
        seat: {
          seatNumber: 'AI-001',
          seatType: 'window',
          price: 0
        },
        totalPrice: tripDetails.budget
      };
      
      console.log('Trip booking data created:', tripBookingData);
      
      // Generate PDF ticket using the travelAPI service
      console.log('Calling travelAPI.generatePDFTicket...');
      const ticketBlob = await travelAPI.generatePDFTicket(tripBookingData);
      console.log('PDF blob received:', ticketBlob);
      console.log('Blob type:', ticketBlob.type);
      console.log('Blob size:', ticketBlob.size);
      
      // Download the ticket
      const url = URL.createObjectURL(ticketBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trip-ticket-${bookingReference}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('PDF download completed successfully');
      
      // Show success message
      success('Trip ticket downloaded successfully!');
    } catch (error: any) {
      console.error('Download failed:', error);
      console.error('Error details:', error.message, error.stack);
      error('Failed to download trip ticket. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <img
                src={destination.image}
                alt={destination.name}
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Plan Trip to {destination.name}</h2>
                <p className="text-sm text-gray-600">{destination.country}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Trip Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    value={tripDetails.startDate}
                    onChange={(e) => handleTripDetailsChange('startDate', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                    type="date"
                    value={tripDetails.endDate}
                    onChange={(e) => handleTripDetailsChange('endDate', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Travelers</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tripDetails.travelers}
                    onChange={(e) => handleTripDetailsChange('travelers', parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Budget (USD)</label>
                  <input
                    type="number"
                    value={tripDetails.budget}
                    onChange={(e) => handleTripDetailsChange('budget', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="1500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Accommodation Type</label>
                <select
                  value={tripDetails.accommodation}
                  onChange={(e) => handleTripDetailsChange('accommodation', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hotel">Hotel</option>
                  <option value="resort">Resort</option>
                  <option value="hostel">Hostel</option>
                  <option value="apartment">Apartment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Activities (Optional)</label>
                <div className="space-y-2">
                  {['Sightseeing', 'Adventure Sports', 'Cultural Tours', 'Beach Activities', 'Food Tours'].map((activity) => (
                    <label key={activity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tripDetails.activities.includes(activity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleTripDetailsChange('activities', [...tripDetails.activities, activity]);
                          } else {
                            handleTripDetailsChange('activities', tripDetails.activities.filter(a => a !== activity));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{activity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Review & Confirm</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Trip Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Destination:</span>
                    <span className="font-medium">{destination.name}, {destination.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{tripDetails.startDate} to {tripDetails.endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Travelers:</span>
                    <span className="font-medium">{tripDetails.travelers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accommodation:</span>
                    <span className="font-medium capitalize">{tripDetails.accommodation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Budget:</span>
                    <span className="font-medium">${tripDetails.budget}</span>
                  </div>
                  {tripDetails.activities.length > 0 && (
                    <div className="flex justify-between">
                      <span>Activities:</span>
                      <span className="font-medium">{tripDetails.activities.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-900">What's Included</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Flight booking assistance</li>
                  <li>• Hotel recommendations</li>
                  <li>• Activity planning</li>
                  <li>• 24/7 travel support</li>
                  <li>• Travel insurance options</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Card Number</label>
                  <input
                    type="text"
                    value={paymentDetails.cardNumber}
                    onChange={(e) => handlePaymentDetailsChange('cardNumber', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Card Holder</label>
                  <input
                    type="text"
                    value={paymentDetails.cardHolder}
                    onChange={(e) => handlePaymentDetailsChange('cardHolder', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={user?.displayName || user?.username || "Cardholder Name"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Expiry Date</label>
                  <input
                    type="text"
                    value={paymentDetails.expiryDate}
                    onChange={(e) => handlePaymentDetailsChange('expiryDate', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CVV</label>
                  <input
                    type="text"
                    value={paymentDetails.cvv}
                    onChange={(e) => handlePaymentDetailsChange('cvv', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="123"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This is a demo payment form. No actual charges will be made.
                </p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900">Booking Confirmed!</h3>
              <p className="text-gray-600">Your trip to {destination.name} has been successfully booked.</p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Booking Reference</p>
                <p className="font-mono font-bold text-lg">{bookingReference}</p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleDownloadTicket}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Ticket</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-6">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <button
                onClick={currentStep === 3 ? handleConfirmBooking : handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {currentStep === 3 ? 'Confirm Booking' : 'Next'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITravelRecommendations;
