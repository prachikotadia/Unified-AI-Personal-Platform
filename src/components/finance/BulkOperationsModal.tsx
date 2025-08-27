import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  Download, 
  Trash2, 
  Edit, 
  Tag, 
  Filter,
  CheckSquare,
  Square,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  Calendar,
  DollarSign,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { Transaction } from '../../services/financeAPI';

interface BulkOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onBulkUpdate: (transactionIds: string[], updates: Partial<Transaction>) => void;
  onBulkDelete: (transactionIds: string[]) => void;
  onImport: (transactions: Transaction[]) => void;
  onExport: (format: 'csv' | 'pdf' | 'excel') => void;
}

interface ImportedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  merchant?: string;
  reference?: string;
}

const BulkOperationsModal: React.FC<BulkOperationsModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onBulkUpdate,
  onBulkDelete,
  onImport,
  onExport
}) => {
  const [activeTab, setActiveTab] = useState<'bulk' | 'import' | 'export'>('bulk');
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'update' | 'delete' | 'tag'>('update');
  const [bulkUpdates, setBulkUpdates] = useState({
    category: '',
    tags: [] as string[],
    notes: ''
  });
  const [importData, setImportData] = useState<ImportedTransaction[]>([]);
  const [importPreview, setImportPreview] = useState<Transaction[]>([]);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectAll = () => {
    if (selectedTransactions.size === transactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(transactions.map(t => t.id).filter(Boolean)));
    }
  };

  const handleSelectTransaction = (transactionId: string) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId);
    } else {
      newSelected.add(transactionId);
    }
    setSelectedTransactions(newSelected);
  };

  const handleBulkAction = async () => {
    if (selectedTransactions.size === 0) return;

    const selectedIds = Array.from(selectedTransactions);

    try {
      switch (bulkAction) {
        case 'update':
          await onBulkUpdate(selectedIds, bulkUpdates);
          break;
        case 'delete':
          await onBulkDelete(selectedIds);
          break;
        case 'tag':
          await onBulkUpdate(selectedIds, { tags: bulkUpdates.tags });
          break;
      }
      
      setSelectedTransactions(new Set());
      onClose();
    } catch (error) {
      setError('Failed to perform bulk action. Please try again.');
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setError('');
      
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const text = await file.text();
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const imported: ImportedTransaction[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim());
            const row: any = {};
            
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            
            imported.push({
              date: row.date || new Date().toISOString().split('T')[0],
              description: row.description || row.memo || row.note || '',
              amount: parseFloat(row.amount) || 0,
              type: row.type || (parseFloat(row.amount) > 0 ? 'income' : 'expense'),
              category: row.category || 'other',
              merchant: row.merchant || row.payee || '',
              reference: row.reference || row.id || ''
            });
          }
        }
        
        setImportData(imported);
        generateImportPreview(imported);
      } else {
        setError('Please upload a CSV file.');
      }
    } catch (error) {
      setError('Failed to parse file. Please check the format.');
    }
  };

  const generateImportPreview = (imported: ImportedTransaction[]) => {
    const preview: Transaction[] = imported.map((item, index) => ({
      id: `import_${index}`,
      type: item.type,
      category: item.category,
      amount: Math.abs(item.amount),
      description: item.description,
      date: item.date,
      account_id: 'default',
      tags: [],
      location: {},
      notes: '',
      receipt_url: '',
      is_recurring: false,
      recurring_frequency: 'monthly',
      merchant: item.merchant || '',
      reference_number: item.reference || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user_123',
      currency: 'USD',
      status: 'completed',
      recurring: false
    }));
    
    setImportPreview(preview);
  };

  const handleImport = async () => {
    if (importPreview.length === 0) return;
    
    setImporting(true);
    try {
      await onImport(importPreview);
      onClose();
    } catch (error) {
      setError('Failed to import transactions. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    setExporting(true);
    try {
      await onExport(format);
      onClose();
    } catch (error) {
      setError('Failed to export transactions. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income': return <TrendingUp size={16} className="text-green-600" />;
      case 'expense': return <DollarSign size={16} className="text-red-600" />;
      case 'transfer': return <CreditCard size={16} className="text-blue-600" />;
      default: return <FileText size={16} className="text-gray-600" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Filter className="text-blue-600" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Bulk Operations</h2>
                  <p className="text-sm text-gray-600">
                    Manage multiple transactions at once
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {[
                { id: 'bulk', label: 'Bulk Actions', icon: <Filter size={16} /> },
                { id: 'import', label: 'Import', icon: <Upload size={16} /> },
                { id: 'export', label: 'Export', icon: <Download size={16} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {activeTab === 'bulk' && (
                <div className="space-y-6">
                  {/* Bulk Actions */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Bulk Actions</h3>
                    <div className="flex items-center gap-4">
                      <select
                        value={bulkAction}
                        onChange={(e) => setBulkAction(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="update">Update Fields</option>
                        <option value="delete">Delete Transactions</option>
                        <option value="tag">Add Tags</option>
                      </select>
                      
                      <button
                        onClick={handleBulkAction}
                        disabled={selectedTransactions.size === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply to {selectedTransactions.size} transaction{selectedTransactions.size !== 1 ? 's' : ''}
                      </button>
                    </div>

                    {bulkAction === 'update' && (
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <select
                            value={bulkUpdates.category}
                            onChange={(e) => setBulkUpdates(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Keep existing</option>
                            <option value="food_dining">Food & Dining</option>
                            <option value="transportation">Transportation</option>
                            <option value="housing">Housing</option>
                            <option value="utilities">Utilities</option>
                            <option value="entertainment">Entertainment</option>
                            <option value="shopping">Shopping</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="education">Education</option>
                            <option value="travel">Travel</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tags
                          </label>
                          <input
                            type="text"
                            value={bulkUpdates.tags.join(', ')}
                            onChange={(e) => setBulkUpdates(prev => ({ 
                              ...prev, 
                              tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="tag1, tag2, tag3"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                          </label>
                          <input
                            type="text"
                            value={bulkUpdates.notes}
                            onChange={(e) => setBulkUpdates(prev => ({ ...prev, notes: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Add notes"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Transaction List */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        Transactions ({transactions.length})
                      </h3>
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        {selectedTransactions.size === transactions.length ? (
                          <>
                            <CheckSquare size={16} />
                            Deselect All
                          </>
                        ) : (
                          <>
                            <Square size={16} />
                            Select All
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                            selectedTransactions.has(transaction.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <button
                            onClick={() => handleSelectTransaction(transaction.id)}
                            className="flex-shrink-0"
                          >
                            {selectedTransactions.has(transaction.id) ? (
                              <CheckSquare size={20} className="text-blue-600" />
                            ) : (
                              <Square size={20} className="text-gray-400" />
                            )}
                          </button>
                          
                          <div className="flex-shrink-0">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900 truncate">
                                  {transaction.description}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`font-medium ${
                                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                </p>
                                {transaction.merchant && (
                                  <p className="text-xs text-gray-500">{transaction.merchant}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'import' && (
                <div className="space-y-6">
                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                    <div className="text-center">
                      <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Import Bank Statement
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Upload a CSV file from your bank statement to import transactions
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Choose File
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file);
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Import Preview */}
                  {importPreview.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">
                        Import Preview ({importPreview.length} transactions)
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {importPreview.map((transaction, index) => (
                          <div
                            key={transaction.id}
                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                          >
                            {getTransactionIcon(transaction.type)}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{transaction.description}</p>
                              <p className="text-sm text-gray-600">
                                {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-medium ${
                                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={handleImport}
                        disabled={importing}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {importing ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            Importing...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            Import {importPreview.length} Transactions
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'export' && (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <Download className="mx-auto mb-4 text-gray-400" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Export Transactions
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Export your transaction data in various formats
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                      {[
                        { format: 'csv', label: 'CSV', icon: <FileText size={24} /> },
                        { format: 'pdf', label: 'PDF', icon: <FileText size={24} /> },
                        { format: 'excel', label: 'Excel', icon: <FileText size={24} /> }
                      ].map((option) => (
                        <button
                          key={option.format}
                          onClick={() => handleExport(option.format as any)}
                          disabled={exporting}
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50"
                        >
                          <div className="flex justify-center mb-2">{option.icon}</div>
                          <div className="text-sm font-medium">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="text-red-600" size={16} />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BulkOperationsModal;
