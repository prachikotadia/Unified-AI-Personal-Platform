import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Star, Calendar, DollarSign, Users, Heart, Share2, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DestinationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: {
    id: number;
    destination: string;
    price: number;
    image: string;
    rating: number;
    duration: string;
    description: string;
    location?: string;
    bestTimeToVisit?: string;
    attractions?: string[];
  };
  onPlanTrip?: (destination: any) => void;
  onSave?: (destinationId: number) => void;
}

const DestinationDetailModal: React.FC<DestinationDetailModalProps> = ({
  isOpen,
  onClose,
  destination,
  onPlanTrip,
  onSave
}) => {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  const handlePlanTrip = () => {
    if (onPlanTrip) {
      onPlanTrip(destination);
    } else {
      navigate('/travel', { state: { destination: destination.destination } });
    }
    onClose();
  };

  const handleSave = () => {
    if (onSave) {
      onSave(destination.id);
    }
    setSaved(!saved);
  };

  const handleGetDirections = () => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination.destination)}`;
    window.open(mapsUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">{destination.destination}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Image */}
          <img
            src={destination.image}
            alt={destination.destination}
            className="w-full h-64 object-cover rounded-lg"
          />

          {/* Key Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Star className="text-yellow-500" size={20} />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
                <div className="font-semibold">{destination.rating}/5</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="text-green-500" size={20} />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Price</div>
                <div className="font-semibold">${destination.price}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="text-blue-500" size={20} />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
                <div className="font-semibold">{destination.duration}</div>
              </div>
            </div>
            {destination.location && (
              <div className="flex items-center gap-2">
                <MapPin className="text-red-500" size={20} />
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Location</div>
                  <div className="font-semibold text-xs">{destination.location}</div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-gray-600 dark:text-gray-400">{destination.description}</p>
          </div>

          {/* Best Time to Visit */}
          {destination.bestTimeToVisit && (
            <div>
              <h3 className="font-semibold mb-2">Best Time to Visit</h3>
              <p className="text-gray-600 dark:text-gray-400">{destination.bestTimeToVisit}</p>
            </div>
          )}

          {/* Attractions */}
          {destination.attractions && destination.attractions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Top Attractions</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                {destination.attractions.map((attraction, index) => (
                  <li key={index}>{attraction}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <button
              onClick={handlePlanTrip}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <Calendar size={18} />
              Plan Trip
            </button>
            <button
              onClick={handleSave}
              className={`btn-secondary flex items-center gap-2 ${
                saved ? 'bg-red-600 text-white' : ''
              }`}
            >
              <Heart size={18} className={saved ? 'fill-current' : ''} />
              {saved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={handleGetDirections}
              className="btn-secondary flex items-center gap-2"
            >
              <Navigation size={18} />
              Directions
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <Share2 size={18} />
              Share
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DestinationDetailModal;

