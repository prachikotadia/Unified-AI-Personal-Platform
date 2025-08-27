// AI Forecasting Service for Financial Predictions
export interface ForecastData {
  id: string;
  type: 'expense' | 'income' | 'budget' | 'goal';
  category?: string;
  predicted_amount: number;
  confidence_level: number;
  prediction_date: string;
  historical_data: Array<{ date: string; amount: number }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  factors: string[];
  created_at: string;
}

export interface ForecastModel {
  id: string;
  name: string;
  type: 'linear_regression' | 'time_series' | 'neural_network';
  accuracy: number;
  last_trained: string;
  is_active: boolean;
}

export interface ForecastAlert {
  id: string;
  type: 'threshold_exceeded' | 'trend_change' | 'anomaly_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  predicted_value: number;
  threshold_value: number;
  category: string;
  created_at: string;
  is_read: boolean;
}

class AIForecastingService {
  private models: ForecastModel[] = [];
  private forecasts: ForecastData[] = [];
  private alerts: ForecastAlert[] = [];

  constructor() {
    this.initializeModels();
    this.generateMockData();
  }

  private initializeModels() {
    this.models = [
      {
        id: 'model_1',
        name: 'Linear Regression - Expenses',
        type: 'linear_regression',
        accuracy: 0.85,
        last_trained: new Date().toISOString(),
        is_active: true,
      },
      {
        id: 'model_2',
        name: 'Time Series - Income',
        type: 'time_series',
        accuracy: 0.92,
        last_trained: new Date().toISOString(),
        is_active: true,
      },
      {
        id: 'model_3',
        name: 'Neural Network - Budget',
        type: 'neural_network',
        accuracy: 0.88,
        last_trained: new Date().toISOString(),
        is_active: true,
      },
    ];
  }

  private generateMockData() {
    const categories = ['food_dining', 'transportation', 'housing', 'utilities', 'entertainment'];
    
    this.forecasts = categories.map((category, index) => ({
      id: `forecast_${index + 1}`,
      type: 'expense' as const,
      category,
      predicted_amount: Math.random() * 1000 + 200,
      confidence_level: Math.random() * 0.3 + 0.7,
      prediction_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      historical_data: Array.from({ length: 12 }, (_, i) => ({
        date: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: Math.random() * 800 + 200,
      })),
      trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
      factors: ['Seasonal patterns', 'Economic indicators', 'Personal habits'],
      created_at: new Date().toISOString(),
    }));

    this.alerts = [
      {
        id: 'alert_1',
        type: 'threshold_exceeded',
        severity: 'high',
        message: 'Food & Dining spending predicted to exceed budget by 15%',
        predicted_value: 920,
        threshold_value: 800,
        category: 'food_dining',
        created_at: new Date().toISOString(),
        is_read: false,
      },
      {
        id: 'alert_2',
        type: 'trend_change',
        severity: 'medium',
        message: 'Transportation expenses showing upward trend',
        predicted_value: 450,
        threshold_value: 400,
        category: 'transportation',
        created_at: new Date().toISOString(),
        is_read: false,
      },
    ];
  }

  // Model Management
  async getModels(): Promise<ForecastModel[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.models;
  }

  async trainModel(modelId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const model = this.models.find(m => m.id === modelId);
    if (model) {
      model.last_trained = new Date().toISOString();
      model.accuracy = Math.random() * 0.2 + 0.8;
    }
  }

  // Forecasting
  async generateForecast(params: {
    type: 'expense' | 'income' | 'budget' | 'goal';
    category?: string;
    period: '1_month' | '3_months' | '6_months' | '1_year';
  }): Promise<ForecastData> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const forecast: ForecastData = {
      id: `forecast_${Date.now()}`,
      type: params.type,
      category: params.category,
      predicted_amount: Math.random() * 2000 + 500,
      confidence_level: Math.random() * 0.3 + 0.7,
      prediction_date: this.getPredictionDate(params.period),
      historical_data: this.generateHistoricalData(params.period),
      trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
      factors: ['Historical patterns', 'Seasonal variations', 'Economic indicators'],
      created_at: new Date().toISOString(),
    };
    
    this.forecasts.push(forecast);
    return forecast;
  }

  async getForecasts(): Promise<ForecastData[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.forecasts;
  }

  // Alert System
  async getAlerts(): Promise<ForecastAlert[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.alerts;
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.is_read = true;
    }
  }

  // Customizable Forecasts
  async createCustomForecast(params: {
    name: string;
    type: 'expense' | 'income' | 'budget' | 'goal';
    category?: string;
    base_amount: number;
    growth_rate: number;
    alert_thresholds: { warning: number; critical: number };
  }): Promise<ForecastData> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const forecast: ForecastData = {
      id: `custom_forecast_${Date.now()}`,
      type: params.type,
      category: params.category,
      predicted_amount: params.base_amount * (1 + params.growth_rate),
      confidence_level: 0.85,
      prediction_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      historical_data: this.generateHistoricalData('3_months'),
      trend: params.growth_rate > 0 ? 'increasing' : 'decreasing',
      factors: ['Custom model', 'User-defined parameters'],
      created_at: new Date().toISOString(),
    };
    
    this.forecasts.push(forecast);
    return forecast;
  }

  // Utility Methods
  private getPredictionDate(period: string): string {
    const now = new Date();
    switch (period) {
      case '1_month':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      case '3_months':
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
      case '6_months':
        return new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString();
      case '1_year':
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  private generateHistoricalData(period: string): Array<{ date: string; amount: number }> {
    const months = period === '1_month' ? 1 : period === '3_months' ? 3 : period === '6_months' ? 6 : 12;
    return Array.from({ length: months }, (_, i) => ({
      date: new Date(Date.now() - (months - 1 - i) * 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: Math.random() * 800 + 200,
    }));
  }
}

export const aiForecastingService = new AIForecastingService();
