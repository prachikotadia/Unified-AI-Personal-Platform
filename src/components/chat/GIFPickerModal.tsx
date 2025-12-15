import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search } from 'lucide-react';

interface GIFPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGIF: (gifUrl: string) => void;
}

const GIFPickerModal: React.FC<GIFPickerModalProps> = ({ isOpen, onClose, onSelectGIF }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('trending');

  // Mock GIF data (in real app, use GIPHY API or similar)
  const categories = ['trending', 'reactions', 'animals', 'memes', 'celebrities'];
  const mockGIFs = Array.from({ length: 20 }, (_, i) => ({
    id: `gif-${i}`,
    url: `https://via.placeholder.com/200x200/FF6B6B/FFFFFF?text=GIF+${i + 1}`,
    title: `GIF ${i + 1}`
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Select GIF</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search GIFs..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
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
          <div className="grid grid-cols-3 gap-2">
            {mockGIFs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => {
                  onSelectGIF(gif.url);
                  onClose();
                }}
                className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
              >
                <img
                  src={gif.url}
                  alt={gif.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GIFPickerModal;

