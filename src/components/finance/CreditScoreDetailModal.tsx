import React from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Minus, Info, Award, AlertTriangle, Shield, Target, CheckCircle2, Clock, BarChart3, Sparkles, Calendar, TrendingUp as TrendUpIcon, Percent, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CreditScoreData } from '../../services/bankIntegration';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface CreditScoreDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditScore: CreditScoreData | null;
}

const CreditScoreDetailModal: React.FC<CreditScoreDetailModalProps> = ({
  isOpen,
  onClose,
  creditScore
}) => {
  if (!isOpen || !creditScore) return null;

  const getScoreColor = (range: string) => {
    switch (range) {
      case 'excellent':
        return 'text-green-600 bg-green-50';
      case 'very_good':
        return 'text-blue-600 bg-blue-50';
      case 'good':
        return 'text-yellow-600 bg-yellow-50';
      case 'fair':
        return 'text-orange-600 bg-orange-50';
      case 'poor':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getScoreLabel = (range: string) => {
    return range.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getScoreRange = (score: number) => {
    if (score >= 800) return 'excellent';
    if (score >= 740) return 'very_good';
    if (score >= 670) return 'good';
    if (score >= 580) return 'fair';
    return 'poor';
  };

  // Use actual factors from creditScore data
  const factors = [
    { 
      key: 'payment_history',
      name: 'Payment History', 
      impact: 'High', 
      weight: creditScore.factors?.payment_history || 0.35,
      status: creditScore.factors_impact?.payment_history === 'positive' ? 'Good' : 
              creditScore.factors_impact?.payment_history === 'negative' ? 'Poor' : 'Fair',
      description: 'Your payment history shows how consistently you pay bills on time. This is the most important factor.',
      icon: '✓'
    },
    { 
      key: 'credit_utilization',
      name: 'Credit Utilization', 
      impact: 'High', 
      weight: creditScore.factors?.credit_utilization || 0.30,
      status: creditScore.factors_impact?.credit_utilization === 'positive' ? 'Good' : 
              creditScore.factors_impact?.credit_utilization === 'negative' ? 'Poor' : 'Fair',
      description: 'The amount of credit you\'re using compared to your total available credit.',
      icon: '📊'
    },
    { 
      key: 'credit_history_length',
      name: 'Length of Credit History', 
      impact: 'Medium', 
      weight: creditScore.factors?.credit_history_length || 0.15,
      status: creditScore.factors_impact?.credit_history_length === 'positive' ? 'Good' : 
              creditScore.factors_impact?.credit_history_length === 'negative' ? 'Poor' : 'Fair',
      description: 'How long you\'ve had credit accounts open. Longer history is better.',
      icon: '📅'
    },
    { 
      key: 'credit_mix',
      name: 'Credit Mix', 
      impact: 'Medium', 
      weight: creditScore.factors?.credit_mix || 0.10,
      status: creditScore.factors_impact?.credit_mix === 'positive' ? 'Good' : 
              creditScore.factors_impact?.credit_mix === 'negative' ? 'Poor' : 'Fair',
      description: 'The variety of credit types you have (credit cards, loans, mortgages).',
      icon: '💳'
    },
    { 
      key: 'new_credit',
      name: 'New Credit', 
      impact: 'Low', 
      weight: creditScore.factors?.new_credit || 0.10,
      status: creditScore.factors_impact?.new_credit === 'positive' ? 'Good' : 
              creditScore.factors_impact?.new_credit === 'negative' ? 'Poor' : 'Fair',
      description: 'Recent credit inquiries and newly opened accounts.',
      icon: '🆕'
    }
  ];

  const getScorePercentage = (score: number) => {
    return ((score - 300) / 550) * 100;
  };

  const scorePercentage = getScorePercentage(creditScore.score);

  // Use actual history data if available, otherwise generate from score
  const historyData = creditScore.history && creditScore.history.length > 0
    ? creditScore.history.slice(-6).map((item, index) => ({
        month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
        score: item.score,
        change: item.change
      }))
    : [
        { month: 'Jan', score: creditScore.score - 20, change: -5 },
        { month: 'Feb', score: creditScore.score - 15, change: 5 },
        { month: 'Mar', score: creditScore.score - 10, change: 5 },
        { month: 'Apr', score: creditScore.score - 5, change: 5 },
        { month: 'May', score: creditScore.score, change: 5 },
      ];
  
  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };
  
  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${getScoreColor(creditScore.range).replace('text-', 'from-').replace('bg-', 'to-')} rounded-lg flex items-center justify-center`}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Credit Score Details</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Score Display - Enhanced Hero Section */}
          <div className="relative bg-gradient-to-br from-gray-50 via-blue-50/50 to-purple-50/50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-full -ml-36 -mb-36 blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                {/* Large Score Display */}
                <div className="lg:col-span-1 text-center lg:text-left">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="inline-flex flex-col items-center lg:items-start"
                  >
                    <div className={`inline-flex items-center justify-center w-36 h-36 rounded-full bg-gradient-to-br ${
                      getScoreRange(creditScore.score) === 'excellent' ? 'from-emerald-500 to-green-600' :
                      getScoreRange(creditScore.score) === 'very_good' ? 'from-blue-500 to-indigo-600' :
                      getScoreRange(creditScore.score) === 'good' ? 'from-amber-500 to-yellow-600' :
                      getScoreRange(creditScore.score) === 'fair' ? 'from-orange-500 to-red-500' :
                      'from-red-500 to-rose-600'
                    } shadow-2xl mb-4 ring-8 ${
                      getScoreRange(creditScore.score) === 'excellent' ? 'ring-emerald-200 dark:ring-emerald-900' :
                      getScoreRange(creditScore.score) === 'very_good' ? 'ring-blue-200 dark:ring-blue-900' :
                      getScoreRange(creditScore.score) === 'good' ? 'ring-amber-200 dark:ring-amber-900' :
                      getScoreRange(creditScore.score) === 'fair' ? 'ring-orange-200 dark:ring-orange-900' :
                      'ring-red-200 dark:ring-red-900'
                    } ring-opacity-30`}
                    >
                      <span className="text-6xl font-bold text-white">{creditScore.score}</span>
                    </div>
                    <div className={`inline-block px-6 py-2.5 rounded-full text-base font-bold ${getScoreColor(creditScore.range)} shadow-lg mb-2`}>
                      {getScoreLabel(creditScore.range)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{creditScore.provider || 'FICO'} Score</p>
                  </motion.div>
                </div>

                {/* Key Metrics Grid */}
                <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {creditScore.trend === 'improving' ? (
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      ) : creditScore.trend === 'declining' ? (
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      ) : (
                        <Minus className="w-5 h-5 text-gray-400" />
                      )}
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Trend</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white capitalize">{creditScore.trend}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Last Updated</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {new Date(creditScore.last_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Next Update</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {new Date(creditScore.next_update).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </motion.div>

                  {historyData.length > 0 && historyData[historyData.length - 1]?.change && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        {historyData[historyData.length - 1].change > 0 ? (
                          <ArrowUpRight className="w-5 h-5 text-green-500" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-500" />
                        )}
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Last Change</p>
                      </div>
                      <p className={`text-xl font-bold ${getChangeColor(historyData[historyData.length - 1].change)}`}>
                        {historyData[historyData.length - 1].change > 0 ? '+' : ''}{historyData[historyData.length - 1].change} pts
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Score Range Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Score Range</span>
              </h3>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">300 - 850</span>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${scorePercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-4 rounded-full shadow-lg ${
                    getScoreRange(creditScore.score) === 'excellent' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                    getScoreRange(creditScore.score) === 'very_good' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                    getScoreRange(creditScore.score) === 'good' ? 'bg-gradient-to-r from-amber-500 to-yellow-600' :
                    getScoreRange(creditScore.score) === 'fair' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                    'bg-gradient-to-r from-red-500 to-rose-600'
                  }`}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>300 (Poor)</span>
                <span className="font-semibold">{creditScore.score}</span>
                <span>850 (Excellent)</span>
              </div>
            </div>
          </div>

          {/* Score History Chart - Enhanced */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>Score History</span>
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Score</span>
                </div>
                {historyData.some(d => d.change) && (
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Improvement</span>
                  </div>
                )}
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    stroke="currentColor"
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <YAxis 
                    domain={[Math.min(...historyData.map(d => d.score)) - 20, Math.max(...historyData.map(d => d.score)) + 20]}
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    stroke="currentColor"
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'score') return [`${value}`, 'Score'];
                      if (name === 'change') return [`${value > 0 ? '+' : ''}${value}`, 'Change'];
                      return [value, name];
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorScore)"
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* History Summary */}
            {historyData.length > 1 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {historyData.slice(-4).map((data, index) => (
                  <div key={index} className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{data.month}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{data.score}</p>
                    {data.change && (
                      <p className={`text-xs font-medium flex items-center justify-center space-x-1 ${getChangeColor(data.change)}`}>
                        {getChangeIcon(data.change)}
                        <span>{data.change > 0 ? '+' : ''}{data.change}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Credit Factors - Enhanced */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Credit Score Factors</span>
            </h3>
            <div className="space-y-4">
              {factors.map((factor, index) => {
                const impactValue = factor.impact === 'High' ? 100 : factor.impact === 'Medium' ? 70 : 40;
                const statusColor = factor.status === 'Good' 
                  ? 'bg-green-500' 
                  : factor.status === 'Fair' 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500';
                const weightPercent = (factor.weight * 100).toFixed(0);
                
                return (
                  <motion.div
                    key={factor.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/50"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            factor.status === 'Good' 
                              ? 'bg-green-100 dark:bg-green-900/30' 
                              : factor.status === 'Fair' 
                              ? 'bg-yellow-100 dark:bg-yellow-900/30' 
                              : 'bg-red-100 dark:bg-red-900/30'
                          }`}>
                            <Target className={`w-5 h-5 ${
                              factor.status === 'Good' 
                                ? 'text-green-600 dark:text-green-400' 
                                : factor.status === 'Fair' 
                                ? 'text-yellow-600 dark:text-yellow-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-lg">{factor.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{factor.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 ml-13">
                          <div className="flex items-center space-x-1">
                            <Percent className="w-3 h-3 text-gray-400" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {weightPercent}% Weight
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Impact: {factor.impact}
                          </span>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 shadow-md ${
                        factor.status === 'Good' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                          : factor.status === 'Fair' 
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                      }`}>
                        {factor.status === 'Good' && <CheckCircle2 className="w-4 h-4" />}
                        {factor.status === 'Poor' && <AlertTriangle className="w-4 h-4" />}
                        <span>{factor.status}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Factor Impact</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{impactValue}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${impactValue}%` }}
                          transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
                          className={`h-3 rounded-full ${statusColor} shadow-sm`}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Recommendations - Enhanced */}
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-xl flex-shrink-0">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-1 text-xl">Improvement Recommendations</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">Follow these tips to improve your credit score</p>
                <ul className="space-y-3">
                  {[
                    { text: 'Continue making payments on time', icon: CheckCircle2, priority: 'High' },
                    { text: 'Keep credit utilization below 30%', icon: Percent, priority: 'High' },
                    { text: 'Avoid opening too many new accounts', icon: AlertTriangle, priority: 'Medium' },
                    { text: 'Maintain a healthy credit mix', icon: Target, priority: 'Medium' },
                    { text: 'Review your credit report regularly', icon: Shield, priority: 'Low' }
                  ].map((rec, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-100 dark:border-blue-900/50"
                    >
                      <rec.icon className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">{rec.text}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          rec.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                          rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <Info className="w-5 h-5 text-blue-500" />
                <h5 className="font-semibold text-gray-900 dark:text-white">Score Range</h5>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Excellent</span>
                  <span className="font-medium text-gray-900 dark:text-white">800-850</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Very Good</span>
                  <span className="font-medium text-gray-900 dark:text-white">740-799</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Good</span>
                  <span className="font-medium text-gray-900 dark:text-white">670-739</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Fair</span>
                  <span className="font-medium text-gray-900 dark:text-white">580-669</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Poor</span>
                  <span className="font-medium text-gray-900 dark:text-white">300-579</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="w-5 h-5 text-amber-500" />
                <h5 className="font-semibold text-gray-900 dark:text-white">Quick Tips</h5>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start space-x-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>Pay bills on time, every time</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>Keep balances low on credit cards</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>Don't close old credit accounts</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>Limit new credit applications</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreditScoreDetailModal;

