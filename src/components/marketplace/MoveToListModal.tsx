import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRight, Plus } from 'lucide-react';

interface Wishlist {
  id: string;
  name: string;
  itemCount: number;
}

interface MoveToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  wishlists: Wishlist[];
  onCreateNewList: () => void;
  onMove: (listId: string) => void;
}

const MoveToListModal: React.FC<MoveToListModalProps> = ({
  isOpen,
  onClose,
  productName,
  wishlists,
  onCreateNewList,
  onMove
}) => {
  const [selectedListId, setSelectedListId] = useState<string>('');

  const handleMove = () => {
    if (!selectedListId) {
      alert('Please select a list');
      return;
    }
    onMove(selectedListId);
    setSelectedListId('');
    onClose();
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
          <h2 className="text-xl font-semibold">Move to Another List</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Item:</strong> {productName}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select List
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {wishlists.map((list) => (
                <label
                  key={list.id}
                  className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedListId === list.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="list"
                    value={list.id}
                    checked={selectedListId === list.id}
                    onChange={(e) => setSelectedListId(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{list.name}</p>
                    <p className="text-xs text-gray-500">{list.itemCount} items</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={onCreateNewList}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <Plus size={16} />
            Create New List
          </button>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleMove}
              disabled={!selectedListId}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ArrowRight size={16} />
              Move Item
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MoveToListModal;

