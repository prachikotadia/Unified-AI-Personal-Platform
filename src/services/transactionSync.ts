import { Transaction } from './financeAPI';
import { LiveTransaction } from './bankIntegration';

// Real-time Transaction Sync Service
export interface SyncStatus {
  isConnected: boolean;
  lastSync: string;
  syncInProgress: boolean;
  error: string | null;
  pendingTransactions: number;
  syncedTransactions: number;
}

export interface SyncConfig {
  autoSync: boolean;
  syncInterval: number; // in minutes
  syncOnStartup: boolean;
  syncBankAccounts: string[];
  syncCategories: boolean;
  syncTags: boolean;
  syncNotes: boolean;
}

class TransactionSyncService {
  private syncStatus: SyncStatus = {
    isConnected: false,
    lastSync: '',
    syncInProgress: false,
    error: null,
    pendingTransactions: 0,
    syncedTransactions: 0
  };

  private config: SyncConfig = {
    autoSync: true,
    syncInterval: 15,
    syncOnStartup: true,
    syncBankAccounts: [],
    syncCategories: true,
    syncTags: true,
    syncNotes: true
  };

  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: ((status: SyncStatus) => void)[] = [];
  private transactionListeners: ((transactions: Transaction[]) => void)[] = [];

  constructor() {
    this.loadConfig();
    if (this.config.syncOnStartup) {
      this.startAutoSync();
    }
  }

  // Configuration Management
  private loadConfig() {
    try {
      const saved = localStorage.getItem('transactionSyncConfig');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Error loading sync config:', error);
    }
  }

  public saveConfig() {
    try {
      localStorage.setItem('transactionSyncConfig', JSON.stringify(this.config));
    } catch (error) {
      console.error('Error saving sync config:', error);
    }
  }

  public getConfig(): SyncConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<SyncConfig>) {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    
    if (updates.autoSync !== undefined) {
      if (updates.autoSync) {
        this.startAutoSync();
      } else {
        this.stopAutoSync();
      }
    }
  }

  // Status Management
  public getStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  public subscribeToStatus(callback: (status: SyncStatus) => void) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public subscribeToTransactions(callback: (transactions: Transaction[]) => void) {
    this.transactionListeners.push(callback);
    return () => {
      const index = this.transactionListeners.indexOf(callback);
      if (index > -1) {
        this.transactionListeners.splice(index, 1);
      }
    };
  }

  private updateStatus(updates: Partial<SyncStatus>) {
    this.syncStatus = { ...this.syncStatus, ...updates };
    this.listeners.forEach(listener => listener(this.syncStatus));
  }

  // Auto Sync Management
  public startAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    if (this.config.autoSync) {
      this.syncInterval = setInterval(() => {
        this.performSync();
      }, this.config.syncInterval * 60 * 1000);
    }
  }

  public stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Manual Sync
  public async performSync(): Promise<Transaction[]> {
    if (this.syncStatus.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.updateStatus({
      syncInProgress: true,
      error: null
    });

    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate fetching new transactions from bank
      const newTransactions = await this.fetchNewTransactions();
      
      // Process and categorize transactions
      const processedTransactions = await this.processTransactions(newTransactions);
      
      // Update sync status
      this.updateStatus({
        isConnected: true,
        lastSync: new Date().toISOString(),
        syncInProgress: false,
        syncedTransactions: this.syncStatus.syncedTransactions + processedTransactions.length,
        pendingTransactions: Math.max(0, this.syncStatus.pendingTransactions - processedTransactions.length)
      });

      // Notify listeners of new transactions
      this.transactionListeners.forEach(listener => listener(processedTransactions));

      return processedTransactions;

    } catch (error) {
      this.updateStatus({
        syncInProgress: false,
        error: error instanceof Error ? error.message : 'Sync failed'
      });
      throw error;
    }
  }

  // Transaction Processing
  private async fetchNewTransactions(): Promise<LiveTransaction[]> {
    // Simulate fetching from bank API
    await new Promise(resolve => setTimeout(resolve, 1000));

    return [
      {
        id: `live_${Date.now()}_1`,
        account_id: 'conn_1',
        type: 'expense',
        category: 'food_dining',
        amount: 45.50,
        currency: 'USD',
        description: 'Grocery Shopping',
        merchant: 'Walmart',
        date: new Date().toISOString(),
        status: 'posted',
        transaction_id: `bank_${Date.now()}_1`,
        location: {
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'US'
        }
      },
      {
        id: `live_${Date.now()}_2`,
        account_id: 'conn_1',
        type: 'income',
        category: 'salary',
        amount: 5000.00,
        currency: 'USD',
        description: 'Direct Deposit',
        merchant: 'Company Inc',
        date: new Date().toISOString(),
        status: 'posted',
        transaction_id: `bank_${Date.now()}_2`
      }
    ];
  }

  private async processTransactions(liveTransactions: LiveTransaction[]): Promise<Transaction[]> {
    const processed: Transaction[] = [];

    for (const liveTxn of liveTransactions) {
      // Check if transaction already exists
      const existing = await this.checkExistingTransaction(liveTxn.transaction_id);
      
      if (!existing) {
        // Categorize transaction using AI/ML
        const category = await this.categorizeTransaction(liveTxn);
        
        // Create new transaction
        const transaction: Transaction = {
          id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: liveTxn.type,
          category: category,
          amount: liveTxn.amount,
          description: liveTxn.description,
          date: liveTxn.date,
          account_id: liveTxn.account_id,
          tags: [],
          location: liveTxn.location || {},
          notes: '',
          receipt_url: '',
          is_recurring: false,
          recurring_frequency: 'monthly',
          merchant: liveTxn.merchant,
          reference_number: liveTxn.transaction_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: 'user_123',
          currency: liveTxn.currency,
          status: liveTxn.status,
          recurring: false
        };

        processed.push(transaction);
      }
    }

    return processed;
  }

  private async checkExistingTransaction(bankTransactionId: string): Promise<boolean> {
    // Simulate checking if transaction already exists
    await new Promise(resolve => setTimeout(resolve, 100));
    return false; // Assume new transaction
  }

  private async categorizeTransaction(liveTransaction: LiveTransaction): Promise<string> {
    // Simulate AI categorization
    await new Promise(resolve => setTimeout(resolve, 200));

    const description = liveTransaction.description.toLowerCase();
    
    if (description.includes('grocery') || description.includes('food') || description.includes('restaurant')) {
      return 'food_dining';
    } else if (description.includes('gas') || description.includes('fuel') || description.includes('uber')) {
      return 'transportation';
    } else if (description.includes('salary') || description.includes('deposit')) {
      return 'salary';
    } else if (description.includes('amazon') || description.includes('walmart') || description.includes('target')) {
      return 'shopping';
    } else {
      return 'other';
    }
  }

  // Conflict Resolution
  public async resolveConflicts(conflicts: Array<{
    localTransaction: Transaction;
    bankTransaction: LiveTransaction;
  }>): Promise<Transaction[]> {
    const resolved: Transaction[] = [];

    for (const conflict of conflicts) {
      // Simulate conflict resolution logic
      const resolvedTransaction: Transaction = {
        ...conflict.localTransaction,
        amount: conflict.bankTransaction.amount,
        description: conflict.bankTransaction.description,
        updated_at: new Date().toISOString()
      };

      resolved.push(resolvedTransaction);
    }

    return resolved;
  }

  // Manual Transaction Matching
  public async matchTransaction(
    localTransaction: Transaction,
    bankTransaction: LiveTransaction
  ): Promise<boolean> {
    // Simulate matching logic
    await new Promise(resolve => setTimeout(resolve, 100));

    const amountMatch = Math.abs(localTransaction.amount - bankTransaction.amount) < 0.01;
    const dateMatch = new Date(localTransaction.date).toDateString() === new Date(bankTransaction.date).toDateString();
    const descriptionSimilarity = this.calculateSimilarity(
      localTransaction.description.toLowerCase(),
      bankTransaction.description.toLowerCase()
    );

    return amountMatch && dateMatch && descriptionSimilarity > 0.7;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple similarity calculation
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  // Sync History
  public getSyncHistory(): Array<{
    timestamp: string;
    status: 'success' | 'error';
    transactionsSynced: number;
    error?: string;
  }> {
    try {
      const history = localStorage.getItem('transactionSyncHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading sync history:', error);
      return [];
    }
  }

  private addSyncHistory(entry: {
    timestamp: string;
    status: 'success' | 'error';
    transactionsSynced: number;
    error?: string;
  }) {
    try {
      const history = this.getSyncHistory();
      history.unshift(entry);
      
      // Keep only last 50 entries
      if (history.length > 50) {
        history.splice(50);
      }
      
      localStorage.setItem('transactionSyncHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving sync history:', error);
    }
  }

  // Cleanup
  public destroy() {
    this.stopAutoSync();
    this.listeners = [];
    this.transactionListeners = [];
  }
}

// Create singleton instance
export const transactionSyncService = new TransactionSyncService();

// Export types
export type { SyncStatus, SyncConfig };
