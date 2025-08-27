import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Share2, 
  Copy, 
  Download, 
  QrCode, 
  Link, 
  Calendar,
  Activity,
  Heart,
  Zap,
  Users,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  MessageCircle,
  Twitter,
  Facebook,
  Instagram,
  CheckCircle
} from 'lucide-react';

interface FitnessShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fitnessData?: any;
}

interface ShareOption {
  id: string;
  name: string;
  icon: any;
  description: string;
  color: string;
}

const FitnessShareModal: React.FC<FitnessShareModalProps> = ({ isOpen, onClose, fitnessData }) => {
  const [selectedData, setSelectedData] = useState<string[]>(['steps', 'workouts', 'achievements']);
  const [shareVisibility, setShareVisibility] = useState<'public' | 'private' | 'friends'>('friends');
  const [shareLink, setShareLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mock fitness data for sharing
  const mockFitnessData = {
    steps: 8420,
    calories: 420,
    workouts: 5,
    streak: 7,
    achievements: 3,
    heartRate: 72,
    sleepHours: 7.5,
    weight: 70.5,
    bodyFat: 18.5
  };

  const data = fitnessData || mockFitnessData;

  const dataOptions = [
    { key: 'steps', label: 'Step Count', icon: Activity, value: data.steps, unit: 'steps' },
    { key: 'calories', label: 'Calories Burned', icon: Zap, value: data.calories, unit: 'cal' },
    { key: 'workouts', label: 'Workouts', icon: Activity, value: data.workouts, unit: 'sessions' },
    { key: 'streak', label: 'Current Streak', icon: Zap, value: data.streak, unit: 'days' },
    { key: 'achievements', label: 'Achievements', icon: Heart, value: data.achievements, unit: 'badges' },
    { key: 'heartRate', label: 'Heart Rate', icon: Heart, value: data.heartRate, unit: 'bpm' },
    { key: 'sleepHours', label: 'Sleep Hours', icon: Zap, value: data.sleepHours, unit: 'hours' },
    { key: 'weight', label: 'Weight', icon: Activity, value: data.weight, unit: 'kg' },
    { key: 'bodyFat', label: 'Body Fat', icon: Activity, value: data.bodyFat, unit: '%' }
  ];

  const shareOptions: ShareOption[] = [
    {
      id: 'link',
      name: 'Share Link',
      icon: Link,
      description: 'Generate a shareable link',
      color: 'from-blue-gradient-from to-blue-gradient-to'
    },
    {
      id: 'qr',
      name: 'QR Code',
      icon: QrCode,
      description: 'Create a QR code for easy sharing',
      color: 'from-green-gradient-from to-green-gradient-to'
    },
    {
      id: 'export',
      name: 'Export Data',
      icon: Download,
      description: 'Download as PDF or CSV',
      color: 'from-purple-gradient-from to-purple-gradient-to'
    },
    {
      id: 'social',
      name: 'Social Media',
      icon: Share2,
      description: 'Share on social platforms',
      color: 'from-pink-gradient-from to-pink-gradient-to'
    }
  ];

  const socialPlatforms = [
    { name: 'Twitter', icon: Twitter, color: 'text-blue-400' },
    { name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { name: 'Email', icon: Mail, color: 'text-gray-400' },
    { name: 'SMS', icon: MessageCircle, color: 'text-green-400' }
  ];

  const handleDataToggle = (dataKey: string) => {
    if (selectedData.includes(dataKey)) {
      setSelectedData(selectedData.filter(key => key !== dataKey));
    } else {
      setSelectedData([...selectedData, dataKey]);
    }
  };

  const generateShareLink = async () => {
    setIsGenerating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const shareData = {
      data: selectedData.reduce((acc, key) => {
        const option = dataOptions.find(opt => opt.key === key);
        if (option) {
          acc[key] = { value: option.value, unit: option.unit };
        }
        return acc;
      }, {} as any),
      visibility: shareVisibility,
      timestamp: new Date().toISOString(),
      userId: 'user_123'
    };
    
    const shareId = Math.random().toString(36).substring(7);
    const link = `${window.location.origin}/fitness/share/${shareId}`;
    
    setShareLink(link);
    setIsGenerating(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const shareToSocial = (platform: string) => {
    const text = `Check out my fitness progress! ${shareLink}`;
    const url = encodeURIComponent(shareLink);
    
    let shareUrl = '';
    switch (platform.toLowerCase()) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing via URL
        alert('Copy the link and share it on Instagram!');
        return;
      case 'email':
        shareUrl = `mailto:?subject=Fitness Progress&body=${encodeURIComponent(text)}`;
        break;
      case 'sms':
        shareUrl = `sms:?body=${encodeURIComponent(text)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const exportData = (format: 'pdf' | 'csv') => {
    const exportData = selectedData.reduce((acc, key) => {
      const option = dataOptions.find(opt => opt.key === key);
      if (option) {
        acc[option.label] = `${option.value} ${option.unit}`;
      }
      return acc;
    }, {} as any);

    if (format === 'csv') {
      const csvContent = Object.entries(exportData)
        .map(([key, value]) => `${key},${value}`)
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fitness-data-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else {
      // For PDF, you would typically use a library like jsPDF
      alert('PDF export would be implemented with jsPDF library');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Share Fitness Data</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Data Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Data to Share</h3>
                <div className="space-y-3">
                  {dataOptions.map((option) => {
                    const IconComponent = option.icon;
                    const isSelected = selectedData.includes(option.key);
                    
                    return (
                      <label
                        key={option.key}
                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-500/10' 
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleDataToggle(option.key)}
                            className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                          />
                          <IconComponent className="w-5 h-5 text-gray-400" />
                          <div>
                            <span className="font-medium">{option.label}</span>
                            <p className="text-sm text-gray-500">
                              {option.value} {option.unit}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </label>
                    );
                  })}
                </div>

                {/* Visibility Settings */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Share Visibility</h4>
                  <div className="space-y-2">
                    {[
                      { key: 'public', label: 'Public', icon: Globe, description: 'Anyone can view' },
                      { key: 'friends', label: 'Friends Only', icon: Users, description: 'Only your friends can view' },
                      { key: 'private', label: 'Private', icon: Lock, description: 'Only you can view' }
                    ].map((option) => (
                      <label
                        key={option.key}
                        className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                          shareVisibility === option.key 
                            ? 'border-blue-500 bg-blue-500/10' 
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="visibility"
                          value={option.key}
                          checked={shareVisibility === option.key}
                          onChange={(e) => setShareVisibility(e.target.value as any)}
                          className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 focus:ring-blue-500"
                        />
                        <option.icon className="w-5 h-5 text-gray-400" />
                        <div>
                          <span className="font-medium">{option.label}</span>
                          <p className="text-sm text-gray-500">{option.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Share Options */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Share Options</h3>
                
                {/* Share Methods */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {shareOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          if (option.id === 'link') generateShareLink();
                          else if (option.id === 'export') exportData('csv');
                        }}
                        disabled={isGenerating || selectedData.length === 0}
                        className={`p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-all disabled:opacity-50 ${
                          option.id === 'link' && shareLink ? 'border-blue-500 bg-blue-500/10' : ''
                        }`}
                      >
                        <div className={`w-10 h-10 bg-gradient-to-r ${option.color} rounded-lg flex items-center justify-center mb-3`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-medium text-sm">{option.name}</h4>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Generated Share Link */}
                {shareLink && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Share Link</h4>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={shareLink}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm"
                      />
                      <button
                        onClick={copyToClipboard}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Social Media Sharing */}
                <div>
                  <h4 className="font-semibold mb-3">Share on Social Media</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {socialPlatforms.map((platform) => {
                      const IconComponent = platform.icon;
                      return (
                        <button
                          key={platform.name}
                          onClick={() => shareToSocial(platform.name)}
                          disabled={!shareLink}
                          className={`p-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50 ${platform.color}`}
                          title={`Share on ${platform.name}`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preview */}
                {selectedData.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Preview</h4>
                    <div className="p-4 border border-white/10 rounded-lg bg-white/5">
                      <div className="grid grid-cols-2 gap-3">
                        {selectedData.map((key) => {
                          const option = dataOptions.find(opt => opt.key === key);
                          if (!option) return null;
                          
                          return (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">{option.label}:</span>
                              <span className="font-medium">{option.value} {option.unit}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-white/10">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={generateShareLink}
                disabled={isGenerating || selectedData.length === 0}
                className="px-4 py-2 bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Generate Share Link</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FitnessShareModal;
