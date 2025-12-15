import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, BarChart3, LineChart, PieChart, AreaChart, TrendingUp } from 'lucide-react';

interface ChartTypeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChart: (chartType: 'bar' | 'line' | 'pie' | 'area' | 'trend') => void;
  currentChartType?: 'bar' | 'line' | 'pie' | 'area' | 'trend';
}

const ChartTypeSelectorModal: React.FC<ChartTypeSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectChart,
  currentChartType = 'bar'
}) => {
  const [selectedType, setSelectedType] = useState<'bar' | 'line' | 'pie' | 'area' | 'trend'>(currentChartType);

  const chartTypes = [
    {
      value: 'bar' as const,
      label: 'Bar Chart',
      icon: BarChart3,
      description: 'Compare values across categories',
      bestFor: 'Comparing metrics, weekly/monthly summaries'
    },
    {
      value: 'line' as const,
      label: 'Line Chart',
      icon: LineChart,
      description: 'Show trends over time',
      bestFor: 'Tracking progress over time, trends'
    },
    {
      value: 'pie' as const,
      label: 'Pie Chart',
      icon: PieChart,
      description: 'Show proportions and percentages',
      bestFor: 'Distribution, category breakdowns'
    },
    {
      value: 'area' as const,
      label: 'Area Chart',
      icon: AreaChart,
      description: 'Show cumulative values over time',
      bestFor: 'Cumulative progress, stacked data'
    },
    {
      value: 'trend' as const,
      label: 'Trend Chart',
      icon: TrendingUp,
      description: 'Show directional trends and patterns',
      bestFor: 'Long-term trends, predictions'
    }
  ];

  const handleSelect = () => {
    onSelectChart(selectedType);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Select Chart Type</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {chartTypes.map((chart) => (
            <button
              key={chart.value}
              onClick={() => setSelectedType(chart.value)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                selectedType === chart.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <chart.icon
                  className={selectedType === chart.value ? 'text-blue-600' : 'text-gray-400'}
                  size={24}
                />
                <div>
                  <div className="font-medium">{chart.label}</div>
                  <div className="text-xs text-gray-500">{chart.description}</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                <strong>Best for:</strong> {chart.bestFor}
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Apply Chart Type
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ChartTypeSelectorModal;

