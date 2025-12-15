import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Navigation, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface MapViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Array<{
    name: string;
    address: string;
    lat: number;
    lng: number;
    time?: string;
  }>;
  tripName?: string;
}

const MapViewModal: React.FC<MapViewModalProps> = ({
  isOpen,
  onClose,
  locations,
  tripName
}) => {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);

  const handleGetDirections = (location: any) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    window.open(mapsUrl, '_blank');
  };

  const handleViewFullMap = () => {
    // Create waypoints for all locations
    const waypoints = locations.map(loc => `${loc.lat},${loc.lng}`).join('/');
    const mapsUrl = `https://www.google.com/maps/dir/${waypoints}`;
    window.open(mapsUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">
              {tripName ? `${tripName} - Map View` : 'Itinerary Map'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map Container */}
          <div className="lg:col-span-2 bg-gray-100 dark:bg-gray-700 rounded-lg relative overflow-hidden">
            {/* Embedded Google Maps */}
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '400px' }}
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${locations[0]?.lat},${locations[0]?.lng}`}
            />
            
            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={handleViewFullMap}
                className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                title="Open in Google Maps"
              >
                <Maximize2 size={18} />
              </button>
            </div>
          </div>

          {/* Locations List */}
          <div className="space-y-2 overflow-y-auto max-h-[400px]">
            <h3 className="font-semibold mb-3">Itinerary Locations</h3>
            {locations.map((location, index) => (
              <div
                key={index}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedLocation === index
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setSelectedLocation(index)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <h4 className="font-medium">{location.name}</h4>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 ml-8">
                      {location.address}
                    </p>
                    {location.time && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 ml-8 mt-1">
                        {location.time}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGetDirections(location);
                  }}
                  className="mt-2 ml-8 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Navigation size={14} />
                  Get Directions
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t mt-4">
          <button
            onClick={handleViewFullMap}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Maximize2 size={16} />
            Open in Google Maps
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MapViewModal;

