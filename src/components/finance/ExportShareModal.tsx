import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Share2, 
  FileText, 
  FileSpreadsheet, 
  File, 
  Mail, 
  Link, 
  Copy,
  CheckCircle,
  Calendar,
  Filter,
  Users,
  Lock,
  Globe,
  Eye,
  Edit,
  Settings
} from 'lucide-react';
import { bankIntegrationAPIService } from '../../services/bankIntegration';

interface ExportShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'export' | 'share';
}

const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV', icon: <FileSpreadsheet size={20} />, description: 'Spreadsheet format' },
  { value: 'pdf', label: 'PDF', icon: <File size={20} />, description: 'Document format' },
  { value: 'excel', label: 'Excel', icon: <FileSpreadsheet size={20} />, description: 'Excel format' },
];

const EXPORT_TYPES = [
  { value: 'transactions', label: 'Transactions', description: 'Export transaction history' },
  { value: 'budgets', label: 'Budgets', description: 'Export budget data' },
  { value: 'goals', label: 'Financial Goals', description: 'Export goal progress' },
  { value: 'reports', label: 'Financial Reports', description: 'Export comprehensive reports' },
];

const SHARE_PERMISSIONS = [
  { value: 'view', label: 'View Only', icon: <Eye size={16} />, description: 'Can only view data' },
  { value: 'edit', label: 'Edit', icon: <Edit size={16} />, description: 'Can view and edit data' },
  { value: 'admin', label: 'Admin', icon: <Settings size={16} />, description: 'Full access to data' },
];

const ExportShareModal: React.FC<ExportShareModalProps> = ({ isOpen, onClose, type }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportType, setExportType] = useState('transactions');
  const [dateRange, setDateRange] = useState('last_month');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const [shareType, setShareType] = useState('dashboard');
  const [sharePermissions, setSharePermissions] = useState('view');
  const [shareRecipients, setShareRecipients] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [shareExpiration, setShareExpiration] = useState('7_days');
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareUrlCopied, setShareUrlCopied] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock data based on export type and format
      let data = '';
      const fileName = `financial_${exportType}_${new Date().toISOString().split('T')[0]}`;
      
      if (exportFormat === 'csv') {
        data = generateCSVData(exportType);
      } else if (exportFormat === 'pdf') {
        data = generatePDFData(exportType);
      } else if (exportFormat === 'excel') {
        data = generateExcelData(exportType);
      }

      // Create and download file
      const blob = new Blob([data], { type: getMimeType(exportFormat) });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const generateCSVData = (type: string) => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Type'];
    const rows = [
      ['2024-01-15', 'Grocery Shopping', 'Food & Dining', '-125.50', 'Expense'],
      ['2024-01-16', 'Salary Deposit', 'Income', '3500.00', 'Income'],
      ['2024-01-17', 'Gas Station', 'Transportation', '-45.20', 'Expense'],
      ['2024-01-18', 'Netflix Subscription', 'Entertainment', '-15.99', 'Expense'],
      ['2024-01-19', 'Freelance Payment', 'Income', '500.00', 'Income'],
      ['2024-01-20', 'Restaurant', 'Food & Dining', '-85.30', 'Expense'],
      ['2024-01-21', 'Electric Bill', 'Utilities', '-120.00', 'Expense'],
      ['2024-01-22', 'Online Shopping', 'Shopping', '-67.45', 'Expense'],
    ];
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generatePDFData = (type: string) => {
    return `Financial Report - ${type}
Generated on: ${new Date().toLocaleDateString()}

Summary:
- Total Income: $4,000.00
- Total Expenses: $459.44
- Net Savings: $3,540.56

This is a mock PDF content for demonstration purposes.
The actual PDF would contain formatted financial data with charts and tables.

Transaction Details:
• Grocery Shopping: -$125.50
• Salary Deposit: +$3,500.00
• Gas Station: -$45.20
• Netflix Subscription: -$15.99
• Freelance Payment: +$500.00
• Restaurant: -$85.30
• Electric Bill: -$120.00
• Online Shopping: -$67.45`;
  };

  const generateExcelData = (type: string) => {
    // Simplified Excel-like data (in real implementation, you'd use a library like xlsx)
    return `Financial Report - ${type}
Date,Description,Category,Amount,Type
2024-01-15,Grocery Shopping,Food & Dining,-125.50,Expense
2024-01-16,Salary Deposit,Income,3500.00,Income
2024-01-17,Gas Station,Transportation,-45.20,Expense
2024-01-18,Netflix Subscription,Entertainment,-15.99,Expense
2024-01-19,Freelance Payment,Income,500.00,Income
2024-01-20,Restaurant,Food & Dining,-85.30,Expense
2024-01-21,Electric Bill,Utilities,-120.00,Expense
2024-01-22,Online Shopping,Shopping,-67.45,Expense`;
  };

  const getMimeType = (format: string) => {
    switch (format) {
      case 'csv':
        return 'text/csv';
      case 'pdf':
        return 'application/pdf';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'text/plain';
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const shareData = {
        type: shareType as 'dashboard' | 'transactions' | 'budget' | 'goals',
        recipients: shareRecipients.split(',').map(email => email.trim()).filter(Boolean),
        permissions: sharePermissions as 'view' | 'edit' | 'admin',
        expiration_date: getExpirationDate(),
        message: shareMessage,
      };

      const result = await bankIntegrationAPIService.shareFinancialData(shareData);
      setShareUrl(result.share_url);
    } catch (error) {
      console.error('Error sharing data:', error);
      alert('Failed to share data. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareUrlCopied(true);
      setTimeout(() => setShareUrlCopied(false), 2000);
    } catch (error) {
      console.error('Error copying URL:', error);
    }
  };

  const getDateRangeStart = () => {
    const now = new Date();
    switch (dateRange) {
      case 'last_week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      case 'last_month':
        return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString().split('T')[0];
      case 'last_quarter':
        return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString().split('T')[0];
      case 'last_year':
        return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString().split('T')[0];
      default:
        return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString().split('T')[0];
    }
  };

  const getDateRangeEnd = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getExpirationDate = () => {
    const now = new Date();
    switch (shareExpiration) {
      case '1_day':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      case '7_days':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      case '30_days':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      case 'never':
        return undefined;
      default:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
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
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {type === 'export' ? (
                    <Download className="text-blue-600" size={20} />
                  ) : (
                    <Share2 className="text-blue-600" size={20} />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {type === 'export' ? 'Export Financial Data' : 'Share Financial Data'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {type === 'export' 
                      ? 'Download your financial data in various formats' 
                      : 'Share your financial data with others securely'
                    }
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

            {/* Content */}
            <div className="p-6">
              {type === 'export' ? (
                <div className="space-y-6">
                  {/* Export Type */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Export Type</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {EXPORT_TYPES.map((exportTypeOption) => (
                        <button
                          key={exportTypeOption.value}
                          onClick={() => setExportType(exportTypeOption.value)}
                          className={`p-3 border rounded-lg text-left transition-colors ${
                            exportType === exportTypeOption.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium">{exportTypeOption.label}</div>
                          <div className="text-sm text-gray-600">{exportTypeOption.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Export Format */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Export Format</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {EXPORT_FORMATS.map((format) => (
                        <button
                          key={format.value}
                          onClick={() => setExportFormat(format.value)}
                          className={`p-3 border rounded-lg text-center transition-colors ${
                            exportFormat === format.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-center mb-2">{format.icon}</div>
                          <div className="font-medium">{format.label}</div>
                          <div className="text-xs text-gray-600">{format.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Date Range</h3>
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="last_week">Last Week</option>
                      <option value="last_month">Last Month</option>
                      <option value="last_quarter">Last Quarter</option>
                      <option value="last_year">Last Year</option>
                    </select>
                  </div>

                  {/* Options */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Options</h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="includeCharts"
                        checked={includeCharts}
                        onChange={(e) => setIncludeCharts(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="includeCharts" className="text-sm text-gray-700">
                        Include charts and visualizations
                      </label>
                    </div>
                  </div>

                  {/* Export Button */}
                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isExporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        Export Data
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Share Type */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Share Type</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'dashboard', label: 'Dashboard', description: 'Share financial overview' },
                        { value: 'transactions', label: 'Transactions', description: 'Share transaction history' },
                        { value: 'budget', label: 'Budgets', description: 'Share budget information' },
                        { value: 'goals', label: 'Goals', description: 'Share financial goals' },
                      ].map((shareTypeOption) => (
                        <button
                          key={shareTypeOption.value}
                          onClick={() => setShareType(shareTypeOption.value)}
                          className={`p-3 border rounded-lg text-left transition-colors ${
                            shareType === shareTypeOption.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium">{shareTypeOption.label}</div>
                          <div className="text-sm text-gray-600">{shareTypeOption.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Permissions */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Permissions</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {SHARE_PERMISSIONS.map((permission) => (
                        <button
                          key={permission.value}
                          onClick={() => setSharePermissions(permission.value)}
                          className={`p-3 border rounded-lg text-center transition-colors ${
                            sharePermissions === permission.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-center mb-2">{permission.icon}</div>
                          <div className="font-medium">{permission.label}</div>
                          <div className="text-xs text-gray-600">{permission.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recipients */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipients (Email addresses, separated by commas)
                    </label>
                    <input
                      type="text"
                      value={shareRecipients}
                      onChange={(e) => setShareRecipients(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@example.com, jane@example.com"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      value={shareMessage}
                      onChange={(e) => setShareMessage(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add a personal message..."
                    />
                  </div>

                  {/* Expiration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiration
                    </label>
                    <select
                      value={shareExpiration}
                      onChange={(e) => setShareExpiration(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="1_day">1 Day</option>
                      <option value="7_days">7 Days</option>
                      <option value="30_days">30 Days</option>
                      <option value="never">Never</option>
                    </select>
                  </div>

                  {/* Share URL */}
                  {shareUrl && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Share URL</h4>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={shareUrl}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white"
                        />
                        <button
                          onClick={copyShareUrl}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          {shareUrlCopied ? (
                            <>
                              <CheckCircle size={16} />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={16} />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Share Button */}
                  <button
                    onClick={handleShare}
                    disabled={isSharing || !shareRecipients.trim()}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSharing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sharing...
                      </>
                    ) : (
                      <>
                        <Share2 size={16} />
                        Share Data
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExportShareModal;
