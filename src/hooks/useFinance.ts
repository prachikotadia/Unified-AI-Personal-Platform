import { useEffect, useCallback } from 'react';
import { useFinanceStore } from '../store/finance';
import {
  BankAccount,
  Transaction,
  Budget,
  FinancialGoal,
  DebtTracker,
  Investment,
  BankAccountCreate,
  BankAccountUpdate,
  TransactionCreate,
  TransactionUpdate,
  BudgetCreate,
  BudgetUpdate,
  FinancialGoalCreate,
  FinancialGoalUpdate,
  DebtTrackerCreate,
  DebtTrackerUpdate,
  InvestmentCreate,
  InvestmentUpdate,
} from '../services/financeAPI';

// Main Finance Hook
export const useFinance = () => {
  const {
    // Data
    bankAccounts,
    transactions,
    budgets,
    financialGoals,
    debtTrackers,
    investments,
    analytics,
    reports,
    
    // Loading States
    isLoading,
    
    // Error States
    errors,
    
    // Actions
    fetchBankAccounts,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
    
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    
    fetchFinancialGoals,
    createFinancialGoal,
    updateFinancialGoal,
    deleteFinancialGoal,
    
    fetchDebtTrackers,
    createDebtTracker,
    updateDebtTracker,
    deleteDebtTracker,
    
    fetchInvestments,
    createInvestment,
    updateInvestment,
    deleteInvestment,
    
    fetchAnalytics,
    fetchReports,
    
    // Calculation Functions
    getTotalBalance,
    getMonthlyIncome,
    getMonthlyExpenses,
    getMonthlySavings,
    getSavingsRate,
    
    clearErrors,
    resetStore,
  } = useFinanceStore();

  // Auto-fetch data on mount
  useEffect(() => {
    fetchBankAccounts();
    fetchTransactions();
    fetchBudgets();
    fetchFinancialGoals();
    fetchDebtTrackers();
    fetchInvestments();
    fetchAnalytics();
  }, [
    fetchBankAccounts,
    fetchTransactions,
    fetchBudgets,
    fetchFinancialGoals,
    fetchDebtTrackers,
    fetchInvestments,
    fetchAnalytics,
  ]);

  return {
    // Data
    bankAccounts,
    transactions,
    budgets,
    financialGoals,
    debtTrackers,
    investments,
    analytics,
    reports,
    
    // Loading States
    isLoading,
    
    // Error States
    errors,
    
    // Actions
    fetchBankAccounts,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
    
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    
    fetchFinancialGoals,
    createFinancialGoal,
    updateFinancialGoal,
    deleteFinancialGoal,
    
    fetchDebtTrackers,
    createDebtTracker,
    updateDebtTracker,
    deleteDebtTracker,
    
    fetchInvestments,
    createInvestment,
    updateInvestment,
    deleteInvestment,
    
    fetchAnalytics,
    fetchReports,
    
    // Calculation Functions
    getTotalBalance,
    getMonthlyIncome,
    getMonthlyExpenses,
    getMonthlySavings,
    getSavingsRate,
    
    clearErrors,
    resetStore,
  };
};

// Bank Account Hooks
export const useBankAccounts = () => {
  const {
    bankAccounts,
    isLoading: { bankAccounts: isLoading },
    errors: { bankAccounts: error },
    fetchBankAccounts,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
  } = useFinanceStore();

  const handleCreateBankAccount = useCallback(async (accountData: BankAccountCreate) => {
    try {
      await createBankAccount(accountData as BankAccount);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [createBankAccount]);

  const handleUpdateBankAccount = useCallback(async (id: string, accountData: BankAccountUpdate) => {
    try {
      await updateBankAccount(id, accountData);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [updateBankAccount]);

  const handleDeleteBankAccount = useCallback(async (id: string) => {
    try {
      await deleteBankAccount(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [deleteBankAccount]);

  return {
    bankAccounts,
    isLoading,
    error,
    fetchBankAccounts,
    createBankAccount: handleCreateBankAccount,
    updateBankAccount: handleUpdateBankAccount,
    deleteBankAccount: handleDeleteBankAccount,
  };
};

// Transaction Hooks
export const useTransactions = () => {
  const {
    transactions,
    isLoading: { transactions: isLoading },
    errors: { transactions: error },
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useFinanceStore();

  const handleCreateTransaction = useCallback(async (transactionData: TransactionCreate) => {
    try {
      await createTransaction(transactionData as Transaction);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [createTransaction]);

  const handleUpdateTransaction = useCallback(async (id: string, transactionData: TransactionUpdate) => {
    try {
      await updateTransaction(id, transactionData);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [updateTransaction]);

  const handleDeleteTransaction = useCallback(async (id: string) => {
    try {
      await deleteTransaction(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [deleteTransaction]);

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    createTransaction: handleCreateTransaction,
    updateTransaction: handleUpdateTransaction,
    deleteTransaction: handleDeleteTransaction,
  };
};

// Budget Hooks
export const useBudgets = () => {
  const {
    budgets,
    isLoading: { budgets: isLoading },
    errors: { budgets: error },
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
  } = useFinanceStore();

  const handleCreateBudget = useCallback(async (budgetData: BudgetCreate) => {
    try {
      await createBudget(budgetData as Budget);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [createBudget]);

  const handleUpdateBudget = useCallback(async (id: string, budgetData: BudgetUpdate) => {
    try {
      await updateBudget(id, budgetData);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [updateBudget]);

  const handleDeleteBudget = useCallback(async (id: string) => {
    try {
      await deleteBudget(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [deleteBudget]);

  return {
    budgets,
    isLoading,
    error,
    fetchBudgets,
    createBudget: handleCreateBudget,
    updateBudget: handleUpdateBudget,
    deleteBudget: handleDeleteBudget,
  };
};

// Financial Goals Hooks
export const useFinancialGoals = () => {
  const {
    financialGoals,
    isLoading: { financialGoals: isLoading },
    errors: { financialGoals: error },
    fetchFinancialGoals,
    createFinancialGoal,
    updateFinancialGoal,
    deleteFinancialGoal,
  } = useFinanceStore();

  const handleCreateFinancialGoal = useCallback(async (goalData: FinancialGoalCreate) => {
    try {
      await createFinancialGoal(goalData as FinancialGoal);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [createFinancialGoal]);

  const handleUpdateFinancialGoal = useCallback(async (id: string, goalData: FinancialGoalUpdate) => {
    try {
      await updateFinancialGoal(id, goalData);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [updateFinancialGoal]);

  const handleDeleteFinancialGoal = useCallback(async (id: string) => {
    try {
      await deleteFinancialGoal(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [deleteFinancialGoal]);

  return {
    financialGoals,
    isLoading,
    error,
    fetchFinancialGoals,
    createFinancialGoal: handleCreateFinancialGoal,
    updateFinancialGoal: handleUpdateFinancialGoal,
    deleteFinancialGoal: handleDeleteFinancialGoal,
  };
};

// Debt Tracker Hooks
export const useDebtTrackers = () => {
  const {
    debtTrackers,
    isLoading: { debtTrackers: isLoading },
    errors: { debtTrackers: error },
    fetchDebtTrackers,
    createDebtTracker,
    updateDebtTracker,
    deleteDebtTracker,
  } = useFinanceStore();

  const handleCreateDebtTracker = useCallback(async (debtData: DebtTrackerCreate) => {
    try {
      await createDebtTracker(debtData as DebtTracker);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [createDebtTracker]);

  const handleUpdateDebtTracker = useCallback(async (id: string, debtData: DebtTrackerUpdate) => {
    try {
      await updateDebtTracker(id, debtData);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [updateDebtTracker]);

  const handleDeleteDebtTracker = useCallback(async (id: string) => {
    try {
      await deleteDebtTracker(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [deleteDebtTracker]);

  return {
    debtTrackers,
    isLoading,
    error,
    fetchDebtTrackers,
    createDebtTracker: handleCreateDebtTracker,
    updateDebtTracker: handleUpdateDebtTracker,
    deleteDebtTracker: handleDeleteDebtTracker,
  };
};

// Investment Hooks
export const useInvestments = () => {
  const {
    investments,
    isLoading: { investments: isLoading },
    errors: { investments: error },
    fetchInvestments,
    createInvestment,
    updateInvestment,
    deleteInvestment,
  } = useFinanceStore();

  const handleCreateInvestment = useCallback(async (investmentData: InvestmentCreate) => {
    try {
      await createInvestment(investmentData as Investment);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [createInvestment]);

  const handleUpdateInvestment = useCallback(async (id: string, investmentData: InvestmentUpdate) => {
    try {
      await updateInvestment(id, investmentData);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [updateInvestment]);

  const handleDeleteInvestment = useCallback(async (id: string) => {
    try {
      await deleteInvestment(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [deleteInvestment]);

  return {
    investments,
    isLoading,
    error,
    fetchInvestments,
    createInvestment: handleCreateInvestment,
    updateInvestment: handleUpdateInvestment,
    deleteInvestment: handleDeleteInvestment,
  };
};

// Analytics Hooks
export const useAnalytics = () => {
  const {
    analytics,
    isLoading: { analytics: isLoading },
    errors: { analytics: error },
    fetchAnalytics,
  } = useFinanceStore();

  return {
    analytics,
    isLoading,
    error,
    fetchAnalytics,
  };
};

// Reports Hooks
export const useReports = () => {
  const {
    reports,
    isLoading: { reports: isLoading },
    errors: { reports: error },
    fetchReports,
  } = useFinanceStore();

  return {
    reports,
    isLoading,
    error,
    fetchReports,
  };
};

// Computed Data Hooks
export const useFinanceSummary = () => {
  const { bankAccounts, transactions, budgets, financialGoals, debtTrackers, investments } = useFinanceStore();

  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  const totalDebt = debtTrackers.reduce((sum, debt) => sum + debt.current_balance, 0);
  const totalInvestments = investments.reduce((sum, inv) => sum + inv.current_value, 0);
  const netWorth = totalBalance + totalInvestments - totalDebt;

  const recentTransactions = transactions.slice(0, 5);
  const activeBudgets = budgets.filter(budget => budget.is_active);
  const activeGoals = financialGoals.filter(goal => goal.status === 'active');
  const activeDebts = debtTrackers.filter(debt => debt.status === 'active');
  const activeInvestments = investments.filter(inv => inv.status === 'active');

  const monthlyIncome = transactions
    .filter(txn => txn.type === 'income' && new Date(txn.date).getMonth() === new Date().getMonth())
    .reduce((sum, txn) => sum + txn.amount, 0);

  const monthlyExpenses = transactions
    .filter(txn => txn.type === 'expense' && new Date(txn.date).getMonth() === new Date().getMonth())
    .reduce((sum, txn) => sum + txn.amount, 0);

  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

  return {
    totalBalance,
    totalDebt,
    totalInvestments,
    netWorth,
    recentTransactions,
    activeBudgets,
    activeGoals,
    activeDebts,
    activeInvestments,
    monthlyIncome,
    monthlyExpenses,
    savingsRate,
  };
};

// Category-based Hooks
export const useTransactionsByCategory = (category: string) => {
  const { transactions } = useFinanceStore();
  return transactions.filter(transaction => transaction.category === category);
};

export const useTransactionsByType = (type: 'income' | 'expense' | 'transfer') => {
  const { transactions } = useFinanceStore();
  return transactions.filter(transaction => transaction.type === type);
};

export const useTransactionsByDateRange = (startDate: Date, endDate: Date) => {
  const { transactions } = useFinanceStore();
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
};

// Budget Performance Hooks
export const useBudgetPerformance = (budgetId: string) => {
  const { budgets, transactions } = useFinanceStore();
  const budget = budgets.find(b => b.id === budgetId);
  
  if (!budget) return null;

  const spent = transactions
    .filter(txn => txn.category === budget.category && txn.type === 'expense')
    .reduce((sum, txn) => sum + txn.amount, 0);

  const remaining = budget.amount - spent;
  const percentageUsed = (spent / budget.amount) * 100;

  return {
    budget,
    spent,
    remaining,
    percentageUsed,
    isOverBudget: spent > budget.amount,
  };
};

// Goal Progress Hooks
export const useGoalProgress = (goalId: string) => {
  const { financialGoals } = useFinanceStore();
  const goal = financialGoals.find(g => g.id === goalId);
  
  if (!goal) return null;

  const progress = (goal.current_amount / goal.target_amount) * 100;
  const remaining = goal.target_amount - goal.current_amount;
  const isCompleted = goal.current_amount >= goal.target_amount;

  return {
    goal,
    progress,
    remaining,
    isCompleted,
  };
};

// Debt Summary Hooks
export const useDebtSummary = () => {
  const { debtTrackers } = useFinanceStore();
  
  const totalDebt = debtTrackers.reduce((sum, debt) => sum + debt.current_balance, 0);
  const totalOriginalDebt = debtTrackers.reduce((sum, debt) => sum + debt.original_amount, 0);
  const totalPaidOff = totalOriginalDebt - totalDebt;
  const progressPercentage = totalOriginalDebt > 0 ? (totalPaidOff / totalOriginalDebt) * 100 : 0;

  const monthlyPayments = debtTrackers.reduce((sum, debt) => sum + debt.monthly_payment, 0);
  const activeDebts = debtTrackers.filter(debt => debt.status === 'active');
  const overdueDebts = debtTrackers.filter(debt => debt.status === 'overdue');

  return {
    totalDebt,
    totalOriginalDebt,
    totalPaidOff,
    progressPercentage,
    monthlyPayments,
    activeDebts,
    overdueDebts,
    debtCount: debtTrackers.length,
  };
};

// Investment Summary Hooks
export const useInvestmentSummary = () => {
  const { investments } = useFinanceStore();
  
  const totalValue = investments.reduce((sum, inv) => sum + inv.current_value, 0);
  const totalCost = investments.reduce((sum, inv) => sum + inv.purchase_price, 0);
  const totalReturn = totalValue - totalCost;
  const returnPercentage = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

  const activeInvestments = investments.filter(inv => inv.status === 'active');
  const soldInvestments = investments.filter(inv => inv.status === 'sold');

  return {
    totalValue,
    totalCost,
    totalReturn,
    returnPercentage,
    activeInvestments,
    soldInvestments,
    investmentCount: investments.length,
  };
};
