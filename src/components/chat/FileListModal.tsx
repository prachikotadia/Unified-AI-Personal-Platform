import React from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Download, File, Image as ImageIcon, Video, Music } from 'lucide-react';
import { Message } from '../../store/chat';

interface FileListModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
}

const FileListModal: React.FC<FileListModalProps> = ({ isOpen, onClose, messages }) => {
  const fileMessages = messages.filter(msg => msg.type === 'file' && msg.fileUrl);

  const getFileIcon = (fileName?: string, fileType?: string) => {
    if (fileType?.startsWith('image/')) return ImageIcon;
    if (fileType?.startsWith('video/')) return Video;
    if (fileType?.startsWith('audio/')) return Music;
    return FileText;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Files</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {fileMessages.length === 0 ? (
          <div className="text-center py-12">
            <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No files found in this conversation</p>
          </div>
        ) : (
          <div className="space-y-2">
            {fileMessages.map((msg) => {
              const Icon = getFileIcon(msg.fileName, msg.fileType);
              return (
                <div
                  key={msg.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Icon className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{msg.fileName || 'Unknown file'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(msg.fileSize)} • {new Date(msg.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => window.open(msg.fileUrl, '_blank')}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg"
                  >
                    <Download size={20} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FileListModal;

