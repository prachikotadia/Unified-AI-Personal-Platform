import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Ruler, 
  Scale, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Calendar,
  BarChart3,
  LineChart,
  Target,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useFitness } from '../../hooks/useFitness';
import MeasurementModal from '../../components/fitness/MeasurementModal';

const MeasurementsPage = () => {
  const { healthMetrics, isLoading, error } = useFitness();
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  // Mock measurements data
  const mockMeasurements = [
    {
      id: '1',
      date: '2024-01-15',
      weight: 70.5,
      body_fat: 18.5,
      muscle_mass: 45.2,
      chest: 95,
      waist: 78,
      hips: 98,
      biceps: 32,
      thighs: 58,
      neck: 38,
      shoulders: 110
    },
    {
      id: '2',
      date: '2024-01-08',
      weight: 71.2,
      body_fat: 19.0,
      muscle_mass: 44.8,
      chest: 94,
      waist: 79,
      hips: 99,
      biceps: 31.5,
      thighs: 57.5,
      neck: 37.5,
      shoulders: 109
    },
    {
      id: '3',
      date: '2024-01-01',
      weight: 72.0,
      body_fat: 19.5,
      muscle_mass: 44.5,
      chest: 93,
      waist: 80,
      hips: 100,
      biceps: 31,
      thighs: 57,
      neck: 37,
      shoulders: 108
    }
  ];

  const measurements = mockMeasurements;
  const latest = measurements[0];
  const previous = measurements[1];

  const calculateChange = (current: number, previous: number) => {
    const change = current - previous;
    const percentage = (change / previous) * 100;
    return { change, percentage };
  };

  const getChangeColor = (change: number) => {
    return change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-500';
  };

  const getChangeIcon = (change: number) => {
    return change > 0 ? <ArrowUp className="w-4 h-4" /> : change < 0 ? <ArrowDown className="w-4 h-4" /> : null;
  };

  const measurementFields = [
    { key: 'weight', label: 'Weight', unit: 'kg', icon: Scale },
    { key: 'body_fat', label: 'Body Fat', unit: '%', icon: TrendingDown },
    { key: 'muscle_mass', label: 'Muscle Mass', unit: 'kg', icon: TrendingUp },
    { key: 'chest', label: 'Chest', unit: 'cm', icon: Ruler },
    { key: 'waist', label: 'Waist', unit: 'cm', icon: Ruler },
    { key: 'hips', label: 'Hips', unit: 'cm', icon: Ruler },
    { key: 'biceps', label: 'Biceps', unit: 'cm', icon: Ruler },
    { key: 'thighs', label: 'Thighs', unit: 'cm', icon: Ruler },
    { key: 'neck', label: 'Neck', unit: 'cm', icon: Ruler },
    { key: 'shoulders', label: 'Shoulders', unit: 'cm', icon: Ruler }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
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
            <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Measurements</div>
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
            <h1 className="text-3xl font-bold mb-2">Body Measurements</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your body composition and physical measurements
            </p>
          </div>
          <div className="flex items-center space-x-4">
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
            <button 
              onClick={() => setShowMeasurementModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Log Measurement</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Current Measurements Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {measurementFields.slice(0, 5).map((field, index) => {
          const current = latest[field.key as keyof typeof latest] as number;
          const prev = previous[field.key as keyof typeof previous] as number;
          const { change, percentage } = calculateChange(current, prev);
          
          return (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-gradient-from to-purple-gradient-to rounded-lg flex items-center justify-center">
                  <field.icon className="w-5 h-5 text-white" />
                </div>
                {getChangeIcon(change)}
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{field.label}</h3>
              <p className="text-2xl font-bold">{current}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`text-sm ${getChangeColor(change)}`}>
                  {change > 0 ? '+' : ''}{change.toFixed(1)} {field.unit}
                </span>
                <span className="text-xs text-gray-500">
                  ({percentage > 0 ? '+' : ''}{percentage.toFixed(1)}%)
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Measurements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* All Measurements Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">All Measurements</h2>
            <BarChart3 className="w-6 h-6 text-blue-500" />
          </div>
          
          <div className="space-y-4">
            {measurementFields.map((field) => {
              const current = latest[field.key as keyof typeof latest] as number;
              const prev = previous[field.key as keyof typeof previous] as number;
              const { change, percentage } = calculateChange(current, prev);
              
              return (
                <div key={field.key} className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <field.icon className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="font-medium">{field.label}</span>
                      <div className="text-sm text-gray-500">{current} {field.unit}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center space-x-1 ${getChangeColor(change)}`}>
                      {getChangeIcon(change)}
                      <span className="text-sm">
                        {change > 0 ? '+' : ''}{change.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {percentage > 0 ? '+' : ''}{percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Measurement History Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Measurement History</h2>
            <LineChart className="w-6 h-6 text-green-500" />
          </div>
          
          <div className="space-y-4">
            {measurements.map((measurement, index) => (
              <div key={measurement.id} className="p-3 border border-white/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{measurement.date}</span>
                  <span className="text-sm text-gray-500">{measurement.weight} kg</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Body Fat:</span>
                    <span className="ml-1">{measurement.body_fat}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Muscle:</span>
                    <span className="ml-1">{measurement.muscle_mass} kg</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Waist:</span>
                    <span className="ml-1">{measurement.waist} cm</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Body Composition Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Body Composition Analysis</h2>
          <Target className="w-6 h-6 text-purple-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Weight Analysis */}
          <div className="p-4 border border-white/10 rounded-lg">
            <h3 className="font-semibold mb-3">Weight Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Current:</span>
                <span className="font-medium">{latest.weight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Change:</span>
                <span className={`font-medium ${getChangeColor(latest.weight - previous.weight)}`}>
                  {latest.weight - previous.weight > 0 ? '+' : ''}{(latest.weight - previous.weight).toFixed(1)} kg
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to h-2 rounded-full"
                  style={{ width: `${((latest.weight - 65) / (75 - 65)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Body Fat Analysis */}
          <div className="p-4 border border-white/10 rounded-lg">
            <h3 className="font-semibold mb-3">Body Fat</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Current:</span>
                <span className="font-medium">{latest.body_fat}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Change:</span>
                <span className={`font-medium ${getChangeColor(latest.body_fat - previous.body_fat)}`}>
                  {latest.body_fat - previous.body_fat > 0 ? '+' : ''}{(latest.body_fat - previous.body_fat).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-gradient-from to-red-gradient-to h-2 rounded-full"
                  style={{ width: `${(latest.body_fat / 25) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Muscle Mass Analysis */}
          <div className="p-4 border border-white/10 rounded-lg">
            <h3 className="font-semibold mb-3">Muscle Mass</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Current:</span>
                <span className="font-medium">{latest.muscle_mass} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Change:</span>
                <span className={`font-medium ${getChangeColor(latest.muscle_mass - previous.muscle_mass)}`}>
                  {latest.muscle_mass - previous.muscle_mass > 0 ? '+' : ''}{(latest.muscle_mass - previous.muscle_mass).toFixed(1)} kg
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-gradient-from to-green-gradient-to h-2 rounded-full"
                  style={{ width: `${(latest.muscle_mass / 50) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Measurement Modal */}
      <MeasurementModal 
        isOpen={showMeasurementModal} 
        onClose={() => setShowMeasurementModal(false)}
      />
    </div>
  );
};

export default MeasurementsPage;
