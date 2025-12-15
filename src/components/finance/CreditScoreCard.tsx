import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Award, Info, Shield, Target } from 'lucide-react';
import { CreditScoreData } from '../../services/bankIntegration';

interface CreditScoreCardProps {
  creditScore: CreditScoreData | null;
  onClick?: () => void;
  compact?: boolean;
}

const CreditScoreCard: React.FC<CreditScoreCardProps> = ({
  creditScore,
  onClick,
  compact = false
}) => {
  if (!creditScore) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const getScoreColor = (range: string) => {
    switch (range) {
      case 'excellent':
        return {
          bg: 'from-emerald-500 to-green-600',
          text: 'text-emerald-600',
          ring: 'ring-emerald-200 dark:ring-emerald-900',
          badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
          progress: 'bg-emerald-500'
        };
      case 'very_good':
        return {
          bg: 'from-blue-500 to-indigo-600',
          text: 'text-blue-600',
          ring: 'ring-blue-200 dark:ring-blue-900',
          badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
          progress: 'bg-blue-500'
        };
      case 'good':
        return {
          bg: 'from-amber-500 to-yellow-600',
          text: 'text-amber-600',
          ring: 'ring-amber-200 dark:ring-amber-900',
          badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
          progress: 'bg-amber-500'
        };
      case 'fair':
        return {
          bg: 'from-orange-500 to-red-500',
          text: 'text-orange-600',
          ring: 'ring-orange-200 dark:ring-orange-900',
          badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
          progress: 'bg-orange-500'
        };
      case 'poor':
        return {
          bg: 'from-red-500 to-rose-600',
          text: 'text-red-600',
          ring: 'ring-red-200 dark:ring-red-900',
          badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
          progress: 'bg-red-500'
        };
      default:
        return {
          bg: 'from-gray-500 to-gray-600',
          text: 'text-gray-600',
          ring: 'ring-gray-200 dark:ring-gray-900',
          badge: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300',
          progress: 'bg-gray-500'
        };
    }
  };

  const getScoreLabel = (range: string) => {
    return range.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  const getScorePercentage = (score: number) => {
    return ((score - 300) / 550) * 100;
  };

  const colors = getScoreColor(creditScore.range);
  const scorePercentage = getScorePercentage(creditScore.score);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={onClick}
        className={`relative overflow-hidden bg-gradient-to-br ${colors.bg} rounded-xl p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all transform hover:scale-[1.02]`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">Credit Score</span>
            </div>
            {getTrendIcon(creditScore.trend)}
          </div>
          
          <div className="flex items-end space-x-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-5xl font-bold"
            >
              {creditScore.score}
            </motion.div>
            <div className="pb-2">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm`}>
                {getScoreLabel(creditScore.range)}
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center space-x-2 text-sm opacity-90">
            <Info className="w-4 h-4" />
            <span>Tap to view details</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${colors.bg} rounded-lg flex items-center justify-center shadow-lg`}>
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Credit Score</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">FICO Score</p>
          </div>
        </div>
        {onClick && (
          <button
            onClick={onClick}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg"
          >
            <Info size={16} />
            View Details
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-baseline space-x-3 mb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className={`text-5xl font-bold ${colors.text}`}
            >
              {creditScore.score}
            </motion.div>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.badge}`}>
              {getScoreLabel(creditScore.range)}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <div className="flex items-center space-x-1">
              {getTrendIcon(creditScore.trend)}
              <span className="capitalize">{creditScore.trend}</span>
            </div>
            <span>•</span>
            <span>Last updated: {new Date(creditScore.last_updated).toLocaleDateString()}</span>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${scorePercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${colors.progress} rounded-full shadow-sm`}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>300</span>
              <span>850</span>
            </div>
          </div>
        </div>

        {/* Circular Progress */}
        <div className="ml-6 relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 56}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - scorePercentage / 100) }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={colors.text}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl font-bold ${colors.text}`}>
                {creditScore.score}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">FICO</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreditScoreCard;

