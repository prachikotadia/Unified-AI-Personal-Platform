import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Video, XCircle, Play } from 'lucide-react';
import { useToastHelpers } from '../../components/ui/Toast';

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  maxFiles = 5,
  maxSizeMB = 100
}) => {
  const { success, error } = useToastHelpers();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (selectedFiles.length + files.length > maxFiles) {
      error('Too Many Files', `You can only upload up to ${maxFiles} files.`);
      return;
    }

    const validFiles: File[] = [];
    const validPreviews: { file: File; url: string }[] = [];

    files.forEach(file => {
      if (!file.type.startsWith('video/')) {
        error('Invalid File Type', `${file.name} is not a video file.`);
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        error('File Too Large', `${file.name} exceeds ${maxSizeMB}MB limit.`);
        return;
      }

      validFiles.push(file);
      const url = URL.createObjectURL(file);
      validPreviews.push({ file, url });
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviews(prev => [...prev, ...validPreviews]);
  };

  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(previews[index].url);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      error('No Files Selected', 'Please select at least one video to upload.');
      return;
    }

    onUpload(selectedFiles);
    success('Videos Uploaded', `${selectedFiles.length} video(s) uploaded successfully!`);
    onClose();
    
    // Cleanup and reset
    previews.forEach(preview => URL.revokeObjectURL(preview.url));
    setSelectedFiles([]);
    setPreviews([]);
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
          <h2 className="text-xl font-semibold">Upload Videos</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Click to select videos or drag and drop
            </p>
            <p className="text-sm text-gray-500">
              Max {maxFiles} files, {maxSizeMB}MB each
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Preview Grid */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-video group">
                  <video
                    src={preview.url}
                    className="w-full h-full object-cover rounded-lg"
                    controls={false}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XCircle size={18} />
                  </button>
                  <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                    {preview.file.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Video size={18} />
              Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VideoUploadModal;

