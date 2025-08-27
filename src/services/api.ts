import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { mockMarketplaceAPI } from './mockMarketplaceAPI';

// API Types
export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  description: string;
  category: string;
  subcategory: string;
  images: string[];
  specifications: Record<string, string>;
  features: string[];
  isDeal?: boolean;
  dealEndsIn?: string;
  fastDelivery?: boolean;
  isPrime?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  subcategories: string[];
}

export interface CartItem {
  id: number;
  productId: number;
  product: {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    brand: string;
    inStock: boolean;
  };
  quantity: number;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  totalSavings: number;
}

export interface WishlistItem {
  id: number;
  productId: number;
  product: {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    brand: string;
    inStock: boolean;
    rating: number;
    reviewCount: number;
  };
  addedAt: string;
}

export interface Order {
  id: string;
  items: any[];
  total: number;
  status: string;
  createdAt: string;
}

export interface Address {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
}

export interface PaymentMethod {
  id: string;
  type: string;
  last4?: string;
  brand?: string;
  is_default: boolean;
}

export interface SearchRequest {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

import { API_BASE_URL, API_TIMEOUT } from '../config/api';

// API Configuration

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
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
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export the mock marketplace API
export const marketplaceAPI = mockMarketplaceAPI;
