const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  dateOfBirth: {
    type: Date
  },
  phone: {
    type: String
  },
  location: {
    city: String,
    country: String,
    timezone: String
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'friends'
      },
      showOnlineStatus: { type: Boolean, default: true },
      allowMessages: { type: Boolean, default: true }
    }
  },
  social: {
    googleId: String,
    githubId: String,
    linkedinUrl: String,
    twitterHandle: String,
    website: String
  },
  verification: {
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  loginHistory: [{
    timestamp: { type: Date, default: Date.now },
    ip: String,
    userAgent: String,
    location: String
  }],
  security: {
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    emailVerificationExpires: Date
  },
  stats: {
    totalLogins: { type: Number, default: 0 },
    lastLogin: Date,
    profileViews: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  return this.username || this.fullName;
});

// Index for search
userSchema.index({ 
  username: 'text', 
  firstName: 'text', 
  lastName: 'text', 
  email: 'text' 
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.security.passwordChangedAt = Date.now() - 1000; // 1 second ago
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.security.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.security.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.security.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.security.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Instance method to create email verification token
userSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.security.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  this.security.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Static method to find users by search term
userSchema.statics.searchUsers = function(searchTerm, limit = 10) {
  return this.find({
    $or: [
      { username: { $regex: searchTerm, $options: 'i' } },
      { firstName: { $regex: searchTerm, $options: 'i' } },
      { lastName: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } }
    ],
    status: 'active'
  })
  .select('username firstName lastName avatar bio stats')
  .limit(limit);
};

// Static method to get user recommendations
userSchema.statics.getRecommendations = function(userId, limit = 10) {
  return this.aggregate([
    {
      $match: {
        _id: { $ne: mongoose.Types.ObjectId(userId) },
        status: 'active'
      }
    },
    {
      $lookup: {
        from: 'follows',
        localField: '_id',
        foreignField: 'following',
        as: 'followers'
      }
    },
    {
      $addFields: {
        followerCount: { $size: '$followers' }
      }
    },
    {
      $sort: { followerCount: -1, 'stats.postsCount': -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        username: 1,
        firstName: 1,
        lastName: 1,
        avatar: 1,
        bio: 1,
        stats: 1,
        followerCount: 1
      }
    }
  ]);
};

module.exports = mongoose.model('User', userSchema);
