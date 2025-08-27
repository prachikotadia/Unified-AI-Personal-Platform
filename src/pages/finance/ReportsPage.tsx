import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  Calendar,
  Filter,
  FileText,
  DollarSign,
  TrendingDown,
  Target,
  AlertTriangle
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { useToastHelpers } from '../../components/ui/Toast';

const ReportsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('summary');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { reports, analytics, fetchReports, fetchAnalytics } = useFinance();
  const { success, error: showError } = useToastHelpers();

  useEffect(() => {
    fetchReports('summary');
    fetchAnalytics();
  }, [fetchReports, fetchAnalytics]);

  const handleGenerateReport = async (reportType: 'summary' | 'detailed' | 'budget') => {
    setIsGenerating(true);
    try {
      await fetchReports(reportType);
      success(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully!`);
    } catch (err) {
      showError('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = (format: 'pdf' | 'csv' | 'json') => {
    const reportData = reports || analytics;
    if (!reportData) {
      showError('No report data available');
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(reportData, null, 2);
        filename = `financial-report-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        content = convertToCSV(reportData);
        filename = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
        break;
      case 'pdf':
        // For PDF, we'll create a simple text representation
        content = generatePDFContent(reportData);
        filename = `financial-report-${new Date().toISOString().split('T')[0]}.txt`;
        mimeType = 'text/plain';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    success(`Report downloaded as ${format.toUpperCase()}`);
  };

  const convertToCSV = (data: any): string => {
    // Simple CSV conversion for demo
    const lines = ['Category,Amount,Percentage'];
    if (data.spending_by_category) {
      Object.entries(data.spending_by_category).forEach(([category, amount]) => {
        lines.push(`${category},${amount},${((amount as number) / data.monthly_expenses * 100).toFixed(2)}%`);
      });
    }
    return lines.join('\n');
  };

  const generatePDFContent = (data: any): string => {
    return `Financial Report
Generated: ${new Date().toLocaleDateString()}

Summary:
- Total Balance: $${data.total_balance?.toLocaleString() || 'N/A'}
- Monthly Income: $${data.monthly_income?.toLocaleString() || 'N/A'}
- Monthly Expenses: $${data.monthly_expenses?.toLocaleString() || 'N/A'}
- Savings Rate: ${data.savings_rate?.toFixed(1) || 'N/A'}%

Spending by Category:
${data.spending_by_category ? Object.entries(data.spending_by_category).map(([category, amount]) => 
  `- ${category}: $${(amount as number).toLocaleString()}`
).join('\n') : 'No data available'}

Recommendations:
${data.recommendations ? data.recommendations.map((rec: string) => `- ${rec}`).join('\n') : 'No recommendations available'}`;
  };

  const reportTypes = [
    { id: 'summary', label: 'Summary Report', icon: <FileText size={20} />, description: 'Overview of financial health' },
    { id: 'detailed', label: 'Detailed Report', icon: <BarChart3 size={20} />, description: 'Comprehensive financial analysis' },
    { id: 'budget', label: 'Budget Report', icon: <Target size={20} />, description: 'Budget performance and tracking' },
  ];

  const periods = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' },
    { id: 'year', label: 'This Year' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="text-blue-600" />
              Financial Reports
            </h1>
            <p className="text-gray-600 mt-2">Generate and download comprehensive financial reports</p>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-wrap items-center gap-6">
            {/* Period Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {periods.map((period) => (
                  <option key={period.id} value={period.id}>{period.label}</option>
                ))}
              </select>
            </div>

            {/* Report Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={() => handleGenerateReport(selectedReport as 'summary' | 'detailed' | 'budget')}
              disabled={isGenerating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Report Types Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {reportTypes.map((type) => (
            <div key={type.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                  {type.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{type.label}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleGenerateReport(type.id as 'summary' | 'detailed' | 'budget')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadReport('pdf')}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => handleDownloadReport('csv')}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => handleDownloadReport('json')}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    JSON
                  </button>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Report Preview */}
        {reports && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Report Preview</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadReport('pdf')}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  ${reports.summary?.total_income?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-gray-600">Total Income</p>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg">
                <TrendingDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">
                  ${reports.summary?.total_expenses?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-gray-600">Total Expenses</p>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">
                  ${reports.summary?.net_savings?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-gray-600">Net Savings</p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">
                  {reports.summary?.savings_rate?.toFixed(1) || '0'}%
                </p>
                <p className="text-sm text-gray-600">Savings Rate</p>
              </div>
            </div>

            {/* Recommendations */}
            {reports.recommendations && reports.recommendations.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {reports.recommendations.map((recommendation: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
