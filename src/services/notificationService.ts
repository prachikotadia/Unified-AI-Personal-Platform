import { bankIntegrationAPIService } from './bankIntegration';
import { getWebSocketURL } from '../config/api';

// Notification Types
export interface Notification {
  id: string;
  type: 'transaction' | 'budget_alert' | 'credit_score' | 'offer' | 'goal' | 'system';
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action_url?: string;
  action_text?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  in_app: boolean;
  types: {
    transaction: boolean;
    budget_alert: boolean;
    credit_score: boolean;
    offer: boolean;
    goal: boolean;
    system: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

// WebSocket Event Types
export interface WebSocketEvent {
  type: 'notification' | 'transaction_update' | 'balance_update' | 'credit_score_update' | 'offer_update';
  data: any;
  timestamp: string;
}

// Notification Service Class
class NotificationService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, ((event: WebSocketEvent) => void)[]> = new Map();
  private notificationListeners: ((notification: Notification) => void)[] = [];
  private isConnected = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Disable WebSocket for now to prevent connection errors
    // this.initializeWebSocket();
  }

  private initializeWebSocket() {
    const wsUrl = getWebSocketURL('finance');
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.setupWebSocketHandlers();
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private setupWebSocketHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.authenticate();
    };

    this.ws.onmessage = (event) => {
      try {
        const data: WebSocketEvent = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.isConnected = false;
      this.stopHeartbeat();
      
      if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private handleWebSocketMessage(event: WebSocketEvent) {
    // Notify event-specific listeners
    const eventListeners = this.listeners.get(event.type);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(event));
    }

    // Handle notification events
    if (event.type === 'notification') {
      const notification: Notification = event.data;
      this.notificationListeners.forEach(listener => listener(notification));
      
      // Show browser notification if enabled
      this.showBrowserNotification(notification);
    }
  }

  private authenticate() {
    if (!this.ws || !this.isConnected) return;

    const token = localStorage.getItem('authToken');
    if (token) {
      this.ws.send(JSON.stringify({
        type: 'authenticate',
        token: token
      }));
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.isConnected) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.initializeWebSocket();
    }, delay);
  }

  private showBrowserNotification(notification: Notification) {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.showBrowserNotification(notification);
        }
      });
    }
  }

  // Public Methods
  public subscribeToEvent(eventType: string, callback: (event: WebSocketEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);

    return () => {
      const eventListeners = this.listeners.get(eventType);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    };
  }

  public subscribeToNotifications(callback: (notification: Notification) => void) {
    this.notificationListeners.push(callback);

    return () => {
      const index = this.notificationListeners.indexOf(callback);
      if (index > -1) {
        this.notificationListeners.splice(index, 1);
      }
    };
  }

  public sendMessage(message: any) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(message));
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopHeartbeat();
    this.isConnected = false;
  }

  public isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  // Notification Management
  public async getNotifications(params?: {
    type?: string;
    read?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Notification[]> {
    // Return mock notifications instead of making API calls
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockNotifications: Notification[] = [
      {
        id: 'notif_1',
        type: 'transaction',
        title: 'New Transaction',
        message: 'A new transaction of $45.50 has been posted to your account',
        data: { transaction_id: 'txn_123', amount: 45.50 },
        read: false,
        created_at: new Date().toISOString(),
        priority: 'low',
        action_url: '/finance/transactions/txn_123',
        action_text: 'View Transaction'
      },
      {
        id: 'notif_2',
        type: 'budget_alert',
        title: 'Budget Alert',
        message: 'You have spent 80% of your food & dining budget',
        data: { budget_id: 'budget_1', spent_percentage: 80 },
        read: true,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium',
        action_url: '/finance/budgets',
        action_text: 'View Budgets'
      },
      {
        id: 'notif_3',
        type: 'credit_score',
        title: 'Credit Score Update',
        message: 'Your credit score has improved by 15 points',
        data: { score_change: 15, new_score: 750 },
        read: false,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        action_url: '/finance/credit-score',
        action_text: 'View Credit Score'
      }
    ];

    // Filter based on params
    let filtered = mockNotifications;
    if (params?.read !== undefined) {
      filtered = filtered.filter(n => n.read === params.read);
    }
    if (params?.type) {
      filtered = filtered.filter(n => n.type === params.type);
    }
    if (params?.limit) {
      filtered = filtered.slice(0, params.limit);
    }

    return filtered;
  }

  public async markAsRead(notificationId: string): Promise<void> {
    try {
      await bankIntegrationAPIService.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  public async markAllAsRead(): Promise<void> {
    try {
      await bankIntegrationAPIService.markAllNotificationsAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  public async subscribeToNotificationTypes(types: string[]): Promise<void> {
    try {
      await bankIntegrationAPIService.subscribeToNotifications(types);
    } catch (error) {
      console.error('Error subscribing to notification types:', error);
    }
  }

  // Utility Methods
  private getNotificationPriority(type: string): 'low' | 'medium' | 'high' | 'urgent' {
    const priorityMap: Record<string, 'low' | 'medium' | 'high' | 'urgent'> = {
      'transaction': 'low',
      'budget_alert': 'medium',
      'credit_score': 'high',
      'offer': 'medium',
      'goal': 'high',
      'system': 'urgent',
    };
    return priorityMap[type] || 'low';
  }

  private getNotificationActionUrl(notification: any): string | undefined {
    const actionMap: Record<string, string> = {
      'transaction': `/finance/transactions/${notification.data?.transaction_id}`,
      'budget_alert': '/finance/budgets',
      'credit_score': '/finance/credit-score',
      'offer': `/finance/offers/${notification.data?.offer_id}`,
      'goal': '/finance/goals',
      'system': '/finance/dashboard',
    };
    return actionMap[notification.type];
  }

  private getNotificationActionText(notification: any): string | undefined {
    const actionTextMap: Record<string, string> = {
      'transaction': 'View Transaction',
      'budget_alert': 'View Budgets',
      'credit_score': 'View Credit Score',
      'offer': 'View Offer',
      'goal': 'View Goals',
      'system': 'View Dashboard',
    };
    return actionTextMap[notification.type];
  }

  // Request browser notification permission
  public async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;

    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Check if notifications are supported and enabled
  public isNotificationSupported(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Export types
export type { Notification, NotificationPreferences, WebSocketEvent };
