import axios from 'axios';

// Base API configuration
import { API_BASE_URL as CONFIG_API_URL } from '../config/api';
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || CONFIG_API_URL || 'http://localhost:8000';

// Types
export interface BankAccount {
  id: string;
  user_id: string;
  account_name: string;
  bank_name: string;
  account_number: string;
  account_type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  interest_rate?: number;
  credit_limit?: number;
  is_active: boolean;
  is_primary: boolean;
  last_updated: string;
  created_at: string;
}

export interface BankAccountCreate {
  account_name: string;
  bank_name: string;
  account_number: string;
  account_type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  interest_rate?: number;
  credit_limit?: number;
  is_active: boolean;
  is_primary: boolean;
}

export interface BankAccountUpdate {
  account_name?: string;
  bank_name?: string;
  account_number?: string;
  account_type?: 'checking' | 'savings' | 'credit' | 'investment';
  balance?: number;
  currency?: string;
  interest_rate?: number;
  credit_limit?: number;
  is_active?: boolean;
  is_primary?: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  date: string;
  account_id?: string;
  notes?: string;
  receipt_url?: string;
  created_at: string;
}

export interface TransactionCreate {
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  date: string;
  account_id?: string;
  notes?: string;
  receipt_url?: string;
}

export interface TransactionUpdate {
  description?: string;
  amount?: number;
  type?: 'income' | 'expense' | 'transfer';
  category?: string;
  date?: string;
  account_id?: string;
  notes?: string;
  receipt_url?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  name: string;
  category: string;
  amount: number;
  currency: string;
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string;
  budget_type: 'category' | 'goal' | 'overall';
  goal_amount?: number;
  goal_deadline?: string;
  alerts: {
    warning_threshold: number;
    critical_threshold: number;
    email_alerts: boolean;
    push_alerts: boolean;
  };
  notes?: string;
  is_active: boolean;
  spent: number;
  remaining: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetCreate {
  name: string;
  category: string;
  amount: number;
  currency: string;
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string;
  budget_type: 'category' | 'goal' | 'overall';
  goal_amount?: number;
  goal_deadline?: string;
  alerts: {
    warning_threshold: number;
    critical_threshold: number;
    email_alerts: boolean;
    push_alerts: boolean;
  };
  notes?: string;
  is_active: boolean;
}

export interface BudgetUpdate {
  name?: string;
  category?: string;
  amount?: number;
  currency?: string;
  period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date?: string;
  end_date?: string;
  budget_type?: 'category' | 'goal' | 'overall';
  goal_amount?: number;
  goal_deadline?: string;
  alerts?: {
    warning_threshold: number;
    critical_threshold: number;
    email_alerts: boolean;
    push_alerts: boolean;
  };
  notes?: string;
  is_active?: boolean;
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  name: string;
  description: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  status: 'active' | 'completed' | 'overdue';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialGoalCreate {
  name: string;
  description: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  status: 'active' | 'completed' | 'overdue';
  notes?: string;
}

export interface FinancialGoalUpdate {
  name?: string;
  description?: string;
  target_amount?: number;
  current_amount?: number;
  currency?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  deadline?: string;
  status?: 'active' | 'completed' | 'overdue';
  notes?: string;
}

export interface DebtTracker {
  id: string;
  user_id: string;
  name: string;
  creditor: string;
  account_number: string;
  debt_type: 'credit_card' | 'loan' | 'mortgage' | 'student_loan' | 'car_loan' | 'personal_loan';
  original_amount: number;
  current_balance: number;
  interest_rate: number;
  monthly_payment: number;
  due_date: string;
  remaining_payments: number;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'paid_off' | 'overdue';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DebtTrackerCreate {
  name: string;
  creditor: string;
  account_number: string;
  debt_type: 'credit_card' | 'loan' | 'mortgage' | 'student_loan' | 'car_loan' | 'personal_loan';
  original_amount: number;
  current_balance: number;
  interest_rate: number;
  monthly_payment: number;
  due_date: string;
  remaining_payments: number;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'paid_off' | 'overdue';
  notes?: string;
}

export interface DebtTrackerUpdate {
  name?: string;
  creditor?: string;
  account_number?: string;
  debt_type?: 'credit_card' | 'loan' | 'mortgage' | 'student_loan' | 'car_loan' | 'personal_loan';
  original_amount?: number;
  current_balance?: number;
  interest_rate?: number;
  monthly_payment?: number;
  due_date?: string;
  remaining_payments?: number;
  priority?: 'low' | 'medium' | 'high';
  status?: 'active' | 'paid_off' | 'overdue';
  notes?: string;
}

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  symbol: string;
  investment_type: 'stocks' | 'bonds' | 'etfs' | 'mutual_funds' | 'real_estate' | 'crypto' | 'other';
  purchase_price: number;
  current_value: number;
  quantity: number;
  purchase_date: string;
  sell_date?: string;
  risk_level: 'low' | 'medium' | 'high';
  status: 'active' | 'sold' | 'pending';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InvestmentCreate {
  name: string;
  symbol: string;
  investment_type: 'stocks' | 'bonds' | 'etfs' | 'mutual_funds' | 'real_estate' | 'crypto' | 'other';
  purchase_price: number;
  current_value: number;
  quantity: number;
  purchase_date: string;
  sell_date?: string;
  risk_level: 'low' | 'medium' | 'high';
  status: 'active' | 'sold' | 'pending';
  notes?: string;
}

export interface InvestmentUpdate {
  name?: string;
  symbol?: string;
  investment_type?: 'stocks' | 'bonds' | 'etfs' | 'mutual_funds' | 'real_estate' | 'crypto' | 'other';
  purchase_price?: number;
  current_value?: number;
  quantity?: number;
  purchase_date?: string;
  sell_date?: string;
  risk_level?: 'low' | 'medium' | 'high';
  status?: 'active' | 'sold' | 'pending';
  notes?: string;
}

export interface FinancialAnalytics {
  total_balance: number;
  spending_by_category: Record<string, number>;
  income_by_category: Record<string, number>;
  monthly_spending: Record<string, number>;
  budget_performance: Array<{
    budget_name: string;
    budget_amount: number;
    spent: number;
    remaining: number;
    percentage_used: number;
  }>;
  total_transactions: number;
  period: {
    start_date: string;
    end_date: string;
  };
}

export interface FinancialReport {
  summary?: {
    total_balance: number;
    total_debt: number;
    total_investments: number;
    net_worth: number;
    active_accounts: number;
    active_budgets: number;
    active_goals: number;
    active_debts: number;
    active_investments: number;
  };
  recent_transactions?: Transaction[];
  analytics?: FinancialAnalytics;
  budget_reports?: Array<{
    budget_name: string;
    category: string;
    budget_amount: number;
    spent: number;
    remaining: number;
    percentage_used: number;
    status: 'over_budget' | 'under_budget';
  }>;
  total_budgets?: number;
  active_budgets?: number;
  generated_at: string;
  report_type: 'summary' | 'detailed' | 'budget';
}

export interface Forecast {
  id: string;
  user_id: string;
  title: string;
  predicted_value: number;
  forecast_type: 'income' | 'expense' | 'savings' | 'investment' | 'debt' | 'net_worth';
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string;
  confidence_level?: 'low' | 'medium' | 'high';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ForecastCreate {
  title: string;
  predicted_value: number;
  forecast_type: 'income' | 'expense' | 'savings' | 'investment' | 'debt' | 'net_worth';
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string;
  confidence_level?: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface ForecastUpdate {
  title?: string;
  predicted_value?: number;
  forecast_type?: 'income' | 'expense' | 'savings' | 'investment' | 'debt' | 'net_worth';
  period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date?: string;
  end_date?: string;
  confidence_level?: 'low' | 'medium' | 'high';
  notes?: string;
}

// API Service Class
class FinanceAPIService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/api/finance`;
  }

  // Helper method to get auth headers
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Helper method to handle API responses
  private async handleResponse<T>(response: Promise<T>): Promise<T> {
    try {
      return await response;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      throw error;
    }
  }

  // Bank Account APIs
  async getBankAccounts(): Promise<BankAccount[]> {
    return this.handleResponse(
      axios.get(`${this.baseURL}/accounts`, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async getBankAccount(accountId: string): Promise<BankAccount> {
    return this.handleResponse(
      axios.get(`${this.baseURL}/accounts/${accountId}`, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async createBankAccount(accountData: BankAccountCreate): Promise<BankAccount> {
    return this.handleResponse(
      axios.post(`${this.baseURL}/accounts`, accountData, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async updateBankAccount(accountId: string, accountData: BankAccountUpdate): Promise<BankAccount> {
    return this.handleResponse(
      axios.put(`${this.baseURL}/accounts/${accountId}`, accountData, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async deleteBankAccount(accountId: string): Promise<void> {
    return this.handleResponse(
      axios.delete(`${this.baseURL}/accounts/${accountId}`, {
        headers: this.getAuthHeaders(),
      }).then(() => {})
    );
  }

  // Transaction APIs
  async getTransactions(limit: number = 100, offset: number = 0): Promise<Transaction[]> {
    return this.handleResponse(
      axios.get(`${this.baseURL}/transactions`, {
        headers: this.getAuthHeaders(),
        params: { limit, offset },
      }).then(response => response.data)
    );
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    return this.handleResponse(
      axios.get(`${this.baseURL}/transactions/${transactionId}`, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async createTransaction(transactionData: TransactionCreate): Promise<Transaction> {
    return this.handleResponse(
      axios.post(`${this.baseURL}/transactions`, transactionData, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async updateTransaction(transactionId: string, transactionData: TransactionUpdate): Promise<Transaction> {
    return this.handleResponse(
      axios.put(`${this.baseURL}/transactions/${transactionId}`, transactionData, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    return this.handleResponse(
      axios.delete(`${this.baseURL}/transactions/${transactionId}`, {
        headers: this.getAuthHeaders(),
      }).then(() => {})
    );
  }

  // Budget APIs
  async getBudgets(): Promise<Budget[]> {
    return this.handleResponse(
      axios.get(`${this.baseURL}/budgets`, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async getBudget(budgetId: string): Promise<Budget> {
    return this.handleResponse(
      axios.get(`${this.baseURL}/budgets/${budgetId}`, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async createBudget(budgetData: BudgetCreate): Promise<Budget> {
    return this.handleResponse(
      axios.post(`${this.baseURL}/budgets`, budgetData, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async updateBudget(budgetId: string, budgetData: BudgetUpdate): Promise<Budget> {
    return this.handleResponse(
      axios.put(`${this.baseURL}/budgets/${budgetId}`, budgetData, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async deleteBudget(budgetId: string): Promise<void> {
    return this.handleResponse(
      axios.delete(`${this.baseURL}/budgets/${budgetId}`, {
        headers: this.getAuthHeaders(),
      }).then(() => {})
    );
  }

  // Financial Goals APIs
  async getFinancialGoals(): Promise<FinancialGoal[]> {
    return this.handleResponse(
      axios.get(`${this.baseURL}/goals`, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async getFinancialGoal(goalId: string): Promise<FinancialGoal> {
    return this.handleResponse(
      axios.get(`${this.baseURL}/goals/${goalId}`, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async createFinancialGoal(goalData: FinancialGoalCreate): Promise<FinancialGoal> {
    return this.handleResponse(
      axios.post(`${this.baseURL}/goals`, goalData, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async updateFinancialGoal(goalId: string, goalData: FinancialGoalUpdate): Promise<FinancialGoal> {
    return this.handleResponse(
      axios.put(`${this.baseURL}/goals/${goalId}`, goalData, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async deleteFinancialGoal(goalId: string): Promise<void> {
    return this.handleResponse(
      axios.delete(`${this.baseURL}/goals/${goalId}`, {
        headers: this.getAuthHeaders(),
      }).then(() => {})
    );
  }

  // Debt Tracker APIs
  async getDebtTrackers(): Promise<DebtTracker[]> {
    return this.handleResponse(
      axios.get(`${this.baseURL}/debts`, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async getDebtTracker(debtId: string): Promise<DebtTracker> {
    return this.handleResponse(
      axios.get(`${this.baseURL}/debts/${debtId}`, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async createDebtTracker(debtData: DebtTrackerCreate): Promise<DebtTracker> {
    return this.handleResponse(
      axios.post(`${this.baseURL}/debts`, debtData, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async updateDebtTracker(debtId: string, debtData: DebtTrackerUpdate): Promise<DebtTracker> {
    return this.handleResponse(
      axios.put(`${this.baseURL}/debts/${debtId}`, debtData, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async deleteDebtTracker(debtId: string): Promise<void> {
    return this.handleResponse(
      axios.delete(`${this.baseURL}/debts/${debtId}`, {
        headers: this.getAuthHeaders(),
      }).then(() => {})
    );
  }

  // Investment APIs
  async getInvestments(): Promise<Investment[]> {
    return this.handleResponse(
      axios.get(`${this.baseURL}/investments`, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async getInvestment(investmentId: string): Promise<Investment> {
    return this.handleResponse(
      axios.get(`${this.baseURL}/investments/${investmentId}`, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async createInvestment(investmentData: InvestmentCreate): Promise<Investment> {
    return this.handleResponse(
      axios.post(`${this.baseURL}/investments`, investmentData, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async updateInvestment(investmentId: string, investmentData: InvestmentUpdate): Promise<Investment> {
    return this.handleResponse(
      axios.put(`${this.baseURL}/investments/${investmentId}`, investmentData, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async deleteInvestment(investmentId: string): Promise<void> {
    return this.handleResponse(
      axios.delete(`${this.baseURL}/investments/${investmentId}`, {
        headers: this.getAuthHeaders(),
      }).then(() => {})
    );
  }

  // Analytics and Reports APIs
  async getFinancialAnalytics(): Promise<FinancialAnalytics> {
    return this.handleResponse(
      axios.get(`${this.baseURL}/analytics`, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }

  async getFinancialReports(reportType: 'summary' | 'detailed' | 'budget' = 'summary'): Promise<FinancialReport> {
    return this.handleResponse(
      axios.get(`${this.baseURL}/reports`, {
        headers: this.getAuthHeaders(),
        params: { report_type: reportType },
      }).then(response => response.data)
    );
  }

  async getAIForecast(): Promise<any> {
    return this.handleResponse(
      axios.get(`${this.baseURL}/forecast`, {
        headers: this.getAuthHeaders(),
      }).then(response => response.data)
    );
  }
}

// Mock Finance API Service
export const mockFinanceAPI = {
  // Bank Account APIs
  async getBankAccounts(): Promise<BankAccount[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: '1',
        user_id: 'user_123',
        account_name: 'Main Checking',
        bank_name: 'Chase Bank',
        account_number: '****1234',
        account_type: 'checking',
        balance: 5420.50,
        currency: 'USD',
        interest_rate: 0.01,
        is_active: true,
        is_primary: true,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        user_id: 'user_123',
        account_name: 'Savings Account',
        bank_name: 'Chase Bank',
        account_number: '****5678',
        account_type: 'savings',
        balance: 15200.75,
        currency: 'USD',
        interest_rate: 0.05,
        is_active: true,
        is_primary: false,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: '3',
        user_id: 'user_123',
        account_name: 'Credit Card',
        bank_name: 'Chase Bank',
        account_number: '****9012',
        account_type: 'credit',
        balance: -1250.30,
        currency: 'USD',
        credit_limit: 10000,
        is_active: true,
        is_primary: false,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }
    ];
  },

  async getBankAccount(accountId: string): Promise<BankAccount> {
    const accounts = await this.getBankAccounts();
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) throw new Error('Bank account not found');
    return account;
  },

  async createBankAccount(accountData: BankAccountCreate): Promise<BankAccount> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      id: Date.now().toString(),
      user_id: 'user_123',
      ...accountData,
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString(),
    } as BankAccount;
  },

  async updateBankAccount(accountId: string, accountData: BankAccountUpdate): Promise<BankAccount> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const existing = await this.getBankAccount(accountId);
    return { ...existing, ...accountData, last_updated: new Date().toISOString() };
  },

  async deleteBankAccount(accountId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  // Transaction APIs
  async getTransactions(limit: number = 100, offset: number = 0): Promise<Transaction[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        user_id: 'user_123',
        description: 'Grocery Shopping',
        amount: 125.50,
        type: 'expense',
        category: 'food_dining',
        date: new Date().toISOString(),
        account_id: '1',
        notes: 'Weekly groceries',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        user_id: 'user_123',
        description: 'Salary Deposit',
        amount: 5000.00,
        type: 'income',
        category: 'salary',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        account_id: '1',
        notes: 'Monthly salary',
        created_at: new Date().toISOString(),
      },
      {
        id: '3',
        user_id: 'user_123',
        description: 'Gas Station',
        amount: 45.75,
        type: 'expense',
        category: 'transportation',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        account_id: '1',
        notes: 'Fuel for car',
        created_at: new Date().toISOString(),
      },
      {
        id: '4',
        user_id: 'user_123',
        description: 'Netflix Subscription',
        amount: 15.99,
        type: 'expense',
        category: 'entertainment',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        account_id: '1',
        notes: 'Monthly subscription',
        created_at: new Date().toISOString(),
      },
      {
        id: '5',
        user_id: 'user_123',
        description: 'Freelance Payment',
        amount: 1200.00,
        type: 'income',
        category: 'freelance',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        account_id: '1',
        notes: 'Web development project',
        created_at: new Date().toISOString(),
      }
    ];
    return mockTransactions.slice(offset, offset + limit);
  },

  async getTransaction(transactionId: string): Promise<Transaction> {
    const transactions = await this.getTransactions();
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) throw new Error('Transaction not found');
    return transaction;
  },

  async createTransaction(transactionData: TransactionCreate): Promise<Transaction> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      id: Date.now().toString(),
      user_id: 'user_123',
      ...transactionData,
      created_at: new Date().toISOString(),
    } as Transaction;
  },

  async updateTransaction(transactionId: string, transactionData: TransactionUpdate): Promise<Transaction> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const existing = await this.getTransaction(transactionId);
    return { ...existing, ...transactionData };
  },

  async deleteTransaction(transactionId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  // Budget APIs
  async getBudgets(): Promise<Budget[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: '1',
        user_id: 'user_123',
        name: 'Food & Dining',
        category: 'food_dining',
        amount: 500,
        currency: 'USD',
        period: 'monthly',
        start_date: new Date().toISOString(),
        budget_type: 'category',
        alerts: {
          warning_threshold: 80,
          critical_threshold: 95,
          email_alerts: true,
          push_alerts: true,
        },
        is_active: true,
        spent: 320,
        remaining: 180,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        user_id: 'user_123',
        name: 'Transportation',
        category: 'transportation',
        amount: 300,
        currency: 'USD',
        period: 'monthly',
        start_date: new Date().toISOString(),
        budget_type: 'category',
        alerts: {
          warning_threshold: 80,
          critical_threshold: 95,
          email_alerts: true,
          push_alerts: true,
        },
        is_active: true,
        spent: 180,
        remaining: 120,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];
  },

  async getBudget(budgetId: string): Promise<Budget> {
    const budgets = await this.getBudgets();
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) throw new Error('Budget not found');
    return budget;
  },

  async createBudget(budgetData: BudgetCreate): Promise<Budget> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      id: Date.now().toString(),
      user_id: 'user_123',
      ...budgetData,
      created_at: new Date().toISOString(),
    } as Budget;
  },

  async updateBudget(budgetId: string, budgetData: BudgetUpdate): Promise<Budget> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const existing = await this.getBudget(budgetId);
    return { ...existing, ...budgetData };
  },

  async deleteBudget(budgetId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  // Financial Goals APIs
  async getFinancialGoals(): Promise<FinancialGoal[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: '1',
        user_id: 'user_123',
        name: 'Emergency Fund',
        description: 'Save 6 months of expenses',
        target_amount: 15000,
        current_amount: 12500,
        currency: 'USD',
        category: 'savings',
        priority: 'high',
        deadline: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        notes: 'Save 6 months of expenses',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];
  },

  async getFinancialGoal(goalId: string): Promise<FinancialGoal> {
    const goals = await this.getFinancialGoals();
    const goal = goals.find(g => g.id === goalId);
    if (!goal) throw new Error('Financial goal not found');
    return goal;
  },

  async createFinancialGoal(goalData: FinancialGoalCreate): Promise<FinancialGoal> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      id: Date.now().toString(),
      user_id: 'user_123',
      ...goalData,
      created_at: new Date().toISOString(),
    } as FinancialGoal;
  },

  async updateFinancialGoal(goalId: string, goalData: FinancialGoalUpdate): Promise<FinancialGoal> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const existing = await this.getFinancialGoal(goalId);
    return { ...existing, ...goalData };
  },

  async deleteFinancialGoal(goalId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  // Debt Tracker APIs
  async getDebtTrackers(): Promise<DebtTracker[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: '1',
        user_id: 'user_123',
        name: 'Student Loan',
        original_amount: 25000,
        current_amount: 18000,
        interest_rate: 4.5,
        minimum_payment: 250,
        payment_frequency: 'monthly',
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        debt_type: 'student_loan',
        status: 'active',
        notes: 'Federal student loan',
        created_at: new Date().toISOString(),
      }
    ];
  },

  async getDebtTracker(debtId: string): Promise<DebtTracker> {
    const debts = await this.getDebtTrackers();
    const debt = debts.find(d => d.id === debtId);
    if (!debt) throw new Error('Debt tracker not found');
    return debt;
  },

  async createDebtTracker(debtData: DebtTrackerCreate): Promise<DebtTracker> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      id: Date.now().toString(),
      user_id: 'user_123',
      ...debtData,
      created_at: new Date().toISOString(),
    } as DebtTracker;
  },

  async updateDebtTracker(debtId: string, debtData: DebtTrackerUpdate): Promise<DebtTracker> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const existing = await this.getDebtTracker(debtId);
    return { ...existing, ...debtData };
  },

  async deleteDebtTracker(debtId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  // Investment APIs
  async getInvestments(): Promise<Investment[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: '1',
        user_id: 'user_123',
        name: '401(k) Retirement',
        type: 'retirement',
        amount: 45000,
        currency: 'USD',
        return_rate: 8.5,
        risk_level: 'moderate',
        status: 'active',
        notes: 'Company retirement plan',
        created_at: new Date().toISOString(),
      }
    ];
  },

  async getInvestment(investmentId: string): Promise<Investment> {
    const investments = await this.getInvestments();
    const investment = investments.find(i => i.id === investmentId);
    if (!investment) throw new Error('Investment not found');
    return investment;
  },

  async createInvestment(investmentData: InvestmentCreate): Promise<Investment> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      id: Date.now().toString(),
      user_id: 'user_123',
      ...investmentData,
      created_at: new Date().toISOString(),
    } as Investment;
  },

  async updateInvestment(investmentId: string, investmentData: InvestmentUpdate): Promise<Investment> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const existing = await this.getInvestment(investmentId);
    return { ...existing, ...investmentData };
  },

  async deleteInvestment(investmentId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  // Analytics and Reports APIs
  async getFinancialAnalytics(): Promise<FinancialAnalytics> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      total_balance: 19570.95,
      monthly_income: 6200.00,
      monthly_expenses: 4200.00,
      monthly_savings: 2000.00,
      savings_rate: 32.26,
      spending_by_category: {
        food_dining: 1250.50,
        transportation: 450.75,
        housing: 2000.00,
        utilities: 300.00,
        entertainment: 200.00,
      },
      income_by_category: {
        salary: 5000.00,
        freelance: 1200.00,
      },
      recent_transactions: [],
      active_budgets: [],
      financial_goals: [],
      debt_summary: {
        total_debt: 18000,
        monthly_payments: 250,
        debt_to_income_ratio: 0.29,
      },
      investment_summary: {
        total_investments: 45000,
        total_return: 3825,
        return_rate: 8.5,
      },
    };
  },

  async getFinancialReports(reportType: 'summary' | 'detailed' | 'budget' = 'summary'): Promise<FinancialReport> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      report_type: reportType,
      generated_at: new Date().toISOString(),
      period: 'monthly',
      summary: {
        total_income: 6200.00,
        total_expenses: 4200.00,
        net_savings: 2000.00,
        savings_rate: 32.26,
      },
      details: {
        income_breakdown: {},
        expense_breakdown: {},
        budget_performance: {},
      },
      recommendations: [
        'Consider increasing your emergency fund',
        'Your savings rate is excellent',
        'Monitor your entertainment spending',
      ],
    };
  },

  async getAIForecast(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      forecast_type: 'spending',
      prediction: 'Your spending is expected to increase by 5% next month',
      confidence: 0.85,
      factors: ['Seasonal spending patterns', 'Recent transaction history'],
    };
  },
};

// Export singleton instance
export const financeAPI = new FinanceAPIService();

// Export the appropriate API based on environment
// To use real API: ensure backend is running and VITE_USE_MOCK_API is not set to 'true'
const useMockAPI = (import.meta as any).env?.VITE_USE_MOCK_API === 'true' || (import.meta as any).env?.DEV;
export const financeAPIService = useMockAPI ? mockFinanceAPI : new FinanceAPIService();


