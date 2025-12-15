import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Moon, 
  Sunrise, 
  Clock, 
  TrendingUp, 
  Plus, 
  Calendar,
  BarChart3,
  LineChart,
  Target,
  Bed,
  Zap,
  Activity,
  Edit,
  Trash2,
  Brain,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useFitness } from '../../hooks/useFitness';
import { useToastHelpers } from '../../components/ui/Toast';
import SleepLogModal from '../../components/fitness/SleepLogModal';

const SleepPage = () => {
  const { success } = useToastHelpers();
  const { healthMetrics, isLoading, errors } = useFitness();
  const error = errors.healthMetrics || null;
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [showSleepGoalModal, setShowSleepGoalModal] = useState(false);
  const [showTrends, setShowTrends] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [editingSleep, setEditingSleep] = useState<any>(null);

  // Mock sleep data
  const sleepData = {
    current: {
      hours: 7.5,
      quality: 85,
      deep_sleep: 2.1,
      rem_sleep: 1.8,
      light_sleep: 3.6,
      efficiency: 92,
      bedtime: '23:30',
      wake_time: '07:00'
    },
    average: {
      hours: 7.2,
      quality: 82,
      deep_sleep: 2.0,
      rem_sleep: 1.7,
      light_sleep: 3.5,
      efficiency: 89
    },
    goal: {
      hours: 8.0,
      quality: 90,
      efficiency: 95
    }
  };

  const weeklySleep = [
    { day: 'Mon', hours: 7.5, quality: 85, bedtime: '23:30', wake_time: '07:00' },
    { day: 'Tue', hours: 6.8, quality: 75, bedtime: '23:45', wake_time: '06:45' },
    { day: 'Wed', hours: 8.2, quality: 90, bedtime: '22:30', wake_time: '06:30' },
    { day: 'Thu', hours: 7.0, quality: 80, bedtime: '23:15', wake_time: '06:15' },
    { day: 'Fri', hours: 6.5, quality: 70, bedtime: '00:15', wake_time: '06:45' },
    { day: 'Sat', hours: 8.5, quality: 95, bedtime: '23:00', wake_time: '07:30' },
    { day: 'Sun', hours: 7.8, quality: 88, bedtime: '22:45', wake_time: '06:30' }
  ];

  const sleepStages = [
    { stage: 'Deep Sleep', hours: sleepData.current.deep_sleep, percentage: 28, color: 'from-blue-gradient-from to-blue-gradient-to' },
    { stage: 'REM Sleep', hours: sleepData.current.rem_sleep, percentage: 24, color: 'from-purple-gradient-from to-purple-gradient-to' },
    { stage: 'Light Sleep', hours: sleepData.current.light_sleep, percentage: 48, color: 'from-green-gradient-from to-green-gradient-to' }
  ];

  const sleepInsights = [
    {
      type: 'positive',
      title: 'Great Sleep Quality',
      description: 'Your sleep quality is above average this week',
      icon: Bed
    },
    {
      type: 'warning',
      title: 'Late Bedtime',
      description: 'Try to go to bed earlier for better sleep',
      icon: Moon
    },
    {
      type: 'positive',
      title: 'Consistent Schedule',
      description: 'You\'re maintaining a good sleep schedule',
      icon: Clock
    }
  ];

  const getQualityColor = (quality: number) => {
    if (quality >= 90) return 'text-green-500';
    if (quality >= 80) return 'text-yellow-500';
    if (quality >= 70) return 'text-orange-500';
    return 'text-red-500';
  };

  const getQualityLabel = (quality: number) => {
    if (quality >= 90) return 'Excellent';
    if (quality >= 80) return 'Good';
    if (quality >= 70) return 'Fair';
    return 'Poor';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <div className="text-center">
            <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Sleep Data</div>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary mt-4"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Sleep Tracking</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor your sleep patterns and improve your rest quality
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
            <button
              onClick={() => {
                setEditingSleep(null)
                setShowSleepModal(true)
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Log Sleep</span>
            </button>
            <button
              onClick={() => setShowSleepGoalModal(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Target className="w-4 h-4" />
              <span>Set Sleep Goal</span>
            </button>
            <button
              onClick={() => setShowTrends(!showTrends)}
              className="btn-secondary flex items-center space-x-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>View Trends</span>
            </button>
            <button
              onClick={() => setShowAIRecommendations(true)}
              className="btn-secondary flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Brain className="w-4 h-4" />
              <span>AI Recommendations</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Key Sleep Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to rounded-lg flex items-center justify-center">
              <Moon className="w-5 h-5 text-white" />
            </div>
            <span className={`text-sm font-medium ${getQualityColor(sleepData.current.quality)}`}>
              {getQualityLabel(sleepData.current.quality)}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Sleep Duration</h3>
          <p className="text-2xl font-bold">{sleepData.current.hours}h</p>
          <div className="flex items-center space-x-2 mt-2">
            <span className={`text-sm ${sleepData.current.hours >= sleepData.goal.hours ? 'text-green-500' : 'text-red-500'}`}>
              {sleepData.current.hours >= sleepData.goal.hours ? '+' : ''}{(sleepData.current.hours - sleepData.goal.hours).toFixed(1)}h
            </span>
            <span className="text-xs text-gray-500">vs goal</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-gradient-from to-purple-gradient-to rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className={`text-sm font-medium ${getQualityColor(sleepData.current.efficiency)}`}>
              {sleepData.current.efficiency}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Sleep Efficiency</h3>
          <p className="text-2xl font-bold">{sleepData.current.efficiency}%</p>
          <div className="flex items-center space-x-2 mt-2">
            <span className={`text-sm ${sleepData.current.efficiency >= sleepData.goal.efficiency ? 'text-green-500' : 'text-red-500'}`}>
              {sleepData.current.efficiency >= sleepData.goal.efficiency ? '+' : ''}{(sleepData.current.efficiency - sleepData.goal.efficiency).toFixed(0)}%
            </span>
            <span className="text-xs text-gray-500">vs goal</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-gradient-from to-green-gradient-to rounded-lg flex items-center justify-center">
              <Bed className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-400">
              {sleepData.current.bedtime}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Bedtime</h3>
          <p className="text-2xl font-bold">{sleepData.current.bedtime}</p>
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-sm text-gray-400">
              {sleepData.current.wake_time}
            </span>
            <span className="text-xs text-gray-500">wake time</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-gradient-from to-yellow-gradient-to rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-400">
              {sleepData.average.hours.toFixed(1)}h
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Weekly Average</h3>
          <p className="text-2xl font-bold">{sleepData.average.hours.toFixed(1)}h</p>
          <div className="flex items-center space-x-2 mt-2">
            <span className={`text-sm ${sleepData.average.quality >= 80 ? 'text-green-500' : 'text-yellow-500'}`}>
              {sleepData.average.quality}% quality
            </span>
          </div>
        </motion.div>
      </div>

      {/* Sleep Stages and Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sleep Stages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Sleep Stages</h2>
            <BarChart3 className="w-6 h-6 text-blue-500" />
          </div>
          
          <div className="space-y-4">
            {sleepStages.map((stage, index) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{stage.stage}</span>
                  <span className="text-sm text-gray-500">{stage.hours}h ({stage.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full bg-gradient-to-r ${stage.color}`}
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Weekly Sleep Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Weekly Sleep</h2>
            <LineChart className="w-6 h-6 text-green-500" />
          </div>
          
          <div className="space-y-4">
            {weeklySleep.map((day, index) => (
              <div key={day.day} className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="font-medium w-8">{day.day}</span>
                  <div className="text-center">
                    <div className="text-sm font-medium">{day.hours}h</div>
                    <div className={`text-xs ${getQualityColor(day.quality)}`}>
                      {day.quality}% quality
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <div>{day.bedtime} - {day.wake_time}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Sleep Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Sleep Insights</h2>
          <Activity className="w-6 h-6 text-purple-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sleepInsights.map((insight, index) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`p-4 border rounded-lg ${
                insight.type === 'positive' 
                  ? 'border-green-500/20 bg-green-500/5' 
                  : 'border-yellow-500/20 bg-yellow-500/5'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex-shrink-0">
                  {React.createElement(insight.icon, { className: `w-6 h-6 ${insight.type === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}` })}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{insight.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{insight.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Sleep Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Sleep Tips</h2>
          <Target className="w-6 h-6 text-blue-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">For Better Sleep Quality:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Maintain a consistent sleep schedule</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Create a relaxing bedtime routine</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Keep your bedroom cool and dark</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Avoid screens 1 hour before bed</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Your Sleep Goals:</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                <span className="text-sm">Target Sleep Duration</span>
                <span className="font-semibold">{sleepData.goal.hours}h</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                <span className="text-sm">Target Sleep Quality</span>
                <span className="font-semibold">{sleepData.goal.quality}%</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                <span className="text-sm">Target Efficiency</span>
                <span className="font-semibold">{sleepData.goal.efficiency}%</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sleep Entries with Edit/Delete */}
      <div className="space-y-4">
        {weeklySleep.map((sleep, index) => (
        <div key={index} className="glass-card p-4 group">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{sleep.day}</div>
              <div className="text-sm text-gray-500">{sleep.hours}h • Quality: {sleep.quality}%</div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  setEditingSleep(sleep)
                  setShowSleepModal(true)
                }}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this sleep entry?')) {
                    success('Sleep Entry Deleted', 'Sleep entry has been removed')
                  }
                }}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        ))}
      </div>

      {/* Modals */}
      <SleepLogModal
        isOpen={showSleepModal}
        onClose={() => {
          setShowSleepModal(false)
          setEditingSleep(null)
        }}
        onSubmit={(sleepData) => {
          console.log('Sleep logged:', sleepData)
          success('Sleep Logged', 'Sleep entry has been saved')
        }}
        sleep={editingSleep}
      />

      {showSleepGoalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Set Sleep Goal</h2>
              <button
                onClick={() => setShowSleepGoalModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <div className="text-center py-8">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Set sleep goal functionality would be implemented here
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {showTrends && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Sleep Trends</h2>
            <button
              onClick={() => setShowTrends(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Sleep trend visualizations would be displayed here
            </p>
          </div>
        </div>
      )}

      {showAIRecommendations && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold">AI Sleep Recommendations</h2>
              </div>
              <button
                onClick={() => setShowAIRecommendations(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <div className="text-center py-8">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                AI is analyzing your sleep patterns to provide personalized recommendations...
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SleepPage;
