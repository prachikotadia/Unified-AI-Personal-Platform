import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Target, 
  Users, 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye,
  Zap,
  ArrowLeft,
  Filter,
  RefreshCw,
  BarChart3,
  Gift,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Settings,
  BookOpen,
  Lightbulb,
  Package,
  X,
  Save,
  HelpCircle
} from 'lucide-react';
import AIRecommendations from '../../components/marketplace/AIRecommendations';
import PersonalizedDashboard from '../../components/marketplace/PersonalizedDashboard';
import PreferencesModal from '../../components/marketplace/PreferencesModal';
import AIReasoningModal from '../../components/marketplace/AIReasoningModal';
import { useToastHelpers } from '../../components/ui/Toast';

interface RecommendationCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  type: 'personalized' | 'customers-also-bought' | 'trending' | 'similar-products';
}

const AIRecommendationsPage: React.FC = () => {
  const { success, error: showError } = useToastHelpers();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any[]>([]);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showReasoningModal, setShowReasoningModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);

  const recommendationCategories: RecommendationCategory[] = [
    {
      id: 'personalized',
      name: 'Personalized for You',
      description: 'Based on your browsing history and preferences',
      icon: <Brain className="w-5 h-5" />,
      count: 12,
      type: 'personalized'
    },
    {
      id: 'trending',
      name: 'Trending Now',
      description: 'Popular products this week',
      icon: <TrendingUp className="w-5 h-5" />,
      count: 8,
      type: 'trending'
    },
    {
      id: 'customers-also-bought',
      name: 'Frequently Bought Together',
      description: 'Products customers often purchase together',
      icon: <Users className="w-5 h-5" />,
      count: 6,
      type: 'customers-also-bought'
    },
    {
      id: 'similar-products',
      name: 'Similar to Your Favorites',
      description: 'Products similar to items you love',
      icon: <Target className="w-5 h-5" />,
      count: 10,
      type: 'similar-products'
    }
  ];

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        
        // Mock insights data
        const mockInsights = [
          {
            id: '1',
            type: 'preference',
            title: 'You love premium electronics',
            description: 'Based on your recent purchases, you prefer high-end electronics. We\'ve found some great deals on premium devices.',
            icon: <Target className="w-5 h-5" />,
            color: 'blue'
          },
          {
            id: '2',
            type: 'trend',
            title: 'Smartphone interest increasing',
            description: 'You\'ve been browsing smartphones 40% more this month. New models are coming soon!',
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'green'
          },
          {
            id: '3',
            type: 'opportunity',
            title: 'Price drop alert',
            description: 'Several items in your wishlist have dropped in price. Perfect time to buy!',
            icon: <Gift className="w-5 h-5" />,
            color: 'orange'
          }
        ];

        await new Promise(resolve => setTimeout(resolve, 1000));
        setInsights(mockInsights);
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const getActiveCategory = () => {
    if (activeCategory === 'all') return null;
    return recommendationCategories.find(cat => cat.id === activeCategory);
  };

  const handleRefreshRecommendations = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    success('Recommendations Refreshed', 'New recommendations have been loaded');
  };

  const handleSavePreferences = (newPreferences: any) => {
    setPreferences(newPreferences);
    success('Preferences Saved', 'Your preferences have been updated');
    // Refresh recommendations with new preferences
    handleRefreshRecommendations();
  };

  const handleWhyRecommended = (product: any) => {
    setSelectedProduct(product);
    setShowReasoningModal(true);
  };

  const handleNotInterested = (productId: string) => {
    // In a real app, this would send feedback to the AI system
    success('Feedback Recorded', 'We\'ll show you fewer similar products');
  };

  const handleSaveRecommendationList = () => {
    // In a real app, this would save the current recommendations
    success('List Saved', 'Your recommendation list has been saved');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/marketplace" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft size={20} className="mr-2" />
                Back to Marketplace
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-blue-600">
                <Brain className="w-6 h-6" />
                <h1 className="text-2xl font-bold text-gray-900">AI Recommendations</h1>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
                <Zap className="w-3 h-3" />
                <span>Powered by AI</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreferencesModal(true)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Settings className="w-4 h-4 mr-1" />
                Customize Preferences
              </button>
              <button
                onClick={handleRefreshRecommendations}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>All Recommendations</span>
            </button>
            {recommendationCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
                <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-lg p-4 ${
                  insight.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                  insight.color === 'green' ? 'bg-green-50 border-green-200' :
                  'bg-orange-50 border-orange-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {insight.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{insight.title}</h4>
                    <p className="text-sm opacity-90">{insight.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Recommendations */}
        <div className="space-y-6">
          {activeCategory === 'all' ? (
            // Show all recommendation types
            <>
              <AIRecommendations 
                type="personalized"
                limit={6}
                title="Personalized for You"
                showReason={true}
                showConfidence={true}
                onWhyRecommended={handleWhyRecommended}
                onNotInterested={handleNotInterested}
              />
              
              <AIRecommendations 
                type="trending"
                limit={6}
                title="Trending Now"
                onWhyRecommended={handleWhyRecommended}
                onNotInterested={handleNotInterested}
              />
              
              <AIRecommendations 
                type="customers-also-bought"
                limit={6}
                title="Frequently Bought Together"
                showReason={true}
                onWhyRecommended={handleWhyRecommended}
                onNotInterested={handleNotInterested}
              />
              
              <AIRecommendations 
                type="similar-products"
                limit={6}
                title="Similar to Your Favorites"
                showConfidence={true}
                onWhyRecommended={handleWhyRecommended}
                onNotInterested={handleNotInterested}
              />
            </>
          ) : (
            // Show specific category
            <AIRecommendations 
              type={getActiveCategory()?.type || 'personalized'}
              limit={12}
              title={getActiveCategory()?.name || 'Recommendations'}
              showReason={true}
              showConfidence={true}
              onWhyRecommended={handleWhyRecommended}
              onNotInterested={handleNotInterested}
            />
          )}
        </div>

        {/* Save Recommendation List */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <button
              onClick={handleSaveRecommendationList}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={16} />
              Save Recommendation List
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/marketplace"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Browse All Products</p>
                <p className="text-sm text-gray-600">Explore the full catalog</p>
              </div>
            </Link>
            
            <Link
              to="/marketplace/wishlist"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Heart className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-gray-900">View Wishlist</p>
                <p className="text-sm text-gray-600">Your saved items</p>
              </div>
            </Link>
            
            <Link
              to="/marketplace/cart"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Shopping Cart</p>
                <p className="text-sm text-gray-600">Review your cart</p>
              </div>
            </Link>
            
            <Link
              to="/marketplace/orders"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Order History</p>
                <p className="text-sm text-gray-600">Track your orders</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Modals */}
        <PreferencesModal
          isOpen={showPreferencesModal}
          onClose={() => setShowPreferencesModal(false)}
          onSave={handleSavePreferences}
          initialPreferences={preferences}
        />

        {selectedProduct && (
          <AIReasoningModal
            isOpen={showReasoningModal}
            onClose={() => {
              setShowReasoningModal(false);
              setSelectedProduct(null);
            }}
            productName={selectedProduct.name}
            reason={selectedProduct.reason || 'Based on your browsing history and preferences'}
            confidence={selectedProduct.confidence}
            factors={[
              'Matches your browsing history',
              'Similar to products you\'ve viewed',
              'High customer ratings',
              'Popular with similar users'
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default AIRecommendationsPage;
