import React, { useState } from 'react';
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Settings, 
  Download, 
  Save, 
  GitBranch,
  Zap,
  X,
  FileText
} from 'lucide-react'
import { formatCurrency } from '../../lib/utils'
import AIForecastingModal from '../../components/finance/AIForecastingModal'

const ForecastPage = () => {
  const [showAIModal, setShowAIModal] = useState(false);
  const [showParametersModal, setShowParametersModal] = useState(false);
  const [showSaveScenarioModal, setShowSaveScenarioModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  // Mock forecast data
  const forecastData = [
    { month: 'Jan', actual: 2847, predicted: 2900 },
    { month: 'Feb', actual: 3100, predicted: 3050 },
    { month: 'Mar', actual: 2950, predicted: 3200 },
    { month: 'Apr', actual: null, predicted: 3150 },
    { month: 'May', actual: null, predicted: 3300 },
    { month: 'Jun', actual: null, predicted: 3250 },
  ]

  const insights = [
    { type: 'positive', text: 'You\'re 15% under budget this month' },
    { type: 'neutral', text: 'Food spending is trending upward' },
    { type: 'positive', text: 'Transportation costs decreased by 20%' },
  ];

  const handleGenerateForecast = async () => {
    setIsGenerating(true);
    // Simulate forecast generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const handleExportForecast = () => {
    const data = {
      forecast: forecastData,
      insights: insights,
      generatedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `forecast-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveScenario = (scenarioName: string) => {
    const newScenario = {
      id: Date.now().toString(),
      name: scenarioName,
      data: forecastData,
      createdAt: new Date().toISOString()
    };
    setScenarios([...scenarios, newScenario]);
    setShowSaveScenarioModal(false);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">AI Forecast</h1>
            <p className="text-gray-600 dark:text-gray-400">
              AI-powered spending predictions and insights
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowAIModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Brain size={16} />
              AI Forecasting
            </button>
            <button
              onClick={handleGenerateForecast}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Generate Forecast
                </>
              )}
            </button>
            <button
              onClick={() => setShowParametersModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Settings size={16} />
              Adjust Parameters
            </button>
            <button
              onClick={handleExportForecast}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={16} />
              Export Forecast
            </button>
            <button
              onClick={() => setShowSaveScenarioModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Save size={16} />
              Save Scenario
            </button>
            <button
              onClick={() => setShowCompareModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <GitBranch size={16} />
              Compare Scenarios
            </button>
          </div>
        </div>
      </motion.div>

      {/* Forecast Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-6">6-Month Spending Forecast</h2>
        
        <div className="space-y-4">
          {forecastData.map((data, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-16 text-sm font-medium">{data.month}</div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Predicted</span>
                  <span className="text-sm font-semibold">{formatCurrency(data.predicted)}</span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to h-3 rounded-full"
                    style={{ width: `${(data.predicted / 4000) * 100}%` }}
                  />
                </div>
                
                {data.actual && (
                  <>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500">Actual</span>
                      <span className="text-sm font-semibold">{formatCurrency(data.actual)}</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-gradient-from to-green-gradient-to h-2 rounded-full"
                        style={{ width: `${(data.actual / 4000) * 100}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-1 mt-1">
                      {data.actual < data.predicted ? (
                        <TrendingDown className="w-3 h-3 text-green-500" />
                      ) : (
                        <TrendingUp className="w-3 h-3 text-red-500" />
                      )}
                      <span className={`text-xs ${
                        data.actual < data.predicted ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {data.actual < data.predicted ? 'Under' : 'Over'} by {formatCurrency(Math.abs(data.actual - data.predicted))}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-6">AI Insights</h2>
        
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-start space-x-3 p-4 rounded-lg bg-white/5"
            >
              <div className={`w-2 h-2 rounded-full mt-2 ${
                insight.type === 'positive' ? 'bg-green-500' : 
                insight.type === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <p className="text-sm">{insight.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-6">Recommendations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Good News!</h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your spending patterns suggest you'll save $500 more than expected this quarter.
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Suggestion</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Consider setting up automatic transfers to your savings account.
            </p>
          </div>
        </div>
      </motion.div>

      {/* AI Forecasting Modal */}
      <AIForecastingModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
      />

      {/* Adjust Parameters Modal */}
      {showParametersModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Adjust Forecast Parameters</h2>
              <button onClick={() => setShowParametersModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Forecast Period (months)</label>
                <input
                  type="number"
                  defaultValue={6}
                  min={1}
                  max={24}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  id="forecast-period"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confidence Level (%)</label>
                <input
                  type="number"
                  defaultValue={85}
                  min={50}
                  max={99}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  id="confidence-level"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Include Seasonal Trends</label>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4"
                  id="seasonal-trends"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowParametersModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Apply parameters
                    setShowParametersModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Save Scenario Modal */}
      {showSaveScenarioModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Save Forecast Scenario</h2>
              <button onClick={() => setShowSaveScenarioModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Scenario Name</label>
                <input
                  type="text"
                  placeholder="e.g., Optimistic Forecast"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  id="scenario-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description (optional)</label>
                <textarea
                  placeholder="Add a description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  id="scenario-description"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveScenarioModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const name = (document.getElementById('scenario-name') as HTMLInputElement)?.value;
                    if (name) {
                      handleSaveScenario(name);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Scenario
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Compare Scenarios Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Compare Scenarios</h2>
              <button onClick={() => setShowCompareModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {scenarios.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No saved scenarios yet. Save a scenario to compare.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Current Forecast</h3>
                    <p className="text-sm text-gray-600">6-month forecast</p>
                  </div>
                  {scenarios.map((scenario) => (
                    <div key={scenario.id} className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">{scenario.name}</h3>
                      <p className="text-sm text-gray-600">
                        Saved {new Date(scenario.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ForecastPage
