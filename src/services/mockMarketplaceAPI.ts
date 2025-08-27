// Comprehensive Mock API Service for Marketplace
// This provides all marketplace functionality without needing the backend

import { Product, Category, CartItem, Cart, WishlistItem, Order, SearchRequest } from './api';

// Mock data
const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Apple iPhone 15 Pro Max - 256GB - Natural Titanium',
    price: 1199.99,
    originalPrice: 1299.99,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
    brand: 'Apple',
    inStock: true,
    rating: 4.8,
    reviewCount: 1247,
    description: 'The most advanced iPhone ever with A17 Pro chip, 48MP camera, and titanium design.',
    category: 'electronics',
    subcategory: 'Smartphones',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop'
    ],
    specifications: {
      'Display': '6.7-inch Super Retina XDR display',
      'Chip': 'A17 Pro chip with 6-core GPU',
      'Storage': '256GB',
      'Camera': '48MP Main + 12MP Ultra Wide + 12MP Telephoto'
    },
    features: [
      'A17 Pro chip with 6-core GPU',
      '48MP Main camera with 2x Telephoto',
      'Titanium design with Ceramic Shield',
      'USB-C connector for faster charging'
    ],
    isDeal: true,
    dealEndsIn: '2 days',
    fastDelivery: true,
    isPrime: true
  },
  {
    id: 2,
    name: 'Sony WH-1000XM4 Wireless Noise-Canceling Headphones',
    price: 349.99,
    originalPrice: 399.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    brand: 'Sony',
    inStock: true,
    rating: 4.8,
    reviewCount: 1892,
    description: 'Industry-leading noise canceling with Dual Noise Sensor technology.',
    category: 'electronics',
    subcategory: 'Headphones',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop'
    ],
    specifications: {
      'Driver': '40mm',
      'Frequency Response': '4Hz-40,000Hz',
      'Battery Life': 'Up to 30 hours',
      'Weight': '254g'
    },
    features: [
      'Industry-leading noise canceling',
      'Dual Noise Sensor technology',
      'Up to 30-hour battery life',
      'Quick Charge (10 min = 5 hours)'
    ],
    isDeal: true,
    dealEndsIn: '1 day',
    fastDelivery: true,
    isPrime: true
  },
  {
    id: 3,
    name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
    price: 89.99,
    originalPrice: 119.99,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    brand: 'Instant Pot',
    inStock: true,
    rating: 4.7,
    reviewCount: 3241,
    description: '7-in-1 Multi-Functional Pressure Cooker: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer.',
    category: 'home',
    subcategory: 'Kitchen Appliances',
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop'
    ],
    specifications: {
      'Capacity': '6 quarts',
      'Power': '1000W',
      'Material': 'Stainless Steel',
      'Dimensions': '13.4 x 12.2 x 12.5 inches'
    },
    features: [
      '7-in-1 Multi-Functional',
      'Pressure Cooker',
      'Slow Cooker',
      'Rice Cooker',
      'Steamer',
      'Sauté Pan',
      'Yogurt Maker',
      'Warmer'
    ],
    isDeal: true,
    dealEndsIn: '3 days',
    fastDelivery: true,
    isPrime: true
  },
  {
    id: 4,
    name: 'Nike Air Max 270 Running Shoes',
    price: 129.99,
    originalPrice: 150.00,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    brand: 'Nike',
    inStock: true,
    rating: 4.6,
    reviewCount: 2156,
    description: 'The Nike Air Max 270 delivers unrivaled, all-day comfort with the tallest Air unit yet.',
    category: 'fashion',
    subcategory: 'Shoes',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop'
    ],
    specifications: {
      'Upper': 'Breathable mesh',
      'Midsole': 'Air Max 270 unit',
      'Outsole': 'Rubber',
      'Weight': '10.4 oz'
    },
    features: [
      'Tallest Air unit yet',
      'Breathable mesh upper',
      'Foam midsole',
      'Rubber outsole'
    ],
    isDeal: false,
    fastDelivery: true,
    isPrime: true
  },
  {
    id: 5,
    name: 'Samsung 65" QLED 4K Smart TV',
    price: 1299.99,
    originalPrice: 1599.99,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
    brand: 'Samsung',
    inStock: true,
    rating: 4.9,
    reviewCount: 892,
    description: 'Experience stunning picture quality with Quantum Dot technology and 4K resolution.',
    category: 'electronics',
    subcategory: 'TVs',
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=800&fit=crop'
    ],
    specifications: {
      'Screen Size': '65 inches',
      'Resolution': '4K Ultra HD',
      'Display Technology': 'QLED',
      'Smart Features': 'Tizen OS'
    },
    features: [
      'Quantum Dot technology',
      '4K Ultra HD resolution',
      'HDR support',
      'Smart TV with Tizen OS',
      'Voice control'
    ],
    isDeal: true,
    dealEndsIn: '5 days',
    fastDelivery: true,
    isPrime: true
  }
];

const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest gadgets and electronic devices',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop',
    productCount: 150,
    subcategories: ['Smartphones', 'Laptops', 'Headphones', 'TVs', 'Cameras']
  },
  {
    id: 2,
    name: 'Fashion',
    slug: 'fashion',
    description: 'Trendy clothing and accessories',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop',
    productCount: 320,
    subcategories: ['Men', 'Women', 'Kids', 'Shoes', 'Accessories']
  },
  {
    id: 3,
    name: 'Home & Garden',
    slug: 'home',
    description: 'Everything for your home and garden',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
    productCount: 280,
    subcategories: ['Kitchen', 'Furniture', 'Decor', 'Garden', 'Tools']
  },
  {
    id: 4,
    name: 'Sports & Outdoors',
    slug: 'sports',
    description: 'Sports equipment and outdoor gear',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    productCount: 95,
    subcategories: ['Fitness', 'Camping', 'Hiking', 'Team Sports', 'Water Sports']
  }
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock cart and wishlist data
let mockCart: Cart = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  totalSavings: 0
};

let mockWishlist: WishlistItem[] = [];

// Helper function to update cart totals
const updateCartTotals = () => {
  mockCart.totalItems = mockCart.items.reduce((sum, item) => sum + item.quantity, 0);
  mockCart.totalPrice = mockCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  mockCart.totalSavings = mockCart.items.reduce((sum, item) => {
    const originalPrice = item.product.originalPrice || item.product.price;
    return sum + ((originalPrice - item.product.price) * item.quantity);
  }, 0);
};

export const mockMarketplaceAPI = {
  // Products
  getProducts: async (params?: SearchRequest): Promise<{ products: Product[]; total: number }> => {
    await delay(300);
    let filteredProducts = [...mockProducts];
    
    if (params) {
      if (params.search) {
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(params.search!.toLowerCase()) ||
          product.brand.toLowerCase().includes(params.search!.toLowerCase())
        );
      }
      
      if (params.category) {
        filteredProducts = filteredProducts.filter(product =>
          product.category === params.category
        );
      }
      
      if (params.minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product =>
          product.price >= params.minPrice!
        );
      }
      
      if (params.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product =>
          product.price <= params.maxPrice!
        );
      }
    }
    
    return {
      products: filteredProducts,
      total: filteredProducts.length
    };
  },

  getProductById: async (id: number): Promise<Product> => {
    await delay(200);
    const product = mockProducts.find(p => p.id === id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  },

  searchProducts: async (searchRequest: SearchRequest): Promise<{ products: Product[]; total: number }> => {
    await delay(400);
    let filteredProducts = [...mockProducts];
    
    if (searchRequest.search) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchRequest.search!.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchRequest.search!.toLowerCase()) ||
        product.description.toLowerCase().includes(searchRequest.search!.toLowerCase())
      );
    }
    
    return {
      products: filteredProducts,
      total: filteredProducts.length
    };
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    await delay(250);
    return mockProducts.filter(product => product.rating >= 4.5).slice(0, 4);
  },

  getTrendingProducts: async (): Promise<Product[]> => {
    await delay(250);
    return mockProducts.filter(product => product.reviewCount > 1000).slice(0, 4);
  },

  getDeals: async (): Promise<Product[]> => {
    await delay(250);
    return mockProducts.filter(product => product.isDeal).slice(0, 4);
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    await delay(200);
    return mockCategories;
  },

  getCategoryBySlug: async (slug: string): Promise<Category> => {
    await delay(200);
    const category = mockCategories.find(c => c.slug === slug);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  },

  // Cart
  getCart: async (): Promise<Cart> => {
    await delay(200);
    return mockCart;
  },

  addToCart: async (productId: number, quantity: number = 1): Promise<Cart> => {
    await delay(300);
    
    const product = mockProducts.find(p => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const existingItem = mockCart.items.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const newItem: CartItem = {
        id: Date.now(),
        productId,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          brand: product.brand,
          inStock: product.inStock
        },
        quantity,
        addedAt: new Date().toISOString()
      };
      mockCart.items.push(newItem);
    }

    updateCartTotals();
    return mockCart;
  },

  updateCartItem: async (itemId: number, quantity: number): Promise<Cart> => {
    await delay(300);
    
    const item = mockCart.items.find(item => item.id === itemId);
    if (!item) {
      throw new Error('Cart item not found');
    }

    item.quantity = quantity;
    updateCartTotals();
    return mockCart;
  },

  removeFromCart: async (itemId: number): Promise<void> => {
    await delay(300);
    
    const index = mockCart.items.findIndex(item => item.id === itemId);
    if (index === -1) {
      throw new Error('Cart item not found');
    }

    mockCart.items.splice(index, 1);
    updateCartTotals();
  },

  clearCart: async (): Promise<void> => {
    await delay(300);
    mockCart = {
      items: [],
      totalItems: 0,
      totalPrice: 0,
      totalSavings: 0
    };
  },

  // Wishlist
  getWishlist: async (): Promise<WishlistItem[]> => {
    await delay(200);
    return mockWishlist;
  },

  addToWishlist: async (productId: number): Promise<void> => {
    await delay(300);
    
    const product = mockProducts.find(p => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const existingItem = mockWishlist.find(item => item.productId === productId);
    if (existingItem) {
      throw new Error('Product already in wishlist');
    }

    const newItem: WishlistItem = {
      id: Date.now(),
      productId,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        brand: product.brand,
        inStock: product.inStock,
        rating: product.rating,
        reviewCount: product.reviewCount
      },
      addedAt: new Date().toISOString()
    };

    mockWishlist.push(newItem);
  },

  removeFromWishlist: async (productId: number): Promise<void> => {
    await delay(300);
    
    const index = mockWishlist.findIndex(item => item.productId === productId);
    if (index === -1) {
      throw new Error('Wishlist item not found');
    }

    mockWishlist.splice(index, 1);
  },

  moveToCart: async (productId: number, quantity: number = 1): Promise<CartItem> => {
    await delay(300);
    
    const wishlistItem = mockWishlist.find(item => item.productId === productId);
    if (!wishlistItem) {
      throw new Error('Wishlist item not found');
    }

    // Remove from wishlist
    const wishlistIndex = mockWishlist.findIndex(item => item.productId === productId);
    mockWishlist.splice(wishlistIndex, 1);

    // Add to cart
    const existingCartItem = mockCart.items.find(item => item.productId === productId);
    
    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      const newCartItem: CartItem = {
        id: Date.now(),
        productId,
        product: {
          id: wishlistItem.product.id,
          name: wishlistItem.product.name,
          price: wishlistItem.product.price,
          originalPrice: wishlistItem.product.originalPrice,
          image: wishlistItem.product.image,
          brand: wishlistItem.product.brand,
          inStock: wishlistItem.product.inStock
        },
        quantity,
        addedAt: new Date().toISOString()
      };
      mockCart.items.push(newCartItem);
    }

    updateCartTotals();
    return mockCart.items.find(item => item.productId === productId)!;
  },

  // Buy Now
  buyNow: async (productId: number, quantity: number = 1): Promise<Order> => {
    await delay(500);
    
    const product = mockProducts.find(p => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Create a mock order
    const order: Order = {
      id: Date.now().toString(),
      items: [{
        productId,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          brand: product.brand,
          inStock: product.inStock
        },
        quantity
      }],
      total: product.price * quantity,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    return order;
  },

  // Orders
  getOrderById: async (orderId: number): Promise<Order> => {
    await delay(300);
    
    // Create a mock order for the given ID
    const product = mockProducts[0]; // Use first product as example
    const order: Order = {
      id: orderId.toString(),
      items: [{
        productId: product.id,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          brand: product.brand,
          inStock: product.inStock
        },
        quantity: 1
      }],
      total: product.price,
      status: 'delivered',
      createdAt: new Date().toISOString()
    };

    return order;
  },

  // AI Recommendations
  getAIRecommendations: async (type: string = 'personalized'): Promise<Product[]> => {
    await delay(400);
    // Return different recommendations based on type
    switch (type) {
      case 'personalized':
        return mockProducts.filter(p => p.rating >= 4.5).slice(0, 4);
      case 'trending':
        return mockProducts.filter(p => p.reviewCount > 1000).slice(0, 4);
      case 'similar':
        return mockProducts.filter(p => p.category === 'electronics').slice(0, 4);
      default:
        return mockProducts.slice(0, 4);
    }
  },

  // Price Alerts
  getPriceAlerts: async (): Promise<any[]> => {
    await delay(300);
    return [
      {
        id: 1,
        productId: 1,
        product: mockProducts[0],
        targetPrice: 1100,
        currentPrice: 1199.99,
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];
  },

  createPriceAlert: async (productId: number, targetPrice: number): Promise<void> => {
    await delay(300);
    // Mock implementation
    console.log(`Price alert created for product ${productId} at target price $${targetPrice}`);
  },

  // Product Comparisons
  getComparisons: async (): Promise<any[]> => {
    await delay(300);
    return [
      {
        id: 1,
        products: [mockProducts[0], mockProducts[1]],
        createdAt: new Date().toISOString()
      }
    ];
  },

  createComparison: async (productIds: number[]): Promise<void> => {
    await delay(300);
    // Mock implementation
    console.log(`Comparison created for products: ${productIds.join(', ')}`);
  },

  // Recently Viewed
  getRecentlyViewed: async (): Promise<Product[]> => {
    await delay(200);
    return mockProducts.slice(0, 4);
  },

  // Product Q&A
  getProductQuestions: async (productId: number): Promise<any[]> => {
    await delay(300);
    return [
      {
        id: 1,
        question: 'Is this product worth the price?',
        answer: 'Yes, this product offers excellent value for money.',
        helpful: 5,
        createdAt: new Date().toISOString()
      }
    ];
  },

  createQuestion: async (productId: number, question: string): Promise<void> => {
    await delay(300);
    // Mock implementation
    console.log(`Question created for product ${productId}: ${question}`);
  }
};
