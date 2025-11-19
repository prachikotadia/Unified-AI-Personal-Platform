import React, { useState, useEffect } from 'react';
import { Brain, Zap, MessageSquare, TrendingUp, Calendar, MapPin, ShoppingCart, Users, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface GPT4Capability {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  examples: string[];
  status: 'active' | 'demo' | 'planned';
}

interface ModelInfo {
  model: string;
  version: string;
  capabilities: string[];
  max_tokens: number;
  temperature: float;
  provider: string;
}

const GPT4Showcase: React.FC = () => {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCapability, setActiveCapability] = useState<string | null>(null);

  const capabilities: GPT4Capability[] = [
    {
      id: 'financial-analysis',
      title: 'Advanced Financial Analysis',
      description: 'GPT-4 analyzes spending patterns, creates budgets, and provides personalized financial advice with detailed reasoning.',
      icon: <TrendingUp className="w-6 h-6" />,
      examples: [
        'Analyze monthly spending patterns and identify savings opportunities',
        'Create personalized budget plans using the 50/30/20 rule',
        'Provide financial health scores with detailed reasoning',
        'Generate investment recommendations based on risk tolerance'
      ],
      status: 'active'
    },
    {
      id: 'workout-planning',
      title: 'Intelligent Workout Planning',
      description: 'GPT-4 creates comprehensive workout plans with exercise details, progression strategies, and nutrition guidance.',
      icon: <Zap className="w-6 h-6" />,
      examples: [
        'Design personalized workout schedules based on fitness level and goals',
        'Provide detailed exercise descriptions with sets, reps, and rest periods',
        'Create progressive overload strategies for continuous improvement',
        'Generate nutrition recommendations aligned with fitness goals'
      ],
      status: 'active'
    },
    {
      id: 'travel-planning',
      title: 'Comprehensive Travel Planning',
      description: 'GPT-4 plans detailed trips with itineraries, budget breakdowns, and local insights.',
      icon: <MapPin className="w-6 h-6" />,
      examples: [
        'Create day-by-day itineraries with timing and logistics',
        'Provide budget breakdowns by category (accommodation, food, activities)',
        'Recommend local attractions, restaurants, and cultural experiences',
        'Generate packing lists and travel safety tips'
      ],
      status: 'active'
    },
    {
      id: 'product-recommendations',
      title: 'Smart Product Recommendations',
      description: 'GPT-4 analyzes user preferences and provides personalized product suggestions.',
      icon: <ShoppingCart className="w-6 h-6" />,
      examples: [
        'Recommend products based on user preferences and budget',
        'Provide detailed product comparisons with pros and cons',
        'Suggest alternative options at different price points',
        'Analyze user reviews and ratings for informed decisions'
      ],
      status: 'active'
    },
    {
      id: 'social-content',
      title: 'Social Media Content Creation',
      description: 'GPT-4 generates engaging social media posts with platform-specific optimization.',
      icon: <Users className="w-6 h-6" />,
      examples: [
        'Create platform-specific content for Instagram, Twitter, LinkedIn',
        'Generate relevant hashtags and engagement strategies',
        'Provide optimal posting time recommendations',
        'Create cross-platform content adaptations'
      ],
      status: 'active'
    },
    {
      id: 'chat-analysis',
      title: 'Advanced Chat Analysis',
      description: 'GPT-4 analyzes conversation sentiment and provides communication insights.',
      icon: <MessageSquare className="w-6 h-6" />,
      examples: [
        'Analyze conversation sentiment with confidence scores',
        'Identify key topics and communication patterns',
        'Provide suggestions for better communication',
        'Detect potential misunderstandings or conflicts'
      ],
      status: 'active'
    },
    {
      id: 'productivity',
      title: 'Smart Productivity Tools',
      description: 'GPT-4 creates intelligent reminders and productivity systems.',
      icon: <Clock className="w-6 h-6" />,
      examples: [
        'Create smart reminders with preparation checklists',
        'Generate time management strategies for specific tasks',
        'Provide motivation and encouragement for goal achievement',
        'Integrate tasks with other life areas for better balance'
      ],
      status: 'active'
    },
    {
      id: 'function-calling',
      title: 'Advanced Function Calling',
      description: 'GPT-4 uses function calling capabilities for complex task execution.',
      icon: <Brain className="w-6 h-6" />,
      examples: [
        'Execute complex multi-step workflows',
        'Integrate with external APIs and services',
        'Perform data analysis and generate reports',
        'Create automated decision-making systems'
      ],
      status: 'demo'
    }
  ];

  useEffect(() => {
    fetchModelInfo();
  }, []);

  const fetchModelInfo = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would call your backend API
      // For now, we'll use mock data
      const mockModelInfo: ModelInfo = {
        model: "gpt-4",
        version: "Latest",
        capabilities: [
          "Advanced reasoning",
          "Function calling",
          "Code generation",
          "Creative writing",
          "Data analysis",
          "Multi-modal understanding"
        ],
        max_tokens: 1000,
        temperature: 0.7,
        provider: "OpenAI"
      };
      
      setModelInfo(mockModelInfo);
    } catch (error) {
      console.error('Error fetching model info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'demo':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planned':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'demo':
        return <Zap className="w-4 h-4" />;
      case 'planned':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">GPT-4 Powered AI</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the power of GPT-4 with advanced reasoning, function calling, and comprehensive analysis capabilities
          </p>
        </motion.div>
      </div>

      {/* Model Information */}
      {modelInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{modelInfo.model.toUpperCase()}</div>
              <div className="text-sm text-gray-600">Model</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{modelInfo.version}</div>
              <div className="text-sm text-gray-600">Version</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{modelInfo.max_tokens.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Max Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{modelInfo.provider}</div>
              <div className="text-sm text-gray-600">Provider</div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Capabilities</h3>
            <div className="flex flex-wrap gap-2">
              {modelInfo.capabilities.map((capability, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border border-gray-200"
                >
                  {capability}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {capabilities.map((capability, index) => (
          <motion.div
            key={capability.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`bg-white rounded-xl p-6 border-2 transition-all duration-300 hover:shadow-lg cursor-pointer ${
              activeCapability === capability.id 
                ? 'border-blue-500 shadow-lg' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setActiveCapability(activeCapability === capability.id ? null : capability.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <div className="text-blue-600">{capability.icon}</div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{capability.title}</h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(capability.status)}`}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(capability.status)}
                  {capability.status}
                </div>
              </span>
            </div>
            
            <p className="text-gray-600 mb-4">{capability.description}</p>
            
            {activeCapability === capability.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <h4 className="font-medium text-gray-900 mb-2">Examples:</h4>
                <ul className="space-y-2">
                  {capability.examples.map((example, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-600">{example}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center mt-12"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Experience GPT-4?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Start using GPT-4 powered features across all OmniLife modules. From financial analysis to travel planning, 
            experience the most advanced AI capabilities available.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Explore GPT-4 Features
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GPT4Showcase;
