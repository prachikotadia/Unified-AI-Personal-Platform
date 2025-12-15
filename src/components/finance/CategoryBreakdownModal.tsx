import React from 'react';
import { motion } from 'framer-motion';
import { X, PieChart, DollarSign, Utensils, Car, ShoppingBag, Film, FileText, Heart, GraduationCap, Plane, Package } from 'lucide-react';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Transaction } from '../../services/financeAPI';
import { EmptyChartState } from '../../utils/emptyStateHelpers';

interface CategoryBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

const CategoryBreakdownModal: React.FC<CategoryBreakdownModalProps> = ({
  isOpen,
  onClose,
  transactions
}) => {
  if (!isOpen) return null;

  // Calculate category totals
  const categoryTotals = transactions.reduce((acc, transaction) => {
    if (transaction.type === 'expense') {
      const category = transaction.category || 'other';
      acc[category] = (acc[category] || 0) + Math.abs(transaction.amount);
    }
    return acc;
  }, {} as Record<string, number>);

  const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

  const sortedCategories = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / totalExpenses) * 100
    }))
    .sort((a, b) => b.amount - a.amount);

  const getCategoryIcon = (category: string) => {
    const iconClass = "w-5 h-5 text-gray-600 dark:text-gray-400";
    const icons: Record<string, JSX.Element> = {
      food_dining: <Utensils className={iconClass} />,
      transportation: <Car className={iconClass} />,
      shopping: <ShoppingBag className={iconClass} />,
      entertainment: <Film className={iconClass} />,
      bills: <FileText className={iconClass} />,
      healthcare: <Heart className={iconClass} />,
      education: <GraduationCap className={iconClass} />,
      travel: <Plane className={iconClass} />,
      other: <Package className={iconClass} />
    };
    return icons[category] || <Package className={iconClass} />;
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500',
      'bg-teal-500',
      'bg-gray-500'
    ];
    return colors[index % colors.length];
  };

  const getCategoryColorHex = (index: number) => {
    const colors = [
      '#3b82f6', // blue-500
      '#10b981', // green-500
      '#eab308', // yellow-500
      '#ef4444', // red-500
      '#a855f7', // purple-500
      '#ec4899', // pink-500
      '#6366f1', // indigo-500
      '#f97316', // orange-500
      '#14b8a6', // teal-500
      '#6b7280'  // gray-500
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <PieChart className="text-blue-600 dark:text-blue-400" size={24} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Category Breakdown</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${totalExpenses.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Pie Chart */}
          {sortedCategories.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-4 text-gray-900 dark:text-white">Category Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={sortedCategories.map((item, index) => ({
                      name: item.category.replace('_', ' '),
                      value: item.amount,
                      percentage: item.percentage
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sortedCategories.map((item, index) => (
                      <Cell key={`cell-${index}`} fill={getCategoryColorHex(index)} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))', 
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category List */}
          <div className="space-y-3">
            {sortedCategories.map((item, index) => (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">{getCategoryIcon(item.category)}</div>
                    <div>
                      <p className="font-semibold capitalize text-gray-900 dark:text-white">
                        {item.category.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.percentage.toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-lg text-gray-900 dark:text-white">
                    ${item.amount.toLocaleString()}
                  </p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getCategoryColor(index)} transition-all`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {sortedCategories.length === 0 && (
            <EmptyChartState
              chartType="pie"
              title="No expense data available"
              message="Add expense transactions to see a breakdown by category. Track your spending across different categories to better understand where your money goes."
              actionLabel="Add Transaction"
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CategoryBreakdownModal;

