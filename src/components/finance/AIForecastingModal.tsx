import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  TrendingUp,
  TrendingDown,
  Brain,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Settings,
  Calendar,
  DollarSign,
  Percent,
  Zap,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { 
  aiForecastingService, 
  ForecastData, 
  ForecastModel, 
  ForecastAlert 
} from '../../services/aiForecasting';

interface AIForecastingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FORECAST_PERIODS = [
  { value: '1_month', label: '1 Month', icon: <Calendar size={16} /> },
  { value: '3_months', label: '3 Months', icon: <Calendar size={16} /> },
  { value: '6_months', label: '6 Months', icon: <Calendar size={16} /> },
  { value: '1_year', label: '1 Year', icon: <Calendar size={16} /> },
];

const FORECAST_TYPES = [
  { value: 'expense', label: 'Expense Forecast', icon: <TrendingDown size={16} /> },
  { value: 'income', label: 'Income Forecast', icon: <TrendingUp size={16} /> },
  { value: 'budget', label: 'Budget Forecast', icon: <Target size={16} /> },
  { value: 'goal', label: 'Goal Forecast', icon: <Target size={16} /> },
];

const AIForecastingModal: React.FC<AIForecastingModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'models' | 'forecasts' | 'alerts' | 'custom'>('models');
  const [models, setModels] = useState<ForecastModel[]>([]);
  const [forecasts, setForecasts] = useState<ForecastData[]>([]);
  const [alerts, setAlerts] = useState<ForecastAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [trainingModel, setTrainingModel] = useState<string | null>(null);

  // Custom forecast form
  const [customForecast, setCustomForecast] = useState({
    name: '',
    type: 'expense' as const,
    category: '',
    base_amount: 0,
    growth_rate: 0,
    alert_thresholds: { warning: 0, critical: 0 },
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [modelsData, forecastsData, alertsData] = await Promise.all([
        aiForecastingService.getModels(),
        aiForecastingService.getForecasts(),
        aiForecastingService.getAlerts(),
      ]);
      setModels(modelsData);
      setForecasts(forecastsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading AI forecasting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrainModel = async (modelId: string) => {
    setTrainingModel(modelId);
    try {
      await aiForecastingService.trainModel(modelId);
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error training model:', error);
    } finally {
      setTrainingModel(null);
    }
  };

  const handleGenerateForecast = async () => {
    setLoading(true);
    try {
      const newForecast = await aiForecastingService.generateForecast({
        type: 'expense',
        category: 'food_dining',
        period: '3_months',
      });
      setForecasts(prev => [...prev, newForecast]);
    } catch (error) {
      console.error('Error generating forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomForecast = async () => {
    setLoading(true);
    try {
      const newForecast = await aiForecastingService.createCustomForecast(customForecast);
      setForecasts(prev => [...prev, newForecast]);
      setCustomForecast({
        name: '',
        type: 'expense',
        category: '',
        base_amount: 0,
        growth_rate: 0,
        alert_thresholds: { warning: 0, critical: 0 },
      });
    } catch (error) {
      console.error('Error creating custom forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAlertAsRead = async (alertId: string) => {
    try {
      await aiForecastingService.markAlertAsRead(alertId);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="text-green-600" size={16} />;
      case 'decreasing':
        return <TrendingDown className="text-red-600" size={16} />;
      default:
        return <BarChart3 className="text-gray-600" size={16} />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="text-purple-600" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">AI Financial Forecasting</h2>
                  <p className="text-sm text-gray-600">
                    Machine learning predictions and trend analysis
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {[
                { id: 'models', label: 'ML Models', icon: <Brain size={16} /> },
                { id: 'forecasts', label: 'Forecasts', icon: <TrendingUp size={16} /> },
                { id: 'alerts', label: 'Alerts', icon: <AlertTriangle size={16} /> },
                { id: 'custom', label: 'Custom Forecast', icon: <Settings size={16} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-purple-600" size={24} />
                  <span className="ml-2 text-gray-600">Loading...</span>
                </div>
              )}

              {/* ML Models Tab */}
              {activeTab === 'models' && !loading && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Machine Learning Models</h3>
                    <button
                      onClick={loadData}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <RefreshCw size={16} />
                      Refresh
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {models.map((model) => (
                      <div key={model.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Brain className="text-purple-600" size={20} />
                            <div>
                              <h4 className="font-medium text-gray-900">{model.name}</h4>
                              <p className="text-sm text-gray-500 capitalize">{model.type.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            model.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {model.is_active ? 'Active' : 'Inactive'}
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Accuracy:</span>
                            <span className="font-medium">{Math.round(model.accuracy * 100)}%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Last Trained:</span>
                            <span className="text-gray-900">
                              {new Date(model.last_trained).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleTrainModel(model.id)}
                          disabled={trainingModel === model.id}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                          {trainingModel === model.id ? (
                            <>
                              <Loader2 className="animate-spin" size={16} />
                              Training...
                            </>
                          ) : (
                            <>
                              <Zap size={16} />
                              Train Model
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Forecasts Tab */}
              {activeTab === 'forecasts' && !loading && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">AI Predictions</h3>
                    <button
                      onClick={handleGenerateForecast}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      <Zap size={16} />
                      Generate Forecast
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {forecasts.map((forecast) => (
                      <div key={forecast.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {forecast.category ? forecast.category.replace('_', ' ').toUpperCase() : 'General'} Forecast
                            </h4>
                            <p className="text-sm text-gray-500 capitalize">{forecast.type}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(forecast.trend)}
                            <span className="text-sm font-medium capitalize">{forecast.trend}</span>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Predicted Amount:</span>
                            <span className="font-semibold text-lg">${forecast.predicted_amount.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Confidence:</span>
                            <span className={`font-medium ${getConfidenceColor(forecast.confidence_level)}`}>
                              {Math.round(forecast.confidence_level * 100)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Prediction Date:</span>
                            <span className="text-sm text-gray-900">
                              {new Date(forecast.prediction_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-700">Key Factors:</h5>
                          <div className="flex flex-wrap gap-1">
                            {forecast.factors.map((factor, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                              >
                                {factor}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alerts Tab */}
              {activeTab === 'alerts' && !loading && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">AI Alerts</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {alerts.filter(a => !a.is_read).length} unread
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`border rounded-lg p-4 transition-colors ${
                          alert.is_read ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertSeverityColor(alert.severity)}`}>
                                {alert.severity.toUpperCase()}
                              </div>
                              <span className="text-xs text-gray-500 capitalize">{alert.type.replace('_', ' ')}</span>
                            </div>
                            <p className="text-sm text-gray-900 mb-2">{alert.message}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span>Predicted: ${alert.predicted_value.toFixed(2)}</span>
                              <span>Threshold: ${alert.threshold_value.toFixed(2)}</span>
                              <span>Category: {alert.category.replace('_', ' ')}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!alert.is_read && (
                              <button
                                onClick={() => handleMarkAlertAsRead(alert.id)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Mark as read"
                              >
                                <Eye size={16} />
                              </button>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(alert.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Forecast Tab */}
              {activeTab === 'custom' && !loading && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Create Custom Forecast</h3>

                  <form onSubmit={(e) => { e.preventDefault(); handleCreateCustomForecast(); }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Forecast Name
                        </label>
                        <input
                          type="text"
                          value={customForecast.name}
                          onChange={(e) => setCustomForecast(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g., Vacation Savings Forecast"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Forecast Type
                        </label>
                        <select
                          value={customForecast.type}
                          onChange={(e) => setCustomForecast(prev => ({ ...prev, type: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        >
                          {FORECAST_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={customForecast.category}
                          onChange={(e) => setCustomForecast(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select Category</option>
                          <option value="food_dining">Food & Dining</option>
                          <option value="transportation">Transportation</option>
                          <option value="housing">Housing</option>
                          <option value="utilities">Utilities</option>
                          <option value="entertainment">Entertainment</option>
                          <option value="shopping">Shopping</option>
                          <option value="healthcare">Healthcare</option>
                          <option value="education">Education</option>
                          <option value="travel">Travel</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Base Amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={customForecast.base_amount}
                            onChange={(e) => setCustomForecast(prev => ({ ...prev, base_amount: parseFloat(e.target.value) || 0 }))}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Growth Rate (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={customForecast.growth_rate * 100}
                            onChange={(e) => setCustomForecast(prev => ({ ...prev, growth_rate: parseFloat(e.target.value) / 100 || 0 }))}
                            className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="0.0"
                            required
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            %
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Warning Threshold
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={customForecast.alert_thresholds.warning}
                            onChange={(e) => setCustomForecast(prev => ({ 
                              ...prev, 
                              alert_thresholds: { 
                                ...prev.alert_thresholds, 
                                warning: parseFloat(e.target.value) || 0 
                              } 
                            }))}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Critical Threshold
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={customForecast.alert_thresholds.critical}
                          onChange={(e) => setCustomForecast(prev => ({ 
                            ...prev, 
                            alert_thresholds: { 
                              ...prev.alert_thresholds, 
                              critical: parseFloat(e.target.value) || 0 
                            } 
                          }))}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Zap size={16} />
                            Create Custom Forecast
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIForecastingModal;
