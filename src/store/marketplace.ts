import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  brand: string
  rating: number
  reviewCount: number
  inStock: boolean
  stockCount: number
  tags: string[]
  specifications: Record<string, string>
  features: string[]
  shipping: {
    free: boolean
    cost: number
    estimatedDays: string
  }
  returnPolicy: string
  warranty: string
}

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  selectedOptions?: Record<string, string>
}

export interface Order {
  id: string
  items: CartItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  orderDate: Date
  estimatedDelivery?: Date
  shippingAddress: Address
  paymentMethod: PaymentMethod
}

export interface Address {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'paypal' | 'apple-pay' | 'google-pay'
  last4?: string
  brand?: string
  isDefault: boolean
}

interface MarketplaceState {
  products: Product[]
  cart: CartItem[]
  orders: Order[]
  addresses: Address[]
  paymentMethods: PaymentMethod[]
  wishlist: string[]
  isLoading: boolean
  error: string | null
  
  // Actions
  addToCart: (product: Product, quantity?: number, options?: Record<string, string>) => void
  removeFromCart: (itemId: string) => void
  updateCartItemQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  createOrder: (orderData: Omit<Order, 'id' | 'orderDate'>) => void
  addAddress: (address: Omit<Address, 'id'>) => void
  updateAddress: (id: string, updates: Partial<Address>) => void
  deleteAddress: (id: string) => void
  addPaymentMethod: (paymentMethod: Omit<PaymentMethod, 'id'>) => void
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => void
  deletePaymentMethod: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      products: [
        {
          id: '1',
          name: 'Wireless Noise-Cancelling Headphones',
          description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear sound quality. Perfect for work, travel, and entertainment.',
          price: 299.99,
          originalPrice: 399.99,
          images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&h=600&fit=crop'
          ],
          category: 'Electronics',
          brand: 'AudioTech Pro',
          rating: 4.8,
          reviewCount: 1247,
          inStock: true,
          stockCount: 45,
          tags: ['wireless', 'noise-cancelling', 'bluetooth', 'premium'],
          specifications: {
            'Battery Life': '30 hours',
            'Connectivity': 'Bluetooth 5.0',
            'Weight': '250g',
            'Driver Size': '40mm',
            'Frequency Response': '20Hz-20kHz'
          },
          features: [
            'Active Noise Cancellation',
            '30-hour battery life',
            'Quick charge (10 min = 5 hours)',
            'Touch controls',
            'Voice assistant support',
            'Foldable design'
          ],
          shipping: {
            free: true,
            cost: 0,
            estimatedDays: '2-3 business days'
          },
          returnPolicy: '30-day free returns',
          warranty: '2-year manufacturer warranty'
        },
        {
          id: '2',
          name: 'Smart Fitness Watch',
          description: 'Advanced fitness tracking with heart rate monitoring, GPS, sleep tracking, and 7-day battery life. Water-resistant and compatible with iOS and Android.',
          price: 199.99,
          originalPrice: 249.99,
          images: [
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&h=600&fit=crop'
          ],
          category: 'Electronics',
          brand: 'FitTech',
          rating: 4.6,
          reviewCount: 892,
          inStock: true,
          stockCount: 67,
          tags: ['fitness', 'smartwatch', 'health', 'tracking'],
          specifications: {
            'Display': '1.4" AMOLED',
            'Battery Life': '7 days',
            'Water Resistance': '5ATM',
            'GPS': 'Built-in',
            'Heart Rate': '24/7 monitoring'
          },
          features: [
            'Heart rate monitoring',
            'GPS tracking',
            'Sleep analysis',
            'Workout detection',
            'Water resistant',
            'Smart notifications'
          ],
          shipping: {
            free: true,
            cost: 0,
            estimatedDays: '1-2 business days'
          },
          returnPolicy: '30-day free returns',
          warranty: '1-year manufacturer warranty'
        },
        {
          id: '3',
          name: 'Ergonomic Laptop Stand',
          description: 'Adjustable aluminum laptop stand that elevates your screen to eye level, improving posture and reducing neck strain. Compatible with laptops up to 17 inches.',
          price: 89.99,
          images: [
            'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=600&fit=crop'
          ],
          category: 'Accessories',
          brand: 'ErgoTech',
          rating: 4.7,
          reviewCount: 456,
          inStock: true,
          stockCount: 23,
          tags: ['ergonomic', 'laptop', 'stand', 'adjustable'],
          specifications: {
            'Material': 'Aluminum',
            'Max Weight': '4kg',
            'Height Range': '10-20cm',
            'Compatibility': 'Up to 17" laptops',
            'Weight': '800g'
          },
          features: [
            'Adjustable height',
            'Aluminum construction',
            'Non-slip base',
            'Cable management',
            'Portable design',
            'Heat dissipation'
          ],
          shipping: {
            free: false,
            cost: 9.99,
            estimatedDays: '3-5 business days'
          },
          returnPolicy: '30-day free returns',
          warranty: '1-year warranty'
        },
        {
          id: '4',
          name: 'Smart Coffee Maker',
          description: 'WiFi-enabled coffee maker with programmable brewing, smartphone control, and built-in grinder. Makes perfect coffee every time with customizable strength settings.',
          price: 179.99,
          originalPrice: 229.99,
          images: [
            'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=600&fit=crop'
          ],
          category: 'Home & Kitchen',
          brand: 'BrewTech',
          rating: 4.5,
          reviewCount: 634,
          inStock: true,
          stockCount: 34,
          tags: ['smart', 'coffee', 'wifi', 'programmable'],
          specifications: {
            'Capacity': '12 cups',
            'Power': '1200W',
            'Connectivity': 'WiFi + Bluetooth',
            'Grinder': 'Built-in conical',
            'Material': 'Stainless steel'
          },
          features: [
            'WiFi connectivity',
            'Smartphone app control',
            'Built-in grinder',
            'Programmable brewing',
            'Strength control',
            'Auto-clean function'
          ],
          shipping: {
            free: true,
            cost: 0,
            estimatedDays: '2-4 business days'
          },
          returnPolicy: '30-day free returns',
          warranty: '2-year warranty'
        },
        {
          id: '5',
          name: 'Wireless Charging Pad',
          description: 'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicators and overcharge protection.',
          price: 49.99,
          originalPrice: 69.99,
          images: [
            'https://images.unsplash.com/photo-1609592806598-04d5d2c4d3e8?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1609592806598-04d5d2c4d3e8?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1609592806598-04d5d2c4d3e8?w=600&h=600&fit=crop'
          ],
          category: 'Electronics',
          brand: 'ChargeTech',
          rating: 4.4,
          reviewCount: 789,
          inStock: true,
          stockCount: 89,
          tags: ['wireless', 'charging', 'qi', 'fast-charging'],
          specifications: {
            'Output': '15W max',
            'Compatibility': 'Qi-enabled devices',
            'Material': 'Silicone + ABS',
            'LED Indicator': 'Yes',
            'Protection': 'Overcharge, overheat'
          },
          features: [
            'Fast wireless charging',
            'LED status indicator',
            'Overcharge protection',
            'Non-slip surface',
            'Compact design',
            'Universal compatibility'
          ],
          shipping: {
            free: true,
            cost: 0,
            estimatedDays: '1-3 business days'
          },
          returnPolicy: '30-day free returns',
          warranty: '1-year warranty'
        },
        {
          id: '6',
          name: 'Portable Bluetooth Speaker',
          description: 'Waterproof portable speaker with 360-degree sound, 20-hour battery life, and built-in microphone for calls. Perfect for outdoor activities and parties.',
          price: 129.99,
          originalPrice: 159.99,
          images: [
            'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop'
          ],
          category: 'Electronics',
          brand: 'SoundTech',
          rating: 4.6,
          reviewCount: 567,
          inStock: true,
          stockCount: 56,
          tags: ['portable', 'bluetooth', 'waterproof', 'speaker'],
          specifications: {
            'Battery Life': '20 hours',
            'Water Resistance': 'IPX7',
            'Connectivity': 'Bluetooth 5.0',
            'Output Power': '20W',
            'Weight': '600g'
          },
          features: [
            '360-degree sound',
            'Waterproof design',
            '20-hour battery life',
            'Built-in microphone',
            'Party mode',
            'Durable construction'
          ],
          shipping: {
            free: true,
            cost: 0,
            estimatedDays: '2-3 business days'
          },
          returnPolicy: '30-day free returns',
          warranty: '1-year warranty'
        }
      ],
      cart: [],
      orders: [],
      addresses: [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          address: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States',
          isDefault: true
        }
      ],
      paymentMethods: [
        {
          id: '1',
          type: 'card',
          last4: '4242',
          brand: 'Visa',
          isDefault: true
        }
      ],
      wishlist: [],
      isLoading: false,
      error: null,

      addToCart: (product, quantity = 1, options = {}) => {
        const { cart } = get()
        const existingItem = cart.find(item => 
          item.productId === product.id && 
          JSON.stringify(item.selectedOptions) === JSON.stringify(options)
        )

        if (existingItem) {
          set({
            cart: cart.map(item =>
              item.id === existingItem.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          })
        } else {
          const newItem: CartItem = {
            id: `cart_${Date.now()}_${Math.random()}`,
            productId: product.id,
            product,
            quantity,
            selectedOptions: options
          }
          set({ cart: [...cart, newItem] })
        }
      },

      removeFromCart: (itemId) => {
        const { cart } = get()
        set({ cart: cart.filter(item => item.id !== itemId) })
      },

      updateCartItemQuantity: (itemId, quantity) => {
        const { cart } = get()
        if (quantity <= 0) {
          set({ cart: cart.filter(item => item.id !== itemId) })
        } else {
          set({
            cart: cart.map(item =>
              item.id === itemId ? { ...item, quantity } : item
            )
          })
        }
      },

      clearCart: () => set({ cart: [] }),

      addToWishlist: (productId) => {
        const { wishlist } = get()
        if (!wishlist.includes(productId)) {
          set({ wishlist: [...wishlist, productId] })
        }
      },

      removeFromWishlist: (productId) => {
        const { wishlist } = get()
        set({ wishlist: wishlist.filter(id => id !== productId) })
      },

      createOrder: (orderData) => {
        const { orders } = get()
        const newOrder: Order = {
          ...orderData,
          id: `order_${Date.now()}_${Math.random()}`,
          orderDate: new Date()
        }
        set({ orders: [...orders, newOrder] })
      },

      addAddress: (addressData) => {
        const { addresses } = get()
        const newAddress: Address = {
          ...addressData,
          id: `addr_${Date.now()}_${Math.random()}`
        }
        set({ addresses: [...addresses, newAddress] })
      },

      updateAddress: (id, updates) => {
        const { addresses } = get()
        set({
          addresses: addresses.map(addr =>
            addr.id === id ? { ...addr, ...updates } : addr
          )
        })
      },

      deleteAddress: (id) => {
        const { addresses } = get()
        set({ addresses: addresses.filter(addr => addr.id !== id) })
      },

      addPaymentMethod: (paymentData) => {
        const { paymentMethods } = get()
        const newPayment: PaymentMethod = {
          ...paymentData,
          id: `pay_${Date.now()}_${Math.random()}`
        }
        set({ paymentMethods: [...paymentMethods, newPayment] })
      },

      updatePaymentMethod: (id, updates) => {
        const { paymentMethods } = get()
        set({
          paymentMethods: paymentMethods.map(pay =>
            pay.id === id ? { ...pay, ...updates } : pay
          )
        })
      },

      deletePaymentMethod: (id) => {
        const { paymentMethods } = get()
        set({ paymentMethods: paymentMethods.filter(pay => pay.id !== id) })
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'marketplace-storage',
      partialize: (state) => ({
        cart: state.cart,
        orders: state.orders,
        addresses: state.addresses,
        paymentMethods: state.paymentMethods,
        wishlist: state.wishlist
      })
    }
  )
)
