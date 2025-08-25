import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';
import ProfilePage from './pages/auth/ProfilePage';
import DevOpsDashboard from './pages/DevOpsDashboard';
import SettingsPage from './pages/SettingsPage';

// Finance pages
import FinancePage from './pages/finance/FinancePage';
import TransactionsPage from './pages/finance/TransactionsPage';
import BudgetsPage from './pages/finance/BudgetsPage';
import ForecastPage from './pages/finance/ForecastPage';

// Fitness pages
import FitnessPage from './pages/fitness/FitnessPage';
import WorkoutsPage from './pages/fitness/WorkoutsPage';
import NutritionPage from './pages/fitness/NutritionPage';
import AchievementsPage from './pages/fitness/AchievementsPage';

// Travel pages
import TravelPage from './pages/travel/TravelPage';
import TravelSearchPage from './pages/travel/TravelSearchPage';
import ItineraryPage from './pages/travel/ItineraryPage';
import PriceAlertsPage from './pages/travel/PriceAlertsPage';

// Social pages
import SocialPage from './pages/social/SocialPage';
import SocialFeedPage from './pages/social/SocialFeedPage';
import SharedItemsPage from './pages/social/SharedItemsPage';

// Chat pages
import ChatPage from './pages/chat/ChatPage';
import ChatRoomPage from './pages/chat/ChatRoomPage';

// Marketplace pages
import MarketplacePage from './pages/marketplace/MarketplacePage';
import ProductPage from './pages/marketplace/ProductPage';
import CartPage from './pages/marketplace/CartPage';
import CheckoutPage from './pages/marketplace/CheckoutPage';
import OrdersPage from './pages/marketplace/OrdersPage';
import OrderDetailsPage from './pages/marketplace/OrderDetailsPage';
import WishlistPage from './pages/marketplace/WishlistPage';
import SearchResultsPage from './pages/marketplace/SearchResultsPage';
import CategoryPage from './pages/marketplace/CategoryPage';
import AccountSettingsPage from './pages/marketplace/AccountSettingsPage';
import ReturnsPage from './pages/marketplace/ReturnsPage';

function App() {
  return (
    <Router future={{ v7_relativeSplatPath: true }}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          },
        }}
      />
      <Routes>
        {/* Auth routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/verify-email" element={<EmailVerificationPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Main app routes */}
        <Route path="/" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/devops" element={<Layout><DevOpsDashboard /></Layout>} />
        <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />

        {/* Finance routes */}
        <Route path="/finance" element={<Layout><FinancePage /></Layout>} />
        <Route path="/finance/transactions" element={<Layout><TransactionsPage /></Layout>} />
        <Route path="/finance/budgets" element={<Layout><BudgetsPage /></Layout>} />
        <Route path="/finance/forecast" element={<Layout><ForecastPage /></Layout>} />

        {/* Fitness routes */}
        <Route path="/fitness" element={<Layout><FitnessPage /></Layout>} />
        <Route path="/fitness/workouts" element={<Layout><WorkoutsPage /></Layout>} />
        <Route path="/fitness/nutrition" element={<Layout><NutritionPage /></Layout>} />
        <Route path="/fitness/achievements" element={<Layout><AchievementsPage /></Layout>} />

        {/* Travel routes */}
        <Route path="/travel" element={<Layout><TravelPage /></Layout>} />
        <Route path="/travel/search" element={<Layout><TravelSearchPage /></Layout>} />
        <Route path="/travel/itinerary" element={<Layout><ItineraryPage /></Layout>} />
        <Route path="/travel/price-alerts" element={<Layout><PriceAlertsPage /></Layout>} />

        {/* Social routes */}
        <Route path="/social" element={<Layout><SocialPage /></Layout>} />
        <Route path="/social/feed" element={<Layout><SocialFeedPage /></Layout>} />
        <Route path="/social/shared" element={<Layout><SharedItemsPage /></Layout>} />

        {/* Chat routes */}
        <Route path="/chat" element={<Layout><ChatPage /></Layout>} />
        <Route path="/chat/:roomId" element={<Layout><ChatRoomPage /></Layout>} />

        {/* Marketplace routes */}
        <Route path="/marketplace" element={<Layout><MarketplacePage /></Layout>} />
        <Route path="/marketplace/product/:id" element={<Layout><ProductPage /></Layout>} />
        <Route path="/marketplace/cart" element={<Layout><CartPage /></Layout>} />
        <Route path="/marketplace/checkout" element={<Layout><CheckoutPage /></Layout>} />
        <Route path="/marketplace/orders" element={<Layout><OrdersPage /></Layout>} />
        <Route path="/marketplace/orders/:id" element={<Layout><OrderDetailsPage /></Layout>} />
        <Route path="/marketplace/wishlist" element={<Layout><WishlistPage /></Layout>} />
        <Route path="/marketplace/search" element={<Layout><SearchResultsPage /></Layout>} />
        <Route path="/marketplace/category/:slug" element={<Layout><CategoryPage /></Layout>} />
        <Route path="/marketplace/account" element={<Layout><AccountSettingsPage /></Layout>} />
        <Route path="/marketplace/returns" element={<Layout><ReturnsPage /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
