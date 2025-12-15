import React, { useState, useEffect, useMemo } from 'react';
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
  AlertTriangle,
  FileSpreadsheet,
  Share2,
  Clock,
  Brain,
  X,
  Settings,
  Mail,
  Link as LinkIcon,
  Copy,
  Check,
  Trash2
} from 'lucide-react';
import { useFinanceStore } from '../../store/finance';
import { useToastHelpers } from '../../components/ui/Toast';
import { useAI } from '../../hooks/useAI';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface GeneratedReport {
  type: 'summary' | 'detailed' | 'budget';
  period: string;
  generatedAt: string;
  data: any;
}

interface ScheduledReport {
  id: string;
  name: string;
  reportType: 'summary' | 'detailed' | 'budget';
  period: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  nextRun: string;
  emailRecipients: string[];
  enabled: boolean;
  createdAt: string;
}

interface CustomReportConfig {
  name: string;
  sections: string[];
  dateRange: string;
}

const ReportsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('summary');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [showCustomReportModal, setShowCustomReportModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  
  const { 
    transactions, 
    budgets, 
    financialGoals, 
    investments, 
    debtTrackers, 
    bankAccounts,
    getTotalBalance,
    getMonthlyIncome,
    getMonthlyExpenses
  } = useFinanceStore();
  
  const { success, error: showError } = useToastHelpers();
  const { analyzeFinance, isLoading: aiLoading } = useAI();
  
  // State for modals
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [shareMethod, setShareMethod] = useState<'email' | 'link' | 'export'>('email');
  const [shareEmail, setShareEmail] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [customReportConfig, setCustomReportConfig] = useState<CustomReportConfig>({
    name: '',
    sections: ['Income', 'Expenses', 'Savings', 'Budgets', 'Investments', 'Debts'],
    dateRange: 'last_30_days'
  });
  const [scheduleConfig, setScheduleConfig] = useState({
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly',
    nextRun: '',
    emailRecipients: ''
  });

  // Load scheduled reports from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('scheduled-reports');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setScheduledReports(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Failed to load scheduled reports:', e);
      }
    }
  }, []);

  // Save scheduled reports to localStorage
  const saveScheduledReports = (reports: ScheduledReport[]) => {
    localStorage.setItem('scheduled-reports', JSON.stringify(reports));
    setScheduledReports(reports);
  };

  // Calculate date range based on selected period
  const getDateRange = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    return { startDate, endDate: now };
  }, [selectedPeriod]);

  // Filter transactions by period
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= getDateRange.startDate && transactionDate <= getDateRange.endDate;
    });
  }, [transactions, getDateRange]);

  // Generate report data based on type
  const generateReportData = (reportType: 'summary' | 'detailed' | 'budget') => {
    const periodTransactions = filteredTransactions;
    const periodIncome = periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const periodExpenses = periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const periodSavings = periodIncome - periodExpenses;
    const savingsRate = periodIncome > 0 ? (periodSavings / periodIncome) * 100 : 0;

    // Calculate spending by category
    const spendingByCategory: Record<string, number> = {};
    periodTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const category = t.category || 'other';
        spendingByCategory[category] = (spendingByCategory[category] || 0) + (t.amount || 0);
      });

    // Calculate top expenses
    const topExpenses = periodTransactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => (b.amount || 0) - (a.amount || 0))
      .slice(0, 10);

    // Calculate budget performance
    const budgetPerformance = budgets.map(budget => {
      const budgetExpenses = periodTransactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      const budgetLimit = (budget as any).limit || (budget as any).amount || 0;
      const percentage = budgetLimit > 0 ? (budgetExpenses / budgetLimit) * 100 : 0;
      return {
        category: budget.category,
        limit: budgetLimit,
        spent: budgetExpenses,
        remaining: budgetLimit - budgetExpenses,
        percentage: percentage,
        status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'
      };
    });

    // Calculate investment totals
    const totalInvestments = investments.reduce((sum, inv) => {
      return sum + ((inv.current_value || inv.purchase_price || 0) * (inv.quantity || 0));
    }, 0);

    // Calculate debt totals
    const totalDebt = debtTrackers.reduce((sum, debt) => sum + (debt.current_balance || 0), 0);

    // Calculate net worth
    const totalBalance = getTotalBalance();
    const netWorth = totalBalance + totalInvestments - totalDebt;

    const baseData = {
      period: selectedPeriod,
      startDate: getDateRange.startDate.toISOString(),
      endDate: getDateRange.endDate.toISOString(),
      totalBalance,
      periodIncome,
      periodExpenses,
      periodSavings,
      savingsRate,
      spendingByCategory,
      topExpenses,
      totalInvestments,
      totalDebt,
      netWorth,
      transactionCount: periodTransactions.length,
    };

    switch (reportType) {
      case 'summary':
        return {
          ...baseData,
          summary: {
            total_balance: totalBalance,
            monthly_income: periodIncome,
            monthly_expenses: periodExpenses,
            net_savings: periodSavings,
            savings_rate: savingsRate,
            total_investments: totalInvestments,
            total_debt: totalDebt,
            net_worth: netWorth,
          },
          recommendations: generateRecommendations(baseData),
        };
      
      case 'detailed':
        return {
          ...baseData,
          transactions: periodTransactions,
          spendingByCategory,
          topExpenses,
          categoryBreakdown: Object.entries(spendingByCategory).map(([category, amount]) => ({
            category,
            amount,
            percentage: periodExpenses > 0 ? (amount / periodExpenses) * 100 : 0,
          })),
          trends: calculateTrends(periodTransactions),
          recommendations: generateRecommendations(baseData),
        };
      
      case 'budget':
        return {
          ...baseData,
          budgets: budgets,
          budgetPerformance,
          budgetSummary: {
            totalBudgets: budgets.length,
            totalBudgeted: budgets.reduce((sum, b) => sum + ((b as any).limit || (b as any).amount || 0), 0),
            totalSpent: budgetPerformance.reduce((sum, b) => sum + b.spent, 0),
            overBudget: budgetPerformance.filter(b => b.status === 'over').length,
            onTrack: budgetPerformance.filter(b => b.status === 'good').length,
          },
          recommendations: generateBudgetRecommendations(budgetPerformance),
        };
      
      default:
        return baseData;
    }
  };

  const calculateTrends = (transactions: any[]) => {
    const monthlyData: Record<string, { income: number; expenses: number }> = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        monthlyData[monthKey].income += t.amount || 0;
      } else if (t.type === 'expense') {
        monthlyData[monthKey].expenses += t.amount || 0;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      savings: data.income - data.expenses,
    }));
  };

  const generateRecommendations = (data: any): string[] => {
    const recommendations: string[] = [];
    
    if (data.savingsRate < 20) {
      recommendations.push('Consider increasing your savings rate to at least 20% of income');
    }
    
    if (data.periodExpenses > data.periodIncome * 0.9) {
      recommendations.push('Your expenses are very high relative to income. Review discretionary spending.');
    }
    
    const topCategory = Object.entries(data.spendingByCategory)
      .sort(([, a], [, b]) => (b as number) - (a as number))[0];
    if (topCategory && (topCategory[1] as number) > data.periodExpenses * 0.3) {
      recommendations.push(`Consider reviewing spending in ${topCategory[0]} category (${((topCategory[1] as number) / data.periodExpenses * 100).toFixed(1)}% of expenses)`);
    }
    
    if (data.totalDebt > 0 && data.totalDebt > data.periodIncome * 3) {
      recommendations.push('Your debt level is high. Consider creating a debt repayment plan.');
    }
    
    return recommendations;
  };

  const generateBudgetRecommendations = (budgetPerformance: any[]): string[] => {
    const recommendations: string[] = [];
    
    const overBudget = budgetPerformance.filter(b => b.status === 'over');
    if (overBudget.length > 0) {
      recommendations.push(`${overBudget.length} budget(s) exceeded. Review spending in: ${overBudget.map(b => b.category).join(', ')}`);
    }
    
    const warningBudgets = budgetPerformance.filter(b => b.status === 'warning');
    if (warningBudgets.length > 0) {
      recommendations.push(`${warningBudgets.length} budget(s) approaching limit. Monitor: ${warningBudgets.map(b => b.category).join(', ')}`);
    }
    
    return recommendations;
  };

  const generateAIInsightsFallback = (reportData: any): string => {
    const insights: string[] = [];
    
    insights.push(`📊 Financial Overview:`);
    insights.push(`Your total balance is $${(reportData.totalBalance || 0).toLocaleString()}`);
    insights.push(`Income for this period: $${(reportData.periodIncome || 0).toLocaleString()}`);
    insights.push(`Expenses for this period: $${(reportData.periodExpenses || 0).toLocaleString()}`);
    insights.push(`Net savings: $${(reportData.periodSavings || 0).toLocaleString()} (${(reportData.savingsRate || 0).toFixed(1)}% savings rate)`);
    insights.push(``);
    
    if (reportData.spendingByCategory) {
      insights.push(`💰 Spending Analysis:`);
      const topCategories = Object.entries(reportData.spendingByCategory)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3);
      
      topCategories.forEach(([category, amount], index) => {
        const percentage = reportData.periodExpenses > 0 
          ? (((amount as number) / reportData.periodExpenses) * 100).toFixed(1) 
          : '0';
        insights.push(`${index + 1}. ${category}: $${(amount as number).toLocaleString()} (${percentage}% of expenses)`);
      });
      insights.push(``);
    }
    
    if (reportData.netWorth !== undefined) {
      insights.push(`💎 Net Worth: $${(reportData.netWorth || 0).toLocaleString()}`);
      insights.push(`Investments: $${(reportData.totalInvestments || 0).toLocaleString()}`);
      insights.push(`Debt: $${(reportData.totalDebt || 0).toLocaleString()}`);
      insights.push(``);
    }
    
    insights.push(`💡 Key Insights:`);
    if (reportData.savingsRate < 20) {
      insights.push(`• Your savings rate is below the recommended 20%. Consider reducing discretionary spending.`);
    }
    if (reportData.periodExpenses > reportData.periodIncome * 0.8) {
      insights.push(`• Your expenses are high relative to income. Review your spending patterns.`);
    }
    if (reportData.totalDebt > 0 && reportData.totalDebt > reportData.periodIncome * 2) {
      insights.push(`• Your debt level is significant. Consider creating a debt repayment strategy.`);
    }
    
    return insights.join('\n');
  };

  const handleGenerateReport = async (reportType: 'summary' | 'detailed' | 'budget') => {
    setIsGenerating(true);
    try {
      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const reportData = generateReportData(reportType);
      const report: GeneratedReport = {
        type: reportType,
        period: selectedPeriod,
        generatedAt: new Date().toISOString(),
        data: reportData,
      };
      
      setGeneratedReport(report);
      success(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully!`);
    } catch (err: any) {
      showError(err.message || 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = (reportType: 'summary' | 'detailed' | 'budget') => {
    if (!generatedReport || generatedReport.type !== reportType) {
      showError('Please generate the report first');
      return;
    }

    const doc = new jsPDF();
    const data = generatedReport.data;
    let yPos = 20;

    // Title
    doc.setFontSize(18);
    doc.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Financial Report`, 14, yPos);
    yPos += 10;

    // Period
    doc.setFontSize(12);
    doc.text(`Period: ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}`, 14, yPos);
    yPos += 8;
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, yPos);
    yPos += 15;

    // Summary Section
    doc.setFontSize(14);
    doc.text('Summary', 14, yPos);
    yPos += 8;
    doc.setFontSize(10);
    
    doc.text(`Total Balance: $${data.totalBalance?.toLocaleString() || '0'}`, 14, yPos);
    yPos += 6;
    doc.text(`Income: $${data.periodIncome?.toLocaleString() || '0'}`, 14, yPos);
    yPos += 6;
    doc.text(`Expenses: $${data.periodExpenses?.toLocaleString() || '0'}`, 14, yPos);
    yPos += 6;
    doc.text(`Savings: $${data.periodSavings?.toLocaleString() || '0'}`, 14, yPos);
    yPos += 6;
    doc.text(`Savings Rate: ${data.savingsRate?.toFixed(1) || '0'}%`, 14, yPos);
    yPos += 6;
    doc.text(`Net Worth: $${data.netWorth?.toLocaleString() || '0'}`, 14, yPos);
    yPos += 10;

    if (reportType === 'detailed' && data.transactions) {
      doc.setFontSize(14);
      doc.text('Top Expenses', 14, yPos);
      yPos += 8;
      doc.setFontSize(10);
      
      data.topExpenses.slice(0, 10).forEach((expense: any, index: number) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${index + 1}. ${expense.description || 'N/A'}: $${(expense.amount || 0).toLocaleString()}`, 14, yPos);
        yPos += 6;
      });
      yPos += 5;
    }

    if (reportType === 'budget' && data.budgetPerformance) {
      doc.setFontSize(14);
      doc.text('Budget Performance', 14, yPos);
      yPos += 8;
      doc.setFontSize(10);
      
      data.budgetPerformance.forEach((budget: any) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${budget.category}: $${budget.spent.toLocaleString()} / $${budget.limit.toLocaleString()} (${budget.percentage.toFixed(1)}%)`, 14, yPos);
        yPos += 6;
      });
      yPos += 5;
    }

    // Recommendations
    if (data.recommendations && data.recommendations.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.text('Recommendations', 14, yPos);
      yPos += 8;
      doc.setFontSize(10);
      
      data.recommendations.forEach((rec: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${rec}`, 14, yPos);
        yPos += 6;
      });
    }

    const filename = `${reportType}-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    success('PDF report downloaded successfully!');
  };

  const handleExportExcel = (reportType: 'summary' | 'detailed' | 'budget') => {
    if (!generatedReport || generatedReport.type !== reportType) {
      showError('Please generate the report first');
      return;
    }

    const data = generatedReport.data;
    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['Financial Report Summary'],
      ['Period', selectedPeriod],
      ['Generated', new Date().toLocaleString()],
      [],
      ['Metric', 'Value'],
      ['Total Balance', data.totalBalance || 0],
      ['Income', data.periodIncome || 0],
      ['Expenses', data.periodExpenses || 0],
      ['Savings', data.periodSavings || 0],
      ['Savings Rate (%)', data.savingsRate?.toFixed(2) || 0],
      ['Net Worth', data.netWorth || 0],
      ['Total Investments', data.totalInvestments || 0],
      ['Total Debt', data.totalDebt || 0],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Transactions Sheet (for detailed report)
    if (reportType === 'detailed' && data.transactions) {
      const transactionsData = [
        ['Date', 'Description', 'Category', 'Type', 'Amount']
      ];
      data.transactions.forEach((t: any) => {
        transactionsData.push([
          new Date(t.date).toLocaleDateString(),
          t.description || '',
          t.category || '',
          t.type || '',
          t.amount || 0,
        ]);
      });
      const transactionsSheet = XLSX.utils.aoa_to_sheet(transactionsData);
      XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions');
    }

    // Category Breakdown Sheet
    if (data.spendingByCategory) {
      const categoryData: (string | number)[][] = [
        ['Category', 'Amount', 'Percentage']
      ];
      Object.entries(data.spendingByCategory).forEach(([category, amount]) => {
        categoryData.push([
          category,
          amount as number,
          data.periodExpenses > 0 ? (((amount as number) / data.periodExpenses) * 100).toFixed(2) + '%' : '0%',
        ]);
      });
      const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
      XLSX.utils.book_append_sheet(workbook, categorySheet, 'Categories');
    }

    // Budget Performance Sheet (for budget report)
    if (reportType === 'budget' && data.budgetPerformance) {
      const budgetData = [
        ['Category', 'Budget Limit', 'Spent', 'Remaining', 'Percentage', 'Status']
      ];
      data.budgetPerformance.forEach((budget: any) => {
        budgetData.push([
          budget.category,
          budget.limit,
          budget.spent,
          budget.remaining,
          budget.percentage.toFixed(2) + '%',
          budget.status,
        ]);
      });
      const budgetSheet = XLSX.utils.aoa_to_sheet(budgetData);
      XLSX.utils.book_append_sheet(workbook, budgetSheet, 'Budgets');
    }

    const filename = `${reportType}-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
    success('Excel report downloaded successfully!');
  };

  const handleExportCSV = (reportType: 'summary' | 'detailed' | 'budget') => {
    if (!generatedReport || generatedReport.type !== reportType) {
      showError('Please generate the report first');
      return;
    }

    const data = generatedReport.data;
    let csvContent = '';

    // Header
    csvContent += `Financial Report - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}\n`;
    csvContent += `Period: ${selectedPeriod}\n`;
    csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;

    // Summary
    csvContent += 'Summary\n';
    csvContent += 'Metric,Value\n';
    csvContent += `Total Balance,${data.totalBalance || 0}\n`;
    csvContent += `Income,${data.periodIncome || 0}\n`;
    csvContent += `Expenses,${data.periodExpenses || 0}\n`;
    csvContent += `Savings,${data.periodSavings || 0}\n`;
    csvContent += `Savings Rate,${data.savingsRate?.toFixed(2) || 0}%\n`;
    csvContent += `Net Worth,${data.netWorth || 0}\n\n`;

    // Category Breakdown
    if (data.spendingByCategory) {
      csvContent += 'Category Breakdown\n';
      csvContent += 'Category,Amount,Percentage\n';
      Object.entries(data.spendingByCategory).forEach(([category, amount]) => {
        const percentage = data.periodExpenses > 0 ? (((amount as number) / data.periodExpenses) * 100).toFixed(2) : '0';
        csvContent += `${category},${amount},${percentage}%\n`;
      });
      csvContent += '\n';
    }

    // Transactions (for detailed report)
    if (reportType === 'detailed' && data.transactions) {
      csvContent += 'Transactions\n';
      csvContent += 'Date,Description,Category,Type,Amount\n';
      data.transactions.forEach((t: any) => {
        csvContent += `${new Date(t.date).toLocaleDateString()},${t.description || ''},${t.category || ''},${t.type || ''},${t.amount || 0}\n`;
      });
      csvContent += '\n';
    }

    // Budget Performance (for budget report)
    if (reportType === 'budget' && data.budgetPerformance) {
      csvContent += 'Budget Performance\n';
      csvContent += 'Category,Budget Limit,Spent,Remaining,Percentage,Status\n';
      data.budgetPerformance.forEach((budget: any) => {
        csvContent += `${budget.category},${budget.limit},${budget.spent},${budget.remaining},${budget.percentage.toFixed(2)}%,${budget.status}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType}-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    success('CSV report downloaded successfully!');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BarChart3 className="text-blue-600 dark:text-blue-400" />
              Financial Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Generate and download comprehensive financial reports</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowAIModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Brain size={16} />
              AI Report Insights
            </button>
            <button
              onClick={() => setShowCustomReportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Settings size={16} />
              Custom Report
            </button>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Clock size={16} />
              Schedule Report
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Share2 size={16} />
              Share Report
            </button>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl p-6 mb-8"
        >
          <div className="flex flex-wrap items-center gap-6">
            {/* Period Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {periods.map((period) => (
                  <option key={period.id} value={period.id}>{period.label}</option>
                ))}
              </select>
            </div>

            {/* Report Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Type</label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
            <div key={type.id} className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  {type.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{type.label}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleGenerateReport(type.id as 'summary' | 'detailed' | 'budget')}
                  disabled={isGenerating}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportPDF(type.id as 'summary' | 'detailed' | 'budget')}
                    disabled={!generatedReport || generatedReport.type !== type.id}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Export PDF"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => handleExportExcel(type.id as 'summary' | 'detailed' | 'budget')}
                    disabled={!generatedReport || generatedReport.type !== type.id}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Export Excel"
                  >
                    Excel
                  </button>
                  <button
                    onClick={() => handleExportCSV(type.id as 'summary' | 'detailed' | 'budget')}
                    disabled={!generatedReport || generatedReport.type !== type.id}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Export CSV"
                  >
                    CSV
                  </button>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Report Preview */}
        {generatedReport && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {generatedReport.type.charAt(0).toUpperCase() + generatedReport.type.slice(1)} Report Preview
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportPDF(generatedReport.type)}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2"
                  title="Export PDF"
                >
                  <Download size={16} />
                  PDF
                </button>
                <button
                  onClick={() => handleExportExcel(generatedReport.type)}
                  className="px-4 py-2 text-green-600 hover:text-green-700 transition-colors flex items-center gap-2"
                  title="Export Excel"
                >
                  <FileSpreadsheet size={16} />
                  Excel
                </button>
                <button
                  onClick={() => handleExportCSV(generatedReport.type)}
                  className="px-4 py-2 text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-2"
                  title="Export CSV"
                >
                  <Download size={16} />
                  CSV
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${(generatedReport.data.totalBalance || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Balance</p>
              </div>

              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${(generatedReport.data.periodIncome || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Income</p>
              </div>

              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ${(generatedReport.data.periodExpenses || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expenses</p>
              </div>

              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <Target className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  ${(generatedReport.data.netWorth || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Net Worth</p>
              </div>
            </div>

            {/* Recommendations */}
            {generatedReport.data.recommendations && generatedReport.data.recommendations.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {generatedReport.data.recommendations.map((recommendation: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700 dark:text-gray-300">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Modals - keeping existing modals for now */}
        {showCustomReportModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create Custom Report</h2>
                <button onClick={() => setShowCustomReportModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Name</label>
                  <input
                    type="text"
                    placeholder="My Custom Report"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Include Sections</label>
                  <div className="space-y-2">
                    {['Income', 'Expenses', 'Savings', 'Budgets', 'Investments', 'Debts'].map(section => (
                      <label key={section} className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <input type="checkbox" defaultChecked className="w-4 h-4" />
                        <span>{section}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCustomReportModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleGenerateReport('detailed');
                      setShowCustomReportModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
                  >
                    Generate Report
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Schedule Report Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowScheduleModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Schedule Report</h2>
                <button onClick={() => setShowScheduleModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Name</label>
                  <input
                    type="text"
                    placeholder="Monthly Financial Report"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    id="schedule-report-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Type</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    id="schedule-report-type"
                  >
                    <option value="summary">Summary Report</option>
                    <option value="detailed">Detailed Report</option>
                    <option value="budget">Budget Report</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
                  <select 
                    value={scheduleConfig.frequency}
                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, frequency: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Next Run Date/Time</label>
                  <input
                    type="datetime-local"
                    value={scheduleConfig.nextRun}
                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, nextRun: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Recipients (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="email1@example.com, email2@example.com"
                    value={scheduleConfig.emailRecipients}
                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, emailRecipients: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const reportName = (document.getElementById('schedule-report-name') as HTMLInputElement)?.value || 'Scheduled Report';
                      const reportType = (document.getElementById('schedule-report-type') as HTMLSelectElement)?.value || 'summary';
                      
                      if (!scheduleConfig.nextRun) {
                        showError('Please select a date and time for the next run');
                        return;
                      }
                      
                      const newSchedule: ScheduledReport = {
                        id: `schedule_${Date.now()}`,
                        name: reportName,
                        reportType: reportType as 'summary' | 'detailed' | 'budget',
                        period: selectedPeriod,
                        frequency: scheduleConfig.frequency,
                        nextRun: scheduleConfig.nextRun,
                        emailRecipients: scheduleConfig.emailRecipients.split(',').map(e => e.trim()).filter(e => e),
                        enabled: true,
                        createdAt: new Date().toISOString(),
                      };
                      
                      const updated = [...scheduledReports, newSchedule];
                      saveScheduledReports(updated);
                      success(`Report "${reportName}" scheduled successfully!`);
                      setScheduleConfig({ frequency: 'monthly', nextRun: '', emailRecipients: '' });
                      setShowScheduleModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    Schedule
                  </button>
                </div>
                
                {/* List of Scheduled Reports */}
                {scheduledReports.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Scheduled Reports</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {scheduledReports.map((schedule) => (
                        <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{schedule.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {schedule.frequency} • Next: {new Date(schedule.nextRun).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              const updated = scheduledReports.filter(s => s.id !== schedule.id);
                              saveScheduledReports(updated);
                              success('Schedule removed');
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Remove schedule"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Share Report Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowShareModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Share Report</h2>
                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Share via</label>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setShareMethod('email')}
                      className={`w-full px-4 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors flex items-center gap-3 ${
                        shareMethod === 'email' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                      } text-gray-900 dark:text-white`}
                    >
                      <Mail size={18} />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Send report via email</p>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        setShareMethod('link');
                        if (!shareLink) {
                          const link = `${window.location.origin}/finance/reports?share=${btoa(JSON.stringify(generatedReport?.data || {}))}`;
                          setShareLink(link);
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors flex items-center gap-3 ${
                        shareMethod === 'link' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                      } text-gray-900 dark:text-white`}
                    >
                      <LinkIcon size={18} />
                      <div>
                        <p className="font-medium">Generate Link</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Create shareable link</p>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        setShareMethod('export');
                        if (generatedReport) {
                          handleExportPDF(generatedReport.type);
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors flex items-center gap-3 ${
                        shareMethod === 'export' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                      } text-gray-900 dark:text-white`}
                    >
                      <Download size={18} />
                      <div>
                        <p className="font-medium">Export & Share</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Download and share file</p>
                      </div>
                    </button>
                  </div>
                </div>
                
                {shareMethod === 'email' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      placeholder="recipient@example.com"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Note: Email functionality requires backend integration. For now, you can copy the email address.
                    </p>
                  </div>
                )}
                
                {shareMethod === 'link' && shareLink && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shareable Link</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shareLink}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(shareLink);
                          setLinkCopied(true);
                          success('Link copied to clipboard!');
                          setTimeout(() => setLinkCopied(false), 2000);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Share this link with others to view the report
                    </p>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowShareModal(false);
                      setShareMethod('email');
                      setShareEmail('');
                      setShareLink('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  {shareMethod === 'email' && (
                    <button
                      onClick={() => {
                        if (!shareEmail || !shareEmail.includes('@')) {
                          showError('Please enter a valid email address');
                          return;
                        }
                        // In a real app, this would send an email via backend
                        // For now, we'll just copy the email to clipboard
                        navigator.clipboard.writeText(shareEmail);
                        success(`Email address "${shareEmail}" copied. Report sharing via email requires backend integration.`);
                        setShowShareModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                      Copy Email
                    </button>
                  )}
                  {shareMethod === 'link' && (
                    <button
                      onClick={() => {
                        if (!shareLink) {
                          const link = `${window.location.origin}/finance/reports?share=${btoa(JSON.stringify(generatedReport?.data || {}))}`;
                          setShareLink(link);
                        }
                        navigator.clipboard.writeText(shareLink);
                        success('Shareable link copied to clipboard!');
                        setShowShareModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                      Copy Link
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* AI Report Insights Modal */}
        {showAIModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowAIModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Brain className="text-purple-600 dark:text-purple-400" size={24} />
                  AI Report Insights
                </h2>
                <button onClick={() => setShowAIModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  AI-powered insights and recommendations based on your financial data.
                </p>
                
                {!generatedReport && (
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Generate a report first</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Please generate a report to see AI-powered insights and recommendations.</p>
                  </div>
                )}
                
                {generatedReport && !aiInsights && !isLoadingAI && (
                  <button
                    onClick={async () => {
                      setIsLoadingAI(true);
                      try {
                        const response = await analyzeFinance(filteredTransactions, budgets);
                        if (response.content) {
                          setAiInsights(response.content);
                        } else {
                          // Fallback to basic analysis if AI fails
                          const fallbackInsights = generateAIInsightsFallback(generatedReport.data);
                          setAiInsights(fallbackInsights);
                        }
                      } catch (err: any) {
                        // Fallback to basic analysis
                        const fallbackInsights = generateAIInsightsFallback(generatedReport.data);
                        setAiInsights(fallbackInsights);
                      } finally {
                        setIsLoadingAI(false);
                      }
                    }}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Brain size={18} />
                    Generate AI Insights
                  </button>
                )}
                
                {isLoadingAI && (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Analyzing your financial data...</span>
                  </div>
                )}
                
                {aiInsights && (
                  <div className="space-y-3">
                    <div className="p-4 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <div className="flex items-start gap-3">
                        <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">AI Analysis</h3>
                          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {aiInsights}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {generatedReport?.data.recommendations && generatedReport.data.recommendations.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Recommendations</h3>
                        <div className="space-y-2">
                          {generatedReport.data.recommendations.map((rec: string, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-3 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-700 dark:text-gray-300">{rec}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
