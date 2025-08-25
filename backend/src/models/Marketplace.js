const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  category: {
    type: String,
    required: true,
    enum: [
      'electronics', 'clothing', 'books', 'home', 'sports',
      'beauty', 'toys', 'automotive', 'health', 'food',
      'jewelry', 'art', 'music', 'tools', 'garden', 'other'
    ]
  },
  subcategory: String,
  brand: {
    type: String,
    required: true
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  specifications: {
    type: Map,
    of: String
  },
  features: [String],
  tags: [String],
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  stock: {
    quantity: {
      type: Number,
      default: 0,
      min: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 5
    },
    trackInventory: {
      type: Boolean,
      default: true
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: String,
    comment: String,
    images: [String],
    helpful: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  variants: [{
    name: String,
    options: [{
      name: String,
      value: String,
      price: Number,
      stock: Number
    }]
  }],
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    shippingCost: {
      type: Number,
      default: 0
    }
  },
  warranty: String,
  returnPolicy: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'archived'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  trending: {
    type: Boolean,
    default: false
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  analytics: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    variant: {
      name: String,
      value: String
    },
    total: Number
  }],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  shipping: {
    cost: { type: Number, default: 0 },
    method: String,
    tracking: String
  },
  discount: {
    code: String,
    amount: { type: Number, default: 0 },
    type: { type: String, enum: ['percentage', 'fixed'] }
  },
  total: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'paypal', 'stripe', 'apple_pay', 'google_pay', 'bank_transfer'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  shippingAddress: {
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  billingAddress: {
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  notes: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  trackingEvents: [{
    status: String,
    location: String,
    timestamp: { type: Date, default: Date.now },
    description: String
  }]
}, {
  timestamps: true
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    variant: {
      name: String,
      value: String
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  coupon: {
    code: String,
    discount: Number
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
productSchema.index({ category: 1, status: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1, status: 1 });
productSchema.index({ trending: 1, status: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });

cartSchema.index({ userId: 1 });
wishlistSchema.index({ userId: 1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for in stock status
productSchema.virtual('inStock').get(function() {
  if (!this.stock.trackInventory) return true;
  return this.stock.quantity > 0;
});

// Virtual for low stock status
productSchema.virtual('lowStock').get(function() {
  if (!this.stock.trackInventory) return false;
  return this.stock.quantity <= this.stock.lowStockThreshold && this.stock.quantity > 0;
});

// Static method to get featured products
productSchema.statics.getFeaturedProducts = function(limit = 10) {
  return this.find({
    featured: true,
    status: 'active'
  })
  .sort({ 'ratings.average': -1, createdAt: -1 })
  .limit(limit);
};

// Static method to get trending products
productSchema.statics.getTrendingProducts = function(limit = 10) {
  return this.find({
    trending: true,
    status: 'active'
  })
  .sort({ 'analytics.views': -1, 'analytics.purchases': -1 })
  .limit(limit);
};

// Static method to search products
productSchema.statics.searchProducts = function(query, filters = {}, limit = 20, skip = 0) {
  const searchQuery = {
    status: 'active',
    $text: { $search: query }
  };

  if (filters.category) {
    searchQuery.category = filters.category;
  }

  if (filters.brand) {
    searchQuery.brand = filters.brand;
  }

  if (filters.minPrice || filters.maxPrice) {
    searchQuery.price = {};
    if (filters.minPrice) searchQuery.price.$gte = filters.minPrice;
    if (filters.maxPrice) searchQuery.price.$lte = filters.maxPrice;
  }

  return this.find(searchQuery)
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit);
};

// Static method to get related products
productSchema.statics.getRelatedProducts = function(productId, category, limit = 5) {
  return this.find({
    _id: { $ne: productId },
    category: category,
    status: 'active'
  })
  .sort({ 'ratings.average': -1 })
  .limit(limit);
};

// Instance method to update rating
productSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.ratings.average = 0;
    this.ratings.count = 0;
  } else {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.ratings.average = totalRating / this.reviews.length;
    this.ratings.count = this.reviews.length;
  }
};

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

// Instance method to calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + (item.total || 0), 0);
  this.total = this.subtotal + this.tax + this.shipping.cost - this.discount.amount;
};

module.exports = {
  Product: mongoose.model('Product', productSchema),
  Order: mongoose.model('Order', orderSchema),
  Cart: mongoose.model('Cart', cartSchema),
  Wishlist: mongoose.model('Wishlist', wishlistSchema)
};
