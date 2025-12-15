import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Video, Smile, Hash, Globe, Users, Lock, Send } from 'lucide-react';
import { useToastHelpers } from '../../components/ui/Toast';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: {
    content: string;
    images?: File[];
    videos?: File[];
    privacy: 'public' | 'friends' | 'private';
    hashtags?: string[];
  }) => void;
  initialContent?: string;
  shareType?: 'achievement' | 'workout' | 'trip' | 'budget' | 'finance' | null;
  shareData?: any;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialContent = '',
  shareType,
  shareData
}) => {
  const { success } = useToastHelpers();
  const [content, setContent] = useState(initialContent);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('friends');
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setVideos(prev => [...prev, ...files]);
  };

  const handleAddHashtag = () => {
    if (hashtagInput.trim() && !hashtags.includes(hashtagInput.trim())) {
      setHashtags(prev => [...prev, hashtagInput.trim()]);
      setHashtagInput('');
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(prev => prev.filter(t => t !== tag));
  };

  const handleSubmit = () => {
    if (!content.trim() && images.length === 0 && videos.length === 0) {
      return;
    }

    onSubmit({
      content,
      images: images.length > 0 ? images : undefined,
      videos: videos.length > 0 ? videos : undefined,
      privacy,
      hashtags: hashtags.length > 0 ? hashtags : undefined
    });

    success('Post Created', 'Your post has been shared successfully!');
    onClose();
    
    // Reset form
    setContent('');
    setImages([]);
    setVideos([]);
    setHashtags([]);
    setHashtagInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-[95vw] sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {shareType ? `Share ${shareType.charAt(0).toUpperCase() + shareType.slice(1)}` : 'Create Post'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Share Type Preview */}
          {shareType && shareData && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Sharing {shareType}: {shareData.title || shareData.name || 'Item'}
              </p>
            </div>
          )}

          {/* Content */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white min-h-[120px] resize-none"
              rows={5}
            />
          </div>

          {/* Media Preview */}
          {(images.length > 0 || videos.length > 0) && (
            <div className="space-y-2">
              {images.map((img, index) => (
                <div key={index} className="relative inline-block mr-2">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`Preview ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {videos.map((vid, index) => (
                <div key={index} className="relative inline-block mr-2">
                  <video
                    src={URL.createObjectURL(vid)}
                    className="w-24 h-24 object-cover rounded-lg"
                    controls={false}
                  />
                  <button
                    onClick={() => setVideos(prev => prev.filter((_, i) => i !== index))}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-medium mb-2">Hashtags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddHashtag();
                  }
                }}
                placeholder="Add hashtag..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleAddHashtag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    <Hash size={14} />
                    {tag}
                    <button
                      onClick={() => handleRemoveHashtag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Privacy Settings */}
          <div>
            <label className="block text-sm font-medium mb-2">Privacy</label>
            <div className="flex gap-2">
              {[
                { value: 'public', icon: Globe, label: 'Public' },
                { value: 'friends', icon: Users, label: 'Friends' },
                { value: 'private', icon: Lock, label: 'Private' }
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setPrivacy(option.value as any)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      privacy === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <button
                onClick={() => imageInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Add image"
              >
                <ImageIcon size={20} />
              </button>
              <button
                onClick={() => videoInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Add video"
              >
                <Video size={20} />
              </button>
              <button
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Add emoji"
              >
                <Smile size={20} />
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!content.trim() && images.length === 0 && videos.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send size={18} />
                Post
              </button>
            </div>
          </div>
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleVideoSelect}
          className="hidden"
        />
      </motion.div>
    </div>
  );
};

export default CreatePostModal;

