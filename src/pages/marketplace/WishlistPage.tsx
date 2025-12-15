import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Star, 
  Crown,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Share2,
  Plus,
  Edit,
  Folder,
  MoreVertical
} from 'lucide-react';
import { marketplaceAPI, Product } from '../../services/api';
import { useWishlistStore } from '../../store/wishlist';
import { useCartStore } from '../../store/cart';
import { useToastHelpers } from '../../components/ui/Toast';
import ShareWishlistModal from '../../components/marketplace/ShareWishlistModal';
import CreateListModal from '../../components/marketplace/CreateListModal';
import MoveToListModal from '../../components/marketplace/MoveToListModal';

interface Wishlist {
  id: string;
  name: string;
  itemCount: number;
  isDefault: boolean;
}

const WishlistPage: React.FC = () => {
  const { success, error: showError } = useToastHelpers();
  
  // Store hooks
  const { 
    items: wishlistItems, 
    fetchWishlist, 
    removeFromWishlist, 
    moveToCart,
    isLoading: wishlistLoading,
    error: wishlistError
  } = useWishlistStore();
  
  const { 
    addToCart,
    isLoading: cartLoading 
  } = useCartStore();

  const [wishlists, setWishlists] = useState<Wishlist[]>([
    { id: 'default', name: 'My Wishlist', itemCount: wishlistItems.length, isDefault: true }
  ]);
  const [selectedListId, setSelectedListId] = useState<string>('default');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [showMoveToListModal, setShowMoveToListModal] = useState(false);
  const [selectedItemForMove, setSelectedItemForMove] = useState<any>(null);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState('');

  useEffect(() => {
    fetchWishlist();
    setWishlists(prev => prev.map(list => 
      list.id === 'default' ? { ...list, itemCount: wishlistItems.length } : list
    ));
  }, [fetchWishlist, wishlistItems.length]);

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await removeFromWishlist(productId);
      success('Removed', 'Item removed from wishlist');
    } catch (err) {
      showError('Remove Failed', 'Failed to remove item from wishlist');
    }
  };

  const handleMoveToCart = async (productId: number) => {
    try {
      await moveToCart(productId, 1);
      success('Moved to Cart', 'Item moved to your cart');
    } catch (err) {
      showError('Move Failed', 'Failed to move item to cart');
    }
  };

  const handleAddAllToCart = async () => {
    try {
      for (const item of wishlistItems) {
        await addToCart(item.product.id, 1);
      }
      success('Added to Cart', 'All items have been added to your cart');
    } catch (err) {
      showError('Add Failed', 'Failed to add some items to cart');
    }
  };

  const handleCreateList = (listData: { name: string; description?: string; isPublic: boolean }) => {
    const newList: Wishlist = {
      id: Date.now().toString(),
      name: listData.name,
      itemCount: 0,
      isDefault: false
    };
    setWishlists(prev => [...prev, newList]);
    setSelectedListId(newList.id);
    success('List Created', `"${listData.name}" has been created`);
  };

  const handleDeleteList = (listId: string) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      setWishlists(prev => prev.filter(list => list.id !== listId));
      if (selectedListId === listId) {
        setSelectedListId('default');
      }
      success('List Deleted', 'List has been deleted');
    }
  };

  const handleRenameList = (listId: string) => {
    const list = wishlists.find(l => l.id === listId);
    if (list) {
      setEditingListId(listId);
      setEditingListName(list.name);
    }
  };

  const handleSaveRename = () => {
    if (!editingListName.trim()) {
      alert('Please enter a list name');
      return;
    }
    setWishlists(prev => prev.map(list => 
      list.id === editingListId ? { ...list, name: editingListName } : list
    ));
    setEditingListId(null);
    setEditingListName('');
    success('List Renamed', 'List name has been updated');
  };

  const handleMoveToList = (listId: string) => {
    if (selectedItemForMove) {
      // In a real app, this would move the item to another list
      success('Item Moved', 'Item has been moved to the selected list');
      setSelectedItemForMove(null);
    }
  };

  const handleMoveToAnotherList = (item: any) => {
    setSelectedItemForMove(item);
    setShowMoveToListModal(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={`${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (wishlistLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link 
                to="/marketplace" 
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft size={24} />
              </Link>
              <div>
                {editingListId ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingListName}
                      onChange={(e) => setEditingListName(e.target.value)}
                      onBlur={handleSaveRename}
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveRename()}
                      className="text-3xl font-bold bg-transparent border-b-2 border-blue-600 focus:outline-none"
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {wishlists.find(l => l.id === selectedListId)?.name || 'My Wishlist'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Save items for later purchase
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {wishlistItems.length > 0 && (
                <>
                  <button
                    onClick={handleAddAllToCart}
                    disabled={cartLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <ShoppingCart size={16} />
                    Add All to Cart
                  </button>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Share2 size={16} />
                    Share
                  </button>
                </>
              )}
              <button
                onClick={() => setShowCreateListModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus size={16} />
                Create List
              </button>
            </div>
          </div>

          {/* Wishlist Selector */}
          {wishlists.length > 1 && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {wishlists.map(list => (
                <div key={list.id} className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedListId(list.id)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      selectedListId === list.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {list.name} ({list.itemCount})
                  </button>
                  {!list.isDefault && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRenameList(list.id)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Rename"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteList(list.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <Heart size={64} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start shopping to add items to your wishlist
            </p>
            <Link 
              to="/marketplace" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden group"
              >
                <Link to={`/marketplace/product/${product.product.id}`}>
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.product.image}
                      alt={product.product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.product.originalPrice && product.product.originalPrice > product.product.price && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{Math.round(((product.product.originalPrice - product.product.price) / product.product.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>
                </Link>
                
                <div className="p-4">
                  <Link to={`/marketplace/product/${product.product.id}`}>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {product.product.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(product.product.rating)}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({product.product.reviewCount})
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${product.product.price.toFixed(2)}
                    </span>
                    {product.product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleMoveToCart(product.productId)}
                        disabled={cartLoading || wishlistLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2"
                      >
                        {cartLoading || wishlistLoading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <ShoppingCart size={16} />
                        )}
                        {cartLoading || wishlistLoading ? 'Adding...' : 'Add to Cart'}
                      </button>
                      <button 
                        onClick={() => handleRemoveFromWishlist(product.productId)}
                        disabled={wishlistLoading}
                        className="p-2 text-gray-400 hover:text-red-500 disabled:text-gray-300 transition-colors"
                        title="Remove from wishlist"
                      >
                        {wishlistLoading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                    {wishlists.length > 1 && (
                      <button
                        onClick={() => handleMoveToAnotherList(product)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Folder size={14} />
                        Move to Another List
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modals */}
        <ShareWishlistModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          wishlistName={wishlists.find(l => l.id === selectedListId)?.name}
          wishlistId={selectedListId}
        />

        <CreateListModal
          isOpen={showCreateListModal}
          onClose={() => setShowCreateListModal(false)}
          onCreate={handleCreateList}
        />

        <MoveToListModal
          isOpen={showMoveToListModal}
          onClose={() => {
            setShowMoveToListModal(false);
            setSelectedItemForMove(null);
          }}
          productName={selectedItemForMove?.product?.name || ''}
          wishlists={wishlists.filter(l => l.id !== selectedListId)}
          onCreateNewList={() => {
            setShowMoveToListModal(false);
            setShowCreateListModal(true);
          }}
          onMove={handleMoveToList}
        />
      </div>
    </div>
  );
};

export default WishlistPage;
