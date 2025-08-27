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
  financeAPIService,
} from '../services/financeAPI';

// Finance Store State Interface
interface FinanceState {
  // Data
  bankAccounts: BankAccount[];
  transactions: Transaction[];
  budgets: Budget[];
  financialGoals: FinancialGoal[];
  debtTrackers: DebtTracker[];
  investments: Investment[];
  analytics: FinancialAnalytics | null;
  reports: FinancialReport | null;
  
  // Loading States
  isLoading: {
    bankAccounts: boolean;
    transactions: boolean;
    budgets: boolean;
    financialGoals: boolean;
    debtTrackers: boolean;
    investments: boolean;
    analytics: boolean;
    reports: boolean;
  };
  
  // Error States
  errors: {
    bankAccounts: string | null;
    transactions: string | null;
    budgets: string | null;
    financialGoals: string | null;
    debtTrackers: string | null;
    investments: string | null;
    analytics: string | null;
    reports: string | null;
  };
  
  // Actions
  // Bank Account Actions
  fetchBankAccounts: () => Promise<void>;
  createBankAccount: (account: BankAccount) => Promise<void>;
  updateBankAccount: (id: string, account: Partial<BankAccount>) => Promise<void>;
  deleteBankAccount: (id: string) => Promise<void>;
  
  // Transaction Actions
  fetchTransactions: (limit?: number, offset?: number) => Promise<void>;
  createTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Budget Actions
  fetchBudgets: () => Promise<void>;
  createBudget: (budget: Budget) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  
  // Financial Goals Actions
  fetchFinancialGoals: () => Promise<void>;
  createFinancialGoal: (goal: FinancialGoal) => Promise<void>;
  updateFinancialGoal: (id: string, goal: Partial<FinancialGoal>) => Promise<void>;
  deleteFinancialGoal: (id: string) => Promise<void>;
  
  // Debt Tracker Actions
  fetchDebtTrackers: () => Promise<void>;
  createDebtTracker: (debt: DebtTracker) => Promise<void>;
  updateDebtTracker: (id: string, debt: Partial<DebtTracker>) => Promise<void>;
  deleteDebtTracker: (id: string) => Promise<void>;
  
  // Investment Actions
  fetchInvestments: () => Promise<void>;
  createInvestment: (investment: Investment) => Promise<void>;
  updateInvestment: (id: string, investment: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  
  // Analytics and Reports Actions
  fetchAnalytics: () => Promise<void>;
  fetchReports: (reportType?: 'summary' | 'detailed' | 'budget') => Promise<void>;
  
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
  analytics: null,
  reports: null,
  
  isLoading: {
    bankAccounts: false,
    transactions: false,
    budgets: false,
    financialGoals: false,
    debtTrackers: false,
    investments: false,
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
            const newAccount = await financeAPIService.createBankAccount(account);
            set(state => ({
              bankAccounts: [...state.bankAccounts, newAccount],
            }));
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, bankAccounts: error.message || 'Failed to create bank account' },
            }));
            throw error;
          }
        },
        
        updateBankAccount: async (id: string, account: Partial<BankAccount>) => {
          try {
            const updatedAccount = await financeAPIService.updateBankAccount(id, account);
            set(state => ({
              bankAccounts: state.bankAccounts.map(acc => 
                acc.id === id ? updatedAccount : acc
              ),
            }));
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, bankAccounts: error.message || 'Failed to update bank account' },
            }));
            throw error;
          }
        },
        
        deleteBankAccount: async (id: string) => {
          try {
            await financeAPIService.deleteBankAccount(id);
            set(state => ({
              bankAccounts: state.bankAccounts.filter(acc => acc.id !== id),
            }));
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, bankAccounts: error.message || 'Failed to delete bank account' },
            }));
            throw error;
          }
        },
        
        // Transaction Actions
        fetchTransactions: async (limit = 100, offset = 0) => {
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
            const newTransaction = await financeAPIService.createTransaction(transaction);
            set(state => ({
              transactions: [newTransaction, ...state.transactions],
            }));
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, transactions: error.message || 'Failed to create transaction' },
            }));
            throw error;
          }
        },
        
        updateTransaction: async (id: string, transaction: Partial<Transaction>) => {
          try {
            const updatedTransaction = await financeAPIService.updateTransaction(id, transaction);
            set(state => ({
              transactions: state.transactions.map(txn => 
                txn.id === id ? updatedTransaction : txn
              ),
            }));
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, transactions: error.message || 'Failed to update transaction' },
            }));
            throw error;
          }
        },
        
        deleteTransaction: async (id: string) => {
          try {
            await financeAPIService.deleteTransaction(id);
            set(state => ({
              transactions: state.transactions.filter(txn => txn.id !== id),
            }));
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, transactions: error.message || 'Failed to delete transaction' },
            }));
            throw error;
          }
        },
        
        // Budget Actions
        fetchBudgets: async () => {
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
            const newBudget = await financeAPIService.createBudget(budget);
            set(state => ({
              budgets: [...state.budgets, newBudget],
            }));
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, budgets: error.message || 'Failed to create budget' },
            }));
            throw error;
          }
        },
        
        updateBudget: async (id: string, budget: Partial<Budget>) => {
          try {
            const updatedBudget = await financeAPIService.updateBudget(id, budget);
            set(state => ({
              budgets: state.budgets.map(b => 
                b.id === id ? updatedBudget : b
              ),
            }));
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, budgets: error.message || 'Failed to update budget' },
            }));
            throw error;
          }
        },
        
        deleteBudget: async (id: string) => {
          try {
            await financeAPIService.deleteBudget(id);
            set(state => ({
              budgets: state.budgets.filter(b => b.id !== id),
            }));
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, budgets: error.message || 'Failed to delete budget' },
            }));
            throw error;
          }
        },
        
        // Financial Goals Actions
        fetchFinancialGoals: async () => {
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
            const newGoal = await financeAPIService.createFinancialGoal(goal);
            set(state => ({
              financialGoals: [...state.financialGoals, newGoal],
            }));
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, financialGoals: error.message || 'Failed to create financial goal' },
            }));
            throw error;
          }
        },
        
        updateFinancialGoal: async (id: string, goal: Partial<FinancialGoal>) => {
          try {
            const updatedGoal = await financeAPIService.updateFinancialGoal(id, goal);
            set(state => ({
              financialGoals: state.financialGoals.map(g => 
                g.id === id ? updatedGoal : g
              ),
            }));
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, financialGoals: error.message || 'Failed to update financial goal' },
            }));
            throw error;
          }
        },
        
        deleteFinancialGoal: async (id: string) => {
          try {
            await financeAPIService.deleteFinancialGoal(id);
            set(state => ({
              financialGoals: state.financialGoals.filter(g => g.id !== id),
            }));
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, financialGoals: error.message || 'Failed to delete financial goal' },
            }));
            throw error;
          }
        },
        
        // Debt Tracker Actions
        fetchDebtTrackers: async () => {
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
            const newDebt = await financeAPIService.createDebtTracker(debt);
            set(state => ({
              debtTrackers: [...state.debtTrackers, newDebt],
            }));
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, debtTrackers: error.message || 'Failed to create debt tracker' },
            }));
            throw error;
          }
        },
        
        updateDebtTracker: async (id: string, debt: Partial<DebtTracker>) => {
          try {
            const updatedDebt = await financeAPIService.updateDebtTracker(id, debt);
            set(state => ({
              debtTrackers: state.debtTrackers.map(d => 
                d.id === id ? updatedDebt : d
              ),
            }));
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, debtTrackers: error.message || 'Failed to update debt tracker' },
            }));
            throw error;
          }
        },
        
        deleteDebtTracker: async (id: string) => {
          try {
            await financeAPIService.deleteDebtTracker(id);
            set(state => ({
              debtTrackers: state.debtTrackers.filter(d => d.id !== id),
            }));
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, debtTrackers: error.message || 'Failed to delete debt tracker' },
            }));
            throw error;
          }
        },
        
        // Investment Actions
        fetchInvestments: async () => {
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
            const newInvestment = await financeAPIService.createInvestment(investment);
            set(state => ({
              investments: [...state.investments, newInvestment],
            }));
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, investments: error.message || 'Failed to create investment' },
            }));
            throw error;
          }
        },
        
        updateInvestment: async (id: string, investment: Partial<Investment>) => {
          try {
            const updatedInvestment = await financeAPIService.updateInvestment(id, investment);
            set(state => ({
              investments: state.investments.map(inv => 
                inv.id === id ? updatedInvestment : inv
              ),
            }));
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, investments: error.message || 'Failed to update investment' },
            }));
            throw error;
          }
        },
        
        deleteInvestment: async (id: string) => {
          try {
            await financeAPIService.deleteInvestment(id);
            set(state => ({
              investments: state.investments.filter(inv => inv.id !== id),
            }));
          } catch (error: any) {
            set(state => ({
              errors: { ...state.errors, investments: error.message || 'Failed to delete investment' },
            }));
            throw error;
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
          analytics: state.analytics,
          reports: state.reports,
        }),
      }
    ),
    {
      name: 'finance-store',
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
