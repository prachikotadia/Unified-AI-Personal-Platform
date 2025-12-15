import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  BankAccount,
  Transaction,
  Budget,
  FinancialGoal,
  DebtTracker,
  Investment,
  FinancialAnalytics,
  FinancialReport,
  Forecast,
  ForecastCreate,
  ForecastUpdate,
  financeAPIService,
} from '../services/financeAPI';
import { isGuestMode, generateLocalId } from '../utils/financeHelpers';

/**
 * Finance module state management interface.
 * Handles all financial data operations with optimistic updates and localStorage persistence.
 */
interface FinanceState {
  bankAccounts: BankAccount[];
  transactions: Transaction[];
  budgets: Budget[];
  financialGoals: FinancialGoal[];
  debtTrackers: DebtTracker[];
  investments: Investment[];
  forecasts: Forecast[];
  analytics: FinancialAnalytics | null;
  reports: FinancialReport | null;
  
  isLoading: {
    bankAccounts: boolean;
    transactions: boolean;
    budgets: boolean;
    financialGoals: boolean;
    debtTrackers: boolean;
    investments: boolean;
    forecasts: boolean;
    analytics: boolean;
    reports: boolean;
  };
  
  errors: {
    bankAccounts: string | null;
    transactions: string | null;
    budgets: string | null;
    financialGoals: string | null;
    debtTrackers: string | null;
    investments: string | null;
    forecasts: string | null;
    analytics: string | null;
    reports: string | null;
  };
  
  fetchBankAccounts: () => Promise<void>;
  createBankAccount: (account: BankAccount) => Promise<void>;
  updateBankAccount: (id: string, account: Partial<BankAccount>) => Promise<void>;
  deleteBankAccount: (id: string) => Promise<void>;
  
  fetchTransactions: (limit?: number, offset?: number) => Promise<void>;
  createTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  fetchBudgets: () => Promise<void>;
  createBudget: (budget: Budget) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  
  fetchFinancialGoals: () => Promise<void>;
  createFinancialGoal: (goal: FinancialGoal) => Promise<void>;
  updateFinancialGoal: (id: string, goal: Partial<FinancialGoal>) => Promise<void>;
  deleteFinancialGoal: (id: string) => Promise<void>;
  
  fetchDebtTrackers: () => Promise<void>;
  createDebtTracker: (debt: DebtTracker) => Promise<void>;
  updateDebtTracker: (id: string, debt: Partial<DebtTracker>) => Promise<void>;
  deleteDebtTracker: (id: string) => Promise<void>;
  
  fetchInvestments: () => Promise<void>;
  createInvestment: (investment: Investment) => Promise<void>;
  updateInvestment: (id: string, investment: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  
  fetchForecasts: () => Promise<void>;
  createForecast: (forecast: ForecastCreate) => Promise<void>;
  updateForecast: (id: string, forecast: Partial<ForecastUpdate>) => Promise<void>;
  deleteForecast: (id: string) => Promise<void>;
  
  // Analytics and Reports Actions
  fetchAnalytics: () => Promise<void>;
  fetchReports: (reportType?: 'summary' | 'detailed' | 'budget') => Promise<void>;
  
  // Import/Export Actions
  exportFinanceData: () => string;
  importFinanceData: (jsonData: string, merge?: boolean) => Promise<void>;
  
  // Utility Actions
  clearErrors: () => void;
  resetStore: () => void;
  
  // Calculation Functions
  getTotalBalance: () => number;
  getMonthlyIncome: () => number;
  getMonthlyExpenses: () => number;
  getMonthlySavings: () => number;
  getSavingsRate: () => number;
}

// Initial State
const initialState = {
  bankAccounts: [],
  transactions: [],
  budgets: [],
  financialGoals: [],
  debtTrackers: [],
  investments: [],
  forecasts: [],
  analytics: null,
  reports: null,
  
  isLoading: {
    bankAccounts: false,
    transactions: false,
    budgets: false,
    financialGoals: false,
    debtTrackers: false,
    investments: false,
    forecasts: false,
    analytics: false,
    reports: false,
  },
  
  errors: {
    bankAccounts: null,
    transactions: null,
    budgets: null,
    financialGoals: null,
    debtTrackers: null,
    investments: null,
    forecasts: null,
    analytics: null,
    reports: null,
  },
};

// Create Finance Store
export const useFinanceStore = create<FinanceState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Bank Account Actions
        fetchBankAccounts: async () => {
          const guest = isGuestMode();
          
          if (guest) {
            // Guest mode: Data is already loaded from localStorage via persist middleware
            return;
          }
          
          set(state => ({
            isLoading: { ...state.isLoading, bankAccounts: true },
            errors: { ...state.errors, bankAccounts: null },
          }));
          
          try {
            const accounts = await financeAPIService.getBankAccounts();
            set(state => ({
              bankAccounts: accounts,
              isLoading: { ...state.isLoading, bankAccounts: false },
            }));
          } catch (error: any) {
            set(state => ({
              isLoading: { ...state.isLoading, bankAccounts: false },
              errors: { ...state.errors, bankAccounts: error.message || 'Failed to fetch bank accounts' },
            }));
          }
        },
        
        createBankAccount: async (account: BankAccount) => {
          try {
            const guest = isGuestMode();
            let newAccount: BankAccount;
            
            if (guest) {
              // Guest mode: Create locally only, no API call
              newAccount = {
                ...account,
                id: account.id || generateLocalId(),
                created_at: account.created_at || new Date().toISOString(),
                last_updated: account.last_updated || new Date().toISOString(),
              };
            } else {
              // Logged-in mode: Call API
              newAccount = await financeAPIService.createBankAccount(account);
            }
            
            set(state => ({
              bankAccounts: [...state.bankAccounts, newAccount],
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, bankAccounts: error.message || 'Failed to create bank account' },
            }));
            throw error;
          }
        },
        
        updateBankAccount: async (id: string, account: Partial<BankAccount>) => {
          try {
            const guest = isGuestMode();
            let updatedAccount: BankAccount;
            
            if (guest) {
              // Guest mode: Update locally only
              const existing = get().bankAccounts.find(acc => acc.id === id);
              if (!existing) throw new Error('Account not found');
              updatedAccount = {
                ...existing,
                ...account,
                last_updated: new Date().toISOString(),
              };
            } else {
              // Logged-in mode: Call API
              updatedAccount = await financeAPIService.updateBankAccount(id, account);
            }
            
            set(state => ({
              bankAccounts: state.bankAccounts.map(acc => 
                acc.id === id ? updatedAccount : acc
              ),
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, bankAccounts: error.message || 'Failed to update bank account' },
            }));
            throw error;
          }
        },
        
        deleteBankAccount: async (id: string) => {
          try {
            const guest = isGuestMode();
            
            if (!guest) {
              // Logged-in mode: Call API
              await financeAPIService.deleteBankAccount(id);
            }
            // Guest mode: Just update state (no API call)
            
            set(state => ({
              bankAccounts: state.bankAccounts.filter(acc => acc.id !== id),
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, bankAccounts: error.message || 'Failed to delete bank account' },
            }));
            throw error;
          }
        },
        
        // Transaction Actions
        fetchTransactions: async (limit = 100, offset = 0) => {
          const guest = isGuestMode();
          
          if (guest) {
            // Guest mode: Data is already loaded from localStorage via persist middleware
            return;
          }
          
          set(state => ({
            isLoading: { ...state.isLoading, transactions: true },
            errors: { ...state.errors, transactions: null },
          }));
          
          try {
            const transactions = await financeAPIService.getTransactions(limit, offset);
            set(state => ({
              transactions: transactions,
              isLoading: { ...state.isLoading, transactions: false },
            }));
          } catch (error: any) {
            set(state => ({
              isLoading: { ...state.isLoading, transactions: false },
              errors: { ...state.errors, transactions: error.message || 'Failed to fetch transactions' },
            }));
          }
        },
        
        createTransaction: async (transaction: Transaction) => {
          try {
            const guest = isGuestMode();
            let newTransaction: Transaction;
            
            if (guest) {
              // Guest mode: Create locally only, no API call
              newTransaction = {
                ...transaction,
                id: transaction.id || generateLocalId(),
                created_at: transaction.created_at || new Date().toISOString(),
                updated_at: transaction.updated_at || new Date().toISOString(),
              };
            } else {
              // Logged-in mode: Call API
              newTransaction = await financeAPIService.createTransaction(transaction);
            }
            
            set(state => ({
              transactions: [newTransaction, ...state.transactions],
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, transactions: error.message || 'Failed to create transaction' },
            }));
            throw error;
          }
        },
        
        updateTransaction: async (id: string, transaction: Partial<Transaction>) => {
          try {
            const guest = isGuestMode();
            let updatedTransaction: Transaction;
            
            if (guest) {
              // Guest mode: Update locally only
              const existing = get().transactions.find(txn => txn.id === id);
              if (!existing) throw new Error('Transaction not found');
              updatedTransaction = {
                ...existing,
                ...transaction,
                updated_at: new Date().toISOString(),
              };
            } else {
              // Logged-in mode: Call API
              updatedTransaction = await financeAPIService.updateTransaction(id, transaction);
            }
            
            set(state => ({
              transactions: state.transactions.map(txn => 
                txn.id === id ? updatedTransaction : txn
              ),
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, transactions: error.message || 'Failed to update transaction' },
            }));
            throw error;
          }
        },
        
        deleteTransaction: async (id: string) => {
          try {
            const guest = isGuestMode();
            
            if (!guest) {
              // Logged-in mode: Call API
              await financeAPIService.deleteTransaction(id);
            }
            // Guest mode: Just update state (no API call)
            
            set(state => ({
              transactions: state.transactions.filter(txn => txn.id !== id),
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, transactions: error.message || 'Failed to delete transaction' },
            }));
            throw error;
          }
        },
        
        // Budget Actions
        fetchBudgets: async () => {
          const guest = isGuestMode();
          
          if (guest) {
            // Guest mode: Data is already loaded from localStorage via persist middleware
            return;
          }
          
          set(state => ({
            isLoading: { ...state.isLoading, budgets: true },
            errors: { ...state.errors, budgets: null },
          }));
          
          try {
            const budgets = await financeAPIService.getBudgets();
            set(state => ({
              budgets: budgets,
              isLoading: { ...state.isLoading, budgets: false },
            }));
          } catch (error: any) {
            set(state => ({
              isLoading: { ...state.isLoading, budgets: false },
              errors: { ...state.errors, budgets: error.message || 'Failed to fetch budgets' },
            }));
          }
        },
        
        createBudget: async (budget: Budget) => {
          try {
            const guest = isGuestMode();
            let newBudget: Budget;
            
            if (guest) {
              // Guest mode: Create locally only, no API call
              newBudget = {
                ...budget,
                id: budget.id || generateLocalId(),
                created_at: budget.created_at || new Date().toISOString(),
                updated_at: budget.updated_at || new Date().toISOString(),
              };
            } else {
              // Logged-in mode: Call API
              newBudget = await financeAPIService.createBudget(budget);
            }
            
            set(state => ({
              budgets: [...state.budgets, newBudget],
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, budgets: error.message || 'Failed to create budget' },
            }));
            throw error;
          }
        },
        
        updateBudget: async (id: string, budget: Partial<Budget>) => {
          try {
            const guest = isGuestMode();
            let updatedBudget: Budget;
            
            if (guest) {
              // Guest mode: Update locally only
              const existing = get().budgets.find(b => b.id === id);
              if (!existing) throw new Error('Budget not found');
              updatedBudget = {
                ...existing,
                ...budget,
                updated_at: new Date().toISOString(),
              };
            } else {
              // Logged-in mode: Call API
              updatedBudget = await financeAPIService.updateBudget(id, budget);
            }
            
            set(state => ({
              budgets: state.budgets.map(b => 
                b.id === id ? updatedBudget : b
              ),
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, budgets: error.message || 'Failed to update budget' },
            }));
            throw error;
          }
        },
        
        deleteBudget: async (id: string) => {
          try {
            const guest = isGuestMode();
            
            if (!guest) {
              // Logged-in mode: Call API
              await financeAPIService.deleteBudget(id);
            }
            // Guest mode: Just update state (no API call)
            
            set(state => ({
              budgets: state.budgets.filter(b => b.id !== id),
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, budgets: error.message || 'Failed to delete budget' },
            }));
            throw error;
          }
        },
        
        // Financial Goals Actions
        fetchFinancialGoals: async () => {
          const guest = isGuestMode();
          
          if (guest) {
            // Guest mode: Data is already loaded from localStorage via persist middleware
            return;
          }
          
          set(state => ({
            isLoading: { ...state.isLoading, financialGoals: true },
            errors: { ...state.errors, financialGoals: null },
          }));
          
          try {
            const goals = await financeAPIService.getFinancialGoals();
            set(state => ({
              financialGoals: goals,
              isLoading: { ...state.isLoading, financialGoals: false },
            }));
          } catch (error: any) {
            set(state => ({
              isLoading: { ...state.isLoading, financialGoals: false },
              errors: { ...state.errors, financialGoals: error.message || 'Failed to fetch financial goals' },
            }));
          }
        },
        
        createFinancialGoal: async (goal: FinancialGoal) => {
          try {
            const guest = isGuestMode();
            let newGoal: FinancialGoal;
            
            if (guest) {
              // Guest mode: Create locally only, no API call
              newGoal = {
                ...goal,
                id: goal.id || generateLocalId(),
                created_at: goal.created_at || new Date().toISOString(),
                updated_at: goal.updated_at || new Date().toISOString(),
              };
            } else {
              // Logged-in mode: Call API
              newGoal = await financeAPIService.createFinancialGoal(goal);
            }
            
            set(state => ({
              financialGoals: [...state.financialGoals, newGoal],
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, financialGoals: error.message || 'Failed to create financial goal' },
            }));
            throw error;
          }
        },
        
        updateFinancialGoal: async (id: string, goal: Partial<FinancialGoal>) => {
          try {
            const guest = isGuestMode();
            let updatedGoal: FinancialGoal;
            
            if (guest) {
              // Guest mode: Update locally only
              const existing = get().financialGoals.find(g => g.id === id);
              if (!existing) throw new Error('Financial goal not found');
              updatedGoal = {
                ...existing,
                ...goal,
                updated_at: new Date().toISOString(),
              };
            } else {
              // Logged-in mode: Call API
              updatedGoal = await financeAPIService.updateFinancialGoal(id, goal);
            }
            
            set(state => ({
              financialGoals: state.financialGoals.map(g => 
                g.id === id ? updatedGoal : g
              ),
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, financialGoals: error.message || 'Failed to update financial goal' },
            }));
            throw error;
          }
        },
        
        deleteFinancialGoal: async (id: string) => {
          try {
            const guest = isGuestMode();
            
            if (!guest) {
              // Logged-in mode: Call API
              await financeAPIService.deleteFinancialGoal(id);
            }
            // Guest mode: Just update state (no API call)
            
            set(state => ({
              financialGoals: state.financialGoals.filter(g => g.id !== id),
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, financialGoals: error.message || 'Failed to delete financial goal' },
            }));
            throw error;
          }
        },
        
        // Debt Tracker Actions
        fetchDebtTrackers: async () => {
          const guest = isGuestMode();
          
          if (guest) {
            // Guest mode: Data is already loaded from localStorage via persist middleware
            return;
          }
          
          set(state => ({
            isLoading: { ...state.isLoading, debtTrackers: true },
            errors: { ...state.errors, debtTrackers: null },
          }));
          
          try {
            const debts = await financeAPIService.getDebtTrackers();
            set(state => ({
              debtTrackers: debts,
              isLoading: { ...state.isLoading, debtTrackers: false },
            }));
          } catch (error: any) {
            set(state => ({
              isLoading: { ...state.isLoading, debtTrackers: false },
              errors: { ...state.errors, debtTrackers: error.message || 'Failed to fetch debt trackers' },
            }));
          }
        },
        
        createDebtTracker: async (debt: DebtTracker) => {
          try {
            const guest = isGuestMode();
            let newDebt: DebtTracker;
            
            if (guest) {
              // Guest mode: Create locally only, no API call
              newDebt = {
                ...debt,
                id: debt.id || generateLocalId(),
                created_at: debt.created_at || new Date().toISOString(),
                updated_at: debt.updated_at || new Date().toISOString(),
              };
            } else {
              // Logged-in mode: Call API
              newDebt = await financeAPIService.createDebtTracker(debt);
            }
            
            set(state => ({
              debtTrackers: [...state.debtTrackers, newDebt],
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, debtTrackers: error.message || 'Failed to create debt tracker' },
            }));
            throw error;
          }
        },
        
        updateDebtTracker: async (id: string, debt: Partial<DebtTracker>) => {
          try {
            const guest = isGuestMode();
            let updatedDebt: DebtTracker;
            
            if (guest) {
              // Guest mode: Update locally only
              const existing = get().debtTrackers.find(d => d.id === id);
              if (!existing) throw new Error('Debt tracker not found');
              updatedDebt = {
                ...existing,
                ...debt,
                updated_at: new Date().toISOString(),
              };
            } else {
              // Logged-in mode: Call API
              updatedDebt = await financeAPIService.updateDebtTracker(id, debt);
            }
            
            set(state => ({
              debtTrackers: state.debtTrackers.map(d => 
                d.id === id ? updatedDebt : d
              ),
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, debtTrackers: error.message || 'Failed to update debt tracker' },
            }));
            throw error;
          }
        },
        
        deleteDebtTracker: async (id: string) => {
          try {
            const guest = isGuestMode();
            
            if (!guest) {
              // Logged-in mode: Call API
              await financeAPIService.deleteDebtTracker(id);
            }
            // Guest mode: Just update state (no API call)
            
            set(state => ({
              debtTrackers: state.debtTrackers.filter(d => d.id !== id),
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, debtTrackers: error.message || 'Failed to delete debt tracker' },
            }));
            throw error;
          }
        },
        
        // Investment Actions
        fetchInvestments: async () => {
          const guest = isGuestMode();
          
          if (guest) {
            // Guest mode: Data is already loaded from localStorage via persist middleware
            return;
          }
          
          set(state => ({
            isLoading: { ...state.isLoading, investments: true },
            errors: { ...state.errors, investments: null },
          }));
          
          try {
            const investments = await financeAPIService.getInvestments();
            set(state => ({
              investments: investments,
              isLoading: { ...state.isLoading, investments: false },
            }));
          } catch (error: any) {
            set(state => ({
              isLoading: { ...state.isLoading, investments: false },
              errors: { ...state.errors, investments: error.message || 'Failed to fetch investments' },
            }));
          }
        },
        
        createInvestment: async (investment: Investment) => {
          try {
            const guest = isGuestMode();
            let newInvestment: Investment;
            
            if (guest) {
              // Guest mode: Create locally only, no API call
              newInvestment = {
                ...investment,
                id: investment.id || generateLocalId(),
                created_at: investment.created_at || new Date().toISOString(),
                updated_at: investment.updated_at || new Date().toISOString(),
              };
            } else {
              // Logged-in mode: Call API
              newInvestment = await financeAPIService.createInvestment(investment);
            }
            
            set(state => ({
              investments: [...state.investments, newInvestment],
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, investments: error.message || 'Failed to create investment' },
            }));
            throw error;
          }
        },
        
        updateInvestment: async (id: string, investment: Partial<Investment>) => {
          try {
            const guest = isGuestMode();
            let updatedInvestment: Investment;
            
            if (guest) {
              // Guest mode: Update locally only
              const existing = get().investments.find(inv => inv.id === id);
              if (!existing) throw new Error('Investment not found');
              updatedInvestment = {
                ...existing,
                ...investment,
                updated_at: new Date().toISOString(),
              };
            } else {
              // Logged-in mode: Call API
              updatedInvestment = await financeAPIService.updateInvestment(id, investment);
            }
            
            set(state => ({
              investments: state.investments.map(inv => 
                inv.id === id ? updatedInvestment : inv
              ),
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, investments: error.message || 'Failed to update investment' },
            }));
            throw error;
          }
        },
        
        deleteInvestment: async (id: string) => {
          try {
            const guest = isGuestMode();
            
            if (!guest) {
              // Logged-in mode: Call API
              await financeAPIService.deleteInvestment(id);
            }
            // Guest mode: Just update state (no API call)
            
            set(state => ({
              investments: state.investments.filter(inv => inv.id !== id),
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, investments: error.message || 'Failed to delete investment' },
            }));
            throw error;
          }
        },
        
        // Forecast Actions (localStorage only - no API)
        fetchForecasts: async () => {
          // Forecasts are stored in localStorage only, no API call needed
          // Data is automatically loaded via persist middleware
        },
        
        createForecast: async (forecastData: ForecastCreate) => {
          const guest = isGuestMode();
          const now = new Date().toISOString();
          const userId = guest ? `guest_${Date.now()}` : 'user_123'; // Get from auth store in real app
          
          const newForecast: Forecast = {
            id: generateLocalId(),
            user_id: userId,
            ...forecastData,
            created_at: now,
            updated_at: now,
          };
          
          set(state => ({
            forecasts: [...state.forecasts, newForecast],
          }));
          
          // localStorage is automatically updated via persist middleware
        },
        
        updateForecast: async (id: string, forecastData: Partial<ForecastUpdate>) => {
          set(state => ({
            forecasts: state.forecasts.map(f => 
              f.id === id 
                ? { ...f, ...forecastData, updated_at: new Date().toISOString() }
                : f
            ),
          }));
          
          // localStorage is automatically updated via persist middleware
        },
        
        deleteForecast: async (id: string) => {
          set(state => ({
            forecasts: state.forecasts.filter(f => f.id !== id),
          }));
          
          // localStorage is automatically updated via persist middleware
        },
        
        // Import/Export Actions
        exportFinanceData: () => {
          const state = get();
          const exportData = {
            bankAccounts: state.bankAccounts,
            transactions: state.transactions,
            budgets: state.budgets,
            financialGoals: state.financialGoals,
            debtTrackers: state.debtTrackers,
            investments: state.investments,
            forecasts: state.forecasts,
            exportedAt: new Date().toISOString(),
            version: '1.0',
          };
          return JSON.stringify(exportData, null, 2);
        },
        
        importFinanceData: async (jsonData: string, merge = true) => {
          try {
            const importedData = JSON.parse(jsonData);
            
            if (merge) {
              // Merge with existing data
              set(state => ({
                bankAccounts: [...state.bankAccounts, ...(importedData.bankAccounts || [])],
                transactions: [...state.transactions, ...(importedData.transactions || [])],
                budgets: [...state.budgets, ...(importedData.budgets || [])],
                financialGoals: [...state.financialGoals, ...(importedData.financialGoals || [])],
                debtTrackers: [...state.debtTrackers, ...(importedData.debtTrackers || [])],
                investments: [...state.investments, ...(importedData.investments || [])],
                forecasts: [...state.forecasts, ...(importedData.forecasts || [])],
              }));
            } else {
              // Replace existing data
              set({
                bankAccounts: importedData.bankAccounts || [],
                transactions: importedData.transactions || [],
                budgets: importedData.budgets || [],
                financialGoals: importedData.financialGoals || [],
                debtTrackers: importedData.debtTrackers || [],
                investments: importedData.investments || [],
                forecasts: importedData.forecasts || [],
              });
            }
            
            // localStorage is automatically updated via persist middleware
          } catch (error: any) {
            throw new Error(`Failed to import finance data: ${error.message}`);
          }
        },
        
        // Analytics and Reports Actions
        fetchAnalytics: async () => {
          set(state => ({
            isLoading: { ...state.isLoading, analytics: true },
            errors: { ...state.errors, analytics: null },
          }));
          
          try {
            const analytics = await financeAPIService.getFinancialAnalytics();
            set(state => ({
              analytics: analytics,
              isLoading: { ...state.isLoading, analytics: false },
            }));
          } catch (error: any) {
            set(state => ({
              isLoading: { ...state.isLoading, analytics: false },
              errors: { ...state.errors, analytics: error.message || 'Failed to fetch analytics' },
            }));
          }
        },
        
        fetchReports: async (reportType: 'summary' | 'detailed' | 'budget' = 'summary') => {
          set(state => ({
            isLoading: { ...state.isLoading, reports: true },
            errors: { ...state.errors, reports: null },
          }));
          
          try {
            const reports = await financeAPIService.getFinancialReports(reportType);
            set(state => ({
              reports: reports,
              isLoading: { ...state.isLoading, reports: false },
            }));
          } catch (error: any) {
            set(state => ({
              isLoading: { ...state.isLoading, reports: false },
              errors: { ...state.errors, reports: error.message || 'Failed to fetch reports' },
            }));
          }
        },
        
        // Calculation Functions
        getTotalBalance: () => {
          const state = get();
          return state.bankAccounts.reduce((total, account) => total + account.balance, 0);
        },
        
        getMonthlyIncome: () => {
          const state = get();
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          
          return state.transactions
            .filter(transaction => {
              const transactionDate = new Date(transaction.date);
              return transaction.type === 'income' && 
                     transactionDate.getMonth() === currentMonth && 
                     transactionDate.getFullYear() === currentYear;
            })
            .reduce((total, transaction) => total + transaction.amount, 0);
        },
        
        getMonthlyExpenses: () => {
          const state = get();
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          
          return state.transactions
            .filter(transaction => {
              const transactionDate = new Date(transaction.date);
              return transaction.type === 'expense' && 
                     transactionDate.getMonth() === currentMonth && 
                     transactionDate.getFullYear() === currentYear;
            })
            .reduce((total, transaction) => total + transaction.amount, 0);
        },
        
        getMonthlySavings: () => {
          const state = get();
          return state.getMonthlyIncome() - state.getMonthlyExpenses();
        },
        
        getSavingsRate: () => {
          const state = get();
          const monthlyIncome = state.getMonthlyIncome();
          if (monthlyIncome === 0) return 0;
          return (state.getMonthlySavings() / monthlyIncome) * 100;
        },
        
        // Utility Actions
        clearErrors: () => {
          set(state => ({
            errors: {
              bankAccounts: null,
              transactions: null,
              budgets: null,
              financialGoals: null,
              debtTrackers: null,
              investments: null,
              forecasts: null,
              analytics: null,
              reports: null,
            },
          }));
        },
        
        resetStore: () => {
          set(initialState);
        },
      }),
      {
        name: 'finance-store',
        partialize: (state) => ({
          bankAccounts: state.bankAccounts,
          transactions: state.transactions,
          budgets: state.budgets,
          financialGoals: state.financialGoals,
          debtTrackers: state.debtTrackers,
          investments: state.investments,
          forecasts: state.forecasts,
          analytics: state.analytics,
          reports: state.reports,
        }),
        version: 1,
        migrate: (persistedState: any, version: number) => {
          // Migration logic for future structure changes
          if (version === 0) {
            // Ensure all arrays exist
            return {
              ...persistedState,
              bankAccounts: persistedState.bankAccounts || [],
              transactions: persistedState.transactions || [],
              budgets: persistedState.budgets || [],
              financialGoals: persistedState.financialGoals || [],
              debtTrackers: persistedState.debtTrackers || [],
              investments: persistedState.investments || [],
              forecasts: persistedState.forecasts || [],
            };
          }
          return persistedState;
        },
        storage: {
          getItem: (name) => {
            try {
              const str = localStorage.getItem(name);
              if (!str) return null;
              const parsed = JSON.parse(str);
              // Validate structure
              if (!parsed.state) {
                console.warn(`[Finance Store] Invalid localStorage structure for ${name}, resetting...`);
                return null;
              }
              return parsed;
            } catch (error) {
              // Attempt data recovery for corrupted data
              console.error(`[Finance Store] Failed to parse localStorage for ${name}:`, error);
              try {
                // Try to recover using data recovery utility
                const { recoverCorruptedData } = require('../utils/dataRecovery');
                const recovery = recoverCorruptedData(name, {
                  backupBeforeRecovery: true,
                  attemptRepair: true,
                  fallbackToDefaults: true,
                });
                if (recovery.success && recovery.recovered) {
                  console.log(`[Finance Store] Successfully recovered data for ${name}`);
                  return recovery.recovered;
                }
              } catch (recoveryError) {
                console.error(`[Finance Store] Data recovery failed for ${name}:`, recoveryError);
              }
              return null;
            }
          },
          setItem: (name, value) => {
            try {
              localStorage.setItem(name, JSON.stringify(value));
            } catch (error) {
              console.error(`[Finance Store] Failed to save to localStorage for ${name}:`, error);
            }
          },
          removeItem: (name) => {
            try {
              localStorage.removeItem(name);
            } catch (error) {
              console.error(`[Finance Store] Failed to remove from localStorage for ${name}:`, error);
            }
          },
        },
      }
    ),
    {
      name: 'finance-store-devtools',
    }
  )
);

// Selectors for better performance
export const useBankAccounts = () => useFinanceStore(state => state.bankAccounts);
export const useTransactions = () => useFinanceStore(state => state.transactions);
export const useBudgets = () => useFinanceStore(state => state.budgets);
export const useFinancialGoals = () => useFinanceStore(state => state.financialGoals);
export const useDebtTrackers = () => useFinanceStore(state => state.debtTrackers);
export const useInvestments = () => useFinanceStore(state => state.investments);
export const useForecasts = () => useFinanceStore(state => state.forecasts);
export const useAnalytics = () => useFinanceStore(state => state.analytics);
export const useReports = () => useFinanceStore(state => state.reports);

export const useFinanceLoading = () => useFinanceStore(state => state.isLoading);
export const useFinanceErrors = () => useFinanceStore(state => state.errors);

// Computed selectors
export const useTotalBalance = () => useFinanceStore(state => 
  state.bankAccounts.reduce((total, account) => total + account.balance, 0)
);

export const useActiveBudgets = () => useFinanceStore(state => 
  state.budgets.filter(budget => budget.is_active)
);

export const useActiveGoals = () => useFinanceStore(state => 
  state.financialGoals.filter(goal => goal.status === 'active')
);

export const useActiveDebts = () => useFinanceStore(state => 
  state.debtTrackers.filter(debt => debt.status === 'active')
);

export const useActiveInvestments = () => useFinanceStore(state => 
  state.investments.filter(investment => investment.status === 'active')
);

export const useRecentTransactions = (limit = 5) => useFinanceStore(state => 
  state.transactions.slice(0, limit)
);

export const useTransactionsByCategory = (category: string) => useFinanceStore(state => 
  state.transactions.filter(transaction => transaction.category === category)
);

export const useTransactionsByType = (type: 'income' | 'expense' | 'transfer') => useFinanceStore(state => 
  state.transactions.filter(transaction => transaction.type === type)
);
