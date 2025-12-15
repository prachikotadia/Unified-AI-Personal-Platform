import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Download, ZoomIn } from 'lucide-react';
import { Message } from '../../store/chat';

interface MediaGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
}

const MediaGalleryModal: React.FC<MediaGalleryModalProps> = ({ isOpen, onClose, messages }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const mediaMessages = messages.filter(msg => msg.type === 'image' && msg.fileUrl);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-gray-700/50">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Media Gallery</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-900 dark:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {selectedImage ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-full">
              <img
                src={selectedImage}
                alt="Selected media"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => window.open(selectedImage, '_blank')}
                  className="p-2 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-lg shadow-lg hover:bg-white/90 dark:hover:bg-gray-800/90 text-gray-900 dark:text-white transition-colors"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-2 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-lg shadow-lg hover:bg-white/90 dark:hover:bg-gray-800/90 text-gray-900 dark:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            {mediaMessages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No media found in this conversation</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mediaMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedImage(msg.fileUrl!)}
                    className="relative aspect-square cursor-pointer group"
                  >
                    <img
                      src={msg.fileUrl}
                      alt="Media"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                      <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MediaGalleryModal;

