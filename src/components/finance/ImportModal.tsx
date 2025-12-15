import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { useFinanceStore } from '../../store/finance';
import { useToastHelpers } from '../ui/Toast';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  importType?: 'transactions' | 'all';
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, importType = 'all' }) => {
  const { importFinanceData } = useFinanceStore();
  const { success, error } = useToastHelpers();
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      error('Please select a JSON file');
      return;
    }

    setIsProcessing(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (importType === 'transactions') {
        if (!data.transactions || !Array.isArray(data.transactions)) {
          throw new Error('Invalid file format. Expected transactions array.');
        }
        
        const merge = window.confirm('Do you want to merge with existing transactions? (OK to merge, Cancel to replace)');
        
        if (merge) {
          const { transactions: existingTransactions, createTransaction } = useFinanceStore.getState();
          const newTransactions = data.transactions.filter((t: any) => 
            !existingTransactions.some(existing => existing.id === t.id)
          );
          for (const transaction of newTransactions) {
            await createTransaction(transaction);
          }
          setImportResult({
            success: true,
            message: `Imported ${newTransactions.length} new transactions`,
            details: { imported: newTransactions.length, skipped: data.transactions.length - newTransactions.length }
          });
        } else {
          const { transactions: existingTransactions, createTransaction, deleteTransaction } = useFinanceStore.getState();
          // Delete all existing transactions
          for (const transaction of existingTransactions) {
            await deleteTransaction(transaction.id);
          }
          // Add new transactions
          for (const transaction of data.transactions) {
            await createTransaction(transaction);
          }
          setImportResult({
            success: true,
            message: `Replaced with ${data.transactions.length} transactions`,
            details: { imported: data.transactions.length }
          });
        }
      } else {
        const merge = window.confirm('Do you want to merge with existing data? (OK to merge, Cancel to replace)');
        await importFinanceData(text, merge);
        setImportResult({
          success: true,
          message: 'Finance data imported successfully!',
          details: { imported: 'all finance data' }
        });
      }

      success('Import completed successfully!');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to import data. Please check the file format.';
      error(errorMessage);
      setImportResult({
        success: false,
        message: errorMessage
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.json')) {
      const fakeEvent = {
        target: { files: [file] }
      } as any;
      handleFileSelect(fakeEvent);
    } else {
      error('Please drop a JSON file');
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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Upload className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Import {importType === 'transactions' ? 'Transactions' : 'Finance Data'}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Upload a JSON file to import data
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {!importResult ? (
                <>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      JSON file only
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="text-blue-600 dark:text-blue-400 mt-0.5" size={16} />
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <p className="font-medium mb-1">Import Instructions:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                          <li>File must be in JSON format</li>
                          <li>You can merge with existing data or replace it</li>
                          <li>All imported data will be saved to localStorage</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className={`rounded-lg p-6 ${
                  importResult.success 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className="flex items-start gap-3">
                    {importResult.success ? (
                      <CheckCircle className="text-green-600 dark:text-green-400 mt-0.5" size={24} />
                    ) : (
                      <AlertTriangle className="text-red-600 dark:text-red-400 mt-0.5" size={24} />
                    )}
                    <div className="flex-1">
                      <p className={`font-semibold mb-2 ${
                        importResult.success 
                          ? 'text-green-900 dark:text-green-200' 
                          : 'text-red-900 dark:text-red-200'
                      }`}>
                        {importResult.success ? 'Import Successful' : 'Import Failed'}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {importResult.message}
                      </p>
                      {importResult.details && (
                        <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                          {importResult.details.imported && (
                            <p>Imported: {importResult.details.imported} items</p>
                          )}
                          {importResult.details.skipped && (
                            <p>Skipped: {importResult.details.skipped} duplicates</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Processing import...</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setImportResult(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={isProcessing}
                >
                  {importResult ? 'Import Another' : 'Cancel'}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={isProcessing}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImportModal;

