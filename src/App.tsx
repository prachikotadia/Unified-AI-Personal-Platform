import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import { useThemeStore } from './store/theme'
import { NotificationProvider } from './contexts/NotificationContext'
import { useEffect } from 'react'

// Security
import { initializeSecurity } from './utils/security'

// Performance
import { performanceManager } from './utils/performance'

// UI Components
import { ToastProvider } from './components/ui/Toast'
import { PageErrorBoundary } from './components/ui/ErrorBoundary'
import PWAServiceWorker from './components/ui/PWAServiceWorker'

// Layout Components
import Layout from './components/layout/Layout'
import AuthLayout from './components/layout/AuthLayout'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'

// Main Pages
import DashboardPage from './pages/DashboardPage'
import FinancePage from './pages/finance/FinancePage'
import TransactionsPage from './pages/finance/TransactionsPage'
import BudgetsPage from './pages/finance/BudgetsPage'
import ForecastPage from './pages/finance/ForecastPage'
import ReportsPage from './pages/finance/ReportsPage'
import MarketplacePage from './pages/marketplace/MarketplacePage'
import ProductPage from './pages/marketplace/ProductPage'
import CartPage from './pages/marketplace/CartPage'
import OrdersPage from './pages/marketplace/OrdersPage'
import FitnessPage from './pages/fitness/FitnessPage'
import WorkoutsPage from './pages/fitness/WorkoutsPage'
import NutritionPage from './pages/fitness/NutritionPage'
import AchievementsPage from './pages/fitness/AchievementsPage'
import WorkoutPlansPage from './pages/fitness/WorkoutPlansPage'
import ExerciseLibraryPage from './pages/fitness/ExerciseLibraryPage'
import ProgressPage from './pages/fitness/ProgressPage'
import MeasurementsPage from './pages/fitness/MeasurementsPage'
import SleepPage from './pages/fitness/SleepPage'
import TravelPage from './pages/travel/TravelPage'
import TravelSearchPage from './pages/travel/TravelSearchPage'
import ItineraryPage from './pages/travel/ItineraryPage'
import SocialPage from './pages/social/SocialPage'
import SocialFeedPage from './pages/social/SocialFeedPage'
import SharedItemsPage from './pages/social/SharedItemsPage'
import ChatPage from './pages/chat/ChatPage'
import ChatRoomPage from './pages/chat/ChatRoomPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import TravelPriceAlertsPage from './pages/travel/PriceAlertsPage'
import PlaceOrderPage from './pages/marketplace/PlaceOrderPage'
import AddressPage from './pages/marketplace/AddressPage'
import ReviewPage from './pages/marketplace/ReviewPage'
import PaymentPage from './pages/marketplace/PaymentPage'
import OrderSuccessPage from './pages/marketplace/OrderSuccessPage'
import OrderDetailsPage from './pages/marketplace/OrderDetailsPage'
import WishlistPage from './pages/marketplace/WishlistPage'
import SearchResultsPage from './pages/marketplace/SearchResultsPage'
import CategoryPage from './pages/marketplace/CategoryPage'
import AccountSettingsPage from './pages/marketplace/AccountSettingsPage'
import AIRecommendationsPage from './pages/marketplace/AIRecommendationsPage'
import PriceAlertsPage from './pages/marketplace/PriceAlertsPage'
import ProductComparisonPage from './pages/marketplace/ProductComparisonPage'
import RecentlyViewedPage from './pages/marketplace/RecentlyViewedPage'
import QAModerationPage from './pages/marketplace/QAModerationPage'
import TestPage from './pages/marketplace/TestPage'
import DebugCheckoutPage from './pages/marketplace/DebugCheckoutPage'
import TestCheckoutFlow from './pages/marketplace/TestCheckoutFlow'
import SimplePaymentTest from './pages/marketplace/SimplePaymentTest'
import MinimalPaymentPage from './pages/marketplace/MinimalPaymentPage'

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  const { theme } = useThemeStore()

  useEffect(() => {
    // Apply theme class to document
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [theme])

  useEffect(() => {
    // Initialize security features
    initializeSecurity()
    
    // Initialize performance features
    // Note: Preloading disabled since we're using mock API
    // performanceManager.preloadResources([
    //   '/api/products',
    //   '/api/categories',
    //   '/api/user/profile'
    // ])
  }, [])

  return (
    <PageErrorBoundary>
      <ToastProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gradient-to-br from-light-grey to-white dark:from-charcoal-grey dark:to-black">
        <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        } />
        <Route path="/signup" element={
          <AuthLayout>
            <SignupPage />
          </AuthLayout>
        } />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          
                  {/* Finance Routes */}
        <Route path="finance" element={<FinancePage />} />
        <Route path="finance/transactions" element={<TransactionsPage />} />
        <Route path="finance/budgets" element={<BudgetsPage />} />
        <Route path="finance/forecast" element={<ForecastPage />} />
        <Route path="finance/reports" element={<ReportsPage />} />
          
                          {/* Marketplace Routes */}
                <Route path="marketplace" element={<MarketplacePage />} />
                <Route path="marketplace/product/:id" element={<ProductPage />} />
                <Route path="marketplace/cart" element={<CartPage />} />
                <Route path="marketplace/checkout/success" element={<OrderSuccessPage />} />
                <Route path="marketplace/checkout/payment" element={<PaymentPage />} />
                <Route path="marketplace/checkout/review" element={<ReviewPage />} />
                <Route path="marketplace/checkout/address" element={<AddressPage />} />
                <Route path="marketplace/checkout" element={<PlaceOrderPage />} />
                <Route path="marketplace/orders" element={<OrdersPage />} />
                <Route path="marketplace/orders/:orderId" element={<OrderDetailsPage />} />
                <Route path="marketplace/wishlist" element={<WishlistPage />} />
                <Route path="marketplace/search" element={<SearchResultsPage />} />
                <Route path="marketplace/category/:slug" element={<CategoryPage />} />
                <Route path="marketplace/account" element={<AccountSettingsPage />} />
                <Route path="marketplace/recommendations" element={<AIRecommendationsPage />} />
                <Route path="marketplace/price-alerts" element={<PriceAlertsPage />} />
                <Route path="marketplace/compare" element={<ProductComparisonPage />} />
                <Route path="marketplace/recently-viewed" element={<RecentlyViewedPage />} />
                <Route path="marketplace/qa-moderation" element={<QAModerationPage />} />
                <Route path="marketplace/test" element={<TestPage />} />
                <Route path="marketplace/debug-checkout" element={<DebugCheckoutPage />} />
                <Route path="marketplace/test-checkout" element={<TestCheckoutFlow />} />
                <Route path="marketplace/simple-payment" element={<SimplePaymentTest />} />
                <Route path="marketplace/minimal-payment" element={<MinimalPaymentPage />} />
          
          {/* Fitness Routes */}
          <Route path="fitness" element={<FitnessPage />} />
          <Route path="fitness/workouts" element={<WorkoutsPage />} />
          <Route path="fitness/nutrition" element={<NutritionPage />} />
          <Route path="fitness/achievements" element={<AchievementsPage />} />
          <Route path="fitness/plans" element={<WorkoutPlansPage />} />
          <Route path="fitness/exercises" element={<ExerciseLibraryPage />} />
          <Route path="fitness/progress" element={<ProgressPage />} />
          <Route path="fitness/measurements" element={<MeasurementsPage />} />
          <Route path="fitness/sleep" element={<SleepPage />} />
          
          {/* Travel Routes */}
          <Route path="travel" element={<TravelPage />} />
          <Route path="travel/search" element={<TravelSearchPage />} />
          <Route path="travel/itinerary/:id" element={<ItineraryPage />} />
          <Route path="travel/alerts" element={<TravelPriceAlertsPage />} />
          
          {/* Social Routes */}
          <Route path="social" element={<SocialPage />} />
          <Route path="social/feed" element={<SocialFeedPage />} />
          <Route path="social/shared" element={<SharedItemsPage />} />
          
          {/* Chat Routes */}
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:roomId" element={<ChatRoomPage />} />
          
          {/* Profile Routes */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </div>
        </NotificationProvider>
        
        {/* PWA Service Worker */}
        <PWAServiceWorker />
      </ToastProvider>
    </PageErrorBoundary>
  )
}

export default App
