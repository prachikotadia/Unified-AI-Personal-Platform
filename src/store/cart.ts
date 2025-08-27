import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockMarketplaceAPI } from '../services/mockMarketplaceAPI';

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

interface CartStore {
  // State
  cart: Cart;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Computed
  getCartItemCount: () => number;
  getCartTotal: () => number;
  getCartSavings: () => number;
  isInCart: (productId: number) => boolean;
  getCartItem: (productId: number) => CartItem | undefined;
}

const initialCart: Cart = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  totalSavings: 0
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      cart: initialCart,
      isLoading: false,
      error: null,

      // Actions
      fetchCart: async () => {
        set({ isLoading: true, error: null });
              try {
        const cartData = await mockMarketplaceAPI.getCart();
        set({ cart: cartData, isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch cart',
          isLoading: false 
        });
      }
      },

            addToCart: async (productId: number, quantity: number = 1) => {
        console.log('Cart store: Adding to cart', productId, quantity);
        set({ isLoading: true, error: null });
        try {
          const updatedCart = await mockMarketplaceAPI.addToCart(productId, quantity);
          console.log('Cart store: Updated cart', updatedCart);
          set({ cart: updatedCart, isLoading: false });
        } catch (error) {
          console.error('Cart store: Error adding to cart', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add to cart',
            isLoading: false 
          });
        }
      },

      updateCartItem: async (itemId: number, quantity: number) => {
        set({ isLoading: true, error: null });
              try {
        const updatedCart = await mockMarketplaceAPI.updateCartItem(itemId, quantity);
        set({ cart: updatedCart, isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to update cart item',
          isLoading: false 
        });
      }
      },

      removeFromCart: async (itemId: number) => {
        set({ isLoading: true, error: null });
              try {
        await mockMarketplaceAPI.removeFromCart(itemId);
        // Refresh cart after removal
        const cartData = await mockMarketplaceAPI.getCart();
        set({ cart: cartData, isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to remove from cart',
          isLoading: false 
        });
      }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });
              try {
        await mockMarketplaceAPI.clearCart();
        set({ cart: initialCart, isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to clear cart',
          isLoading: false 
        });
      }
      },

      setError: (error: string | null) => set({ error }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      // Computed values
      getCartItemCount: () => {
        const { cart } = get();
        return cart.items.reduce((total, item) => total + item.quantity, 0);
      },

      getCartTotal: () => {
        const { cart } = get();
        return cart.items.reduce((total, item) => {
          return total + (item.product.price * item.quantity);
        }, 0);
      },

      getCartSavings: () => {
        const { cart } = get();
        return cart.items.reduce((total, item) => {
          const originalPrice = item.product.originalPrice || item.product.price;
          const savings = (originalPrice - item.product.price) * item.quantity;
          return total + savings;
        }, 0);
      },

      isInCart: (productId: number) => {
        const { cart } = get();
        return cart.items.some(item => item.productId === productId);
      },

      getCartItem: (productId: number) => {
        const { cart } = get();
        return cart.items.find(item => item.productId === productId);
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ cart: state.cart })
    }
  )
);
