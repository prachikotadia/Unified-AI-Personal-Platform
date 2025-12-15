import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Award,
  Trophy,
  Star,
  ArrowUp,
  ArrowDown,
  Plus,
  Download,
  Share2,
  Camera,
  Brain,
  Sparkles,
  X,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useFitness } from '../../hooks/useFitness';
import { useFitnessStore } from '../../store/fitness';
import { useProgressPhotosStore } from '../../store/progressPhotos';
import { useToastHelpers } from '../../components/ui/Toast';
import MeasurementModal from '../../components/fitness/MeasurementModal';
import GoalModal from '../../components/fitness/GoalModal';
import PhotoUploadModal from '../../components/fitness/PhotoUploadModal';
import ProgressShareModal from '../../components/fitness/ProgressShareModal';
import AIProgressAnalysisModal from '../../components/fitness/AIProgressAnalysisModal';
import ChartTypeSelectorModal from '../../components/fitness/ChartTypeSelectorModal';
import ExportOptionsModal from '../../components/fitness/ExportOptionsModal';

const ProgressPage = () => {
  const navigate = useNavigate();
  const { success } = useToastHelpers();
  const { workoutSessions, nutritionEntries, healthGoals, healthMetrics } = useFitness();
  const { healthGoals: storeGoals, healthMetrics: storeMetrics, workoutSessions: storeWorkouts } = useFitnessStore();
  const { photos, addPhoto, removePhoto } = useProgressPhotosStore();
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [showProgressShare, setShowProgressShare] = useState(false);
  const [showChartSelector, setShowChartSelector] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'area' | 'trend'>('bar');

  // Calculate real progress data from healthMetrics
  const progressData = useMemo(() => {
    const weightMetrics = storeMetrics.filter(m => m.metric_type === 'weight').sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const bodyFatMetrics = storeMetrics.filter(m => m.metric_type === 'body_fat').sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const muscleMassMetrics = storeMetrics.filter(m => m.metric_type === 'muscle_mass').sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    const weightGoal = storeGoals.find(g => g.type === 'weight' || g.name.toLowerCase().includes('weight'));
    const bodyFatGoal = storeGoals.find(g => g.type === 'body_fat' || g.name.toLowerCase().includes('body fat'));
    const muscleMassGoal = storeGoals.find(g => g.type === 'muscle_mass' || g.name.toLowerCase().includes('muscle'));
    const strengthGoal = storeGoals.find(g => g.type === 'strength' || g.name.toLowerCase().includes('strength'));
    const enduranceGoal = storeGoals.find(g => g.type === 'endurance' || g.name.toLowerCase().includes('endurance'));

    const getCurrentAndPrevious = (metrics: typeof storeMetrics) => {
      if (metrics.length === 0) return { current: 0, previous: 0, change: 0, trend: 'up' as const };
      const current = metrics[0]?.value || 0;
      const previous = metrics[1]?.value || metrics[0]?.value || 0;
      const change = current - previous;
      return { current, previous, change, trend: change >= 0 ? 'up' as const : 'down' as const };
    };

    return {
      weight: {
        ...getCurrentAndPrevious(weightMetrics),
        goal: weightGoal?.target_value || 65.0
      },
      bodyFat: {
        ...getCurrentAndPrevious(bodyFatMetrics),
        goal: bodyFatGoal?.target_value || 15.0
      },
      muscleMass: {
        ...getCurrentAndPrevious(muscleMassMetrics),
        goal: muscleMassGoal?.target_value || 48.0
      },
      strength: {
        current: strengthGoal?.current_value || 0,
        previous: strengthGoal?.current_value || 0,
        change: 0,
        trend: 'up' as const,
        goal: strengthGoal?.target_value || 100
      },
      endurance: {
        current: enduranceGoal?.current_value || 0,
        previous: enduranceGoal?.current_value || 0,
        change: 0,
        trend: 'up' as const,
        goal: enduranceGoal?.target_value || 90
      }
    };
  }, [storeMetrics, storeGoals]);

  // Calculate weekly stats from real workout data
  const weeklyStats = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    return days.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayWorkouts = storeWorkouts.filter(w => {
        const workoutDate = new Date(w.created_at).toISOString().split('T')[0];
        return workoutDate === dateStr;
      });
      
      const workouts = dayWorkouts.length;
      const calories = dayWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
      
      return { day, workouts, calories, steps: 0 };
    });
  }, [storeWorkouts]);

  const achievements = [
    {
      id: '1',
      name: 'Weight Loss Milestone',
      description: 'Lost 5kg in 30 days',
      icon: '🏆',
      date: '2024-01-15',
      type: 'weight'
    },
    {
      id: '2',
      name: 'Strength Gain',
      description: 'Increased bench press by 10kg',
      icon: '💪',
      date: '2024-01-10',
      type: 'strength'
    },
    {
      id: '3',
      name: 'Consistency Award',
      description: 'Worked out 5 days in a row',
      icon: '🔥',
      date: '2024-01-08',
      type: 'consistency'
    }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? <ArrowUp className="w-4 h-4 text-green-500" /> : <ArrowDown className="w-4 h-4 text-red-500" />;
  };

  const getProgressColor = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    if (percentage >= 80) return 'from-green-gradient-from to-green-gradient-to';
    if (percentage >= 60) return 'from-yellow-gradient-from to-yellow-gradient-to';
    return 'from-red-gradient-from to-red-gradient-to';
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Progress Tracking</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor your fitness journey and celebrate achievements
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowMeasurementModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 font-medium shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add Measurement</span>
          </button>
          <button
            onClick={() => setShowPhotoUpload(true)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 font-medium shadow-sm"
          >
            <Camera className="w-4 h-4" />
            <span>Add Photo</span>
          </button>
          <button
            onClick={() => {
              setSelectedGoal(null);
              setShowGoalModal(true);
            }}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 font-medium shadow-sm"
          >
            <Target className="w-4 h-4" />
            <span>Set Goal</span>
          </button>
          <button
            onClick={() => setShowChartSelector(true)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 font-medium shadow-sm"
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Charts</span>
          </button>
          <button
            onClick={() => setShowAIAnalysis(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all flex items-center space-x-2 font-medium shadow-md hover:shadow-lg"
          >
            <Brain className="w-4 h-4" />
            <span>AI Progress Analysis</span>
          </button>
          <button
            onClick={() => setShowExportOptions(true)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 font-medium shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Progress</span>
          </button>
          <button
            onClick={() => setShowProgressShare(true)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 font-medium shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Progress</span>
          </button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {Object.entries(progressData).map(([key, data], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              {getTrendIcon(data.trend)}
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            <p className="text-2xl font-bold">{data.current}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`text-sm ${data.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {data.change > 0 ? '+' : ''}{data.change}
              </span>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Weekly Activity</h2>
            <BarChart3 className="w-6 h-6 text-blue-500" />
          </div>
          
          <div className="space-y-4">
            {weeklyStats.map((day, index) => (
              <div key={day.day} className="flex items-center justify-between">
                <span className="text-sm font-medium w-12">{day.day}</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to h-2 rounded-full"
                      style={{ width: `${(day.workouts / 1) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{day.workouts} workout{day.workouts !== 1 ? 's' : ''}</div>
                  <div className="text-xs text-gray-500">{day.calories} cal</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Goal Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Goal Progress</h2>
            <Target className="w-6 h-6 text-green-500" />
          </div>
          
          <div className="space-y-4">
            {storeGoals.length > 0 ? (
              storeGoals.map((goal) => {
                const percentage = goal.target_value > 0 
                  ? Math.min((goal.current_value / goal.target_value) * 100, 100) 
                  : 0;
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{goal.name}</span>
                        <button
                          onClick={() => {
                            setSelectedGoal(goal);
                            setShowGoalModal(true);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="Edit Goal"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${goal.name}"?`)) {
                              const { deleteHealthGoal } = useFitnessStore.getState();
                              deleteHealthGoal(goal.id);
                              success('Goal Deleted', `"${goal.name}" has been removed`);
                            }
                          }}
                          className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete Goal"
                        >
                          Delete
                        </button>
                      </div>
                      <span className="text-sm text-gray-500">
                        {goal.current_value.toFixed(1)} / {goal.target_value.toFixed(1)} {goal.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(goal.current_value, goal.target_value)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No goals set yet</p>
                <button
                  onClick={() => setShowGoalModal(true)}
                  className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
                >
                  Create your first goal
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Recent Achievements</h2>
          <Award className="w-6 h-6 text-yellow-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <h3 className="font-semibold">{achievement.name}</h3>
                  <p className="text-sm text-gray-500">{achievement.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{achievement.date}</span>
                <span className="capitalize">{achievement.type}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workout Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Workout Statistics</h2>
            <Activity className="w-6 h-6 text-purple-500" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Workouts</span>
              <span className="font-semibold">{workoutSessions.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">This Month</span>
              <span className="font-semibold">{workoutSessions.filter(w => new Date(w.created_at).getMonth() === new Date().getMonth()).length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Average Duration</span>
              <span className="font-semibold">
                {workoutSessions.length > 0 
                  ? Math.round(workoutSessions.reduce((sum, w) => sum + w.duration, 0) / workoutSessions.length)
                  : 0} min
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Calories</span>
              <span className="font-semibold">
                {workoutSessions.reduce((sum, w) => sum + (w.calories_burned || 0), 0)} cal
              </span>
            </div>
          </div>
        </motion.div>

        {/* Nutrition Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Nutrition Statistics</h2>
            <PieChart className="w-6 h-6 text-green-500" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Meals Logged</span>
              <span className="font-semibold">{nutritionEntries.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">This Month</span>
              <span className="font-semibold">
                {nutritionEntries.filter(n => new Date(n.created_at).getMonth() === new Date().getMonth()).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Average Calories</span>
              <span className="font-semibold">
                {nutritionEntries.length > 0 
                  ? Math.round(nutritionEntries.reduce((sum, n) => sum + n.total_calories, 0) / nutritionEntries.length)
                  : 0} cal
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Protein</span>
              <span className="font-semibold">
                {Math.round(nutritionEntries.reduce((sum, n) => sum + n.total_protein, 0))}g
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <MeasurementModal
        isOpen={showMeasurementModal}
        onClose={() => {
          setShowMeasurementModal(false);
          // Refresh metrics from store after modal closes
          const { healthMetrics } = useFitnessStore.getState();
        }}
      />

      <GoalModal
        isOpen={showGoalModal}
        onClose={() => {
          setShowGoalModal(false);
          setSelectedGoal(null);
        }}
        goal={selectedGoal}
      />

      {/* Progress Photos Section */}
      {photos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-blue-500" />
              Progress Photos
            </h2>
            <button
              onClick={() => setShowPhotoGallery(true)}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View All ({photos.length})
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.slice(0, 4).map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt={`Progress photo from ${photo.date}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <button
                    onClick={() => {
                      if (confirm('Delete this photo?')) {
                        removePhoto(photo.id);
                        success('Photo Deleted', 'Progress photo has been removed');
                      }
                    }}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs text-white bg-black/50 px-2 py-1 rounded">
                    {new Date(photo.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <PhotoUploadModal
        isOpen={showPhotoUpload}
        onClose={() => setShowPhotoUpload(false)}
        onUpload={(file, metadata) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            addPhoto({
              url: reader.result as string,
              date: metadata?.date || new Date().toISOString().split('T')[0],
              notes: metadata?.notes,
            });
            success('Photo Uploaded', 'Progress photo has been saved');
          };
          reader.readAsDataURL(file);
        }}
      />

      <ProgressShareModal
        isOpen={showProgressShare}
        onClose={() => setShowProgressShare(false)}
        progressData={{
          weight: progressData.weight?.current,
          bodyFat: progressData.bodyFat?.current,
          muscleMass: progressData.muscleMass?.current,
          workouts: workoutSessions.length,
          achievements: 3,
          period: selectedTimeframe
        }}
      />

      <AIProgressAnalysisModal
        isOpen={showAIAnalysis}
        onClose={() => setShowAIAnalysis(false)}
        progressData={{
          weight: [
            { current: progressData.weight?.current || 70.5, previous: progressData.weight?.previous || 72.0, goal: progressData.weight?.goal || 65.0 }
          ],
          workouts: workoutSessions.map(w => ({ date: w.created_at, count: 1 })),
          nutrition: nutritionEntries.map(n => ({ date: n.created_at, calories: n.total_calories })),
          period: selectedTimeframe
        }}
      />

      <ChartTypeSelectorModal
        isOpen={showChartSelector}
        onClose={() => setShowChartSelector(false)}
        onSelectChart={(type) => {
          setChartType(type);
          setShowCharts(true);
          setShowChartSelector(false);
        }}
        currentChartType={chartType}
      />

      {/* Charts Display */}
      {showCharts && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              {chartType === 'bar' && <BarChart3 className="w-6 h-6 text-blue-500" />}
              {chartType === 'line' && <LineChart className="w-6 h-6 text-blue-500" />}
              {chartType === 'pie' && <PieChart className="w-6 h-6 text-blue-500" />}
              Progress Charts - {chartType.charAt(0).toUpperCase() + chartType.slice(1)}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCharts(false);
                  setShowChartSelector(true);
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
              >
                Change Type
              </button>
              <button
                onClick={() => setShowCharts(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 min-h-[400px]">
            {chartType === 'bar' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Weekly Workouts</h3>
                {weeklyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-20" />
                      <XAxis 
                        dataKey="day" 
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
                      />
                      <Bar 
                        dataKey="workouts" 
                        fill="hsl(var(--primary))" 
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                    <BarChart3 className="w-16 h-16 mx-auto mb-2 opacity-50 text-gray-400 dark:text-gray-500" />
                    <p className="text-gray-600 dark:text-gray-300">No workout data to display</p>
                    <button
                      onClick={() => navigate('/fitness/workouts')}
                      className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
                    >
                      Log Workout
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {chartType === 'line' && (() => {
              // Get all metrics sorted by date, prioritize weight if available
              const allMetrics = storeMetrics.length > 0 
                ? storeMetrics.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                : [];
              
              // Try to get weight metrics first, then any metrics
              const weightMetrics = storeMetrics.filter(m => m.metric_type === 'weight');
              const metricsToShow = weightMetrics.length > 1 ? weightMetrics : allMetrics;
              
              const chartData = metricsToShow.map(m => ({
                date: new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: m.value,
                label: m.metric_type
              }));
              
              return (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    {weightMetrics.length > 1 ? 'Weight Progress Over Time' : 'Progress Over Time'}
                  </h3>
                  {chartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-20" />
                        <XAxis 
                          dataKey="date" 
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
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                          fillOpacity={0.3}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                      <LineChart className="w-16 h-16 mx-auto mb-2 opacity-50 text-gray-400 dark:text-gray-500" />
                      <p className="text-gray-600 dark:text-gray-300">Add measurements to see progress over time</p>
                      <button
                        onClick={() => setShowMeasurementModal(true)}
                        className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
                      >
                        Add Measurement
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
            
            {chartType === 'pie' && (() => {
              const goals = storeGoals.filter(g => g.status === 'active');
              const completedGoals = goals.filter(g => g.current_value >= g.target_value).length;
              const inProgressGoals = goals.filter(g => g.current_value > 0 && g.current_value < g.target_value).length;
              const notStartedGoals = goals.filter(g => g.current_value === 0).length;
              
              const pieData = [
                { name: 'Completed', value: completedGoals, color: '#10b981' },
                { name: 'In Progress', value: inProgressGoals, color: '#3b82f6' },
                { name: 'Not Started', value: notStartedGoals, color: '#9ca3af' }
              ].filter(item => item.value > 0);
              
              return (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Goal Completion Distribution</h3>
                  {goals.length > 0 ? (
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
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
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 dark:bg-green-400 rounded-full"></div>
                          <span className="text-sm text-gray-900 dark:text-gray-100">Completed: {completedGoals}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                          <span className="text-sm text-gray-900 dark:text-gray-100">In Progress: {inProgressGoals}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                          <span className="text-sm text-gray-900 dark:text-gray-100">Not Started: {notStartedGoals}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                      <PieChart className="w-16 h-16 mx-auto mb-2 opacity-50 text-gray-400 dark:text-gray-500" />
                      <p className="text-gray-600 dark:text-gray-300">No goals to display</p>
                      <button
                        onClick={() => setShowGoalModal(true)}
                        className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
                      >
                        Create Goal
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
            
            {chartType === 'area' && (() => {
              // Calculate cumulative workouts over time
              const workoutDates = storeWorkouts
                .map(w => new Date(w.created_at).toISOString().split('T')[0])
                .sort()
                .reduce((acc, date) => {
                  acc[date] = (acc[date] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
              
              const sortedDates = Object.keys(workoutDates).sort();
              let cumulative = 0;
              const cumulativeData = sortedDates.map(date => {
                cumulative += workoutDates[date];
                return { 
                  date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
                  value: cumulative 
                };
              });
              
              return (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Cumulative Workouts Over Time</h3>
                  {cumulativeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={cumulativeData}>
                        <defs>
                          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-20" />
                        <XAxis 
                          dataKey="date" 
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
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="hsl(var(--primary))" 
                          fill="url(#areaGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                      <Activity className="w-16 h-16 mx-auto mb-2 opacity-50 text-gray-400 dark:text-gray-500" />
                      <p className="text-gray-600 dark:text-gray-300">No workout data to display</p>
                      <button
                        onClick={() => navigate('/fitness/workouts')}
                        className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
                      >
                        Log Workout
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
            
            {chartType === 'trend' && (() => {
              // Calculate trends for different metrics
              const weightMetrics = storeMetrics.filter(m => m.metric_type === 'weight').sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
              const bodyFatMetrics = storeMetrics.filter(m => m.metric_type === 'body_fat').sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
              
              const calculateTrend = (metrics: typeof storeMetrics) => {
                if (metrics.length < 2) return null;
                const first = metrics[0].value;
                const last = metrics[metrics.length - 1].value;
                const change = last - first;
                const percentChange = first > 0 ? (change / first) * 100 : 0;
                return { change, percentChange, direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable' };
              };
              
              const weightTrend = calculateTrend(weightMetrics);
              const bodyFatTrend = calculateTrend(bodyFatMetrics);
              
              return (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Trend Analysis</h3>
                  <div className="relative h-64">
                    {weightTrend || bodyFatTrend ? (
                      <div className="space-y-6">
                        {weightTrend && (
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Weight</span>
                              <div className={`flex items-center gap-1 ${weightTrend.direction === 'down' ? 'text-green-600' : weightTrend.direction === 'up' ? 'text-red-600' : 'text-gray-600'}`}>
                                {weightTrend.direction === 'down' && <TrendingDown className="w-4 h-4" />}
                                {weightTrend.direction === 'up' && <TrendingUp className="w-4 h-4" />}
                                <span className="text-sm font-semibold">
                                  {weightTrend.change > 0 ? '+' : ''}{weightTrend.change.toFixed(1)} kg
                                  ({weightTrend.percentChange > 0 ? '+' : ''}{weightTrend.percentChange.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {weightMetrics.length} measurements over time
                            </div>
                          </div>
                        )}
                        {bodyFatTrend && (
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Body Fat</span>
                              <div className={`flex items-center gap-1 ${bodyFatTrend.direction === 'down' ? 'text-green-600' : bodyFatTrend.direction === 'up' ? 'text-red-600' : 'text-gray-600'}`}>
                                {bodyFatTrend.direction === 'down' && <TrendingDown className="w-4 h-4" />}
                                {bodyFatTrend.direction === 'up' && <TrendingUp className="w-4 h-4" />}
                                <span className="text-sm font-semibold">
                                  {bodyFatTrend.change > 0 ? '+' : ''}{bodyFatTrend.change.toFixed(1)}%
                                  ({bodyFatTrend.percentChange > 0 ? '+' : ''}{bodyFatTrend.percentChange.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {bodyFatMetrics.length} measurements over time
                            </div>
                          </div>
                        )}
                        {!weightTrend && !bodyFatTrend && (
                          <div className="text-center text-gray-500 py-8">
                            <TrendingUp className="w-16 h-16 mx-auto mb-2 opacity-50" />
                            <p>Add more measurements to see trends</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                        <TrendingUp className="w-16 h-16 mx-auto mb-2 opacity-50 text-gray-400 dark:text-gray-500" />
                        <p className="text-gray-600 dark:text-gray-300">Add measurements to see trend analysis</p>
                        <button
                          onClick={() => setShowMeasurementModal(true)}
                          className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
                        >
                          Add Measurement
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </motion.div>
      )}

      {/* Photo Gallery Modal */}
      {showPhotoGallery && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Progress Photos</h2>
              <button
                onClick={() => setShowPhotoGallery(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.url}
                    alt={`Progress photo from ${photo.date}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        if (confirm('Delete this photo?')) {
                          removePhoto(photo.id);
                          success('Photo Deleted', 'Progress photo has been removed');
                        }
                      }}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-xs text-white bg-black/50 px-2 py-1 rounded">
                      {new Date(photo.date).toLocaleDateString()}
                    </p>
                    {photo.notes && (
                      <p className="text-xs text-white bg-black/50 px-2 py-1 rounded mt-1">
                        {photo.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      <ExportOptionsModal
        isOpen={showExportOptions}
        onClose={() => setShowExportOptions(false)}
        onExport={async (format, options) => {
          try {
            // Filter data by date range if provided
            const filterByDateRange = (items: any[]) => {
              if (!options.dateRange) return items;
              return items.filter(item => {
                const itemDate = new Date(item.created_at || item.date || item.createdAt);
                const start = new Date(options.dateRange!.start);
                const end = new Date(options.dateRange!.end);
                end.setHours(23, 59, 59, 999); // Include entire end date
                return itemDate >= start && itemDate <= end;
              });
            };
            
            const filteredMetrics = filterByDateRange(storeMetrics);
            const filteredGoals = filterByDateRange(storeGoals);
            const filteredWorkouts = filterByDateRange(storeWorkouts);
            const filteredPhotos = options.dateRange 
              ? photos.filter(p => {
                  const photoDate = new Date(p.date);
                  const start = new Date(options.dateRange!.start);
                  const end = new Date(options.dateRange!.end);
                  end.setHours(23, 59, 59, 999);
                  return photoDate >= start && photoDate <= end;
                })
              : photos;
            
            const exportData = {
              metrics: filteredMetrics,
              goals: filteredGoals,
              workouts: filteredWorkouts,
              photos: options.includePhotos ? filteredPhotos : [],
              exportDate: new Date().toISOString(),
              period: selectedTimeframe,
            };
            
            if (format === 'json') {
              const jsonStr = JSON.stringify(exportData, null, 2);
              const blob = new Blob([jsonStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `progress-export-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            } else if (format === 'csv') {
              // Convert to CSV
              const csvRows = [];
              csvRows.push('Type,Name,Value,Unit,Date');
              
              filteredMetrics.forEach(m => {
                csvRows.push(`Metric,${m.metric_type},${m.value},${m.unit},${m.created_at}`);
              });
              
              filteredGoals.forEach(g => {
                csvRows.push(`Goal,${g.name},${g.current_value}/${g.target_value},${g.unit},${g.created_at}`);
              });
              
              filteredWorkouts.forEach(w => {
                csvRows.push(`Workout,${w.name},${w.duration} min,${w.calories_burned || 0} cal,${w.created_at}`);
              });
              
              const csvStr = csvRows.join('\n');
              const blob = new Blob([csvStr], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `progress-export-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            } else if (format === 'pdf') {
              // For PDF, we'll create a simple text-based export
              // In a real app, you'd use a library like jsPDF
              const pdfContent = `Progress Report\n\n` +
                `Export Date: ${new Date().toLocaleDateString()}\n` +
                `Period: ${selectedTimeframe}\n\n` +
                `Metrics: ${filteredMetrics.length}\n` +
                `Goals: ${filteredGoals.length}\n` +
                `Workouts: ${filteredWorkouts.length}\n` +
                (options.includePhotos ? `Photos: ${filteredPhotos.length}\n` : '');
              
              const blob = new Blob([pdfContent], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `progress-export-${new Date().toISOString().split('T')[0]}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            } else if (format === 'excel') {
              // Excel export as CSV (can be opened in Excel)
              const csvRows = [];
              csvRows.push('Type,Name,Value,Unit,Date');
              
              filteredMetrics.forEach(m => {
                csvRows.push(`Metric,${m.metric_type},${m.value},${m.unit},${m.created_at}`);
              });
              
              filteredGoals.forEach(g => {
                csvRows.push(`Goal,${g.name},${g.current_value}/${g.target_value},${g.unit},${g.created_at}`);
              });
              
              filteredWorkouts.forEach(w => {
                csvRows.push(`Workout,${w.name},${w.duration} min,${w.calories_burned || 0} cal,${w.created_at}`);
              });
              
              const csvStr = csvRows.join('\n');
              const blob = new Blob([csvStr], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `progress-export-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }
            
            success('Export Complete', `Your progress data has been exported as ${format.toUpperCase()}`);
          } catch (error) {
            console.error('Export error:', error);
            success('Export Failed', 'There was an error exporting your data. Please try again.');
          }
        }}
        exportType="progress"
      />
    </div>
  );
};

export default ProgressPage;
