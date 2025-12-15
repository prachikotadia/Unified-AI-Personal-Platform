import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, FileText, Calendar, Mail } from 'lucide-react';

interface ExportItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: {
    id: string;
    title: string;
    destination: string;
  };
  onExportPDF: () => void;
  onExportCalendar: () => void;
  onEmailItinerary?: (email: string) => void;
}

const ExportItineraryModal: React.FC<ExportItineraryModalProps> = ({
  isOpen,
  onClose,
  trip,
  onExportPDF,
  onExportCalendar,
  onEmailItinerary
}) => {
  const [email, setEmail] = useState('');

  const handleExportPDF = () => {
    onExportPDF();
    onClose();
  };

  const handleExportCalendar = () => {
    onExportCalendar();
    onClose();
  };

  const handleEmailItinerary = () => {
    if (!email.trim()) {
      alert('Please enter an email address');
      return;
    }
    if (onEmailItinerary) {
      onEmailItinerary(email);
      setEmail('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Download className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">Export Itinerary</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Trip:</strong> {trip.title}
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Destination:</strong> {trip.destination}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleExportPDF}
              className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FileText className="text-blue-600" size={20} />
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 dark:text-white">Export as PDF</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Download itinerary as PDF document</p>
              </div>
            </button>

            <button
              onClick={handleExportCalendar}
              className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Calendar className="text-green-600" size={20} />
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 dark:text-white">Export to Calendar</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add to Google Calendar, iCal, or Outlook</p>
              </div>
            </button>

            {onEmailItinerary && (
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="text-purple-600" size={20} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Email Itinerary</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Send itinerary to email address</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleEmailItinerary}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExportItineraryModal;

