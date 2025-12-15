/**
 * Empty State Components and Helpers
 * Provides consistent empty state messages with guidance
 */

import React from 'react';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  AreaChart, 
  TrendingUp,
  Activity,
  Plus,
  ArrowRight,
  Info
} from 'lucide-react';

interface EmptyChartStateProps {
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'trend';
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionRoute?: string;
}

const chartIcons = {
  bar: BarChart3,
  line: LineChart,
  pie: PieChart,
  area: AreaChart,
  trend: TrendingUp,
};

const chartMessages = {
  bar: {
    title: 'No data to display',
    message: 'Start logging activities to see your progress in a bar chart.',
    actionLabel: 'Log Activity',
  },
  line: {
    title: 'No trend data available',
    message: 'Add measurements over time to visualize trends in a line chart.',
    actionLabel: 'Add Measurement',
  },
  pie: {
    title: 'No data for breakdown',
    message: 'Add transactions or activities to see category breakdowns.',
    actionLabel: 'Add Data',
  },
  area: {
    title: 'No cumulative data',
    message: 'Start tracking activities to see cumulative progress over time.',
    actionLabel: 'Start Tracking',
  },
  trend: {
    title: 'No trend data',
    message: 'Add data points over time to analyze trends and patterns.',
    actionLabel: 'Add Data',
  },
};

export const EmptyChartState: React.FC<EmptyChartStateProps> = ({
  chartType,
  title,
  message,
  actionLabel,
  onAction,
  actionRoute,
}) => {
  const Icon = chartIcons[chartType];
  const defaultContent = chartMessages[chartType];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
        <Icon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title || defaultContent.title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
        {message || defaultContent.message}
      </p>
      {(onAction || actionRoute) && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          <Plus size={16} />
          {actionLabel || defaultContent.actionLabel}
          {actionRoute && <ArrowRight size={16} />}
        </button>
      )}
    </div>
  );
};

interface EmptyListStateProps {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyListState: React.FC<EmptyListStateProps> = ({
  icon: Icon = Activity,
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
        <Icon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
        {message}
      </p>
      <div className="flex gap-3">
        {onAction && actionLabel && (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} />
            {actionLabel}
          </button>
        )}
        {onSecondaryAction && secondaryActionLabel && (
          <button
            onClick={onSecondaryAction}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

interface EmptyStateWithInfoProps {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  message: string;
  info?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyStateWithInfo: React.FC<EmptyStateWithInfoProps> = ({
  icon: Icon = Info,
  title,
  message,
  info,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
        <Icon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mb-4">
        {message}
      </p>
      {info && (
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 max-w-md">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <Info size={16} className="inline mr-2" />
            {info}
          </p>
        </div>
      )}
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

