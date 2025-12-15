import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, MapPin, Briefcase, GraduationCap, Mail, Phone, Globe } from 'lucide-react';
import { useToastHelpers } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/auth';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    name: string;
    avatar: string;
    bio?: string;
    location?: string;
    occupation?: string;
    education?: string;
    email?: string;
    phone?: string;
    website?: string;
  };
  onSave: (updates: any) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, profile, onSave }) => {
  const { success, error } = useToastHelpers();
  const { updateUser, user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: profile.name,
    bio: profile.bio || '',
    location: profile.location || '',
    occupation: profile.occupation || '',
    education: profile.education || '',
    email: profile.email || '',
    phone: profile.phone || '',
    website: profile.website || '',
    avatar: profile.avatar
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Update form data when profile changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: profile.name,
        bio: profile.bio || '',
        location: profile.location || '',
        occupation: profile.occupation || '',
        education: profile.education || '',
        email: profile.email || '',
        phone: profile.phone || '',
        website: profile.website || '',
        avatar: profile.avatar
      });
    }
  }, [profile, isOpen]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        error('Invalid File Type', 'Please upload a PNG, JPG, or JPEG image.');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        error('File Too Large', 'Please upload an image smaller than 5MB.');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        setFormData(prev => ({ ...prev, avatar: base64Image }));
      };
      reader.onerror = () => {
        error('Upload Failed', 'Failed to read the image file.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Get current user to preserve existing preferences
    const { user } = useAuthStore.getState();
    
    // CRITICAL: Ensure avatar is saved - use formData.avatar if it exists, otherwise keep current avatar
    const avatarToSave = formData.avatar && formData.avatar.trim() !== '' 
      ? formData.avatar 
      : (user?.avatar || formData.avatar);
    
    // Debug: Log avatar save
    if (avatarToSave && avatarToSave.startsWith('data:image')) {
      console.log('[EditProfileModal] Saving avatar, length:', avatarToSave.length);
    }
    
    // Save to auth store to persist - properly merge preferences
    updateUser({
      avatar: avatarToSave, // Explicitly save the avatar
      displayName: formData.name,
      bio: formData.bio,
      location: formData.location,
      email: formData.email || user?.email, // Update email at top level
      preferences: {
        ...user?.preferences, // Preserve all existing preferences
        occupation: formData.occupation,
        education: formData.education,
        phone: formData.phone,
        website: formData.website,
      }
    });
    
    onSave(formData);
    success('Profile Updated', 'Your profile has been updated successfully!');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <img
                src={formData.avatar}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700 shadow-lg"
              />
              <label className="absolute bottom-0 right-0 p-3 bg-gradient-to-r from-sky-500 to-cyan-600 text-white rounded-full cursor-pointer hover:from-sky-600 hover:to-cyan-700 transition-all duration-200 shadow-lg">
                <Camera size={18} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 dark:text-white"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about yourself..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 dark:text-white min-h-[100px] resize-none"
              rows={4}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
              <MapPin className="inline w-4 h-4 mr-1 text-sky-500" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="City, Country"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
              <Briefcase className="inline w-4 h-4 mr-1 text-emerald-500" />
              Occupation
            </label>
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
              placeholder="Your job title"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>

          {/* Education */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
              <GraduationCap className="inline w-4 h-4 mr-1 text-amber-500" />
              Education
            </label>
            <input
              type="text"
              value={formData.education}
              onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
              placeholder="School/University"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                <Mail className="inline w-4 h-4 mr-1 text-violet-500" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                <Phone className="inline w-4 h-4 mr-1 text-indigo-500" />
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
              <Globe className="inline w-4 h-4 mr-1 text-cyan-500" />
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-600 text-white rounded-lg hover:from-sky-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditProfileModal;

