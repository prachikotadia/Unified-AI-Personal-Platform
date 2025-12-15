import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, FileText, FileSpreadsheet, File, CheckCircle, AlertCircle } from 'lucide-react';

interface ImportWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File, format: 'csv' | 'json' | 'excel') => void;
}

const ImportWorkoutModal: React.FC<ImportWorkoutModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileFormat, setFileFormat] = useState<'csv' | 'json' | 'excel' | null>(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'csv') {
        setFileFormat('csv');
      } else if (extension === 'json') {
        setFileFormat('json');
      } else if (extension === 'xlsx' || extension === 'xls') {
        setFileFormat('excel');
      }
    }
  };

  const handleImport = async () => {
    if (selectedFile && fileFormat) {
      setImporting(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      onImport(selectedFile, fileFormat);
      setImported(true);
      setImporting(false);
      setTimeout(() => {
        onClose();
        setSelectedFile(null);
        setFileFormat(null);
        setImported(false);
      }, 1500);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
        return FileSpreadsheet;
      case 'json':
        return File;
      case 'excel':
        return FileSpreadsheet;
      default:
        return FileText;
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
            <h2 className="text-xl font-semibold">Import Workouts</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Click to select file or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: CSV, JSON, Excel (.xlsx, .xls)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {imported ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Workouts imported successfully!
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {fileFormat && (
                          <>
                            {React.createElement(getFormatIcon(fileFormat), { size: 20, className: 'text-blue-600' })}
                            <span className="font-medium">{selectedFile.name}</span>
                          </>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Format: {fileFormat?.toUpperCase()}
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Note:</strong> Make sure your file contains workout data in the correct format.
                      Required fields: name, type, duration, date.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {selectedFile && !imported && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setFileFormat(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Change File
              </button>
              <button
                onClick={handleImport}
                disabled={importing || !fileFormat}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Import Workouts
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ImportWorkoutModal;

