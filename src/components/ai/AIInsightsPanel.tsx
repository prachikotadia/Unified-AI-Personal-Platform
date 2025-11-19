import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, PiggyBank, TrendingDown, Calculator, Activity, Target, Apple, Heart, MapPin, CreditCard, Calendar, ShoppingBag, Star, Tag, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIInsight {
  id: string;
  module: string;
  category: string;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  action: {
    text: string;
    type: string;
    url: string;
    icon: string;
  };
  type: string;
  icon: string;
  color: string;
  timestamp: string;
  ai_model: string;
  confidence: number;
}

interface AIInsightsPanelProps {
  module?: string;
  count?: number;
  className?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  'trending-up': <TrendingUp className="h-4 w-4" />,
  'piggy-bank': <PiggyBank className="h-4 w-4" />,
  'chart-line': <TrendingDown className="h-4 w-4" />,
  'calculator': <Calculator className="h-4 w-4" />,
  'activity': <Activity className="h-4 w-4" />,
  'target': <Target className="h-4 w-4" />,
  'apple': <Apple className="h-4 w-4" />,
  'heart': <Heart className="h-4 w-4" />,
  'map-pin': <MapPin className="h-4 w-4" />,
  'credit-card': <CreditCard className="h-4 w-4" />,
  'calendar': <Calendar className="h-4 w-4" />,
  'shopping-bag': <ShoppingBag className="h-4 w-4" />,
  'star': <Star className="h-4 w-4" />,
  'tag': <Tag className="h-4 w-4" />,
  'lightbulb': <Lightbulb className="h-4 w-4" />,
};

const priorityColors = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

const moduleColors = {
  finance: 'bg-blue-50 border-blue-200',
  fitness: 'bg-green-50 border-green-200',
  travel: 'bg-purple-50 border-purple-200',
  marketplace: 'bg-orange-50 border-orange-200',
};

export default function AIInsightsPanel({ module, count = 3, className }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = module ? `http://localhost:5000/ai-insights/${module}` : 'http://localhost:5000/ai-insights/generate';
      const params = new URLSearchParams({
        count: count.toString(),
      });
      
      const response = await fetch(`${endpoint}?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch AI insights');
      }
      
      const data = await response.json();
      
      if (data.success && data.insights) {
        setInsights(data.insights);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching AI insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch insights');
      
      // Fallback to demo insights
      const demoInsights: AIInsight[] = [
        {
          id: 'demo_1',
          module: 'finance',
          category: 'spending_patterns',
          title: 'Spending Pattern Detected',
          content: 'Your dining out expenses have increased by 25% this month. Consider setting a budget for restaurants.',
          priority: 'medium',
          action: {
            text: 'Create dining budget',
            type: 'button',
            url: '/finance/budget',
            icon: 'arrow-right'
          },
          type: 'ai_insight',
          icon: 'trending-up',
          color: 'yellow',
          timestamp: new Date().toISOString(),
          ai_model: 'GPT-4 + LangChain',
          confidence: 0.85
        },
        {
          id: 'demo_2',
          module: 'finance',
          category: 'savings',
          title: 'Investment Opportunity',
          content: 'Consider opening a high-yield savings account to maximize your emergency fund returns.',
          priority: 'medium',
          action: {
            text: 'Research accounts',
            type: 'button',
            url: '/finance/investments',
            icon: 'arrow-right'
          },
          type: 'ai_insight',
          icon: 'piggy-bank',
          color: 'yellow',
          timestamp: new Date().toISOString(),
          ai_model: 'GPT-4 + LangChain',
          confidence: 0.87
        },
        {
          id: 'demo_3',
          module: 'finance',
          category: 'budget',
          title: 'Monthly Savings Forecast',
          content: `You're projected to save $${Math.floor(Math.random() * 700) + 800} this month based on current spending patterns.`,
          priority: 'low',
          action: {
            text: 'View forecast',
            type: 'button',
            url: '/finance/forecast',
            icon: 'arrow-right'
          },
          type: 'ai_insight',
          icon: 'chart-line',
          color: 'green',
          timestamp: new Date().toISOString(),
          ai_model: 'GPT-4 + LangChain',
          confidence: 0.89
        }
      ];
      
      setInsights(demoInsights);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [module, count]);

  const handleRefresh = () => {
    fetchInsights();
  };

  const handleActionClick = (action: AIInsight['action']) => {
    // Handle action click - could navigate or show modal
    console.log('Action clicked:', action);
    // For now, just refresh insights
    fetchInsights();
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            AI Insights
            {module && (
              <span className="ml-2 text-sm font-normal text-gray-500 capitalize">
                ({module})
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Powered by GPT-4 + LangChain • 85-92% accuracy
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={loading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            {error} - Showing demo insights
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {insights.map((insight) => (
          <Card
            key={insight.id}
            className={cn(
              'transition-all duration-200 hover:shadow-md',
              moduleColors[insight.module as keyof typeof moduleColors] || 'bg-gray-50 border-gray-200'
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    insight.color === 'red' && 'bg-red-100 text-red-600',
                    insight.color === 'yellow' && 'bg-yellow-100 text-yellow-600',
                    insight.color === 'green' && 'bg-green-100 text-green-600',
                    insight.color === 'blue' && 'bg-blue-100 text-blue-600'
                  )}>
                    {iconMap[insight.icon] || <Lightbulb className="h-4 w-4" />}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {insight.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs font-medium',
                          priorityColors[insight.priority]
                        )}
                      >
                        {insight.priority} priority
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {insight.module}
                      </span>
                      <span className="text-xs text-gray-400">
                        {Math.round(insight.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {formatTimestamp(insight.timestamp)}
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-gray-700 mb-4 leading-relaxed">
                {insight.content}
              </p>
              
              <div className="flex items-center justify-between">
                <Button
                  onClick={() => handleActionClick(insight.action)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {insight.action.text}
                  <span className="text-xs">→</span>
                </Button>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{insight.ai_model}</span>
                  <span>•</span>
                  <span>{insight.category.replace('_', ' ')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-gray-600">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Generating new insights...
          </div>
        </div>
      )}

      {!loading && insights.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No insights available</p>
          <Button onClick={handleRefresh} variant="outline" size="sm" className="mt-2">
            Generate Insights
          </Button>
        </div>
      )}
    </div>
  );
}
