import React from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Transaction } from '../../services/financeAPI';

interface TrendAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

const TrendAnalysisModal: React.FC<TrendAnalysisModalProps> = ({
  isOpen,
  onClose,
  transactions
}) => {
  if (!isOpen) return null;

  // Group transactions by month
  const monthlyData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { income: 0, expense: 0 };
    }
    
    if (transaction.type === 'income') {
      acc[monthKey].income += transaction.amount;
    } else if (transaction.type === 'expense') {
      acc[monthKey].expense += Math.abs(transaction.amount);
    }
    
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  const sortedMonths = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6); // Last 6 months

  const maxAmount = Math.max(
    ...sortedMonths.map(([, data]) => Math.max(data.income, data.expense)),
    1000
  );

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const overallIncome = sortedMonths.reduce((sum, [, data]) => sum + data.income, 0);
  const overallExpense = sortedMonths.reduce((sum, [, data]) => sum + data.expense, 0);
  const previousIncome = sortedMonths.length > 1 
    ? sortedMonths[sortedMonths.length - 2][1].income 
    : 0;
  const previousExpense = sortedMonths.length > 1 
    ? sortedMonths[sortedMonths.length - 2][1].expense 
    : 0;

  const incomeTrend = calculateTrend(
    sortedMonths[sortedMonths.length - 1]?.[1].income || 0,
    previousIncome
  );
  const expenseTrend = calculateTrend(
    sortedMonths[sortedMonths.length - 1]?.[1].expense || 0,
    previousExpense
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-blue-600 dark:text-blue-400" size={24} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Trend Analysis</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Income</span>
                {incomeTrend !== 0 && (
                  <div className={`flex items-center gap-1 ${incomeTrend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {incomeTrend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span className="text-sm font-semibold">{Math.abs(incomeTrend).toFixed(1)}%</span>
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${overallIncome.toLocaleString()}
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</span>
                {expenseTrend !== 0 && (
                  <div className={`flex items-center gap-1 ${expenseTrend < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {expenseTrend < 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span className="text-sm font-semibold">{Math.abs(expenseTrend).toFixed(1)}%</span>
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${overallExpense.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Monthly Chart */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <Calendar size={20} />
              Monthly Trends (Last 6 Months)
            </h3>
            {sortedMonths.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sortedMonths.map(([month, data]) => {
                  const date = new Date(month + '-01');
                  return {
                    month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                    income: data.income,
                    expense: data.expense
                  };
                })}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-20" />
                  <XAxis 
                    dataKey="month" 
                    stroke="currentColor"
                    className="text-muted-foreground"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    stroke="currentColor"
                    className="text-muted-foreground"
                    tick={{ fill: 'currentColor' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))', 
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState
                chartType="trend"
                title="Not enough data for trend analysis"
                message="Add at least 2 months of transaction data to see income and expense trends over time. This helps you understand your financial patterns."
                actionLabel="Add Transaction"
              />
            )}
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default TrendAnalysisModal;

