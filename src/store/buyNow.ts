import { create } from 'zustand';
import { mockMarketplaceAPI } from '../services/mockMarketplaceAPI';

export interface BuyNowItem {
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    brand: string;
    inStock: boolean;
  };
}

interface BuyNowStore {
  // State
  currentPurchase: BuyNowItem | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setBuyNowItem: (productId: number, quantity: number, product: any) => void;
  clearBuyNowItem: () => void;
  processBuyNow: () => Promise<any>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useBuyNowStore = create<BuyNowStore>((set, get) => ({
  // Initial state
  currentPurchase: null,
  isLoading: false,
  error: null,

  // Actions
  setBuyNowItem: (productId: number, quantity: number, product: any) => {
    set({
      currentPurchase: {
        productId,
        quantity,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          brand: product.brand,
          inStock: product.inStock
        }
      },
      error: null
    });
  },

  clearBuyNowItem: () => {
    set({ currentPurchase: null, error: null });
  },

  processBuyNow: async () => {
    const { currentPurchase } = get();
    if (!currentPurchase) {
      throw new Error('No item selected for purchase');
    }

    set({ isLoading: true, error: null });
    try {
      const order = await mockMarketplaceAPI.buyNow(
        currentPurchase.productId, 
        currentPurchase.quantity
      );
      set({ isLoading: false });
      return order;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to process purchase',
        isLoading: false 
      });
      throw error;
    }
  },

  setError: (error: string | null) => set({ error }),
  setLoading: (loading: boolean) => set({ isLoading: loading })
}));
