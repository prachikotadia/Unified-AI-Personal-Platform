import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface StickerPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSticker: (stickerUrl: string) => void;
}

const StickerPickerModal: React.FC<StickerPickerModalProps> = ({ isOpen, onClose, onSelectSticker }) => {
  const [category, setCategory] = useState('emotions');

  // Mock sticker data
  const categories = ['emotions', 'animals', 'food', 'objects', 'celebration'];
  const mockStickers = Array.from({ length: 24 }, (_, i) => ({
    id: `sticker-${i}`,
    url: `https://via.placeholder.com/100x100/4ECDC4/FFFFFF?text=😊`,
    name: `Sticker ${i + 1}`
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 max-h-[70vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Select Sticker</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap transition-colors ${
                category === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-4 gap-2">
            {mockStickers.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => {
                  onSelectSticker(sticker.url);
                  onClose();
                }}
                className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-4xl"
              >
                {sticker.url.includes('text=') ? (
                  <span>{sticker.url.split('text=')[1]}</span>
                ) : (
                  <img
                    src={sticker.url}
                    alt={sticker.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StickerPickerModal;

