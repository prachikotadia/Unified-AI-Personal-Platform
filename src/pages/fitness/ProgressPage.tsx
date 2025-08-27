import React, { useState } from 'react';
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
  ArrowDown
} from 'lucide-react';
import { useFitness } from '../../hooks/useFitness';

const ProgressPage = () => {
  const { workoutSessions, nutritionEntries, healthGoals, healthMetrics } = useFitness();
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  // Mock progress data
  const progressData = {
    weight: {
      current: 70.5,
      previous: 72.0,
      change: -1.5,
      trend: 'down',
      goal: 65.0
    },
    bodyFat: {
      current: 18.5,
      previous: 19.2,
      change: -0.7,
      trend: 'down',
      goal: 15.0
    },
    muscleMass: {
      current: 45.2,
      previous: 44.8,
      change: 0.4,
      trend: 'up',
      goal: 48.0
    },
    strength: {
      current: 85,
      previous: 80,
      change: 5,
      trend: 'up',
      goal: 100
    },
    endurance: {
      current: 75,
      previous: 70,
      change: 5,
      trend: 'up',
      goal: 90
    }
  };

  const weeklyStats = [
    { day: 'Mon', workouts: 1, calories: 450, steps: 8500 },
    { day: 'Tue', workouts: 0, calories: 0, steps: 6200 },
    { day: 'Wed', workouts: 1, calories: 380, steps: 9200 },
    { day: 'Thu', workouts: 1, calories: 520, steps: 7800 },
    { day: 'Fri', workouts: 0, calories: 0, steps: 6500 },
    { day: 'Sat', workouts: 1, calories: 600, steps: 11000 },
    { day: 'Sun', workouts: 0, calories: 0, steps: 4200 }
  ];

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
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Progress Tracking</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor your fitness journey and celebrate achievements
            </p>
          </div>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
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
            className="glass-card p-6"
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
          className="glass-card p-6"
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
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Goal Progress</h2>
            <Target className="w-6 h-6 text-green-500" />
          </div>
          
          <div className="space-y-4">
            {Object.entries(progressData).map(([key, data]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {data.current} / {data.goal}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(data.current, data.goal)}`}
                    style={{ width: `${Math.min((data.current / data.goal) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
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
          className="glass-card p-6"
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
          className="glass-card p-6"
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
    </div>
  );
};

export default ProgressPage;
