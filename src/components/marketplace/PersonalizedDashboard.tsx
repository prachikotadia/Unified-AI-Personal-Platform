import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye,
  Zap,
  Target,
  Users,
  Clock,
  ArrowRight,
  BarChart3,
  Sparkles,
  Gift,
  AlertCircle,
  CheckCircle,
  Calendar,
  MapPin,
  Filter,
  RefreshCw
} from 'lucide-react';
import AIRecommendations from './AIRecommendations';

interface UserInsight {
  id: string;
  type: 'preference' | 'trend' | 'opportunity' | 'alert';
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action?: {
    label: string;
    url: string;
  };
}

interface CategoryPreference {
  category: string;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  products: number;
}

interface PersonalizedDashboardProps {
  userId?: string;
}

const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({ userId }) => {
  const [insights, setInsights] = useState<UserInsight[]>([]);
  const [categoryPreferences, setCategoryPreferences] = useState<CategoryPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'insights'>('overview');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Mock insights data
        const mockInsights: UserInsight[] = [
          {
            id: '1',
            type: 'preference',
            title: 'You love Apple products',
            description: 'Based on your recent purchases, you prefer Apple devices. We\'ve found some great deals on Apple accessories.',
            icon: <Target className="w-5 h-5" />,
            color: 'blue',
            action: {
              label: 'View Apple deals',
              url: '/marketplace?brand=apple&deals=true'
            }
          },
          {
            id: '2',
            type: 'trend',
            title: 'Smartphone interest increasing',
            description: 'You\'ve been browsing smartphones 40% more this month. New models are coming soon!',
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'green',
            action: {
              label: 'Explore smartphones',
              url: '/marketplace?category=electronics&subcategory=smartphones'
            }
          },
          {
            id: '3',
            type: 'opportunity',
            title: 'Price drop alert',
            description: 'Sony WH-1000XM4 headphones dropped 15% in price. Perfect timing for your wishlist!',
            icon: <Gift className="w-5 h-5" />,
            color: 'orange',
            action: {
              label: 'View deal',
              url: '/marketplace/product/2'
            }
          },
          {
            id: '4',
            type: 'alert',
            title: 'Wishlist item back in stock',
            description: 'Apple Watch Series 9 is back in stock and ready for delivery.',
            icon: <CheckCircle className="w-5 h-5" />,
            color: 'green',
            action: {
              label: 'Buy now',
              url: '/marketplace/product/5'
            }
          }
        ];

        const mockCategoryPreferences: CategoryPreference[] = [
          { category: 'Electronics', percentage: 45, trend: 'up', products: 12 },
          { category: 'Home & Garden', percentage: 25, trend: 'stable', products: 8 },
          { category: 'Fashion', percentage: 20, trend: 'down', products: 5 },
          { category: 'Books', percentage: 10, trend: 'up', products: 3 }
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setInsights(mockInsights);
        setCategoryPreferences(mockCategoryPreferences);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  const getInsightColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800',
      red: 'bg-red-50 border-red-200 text-red-800'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      case 'stable':
        return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-blue-600">
              <Brain className="w-6 h-6" />
              <h2 className="text-xl font-bold text-gray-900">Your Personalized Dashboard</h2>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
              <Zap className="w-3 h-3" />
              <span>AI Powered</span>
            </div>
          </div>
          <button className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium">
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'recommendations', label: 'Recommendations', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'insights', label: 'Insights', icon: <Brain className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Products Viewed</p>
                    <p className="text-2xl font-bold">47</p>
                    <p className="text-xs opacity-90">+12% this week</p>
                  </div>
                  <Eye className="w-8 h-8 opacity-80" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Wishlist Items</p>
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-xs opacity-90">2 price drops</p>
                  </div>
                  <Heart className="w-8 h-8 opacity-80" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Orders This Month</p>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-xs opacity-90">$1,247 total</p>
                  </div>
                  <ShoppingCart className="w-8 h-8 opacity-80" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">AI Match Score</p>
                    <p className="text-2xl font-bold">94%</p>
                    <p className="text-xs opacity-90">Excellent</p>
                  </div>
                  <Brain className="w-8 h-8 opacity-80" />
                </div>
              </div>
            </div>

            {/* Category Preferences */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Shopping Preferences</h3>
              <div className="space-y-3">
                {categoryPreferences.map((pref, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900">{pref.category}</span>
                      {getTrendIcon(pref.trend)}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${pref.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{pref.percentage}%</span>
                      </div>
                      <span className="text-sm text-gray-500">({pref.products} items)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <AIRecommendations 
              type="personalized" 
              limit={6} 
              showReason={true}
              showConfidence={true}
            />
            
            <AIRecommendations 
              type="customers-also-bought" 
              limit={4}
              title="Frequently Bought Together"
            />
            
            <AIRecommendations 
              type="trending" 
              limit={4}
              title="Trending in Your Categories"
            />
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-lg p-4 ${getInsightColor(insight.color)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {insight.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm opacity-90">{insight.description}</p>
                    </div>
                  </div>
                  {insight.action && (
                    <Link
                      to={insight.action.url}
                      className="flex items-center text-sm font-medium hover:opacity-80 transition-opacity"
                    >
                      {insight.action.label}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalizedDashboard;
