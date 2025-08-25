import axios from 'axios';

// Configure axios instance
const api = axios.create({
  baseURL: 'http://localhost:8001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  category: string;
  subcategory?: string;
  brand: string;
  sku: string;
  stock_quantity: number;
  images: string[];
  specifications?: any;
  features?: string[];
  tags?: string[];
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_deal: boolean;
  is_trending: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  color: string;
  sort_order: number;
  created_at: string;
}

export interface SearchRequest {
  skip?: number;
  limit?: number;
  category_id?: number;
  search?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CartItem {
  id: number;
  user_id: string;
  product_id: number;
  quantity: number;
  product: Product;
  added_at: string;
}

export interface WishlistItem {
  id: number;
  user_id: string;
  product_id: number;
  product: Product;
  added_at: string;
}

export interface Order {
  id: number;
  user_id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  currency: string;
  shipping_address: any;
  billing_address: any;
  shipping_method: string;
  tracking_number?: string;
  estimated_delivery?: string;
  created_at: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: string;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  helpful_votes: number;
  verified_purchase: boolean;
  created_at: string;
}

// Marketplace API
export const marketplaceAPI = {
  // Products
  getProducts: async (params?: SearchRequest) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return api.get(`/marketplace/products?${queryParams.toString()}`);
  },

  getProductById: async (id: number) => {
    return api.get(`/marketplace/products/${id}`);
  },

  getFeaturedProducts: async (limit: number = 10) => {
    return api.get(`/marketplace/products/featured?limit=${limit}`);
  },

  getDealProducts: async (limit: number = 10) => {
    return api.get(`/marketplace/products/deals?limit=${limit}`);
  },

  getTrendingProducts: async (limit: number = 10) => {
    return api.get(`/marketplace/products/trending?limit=${limit}`);
  },

  // Categories
  getCategories: async () => {
    return api.get('/marketplace/categories');
  },

  getCategoryById: async (id: number) => {
    return api.get(`/marketplace/categories/${id}`);
  },

  getCategoryBySlug: async (slug: string) => {
    return api.get(`/marketplace/categories/slug/${slug}`);
  },

  // Cart
  getCart: async (userId: string) => {
    return api.get(`/marketplace/cart?user_id=${userId}`);
  },

  addToCart: async (data: { user_id: string; product_id: number; quantity?: number }) => {
    return api.post('/marketplace/cart/add', data);
  },

  updateCartItem: async (data: { user_id: string; product_id: number; quantity: number }) => {
    return api.put('/marketplace/cart/update', data);
  },

  removeFromCart: async (userId: string, productId: number) => {
    return api.delete(`/marketplace/cart/remove?user_id=${userId}&product_id=${productId}`);
  },

  clearCart: async (userId: string) => {
    return api.delete(`/marketplace/cart/clear?user_id=${userId}`);
  },

  // Wishlist
  getWishlist: async (userId: string) => {
    return api.get(`/marketplace/wishlist?user_id=${userId}`);
  },

  addToWishlist: async (data: { user_id: string; product_id: number }) => {
    return api.post('/marketplace/wishlist/add', data);
  },

  removeFromWishlist: async (userId: string, productId: number) => {
    return api.delete(`/marketplace/wishlist/remove?user_id=${userId}&product_id=${productId}`);
  },

  // Orders
  getOrders: async (userId: string, skip: number = 0, limit: number = 20) => {
    return api.get(`/marketplace/orders?user_id=${userId}&skip=${skip}&limit=${limit}`);
  },

  getOrderById: async (orderId: number, userId?: string) => {
    const params = userId ? `?user_id=${userId}` : '';
    return api.get(`/marketplace/orders/${orderId}${params}`);
  },

  createOrder: async (data: {
    user_id: string;
    shipping_address: any;
    billing_address: any;
    payment_method: string;
    shipping_method?: string;
  }) => {
    return api.post('/marketplace/orders/create', data);
  },

  // Reviews
  getProductReviews: async (productId: number, skip: number = 0, limit: number = 20) => {
    return api.get(`/marketplace/products/${productId}/reviews?skip=${skip}&limit=${limit}`);
  },

  createReview: async (productId: number, reviewData: {
    user_id: string;
    rating: number;
    title: string;
    comment: string;
    user_name?: string;
  }) => {
    return api.post(`/marketplace/products/${productId}/reviews`, reviewData);
  },

  // Questions & Answers
  getProductQuestions: async (productId: number, skip: number = 0, limit: number = 20) => {
    return api.get(`/marketplace/products/${productId}/questions?skip=${skip}&limit=${limit}`);
  },

  createProductQuestion: async (productId: number, data: {
    user_id: string;
    question: string;
    user_name?: string;
  }) => {
    return api.post(`/marketplace/products/${productId}/questions`, data);
  },

  answerProductQuestion: async (questionId: number, data: {
    user_id: string;
    answer: string;
    user_name?: string;
    user_type?: string;
  }) => {
    return api.post(`/marketplace/questions/${questionId}/answer`, data);
  },

  // Enhanced Features
  getAIRecommendations: async (userId: string, productId?: number, limit: number = 10) => {
    const params = new URLSearchParams({
      user_id: userId,
      limit: limit.toString(),
    });
    if (productId) {
      params.append('product_id', productId.toString());
    }
    return api.get(`/marketplace/recommendations?${params.toString()}`);
  },

  getPriceAlerts: async (userId: string) => {
    return api.get(`/marketplace/price-alerts?user_id=${userId}`);
  },

  createPriceAlert: async (data: {
    user_id: string;
    product_id: number;
    target_price: number;
  }) => {
    return api.post('/marketplace/price-alerts', data);
  },

  deletePriceAlert: async (alertId: number, userId: string) => {
    return api.delete(`/marketplace/price-alerts/${alertId}?user_id=${userId}`);
  },

  getProductComparisons: async (userId: string) => {
    return api.get(`/marketplace/comparisons?user_id=${userId}`);
  },

  createProductComparison: async (data: {
    user_id: string;
    name: string;
    product_ids: number[];
  }) => {
    return api.post('/marketplace/comparisons', data);
  },

  getRecentlyViewed: async (userId: string, limit: number = 10) => {
    return api.get(`/marketplace/recently-viewed?user_id=${userId}&limit=${limit}`);
  },

  addRecentlyViewed: async (data: { user_id: string; product_id: number }) => {
    return api.post('/marketplace/recently-viewed', data);
  },

  // Loyalty Program
  getLoyaltyProgram: async (userId: string) => {
    return api.get(`/marketplace/loyalty?user_id=${userId}`);
  },

  getLoyaltyTransactions: async (userId: string, limit: number = 50) => {
    return api.get(`/marketplace/loyalty/transactions?user_id=${userId}&limit=${limit}`);
  },

  addLoyaltyPoints: async (data: {
    user_id: string;
    amount: number;
    description: string;
  }) => {
    return api.post('/marketplace/loyalty/points/add', data);
  },

  redeemLoyaltyPoints: async (data: {
    user_id: string;
    points: number;
    description: string;
  }) => {
    return api.post('/marketplace/loyalty/points/redeem', data);
  },

  // Returns
  getReturns: async (userId: string) => {
    return api.get(`/marketplace/returns?user_id=${userId}`);
  },

  createReturn: async (data: {
    user_id: string;
    order_id: number;
    reason: string;
    description?: string;
    return_method?: string;
  }) => {
    return api.post('/marketplace/returns/create', data);
  },

  // Shipping & Tax
  calculateShipping: async (data: {
    shipping_address: any;
    shipping_method: string;
    subtotal: number;
  }) => {
    return api.post('/marketplace/shipping/calculate', data);
  },

  calculateTax: async (data: {
    billing_address: any;
    subtotal: number;
  }) => {
    return api.post('/marketplace/tax/calculate', data);
  },

  // Inventory
  getInventoryStatus: async (productId: number) => {
    return api.get(`/marketplace/products/${productId}/inventory`);
  },

  getInventoryLogs: async (productId: number, limit: number = 50) => {
    return api.get(`/marketplace/products/${productId}/inventory/logs?limit=${limit}`);
  },

  updateInventory: async (productId: number, data: {
    quantity: number;
    action: string;
    user_id?: string;
    reason?: string;
  }) => {
    return api.post(`/marketplace/products/${productId}/inventory/update`, data);
  },
};
