import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Heart,
  Zap,
  Award,
  Star,
  Medal,
  Crown,
  Flame
} from 'lucide-react';

const AchievementsPage = () => {
  const achievements = [
    { id: 1, name: 'First Steps', description: 'Complete your first workout', icon: <Target size={24} />, unlocked: true, progress: 100 },
    { id: 2, name: 'Consistency King', description: 'Work out for 7 days in a row', icon: <TrendingUp size={24} />, unlocked: true, progress: 100 },
    { id: 3, name: 'Cardio Champion', description: 'Complete 20 cardio sessions', icon: <Heart size={24} />, unlocked: false, progress: 75 },
    { id: 4, name: 'Strength Master', description: 'Complete 50 strength training sessions', icon: <Zap size={24} />, unlocked: false, progress: 30 },
    { id: 5, name: 'Flexibility Guru', description: 'Complete 30 yoga sessions', icon: <Award size={24} />, unlocked: false, progress: 60 },
    { id: 6, name: 'Endurance Elite', description: 'Run 100 miles total', icon: <Star size={24} />, unlocked: false, progress: 45 },
    { id: 7, name: 'Weight Warrior', description: 'Lift 10,000 lbs total', icon: <Medal size={24} />, unlocked: false, progress: 20 },
    { id: 8, name: 'Fitness Legend', description: 'Complete 100 workouts', icon: <Crown size={24} />, unlocked: false, progress: 15 },
    { id: 9, name: 'Speed Demon', description: 'Complete a 5K in under 20 minutes', icon: <Flame size={24} />, unlocked: false, progress: 0 },
    { id: 10, name: 'Wellness Warrior', description: 'Track nutrition for 30 days', icon: <Heart size={24} />, unlocked: false, progress: 80 },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievements</h1>
          <p className="text-gray-600">Track your fitness milestones and celebrate your progress</p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Overall Progress</h2>
            <span className="text-2xl font-bold text-blue-600">{unlockedCount}/{totalCount}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {Math.round((unlockedCount / totalCount) * 100)}% of achievements unlocked
          </p>
        </motion.div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-300 ${
                achievement.unlocked 
                  ? 'ring-2 ring-green-200 hover:ring-green-300' 
                  : 'hover:shadow-xl'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                  achievement.unlocked 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {achievement.icon}
                </div>
                {achievement.unlocked && (
                  <div className="text-green-500">
                    <Trophy size={20} />
                  </div>
                )}
              </div>

              <h3 className={`font-semibold text-lg mb-2 ${
                achievement.unlocked ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {achievement.name}
              </h3>
              
              <p className={`text-sm mb-4 ${
                achievement.unlocked ? 'text-gray-600' : 'text-gray-500'
              }`}>
                {achievement.description}
              </p>

              {!achievement.unlocked && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{achievement.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${achievement.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {achievement.unlocked && (
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <Trophy size={16} className="mr-1" />
                  Unlocked!
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Recent Achievements */}
        {unlockedCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Achievements</h2>
            <div className="space-y-3">
              {achievements
                .filter(a => a.unlocked)
                .slice(0, 3)
                .map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                      {achievement.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{achievement.name}</h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    <div className="ml-auto text-green-600">
                      <Trophy size={16} />
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AchievementsPage;
