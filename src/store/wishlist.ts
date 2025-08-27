import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockMarketplaceAPI } from '../services/mockMarketplaceAPI';

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

interface WishlistStore {
  // State
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  moveToCart: (productId: number, quantity?: number) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Computed
  getWishlistCount: () => number;
  isInWishlist: (productId: number) => boolean;
  getWishlistItem: (productId: number) => WishlistItem | undefined;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isLoading: false,
      error: null,

      // Actions
      fetchWishlist: async () => {
        set({ isLoading: true, error: null });
              try {
        const wishlistData = await mockMarketplaceAPI.getWishlist();
        set({ items: wishlistData, isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch wishlist',
          isLoading: false 
        });
      }
      },

            addToWishlist: async (productId: number) => {
        console.log('Wishlist store: Adding to wishlist', productId);
        set({ isLoading: true, error: null });
        try {
          await mockMarketplaceAPI.addToWishlist(productId);
          // Refresh wishlist after adding
          const wishlistData = await mockMarketplaceAPI.getWishlist();
          console.log('Wishlist store: Updated wishlist', wishlistData);
          set({ items: wishlistData, isLoading: false });
        } catch (error) {
          console.error('Wishlist store: Error adding to wishlist', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add to wishlist',
            isLoading: false 
          });
        }
      },

      removeFromWishlist: async (productId: number) => {
        set({ isLoading: true, error: null });
              try {
        await mockMarketplaceAPI.removeFromWishlist(productId);
        // Refresh wishlist after removal
        const wishlistData = await mockMarketplaceAPI.getWishlist();
        set({ items: wishlistData, isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to remove from wishlist',
          isLoading: false 
        });
      }
      },

      moveToCart: async (productId: number, quantity: number = 1) => {
        set({ isLoading: true, error: null });
              try {
        await mockMarketplaceAPI.moveToCart(productId, quantity);
        // Refresh wishlist after moving to cart
        const wishlistData = await mockMarketplaceAPI.getWishlist();
        set({ items: wishlistData, isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to move to cart',
          isLoading: false 
        });
      }
      },

      setError: (error: string | null) => set({ error }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      // Computed values
      getWishlistCount: () => {
        const { items } = get();
        return items.length;
      },

      isInWishlist: (productId: number) => {
        const { items } = get();
        return items.some(item => item.productId === productId);
      },

      getWishlistItem: (productId: number) => {
        const { items } = get();
        return items.find(item => item.productId === productId);
      }
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ items: state.items })
    }
  )
);
