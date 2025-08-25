const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'transfer'],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'salary', 'freelance', 'investment', 'business',
      'food', 'transportation', 'entertainment', 'shopping',
      'healthcare', 'education', 'housing', 'utilities',
      'insurance', 'debt', 'savings', 'other'
    ]
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  tags: [String],
  location: {
    name: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'digital_wallet', 'other']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'failed'],
    default: 'completed'
  },
  receipt: {
    url: String,
    filename: String
  },
  notes: String,
  recurring: {
    isRecurring: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    nextDate: Date,
    endDate: Date
  }
}, {
  timestamps: true
});

const budgetSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true,
    enum: [
      'food', 'transportation', 'entertainment', 'shopping',
      'healthcare', 'education', 'housing', 'utilities',
      'insurance', 'debt', 'savings', 'emergency_fund',
      'investment', 'travel', 'personal_care', 'other'
    ]
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  alerts: {
    enabled: { type: Boolean, default: true },
    threshold: { type: Number, default: 80 }, // percentage
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  notes: String,
  color: String,
  icon: String
}, {
  timestamps: true
});

const goalSchema = new mongoose.Schema({
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
    enum: ['savings', 'debt_payoff', 'investment', 'purchase'],
    required: true
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
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
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  description: String,
  category: String,
  color: String,
  icon: String,
  milestones: [{
    amount: Number,
    description: String,
    achieved: { type: Boolean, default: false },
    achievedAt: Date
  }]
}, {
  timestamps: true
});

const accountSchema = new mongoose.Schema({
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
    enum: ['checking', 'savings', 'credit', 'investment', 'loan', 'other'],
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  institution: {
    name: String,
    logo: String
  },
  accountNumber: String,
  isActive: {
    type: Boolean,
    default: true
  },
  color: String,
  icon: String,
  notes: String
}, {
  timestamps: true
});

// Indexes for better query performance
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, type: 1 });

budgetSchema.index({ userId: 1, isActive: 1 });
budgetSchema.index({ userId: 1, category: 1 });

goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, deadline: 1 });

accountSchema.index({ userId: 1, isActive: 1 });

// Virtual for transaction progress (for goals)
goalSchema.virtual('progress').get(function() {
  return this.currentAmount / this.targetAmount * 100;
});

// Virtual for remaining amount (for goals)
goalSchema.virtual('remainingAmount').get(function() {
  return this.targetAmount - this.currentAmount;
});

// Virtual for days remaining (for goals)
goalSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Static method to get spending summary
transactionSchema.statics.getSpendingSummary = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        type: 'expense',
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);
};

// Static method to get income summary
transactionSchema.statics.getIncomeSummary = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        type: 'income',
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);
};

// Static method to get budget progress
budgetSchema.statics.getBudgetProgress = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        isActive: true
      }
    },
    {
      $lookup: {
        from: 'transactions',
        let: { budgetCategory: '$category', budgetUserId: '$userId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$category', '$$budgetCategory'] },
                  { $eq: ['$userId', '$$budgetUserId'] },
                  { $eq: ['$type', 'expense'] },
                  { $gte: ['$date', startDate] },
                  { $lte: ['$date', endDate] }
                ]
              }
            }
          }
        ],
        as: 'transactions'
      }
    },
    {
      $addFields: {
        spent: { $sum: '$transactions.amount' },
        remaining: { $subtract: ['$amount', { $sum: '$transactions.amount' }] },
        progress: {
          $multiply: [
            { $divide: [{ $sum: '$transactions.amount' }, '$amount'] },
            100
          ]
        }
      }
    },
    {
      $project: {
        transactions: 0
      }
    }
  ]);
};

module.exports = {
  Transaction: mongoose.model('Transaction', transactionSchema),
  Budget: mongoose.model('Budget', budgetSchema),
  Goal: mongoose.model('Goal', goalSchema),
  Account: mongoose.model('Account', accountSchema)
};
