import axios, { AxiosInstance } from 'axios';

// Bank Integration Types
export interface BankConnection {
  id: string;
  bank_name: string;
  account_type: 'checking' | 'savings' | 'credit_card' | 'investment';
  account_number: string;
  routing_number?: string;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  last_sync: string;
  balance: number;
  available_balance: number;
  currency: string;
  institution_id: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
}

export interface LiveTransaction {
  id: string;
  account_id: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  amount: number;
  currency: string;
  description: string;
  merchant: string;
  date: string;
  status: 'pending' | 'posted' | 'cancelled';
  transaction_id: string;
  reference_number?: string;
  location?: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  metadata?: Record<string, any>;
}

export interface CreditScoreData {
  score: number;
  range: 'excellent' | 'very_good' | 'good' | 'fair' | 'poor';
  provider: 'FICO' | 'VantageScore' | 'TransUnion' | 'Equifax' | 'Experian';
  factors: {
    payment_history: number;
    credit_utilization: number;
    credit_history_length: number;
    credit_mix: number;
    new_credit: number;
  };
  factors_impact: {
    payment_history: 'positive' | 'negative' | 'neutral';
    credit_utilization: 'positive' | 'negative' | 'neutral';
    credit_history_length: 'positive' | 'negative' | 'neutral';
    credit_mix: 'positive' | 'negative' | 'neutral';
    new_credit: 'positive' | 'negative' | 'neutral';
  };
  trend: 'improving' | 'declining' | 'stable';
  last_updated: string;
  next_update: string;
  history: Array<{
    date: string;
    score: number;
    change: number;
  }>;
}

export interface FinancialOffer {
  id: string;
  type: 'credit_card' | 'loan' | 'investment' | 'insurance' | 'savings';
  title: string;
  description: string;
  provider: string;
  terms: Record<string, any>;
  benefits: string[];
  requirements: string[];
  interest_rate?: number;
  credit_limit?: number;
  annual_fee?: number;
  cashback_rate?: number;
  rewards_points?: number;
  is_pre_approved: boolean;
  approval_chance: number;
  expiration_date: string;
  is_active: boolean;
  personalized: boolean;
  credit_score_requirement?: number;
  income_requirement?: number;
}

// API Configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Bank Integration Service
export const bankIntegrationService = {
  // Bank Account Connections
  async connectBankAccount(bankName: string, credentials: {
    username: string;
    password: string;
    accountType: string;
  }): Promise<BankConnection> {
    try {
      const response = await api.post('/finance/bank/connect', {
        bank_name: bankName,
        credentials
      });
      return response.data;
    } catch (error) {
      console.error('Error connecting bank account:', error);
      throw new Error('Failed to connect bank account');
    }
  },

  async getBankConnections(): Promise<BankConnection[]> {
    try {
      const response = await api.get('/finance/bank/connections');
      return response.data;
    } catch (error) {
      console.error('Error fetching bank connections:', error);
      throw new Error('Failed to fetch bank connections');
    }
  },

  async disconnectBankAccount(connectionId: string): Promise<void> {
    try {
      await api.delete(`/finance/bank/connections/${connectionId}`);
    } catch (error) {
      console.error('Error disconnecting bank account:', error);
      throw new Error('Failed to disconnect bank account');
    }
  },

  async syncBankAccount(connectionId: string): Promise<void> {
    try {
      await api.post(`/finance/bank/connections/${connectionId}/sync`);
    } catch (error) {
      console.error('Error syncing bank account:', error);
      throw new Error('Failed to sync bank account');
    }
  },

  // Live Transaction Updates
  async getLiveTransactions(accountId: string, params?: {
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<LiveTransaction[]> {
    try {
      const response = await api.get(`/finance/bank/accounts/${accountId}/transactions`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching live transactions:', error);
      throw new Error('Failed to fetch live transactions');
    }
  },

  async getTransactionDetails(transactionId: string): Promise<LiveTransaction> {
    try {
      const response = await api.get(`/finance/bank/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      throw new Error('Failed to fetch transaction details');
    }
  },

  // Credit Score Integration
  async getCreditScore(): Promise<CreditScoreData> {
    try {
      const response = await api.get('/finance/credit-score/live');
      return response.data;
    } catch (error) {
      console.error('Error fetching credit score:', error);
      throw new Error('Failed to fetch credit score');
    }
  },

  async getCreditScoreHistory(): Promise<CreditScoreData['history']> {
    try {
      const response = await api.get('/finance/credit-score/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching credit score history:', error);
      throw new Error('Failed to fetch credit score history');
    }
  },

  async refreshCreditScore(): Promise<void> {
    try {
      await api.post('/finance/credit-score/refresh');
    } catch (error) {
      console.error('Error refreshing credit score:', error);
      throw new Error('Failed to refresh credit score');
    }
  },

  // Financial Offers API
  async getPersonalizedOffers(): Promise<FinancialOffer[]> {
    try {
      const response = await api.get('/finance/offers/personalized');
      return response.data;
    } catch (error) {
      console.error('Error fetching personalized offers:', error);
      throw new Error('Failed to fetch personalized offers');
    }
  },

  async getOfferDetails(offerId: string): Promise<FinancialOffer> {
    try {
      const response = await api.get(`/finance/offers/${offerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching offer details:', error);
      throw new Error('Failed to fetch offer details');
    }
  },

  async applyForOffer(offerId: string, applicationData: Record<string, any>): Promise<{
    application_id: string;
    status: 'submitted' | 'approved' | 'rejected' | 'pending';
    message: string;
  }> {
    try {
      const response = await api.post(`/finance/offers/${offerId}/apply`, applicationData);
      return response.data;
    } catch (error) {
      console.error('Error applying for offer:', error);
      throw new Error('Failed to apply for offer');
    }
  },

  // Export Functionality
  async exportTransactions(format: 'csv' | 'pdf' | 'excel', params?: {
    start_date?: string;
    end_date?: string;
    account_id?: string;
    category?: string;
    type?: string;
  }): Promise<Blob> {
    try {
      const response = await api.get('/finance/export/transactions', {
        params: { format, ...params },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting transactions:', error);
      throw new Error('Failed to export transactions');
    }
  },

  async exportFinancialReport(format: 'pdf' | 'excel', reportType: 'monthly' | 'quarterly' | 'yearly'): Promise<Blob> {
    try {
      const response = await api.get('/finance/export/report', {
        params: { format, report_type: reportType },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting financial report:', error);
      throw new Error('Failed to export financial report');
    }
  },

  // Share Functionality
  async shareFinancialData(shareData: {
    type: 'dashboard' | 'transactions' | 'budget' | 'goals';
    recipients: string[];
    permissions: 'view' | 'edit' | 'admin';
    expiration_date?: string;
    message?: string;
  }): Promise<{
    share_id: string;
    share_url: string;
    status: 'active' | 'expired' | 'revoked';
  }> {
    try {
      const response = await api.post('/finance/share', shareData);
      return response.data;
    } catch (error) {
      console.error('Error sharing financial data:', error);
      throw new Error('Failed to share financial data');
    }
  },

  async getSharedData(shareId: string): Promise<any> {
    try {
      const response = await api.get(`/finance/share/${shareId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching shared data:', error);
      throw new Error('Failed to fetch shared data');
    }
  },

  async revokeShare(shareId: string): Promise<void> {
    try {
      await api.delete(`/finance/share/${shareId}`);
    } catch (error) {
      console.error('Error revoking share:', error);
      throw new Error('Failed to revoke share');
    }
  },

  // Real-time Notifications
  async subscribeToNotifications(types: string[]): Promise<{
    subscription_id: string;
    webhook_url?: string;
  }> {
    try {
      const response = await api.post('/finance/notifications/subscribe', { types });
      return response.data;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      throw new Error('Failed to subscribe to notifications');
    }
  },

  async getNotifications(params?: {
    type?: string;
    read?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    data: Record<string, any>;
    read: boolean;
    created_at: string;
  }>> {
    try {
      const response = await api.get('/finance/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await api.put(`/finance/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  },

  async markAllNotificationsAsRead(): Promise<void> {
    try {
      await api.put('/finance/notifications/read-all');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  },
};

// Mock Bank Integration Service for development
export const mockBankIntegrationService = {
  // Bank Account Connections
  async connectBankAccount(bankName: string, credentials: any): Promise<BankConnection> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      id: `conn_${Date.now()}`,
      bank_name: bankName,
      account_type: 'checking',
      account_number: '****1234',
      status: 'connected',
      last_sync: new Date().toISOString(),
      balance: 5000.00,
      available_balance: 4800.00,
      currency: 'USD',
      institution_id: 'chase_bank',
    };
  },

  async getBankConnections(): Promise<BankConnection[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      {
        id: 'conn_1',
        bank_name: 'Chase Bank',
        account_type: 'checking',
        account_number: '****1234',
        status: 'connected',
        last_sync: new Date().toISOString(),
        balance: 5000.00,
        available_balance: 4800.00,
        currency: 'USD',
        institution_id: 'chase_bank',
      },
      {
        id: 'conn_2',
        bank_name: 'Ally Bank',
        account_type: 'savings',
        account_number: '****5678',
        status: 'connected',
        last_sync: new Date().toISOString(),
        balance: 15000.00,
        available_balance: 15000.00,
        currency: 'USD',
        institution_id: 'ally_bank',
      },
    ];
  },

  async disconnectBankAccount(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  async syncBankAccount(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 2000));
  },

  // Live Transaction Updates
  async getLiveTransactions(): Promise<LiveTransaction[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 'txn_1',
        account_id: 'conn_1',
        type: 'expense',
        category: 'food_dining',
        amount: 45.50,
        currency: 'USD',
        description: 'Grocery Shopping',
        merchant: 'Walmart',
        date: new Date().toISOString(),
        status: 'posted',
        transaction_id: 'bank_txn_123',
        location: {
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'US',
        },
      },
      {
        id: 'txn_2',
        account_id: 'conn_1',
        type: 'income',
        category: 'salary',
        amount: 5000.00,
        currency: 'USD',
        description: 'Direct Deposit',
        merchant: 'Company Inc',
        date: new Date().toISOString(),
        status: 'posted',
        transaction_id: 'bank_txn_124',
      },
    ];
  },

  async getTransactionDetails(): Promise<LiveTransaction> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      id: 'txn_1',
      account_id: 'conn_1',
      type: 'expense',
      category: 'food_dining',
      amount: 45.50,
      currency: 'USD',
      description: 'Grocery Shopping',
      merchant: 'Walmart',
      date: new Date().toISOString(),
      status: 'posted',
      transaction_id: 'bank_txn_123',
      location: {
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'US',
      },
    };
  },

  // Credit Score Integration
  async getCreditScore(): Promise<CreditScoreData> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      score: 745,
      range: 'very_good',
      provider: 'FICO',
      factors: {
        payment_history: 0.35,
        credit_utilization: 0.30,
        credit_history_length: 0.15,
        credit_mix: 0.10,
        new_credit: 0.10,
      },
      factors_impact: {
        payment_history: 'positive',
        credit_utilization: 'positive',
        credit_history_length: 'neutral',
        credit_mix: 'positive',
        new_credit: 'negative',
      },
      trend: 'improving',
      last_updated: new Date().toISOString(),
      next_update: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      history: [
        { date: '2024-01-01', score: 720, change: 0 },
        { date: '2024-02-01', score: 725, change: 5 },
        { date: '2024-03-01', score: 730, change: 5 },
        { date: '2024-04-01', score: 735, change: 5 },
        { date: '2024-05-01', score: 740, change: 5 },
        { date: '2024-06-01', score: 745, change: 5 },
      ],
    };
  },

  async getCreditScoreHistory(): Promise<CreditScoreData['history']> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      { date: '2024-01-01', score: 720, change: 0 },
      { date: '2024-02-01', score: 725, change: 5 },
      { date: '2024-03-01', score: 730, change: 5 },
      { date: '2024-04-01', score: 735, change: 5 },
      { date: '2024-05-01', score: 740, change: 5 },
      { date: '2024-06-01', score: 745, change: 5 },
    ];
  },

  async refreshCreditScore(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 3000));
  },

  // Financial Offers API
  async getPersonalizedOffers(): Promise<FinancialOffer[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      {
        id: 'offer_1',
        type: 'credit_card',
        title: 'Chase Freedom Unlimited',
        description: 'Earn 1.5% cash back on all purchases with no annual fee',
        provider: 'Chase Bank',
        terms: { annual_fee: 0, apr: '16.99%' },
        benefits: ['1.5% cash back', 'No annual fee', 'Sign-up bonus'],
        requirements: ['Good credit score', 'Income verification'],
        interest_rate: 16.99,
        credit_limit: 10000,
        annual_fee: 0,
        cashback_rate: 1.5,
        is_pre_approved: true,
        approval_chance: 0.85,
        expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        personalized: true,
        credit_score_requirement: 700,
        income_requirement: 50000,
      },
      {
        id: 'offer_2',
        type: 'loan',
        title: 'Personal Loan - Low APR',
        description: 'Consolidate debt with our low-interest personal loan',
        provider: 'Wells Fargo',
        terms: { loan_amount: '5000-50000', term: '24-84 months' },
        benefits: ['Low APR', 'No prepayment penalty', 'Fast approval'],
        requirements: ['Good credit score', 'Stable income'],
        interest_rate: 7.99,
        is_pre_approved: false,
        approval_chance: 0.70,
        expiration_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        personalized: true,
        credit_score_requirement: 680,
        income_requirement: 40000,
      },
    ];
  },

  async getOfferDetails(): Promise<FinancialOffer> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: 'offer_1',
      type: 'credit_card',
      title: 'Chase Freedom Unlimited',
      description: 'Earn 1.5% cash back on all purchases with no annual fee',
      provider: 'Chase Bank',
      terms: { annual_fee: 0, apr: '16.99%' },
      benefits: ['1.5% cash back', 'No annual fee', 'Sign-up bonus'],
      requirements: ['Good credit score', 'Income verification'],
      interest_rate: 16.99,
      credit_limit: 10000,
      annual_fee: 0,
      cashback_rate: 1.5,
      is_pre_approved: true,
      approval_chance: 0.85,
      expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true,
      personalized: true,
      credit_score_requirement: 700,
      income_requirement: 50000,
    };
  },

  async applyForOffer(): Promise<{ application_id: string; status: 'submitted' | 'approved' | 'rejected' | 'pending'; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      application_id: `app_${Date.now()}`,
      status: 'submitted',
      message: 'Your application has been submitted successfully. You will receive a decision within 5-7 business days.',
    };
  },

  // Export Functionality
  async exportTransactions(): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const csvContent = 'Date,Description,Amount,Category\n2024-01-15,Grocery Shopping,45.50,food_dining\n2024-01-01,Salary,5000.00,salary';
    return new Blob([csvContent], { type: 'text/csv' });
  },

  async exportFinancialReport(): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const reportContent = 'Financial Report\nMonthly Summary\nIncome: $5000\nExpenses: $3200\nSavings: $1800';
    return new Blob([reportContent], { type: 'application/pdf' });
  },

  // Share Functionality
  async shareFinancialData(): Promise<{ share_id: string; share_url: string; status: 'active' | 'expired' | 'revoked' }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      share_id: `share_${Date.now()}`,
      share_url: 'https://omnilife.app/share/financial-data/abc123',
      status: 'active',
    };
  },

  async getSharedData(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      type: 'dashboard',
      data: {
        total_balance: 17500.00,
        monthly_income: 5000.00,
        monthly_expenses: 3200.00,
      },
    };
  },

  async revokeShare(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  // Real-time Notifications
  async subscribeToNotifications(): Promise<{ subscription_id: string; webhook_url?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      subscription_id: `sub_${Date.now()}`,
      webhook_url: 'https://omnilife.app/webhooks/finance',
    };
  },

  async getNotifications(): Promise<Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    data: Record<string, any>;
    read: boolean;
    created_at: string;
  }>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: 'notif_1',
        type: 'transaction',
        title: 'New Transaction',
        message: 'A new transaction of $45.50 has been posted to your account',
        data: { transaction_id: 'txn_123', amount: 45.50 },
        read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 'notif_2',
        type: 'budget_alert',
        title: 'Budget Alert',
        message: 'You have spent 80% of your food & dining budget',
        data: { budget_id: 'budget_1', spent_percentage: 80 },
        read: true,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  },

  async markNotificationAsRead(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
  },

  async markAllNotificationsAsRead(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
  },
};

// Export the appropriate service based on environment
export const bankIntegrationAPIService = mockBankIntegrationService; // Always use mock for now
