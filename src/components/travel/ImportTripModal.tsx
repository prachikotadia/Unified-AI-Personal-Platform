import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, FileText, Mail, Link2 } from 'lucide-react';

interface ImportTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportFromFile: (file: File) => void;
  onImportFromEmail?: (email: string) => void;
  onImportFromLink?: (link: string) => void;
}

const ImportTripModal: React.FC<ImportTripModalProps> = ({
  isOpen,
  onClose,
  onImportFromFile,
  onImportFromEmail,
  onImportFromLink
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'email' | 'link'>('file');
  const [email, setEmail] = useState('');
  const [link, setLink] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImportFile = () => {
    if (!file) {
      alert('Please select a file');
      return;
    }
    onImportFromFile(file);
    setFile(null);
    onClose();
  };

  const handleImportEmail = () => {
    if (!email.trim()) {
      alert('Please enter an email address');
      return;
    }
    if (onImportFromEmail) {
      onImportFromEmail(email);
      setEmail('');
      onClose();
    }
  };

  const handleImportLink = () => {
    if (!link.trim()) {
      alert('Please enter a link');
      return;
    }
    if (onImportFromLink) {
      onImportFromLink(link);
      setLink('');
      onClose();
    }
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
          <div className="flex items-center gap-2">
            <Upload className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">Import Trip</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('file')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'file'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <FileText className="inline w-4 h-4 mr-2" />
              File
            </button>
            {onImportFromEmail && (
              <button
                onClick={() => setActiveTab('email')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'email'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Mail className="inline w-4 h-4 mr-2" />
                Email
              </button>
            )}
            {onImportFromLink && (
              <button
                onClick={() => setActiveTab('link')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'link'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Link2 className="inline w-4 h-4 mr-2" />
                Link
              </button>
            )}
          </div>

          {/* File Import */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Upload trip file (PDF, JSON, or iCal)
                </p>
                <input
                  type="file"
                  accept=".pdf,.json,.ics,.ical"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Choose File
                </label>
                {file && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Selected: {file.name}
                  </p>
                )}
              </div>
              <button
                onClick={handleImportFile}
                disabled={!file}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import Trip
              </button>
            </div>
          )}

          {/* Email Import */}
          {activeTab === 'email' && onImportFromEmail && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  We'll check this email for trip confirmations and import them automatically.
                </p>
              </div>
              <button
                onClick={handleImportEmail}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Import from Email
              </button>
            </div>
          )}

          {/* Link Import */}
          {activeTab === 'link' && onImportFromLink && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trip Link
                </label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter a link to a shared trip or booking confirmation.
                </p>
              </div>
              <button
                onClick={handleImportLink}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Import from Link
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ImportTripModal;

