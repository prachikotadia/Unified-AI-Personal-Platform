import React from 'react';
import { motion } from 'framer-motion';
import { X, Folder, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Subcategory {
  name: string;
  slug: string;
  productCount: number;
}

interface SubcategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  subcategories: Subcategory[];
}

const SubcategoriesModal: React.FC<SubcategoriesModalProps> = ({
  isOpen,
  onClose,
  categoryName,
  subcategories
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Folder className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">Subcategories</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Category:</strong> {categoryName}
            </p>
          </div>

          {subcategories.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No subcategories available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subcategories.map((subcategory) => (
                <Link
                  key={subcategory.slug}
                  to={`/marketplace/category/${subcategory.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Folder className="text-gray-400" size={20} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{subcategory.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {subcategory.productCount} products
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400" size={20} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SubcategoriesModal;

