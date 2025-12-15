import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Plus, Edit, Trash2, Folder, Share2 } from 'lucide-react';

interface Wishlist {
  id: string;
  name: string;
  itemCount: number;
  isDefault: boolean;
  isPublic: boolean;
}

interface WishlistManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlists: Wishlist[];
  onCreateList: (listData: { name: string; description?: string; isPublic: boolean }) => void;
  onRenameList: (listId: string, newName: string) => void;
  onDeleteList: (listId: string) => void;
  onShareList: (listId: string) => void;
  onSetDefault: (listId: string) => void;
}

const WishlistManagementModal: React.FC<WishlistManagementModalProps> = ({
  isOpen,
  onClose,
  wishlists,
  onCreateList,
  onRenameList,
  onDeleteList,
  onShareList,
  onSetDefault
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createIsPublic, setCreateIsPublic] = useState(false);

  const handleCreate = () => {
    if (!createName.trim()) {
      alert('Please enter a list name');
      return;
    }
    onCreateList({
      name: createName.trim(),
      description: createDescription.trim() || undefined,
      isPublic: createIsPublic
    });
    setCreateName('');
    setCreateDescription('');
    setCreateIsPublic(false);
    setShowCreateForm(false);
  };

  const handleRename = (listId: string) => {
    if (!newName.trim()) {
      alert('Please enter a list name');
      return;
    }
    onRenameList(listId, newName.trim());
    setEditingId(null);
    setNewName('');
  };

  const handleDelete = (listId: string, listName: string) => {
    if (window.confirm(`Are you sure you want to delete "${listName}"?`)) {
      onDeleteList(listId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Heart className="text-red-600" size={24} />
            <h2 className="text-xl font-semibold">Manage Wishlists</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Create New List Button */}
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <Plus size={18} />
              Create New List
            </button>
          )}

          {/* Create Form */}
          {showCreateForm && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="List name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                autoFocus
              />
              <textarea
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={createIsPublic}
                  onChange={(e) => setCreateIsPublic(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Make this list public</span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateName('');
                    setCreateDescription('');
                    setCreateIsPublic(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Wishlists List */}
          <div className="space-y-2">
            {wishlists.map((list) => (
              <div
                key={list.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Folder className="text-gray-400" size={20} />
                  {editingId === list.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={() => handleRename(list.id)}
                        onKeyPress={(e) => e.key === 'Enter' && handleRename(list.id)}
                        className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {list.name}
                        {list.isDefault && (
                          <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                        {list.isPublic && (
                          <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded">
                            Public
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {list.itemCount} items
                      </p>
                    </div>
                  )}
                </div>

                {editingId !== list.id && (
                  <div className="flex items-center gap-1">
                    {!list.isDefault && (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(list.id);
                            setNewName(list.name);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Rename"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(list.id, list.name)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onShareList(list.id)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Share"
                    >
                      <Share2 size={16} />
                    </button>
                    {!list.isDefault && (
                      <button
                        onClick={() => onSetDefault(list.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Set as Default"
                      >
                        <Heart size={16} className={list.isDefault ? 'fill-red-500 text-red-500' : ''} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t mt-4">
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

export default WishlistManagementModal;

