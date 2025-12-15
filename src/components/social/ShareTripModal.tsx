import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plane, MapPin, Calendar } from 'lucide-react';
import CreatePostModal from './CreatePostModal';

interface ShareTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: {
    id: string;
    name: string;
    destination: string;
    startDate?: Date;
    endDate?: Date;
    description?: string;
  };
  onShare: (postData: any) => void;
}

const ShareTripModal: React.FC<ShareTripModalProps> = ({ isOpen, onClose, trip, onShare }) => {
  const [showPostModal, setShowPostModal] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Plane className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold">Share Trip</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="font-semibold mb-2">{trip.name}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  <span>{trip.destination}</span>
                </div>
                {trip.startDate && trip.endDate && (
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {trip.description && (
                  <p className="text-gray-600 dark:text-gray-400 mt-2">{trip.description}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowPostModal(true)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Post
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <CreatePostModal
        isOpen={showPostModal}
        onClose={() => {
          setShowPostModal(false);
          onClose();
        }}
        onSubmit={(postData) => {
          onShare({ ...postData, trip });
        }}
        shareType="trip"
        shareData={trip}
        initialContent={`✈️ Planning a trip to ${trip.destination}! ${trip.description || ''}`}
      />
    </>
  );
};

export default ShareTripModal;

