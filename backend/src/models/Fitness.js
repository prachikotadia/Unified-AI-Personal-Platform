const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'sports', 'yoga', 'pilates', 'hiit', 'other'],
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  intensity: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    default: 'moderate'
  },
  exercises: [{
    name: {
      type: String,
      required: true
    },
    sets: [{
      reps: Number,
      weight: Number,
      duration: Number, // in seconds
      distance: Number, // in meters
      rest: Number // in seconds
    }],
    notes: String,
    order: Number
  }],
  caloriesBurned: {
    type: Number,
    min: 0
  },
  heartRate: {
    average: Number,
    max: Number,
    min: Number
  },
  location: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  equipment: [String],
  notes: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  scheduledFor: Date
}, {
  timestamps: true
});

const nutritionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  meals: [{
    type: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true
    },
    name: String,
    time: Date,
    foods: [{
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        required: true
      },
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      fiber: Number,
      sugar: Number,
      sodium: Number
    }],
    totalCalories: Number,
    totalProtein: Number,
    totalCarbs: Number,
    totalFat: Number,
    notes: String
  }],
  waterIntake: {
    type: Number, // in ml
    default: 0
  },
  supplements: [{
    name: String,
    dosage: String,
    time: Date
  }],
  notes: String
}, {
  timestamps: true
});

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['weight_loss', 'weight_gain', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'general_fitness'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  targetValue: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  milestones: [{
    value: Number,
    description: String,
    achieved: { type: Boolean, default: false },
    achievedAt: Date
  }],
  progress: [{
    date: { type: Date, default: Date.now },
    value: Number,
    notes: String
  }]
}, {
  timestamps: true
});

const bodyMetricsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  weight: {
    type: Number,
    min: 0
  },
  bodyFat: {
    type: Number,
    min: 0,
    max: 100
  },
  muscleMass: {
    type: Number,
    min: 0
  },
  measurements: {
    chest: Number,
    waist: Number,
    hips: Number,
    biceps: Number,
    thighs: Number,
    calves: Number,
    neck: Number
  },
  bodyComposition: {
    water: Number,
    bone: Number,
    visceralFat: Number
  },
  photos: [{
    url: String,
    type: { type: String, enum: ['front', 'back', 'side'] },
    date: { type: Date, default: Date.now }
  }],
  notes: String
}, {
  timestamps: true
});

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['workout', 'nutrition', 'goal', 'streak', 'milestone'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  icon: String,
  badge: {
    name: String,
    color: String,
    image: String
  },
  criteria: {
    type: String,
    enum: ['workouts_completed', 'calories_burned', 'weight_lost', 'streak_days', 'goals_achieved'],
    required: true
  },
  threshold: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number,
    default: 0
  },
  achieved: {
    type: Boolean,
    default: false
  },
  achievedAt: Date,
  points: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
workoutSchema.index({ userId: 1, date: -1 });
workoutSchema.index({ userId: 1, type: 1 });
workoutSchema.index({ userId: 1, completed: 1 });

nutritionSchema.index({ userId: 1, date: -1 });
nutritionSchema.index({ userId: 1, 'meals.type': 1 });

goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, deadline: 1 });

bodyMetricsSchema.index({ userId: 1, date: -1 });

achievementSchema.index({ userId: 1, achieved: 1 });
achievementSchema.index({ userId: 1, type: 1 });

// Virtual for workout progress
goalSchema.virtual('progressPercentage').get(function() {
  return (this.currentValue / this.targetValue) * 100;
});

// Virtual for days remaining
goalSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for total calories in nutrition
nutritionSchema.virtual('totalCalories').get(function() {
  return this.meals.reduce((total, meal) => total + (meal.totalCalories || 0), 0);
});

// Virtual for total macros in nutrition
nutritionSchema.virtual('totalMacros').get(function() {
  return this.meals.reduce((totals, meal) => {
    totals.protein += meal.totalProtein || 0;
    totals.carbs += meal.totalCarbs || 0;
    totals.fat += meal.totalFat || 0;
    return totals;
  }, { protein: 0, carbs: 0, fat: 0 });
});

// Static method to get workout statistics
workoutSchema.statics.getWorkoutStats = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        completed: true,
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        totalCalories: { $sum: '$caloriesBurned' },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
};

// Static method to get nutrition summary
nutritionSchema.statics.getNutritionSummary = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalCalories: { $sum: '$totalCalories' },
        avgCalories: { $avg: '$totalCalories' },
        totalWater: { $sum: '$waterIntake' },
        avgWater: { $avg: '$waterIntake' },
        daysTracked: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get body metrics trend
bodyMetricsSchema.statics.getMetricsTrend = function(userId, startDate, endDate) {
  return this.find({
    userId: mongoose.Types.ObjectId(userId),
    date: { $gte: startDate, $lte: endDate }
  })
  .sort({ date: 1 })
  .select('date weight bodyFat muscleMass');
};

// Static method to get achievements
achievementSchema.statics.getUserAchievements = function(userId) {
  return this.find({
    userId: mongoose.Types.ObjectId(userId)
  })
  .sort({ achievedAt: -1, createdAt: -1 });
};

// Instance method to check if goal is achieved
goalSchema.methods.checkAchievement = function() {
  if (this.currentValue >= this.targetValue && this.status === 'active') {
    this.status = 'completed';
    this.achievedAt = new Date();
  }
};

// Instance method to update progress
goalSchema.methods.updateProgress = function(value, notes = '') {
  this.currentValue = value;
  this.progress.push({
    date: new Date(),
    value: value,
    notes: notes
  });
  this.checkAchievement();
};

// Instance method to calculate workout totals
workoutSchema.methods.calculateTotals = function() {
  let totalCalories = 0;
  let totalDuration = 0;
  
  this.exercises.forEach(exercise => {
    exercise.sets.forEach(set => {
      if (set.duration) totalDuration += set.duration;
    });
  });
  
  // Estimate calories based on duration and intensity
  const intensityMultiplier = {
    low: 3,
    moderate: 5,
    high: 8
  };
  
  totalCalories = Math.round((totalDuration / 60) * intensityMultiplier[this.intensity] * 70); // 70kg average weight
  this.caloriesBurned = totalCalories;
};

module.exports = {
  Workout: mongoose.model('Workout', workoutSchema),
  Nutrition: mongoose.model('Nutrition', nutritionSchema),
  Goal: mongoose.model('FitnessGoal', goalSchema),
  BodyMetrics: mongoose.model('BodyMetrics', bodyMetricsSchema),
  Achievement: mongoose.model('Achievement', achievementSchema)
};
