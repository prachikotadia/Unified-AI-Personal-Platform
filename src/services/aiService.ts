/**
 * AI Service - Frontend integration with OpenAI via backend
 * Provides AI functionality across all modules
 */

import { API_BASE_URL } from '../config/api';

export interface AIResponse {
  content: string;
  model?: string;
  confidence?: number;
  timestamp?: string;
  error?: string;
}

export interface AIContext {
  [key: string]: any;
}

class AIService {
  private baseUrl: string;
  private isAvailableCache: { available: boolean; timestamp: number } | null = null;
  private readonly CACHE_DURATION = 30000; // 30 seconds cache

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Check if AI service is available
   */
  async isAIServiceAvailable(): Promise<boolean> {
    // Check cache first
    if (this.isAvailableCache) {
      const cacheAge = Date.now() - this.isAvailableCache.timestamp;
      if (cacheAge < this.CACHE_DURATION) {
        return this.isAvailableCache.available;
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`${this.baseUrl}/api/ai/health`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit',
      });
      
      clearTimeout(timeoutId);
      const available = response.ok;
      
      // Cache the result
      this.isAvailableCache = {
        available,
        timestamp: Date.now()
      };
      
      return available;
    } catch (error) {
      // Cache the failure result
      this.isAvailableCache = {
        available: false,
        timestamp: Date.now()
      };
      return false;
    }
  }

  /**
   * Get fallback response for demo mode
   */
  private getFallbackResponse(prompt: string, context?: AIContext): AIResponse {
    const lowerPrompt = prompt.toLowerCase();
    
    // Context-aware fallback responses
    if (lowerPrompt.includes('budget') || lowerPrompt.includes('finance')) {
      return {
        content: "Based on your financial data, I recommend reviewing your spending patterns and setting realistic budget goals. Consider tracking your expenses more closely and identifying areas where you can save.",
        model: 'demo-mode',
        confidence: 0.7,
        timestamp: new Date().toISOString(),
        error: 'AI service unavailable - using demo response'
      };
    }
    
    if (lowerPrompt.includes('workout') || lowerPrompt.includes('fitness')) {
      return {
        content: "For a balanced fitness routine, I suggest incorporating both cardio and strength training. Aim for at least 150 minutes of moderate-intensity exercise per week, and don't forget to include rest days for recovery.",
        model: 'demo-mode',
        confidence: 0.7,
        timestamp: new Date().toISOString(),
        error: 'AI service unavailable - using demo response'
      };
    }
    
    if (lowerPrompt.includes('trip') || lowerPrompt.includes('travel')) {
      return {
        content: "For your travel plans, I recommend researching your destination thoroughly, booking accommodations in advance, and creating a flexible itinerary. Don't forget to check travel advisories and pack accordingly.",
        model: 'demo-mode',
        confidence: 0.7,
        timestamp: new Date().toISOString(),
        error: 'AI service unavailable - using demo response'
      };
    }
    
    // Generic fallback
    return {
      content: "I'm currently operating in demo mode. The AI service is temporarily unavailable, but I can still help you with basic information. Please try again later for more detailed AI-powered responses.",
      model: 'demo-mode',
      confidence: 0.5,
      timestamp: new Date().toISOString(),
      error: 'AI service unavailable - using demo response'
    };
  }

  /**
   * Generate AI response for any prompt
   */
  async generateResponse(prompt: string, context?: AIContext): Promise<AIResponse> {
    // Check if AI service is available first
    const isAvailable = await this.isAIServiceAvailable();
    if (!isAvailable) {
      // Return fallback response for demo mode
      return this.getFallbackResponse(prompt, context);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${this.baseUrl}/api/ai/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: prompt,
          context: context || {},
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`AI service error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.response || data.content || 'No response generated',
        model: data.ai_model || 'gpt-4',
        confidence: data.confidence || 0.85,
        timestamp: data.timestamp || new Date().toISOString(),
      };
    } catch (error: any) {
      // Check if it's a network/connection error or timeout
      const isConnectionError = error.message?.includes('Failed to fetch') || 
                                error.message?.includes('NetworkError') ||
                                error.message?.includes('ERR_') ||
                                error.name === 'AbortError';
      
      // Return fallback response instead of generic error
      return this.getFallbackResponse(prompt, context);
    }
  }

  /**
   * Analyze financial data
   */
  async analyzeFinance(transactions: any[], budgets: any[]): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/finance/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions,
          budgets,
        }),
      });

      if (!response.ok) {
        throw new Error(`Finance analysis error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.analysis || data.insights || 'Analysis generated',
        model: data.ai_model || 'gpt-4',
        confidence: data.confidence || data.accuracy || 0.91,
        timestamp: data.timestamp || new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('[AI Service] Error analyzing finance:', error);
      return {
        content: 'Unable to analyze financial data at this time.',
        error: error.message,
      };
    }
  }

  /**
   * Create budget plan
   */
  async createBudgetPlan(income: number, expenses: any[], goals: any[]): Promise<AIResponse> {
    // Check if AI service is available first
    const isAvailable = await this.isAIServiceAvailable();
    if (!isAvailable) {
      const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const savings = income - totalExpenses;
      const savingsRate = income > 0 ? (savings / income * 100).toFixed(1) : '0';
      
      return {
        content: `Based on your income of $${income.toLocaleString()} and expenses totaling $${totalExpenses.toLocaleString()}, I recommend:\n\n1. Allocate 50% to needs (housing, utilities, groceries)\n2. Allocate 30% to wants (entertainment, dining)\n3. Allocate 20% to savings and debt repayment\n\nYour current savings rate is ${savingsRate}%. Aim to increase this by reducing discretionary spending.`,
        model: 'demo-mode',
        confidence: 0.7,
        timestamp: new Date().toISOString(),
        error: 'AI service unavailable - using demo response'
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${this.baseUrl}/api/ai/finance/budget-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          income,
          expenses,
          goals,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Budget planning error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.budget_plan || data.recommendations || 'Budget plan generated',
        model: data.ai_model || 'gpt-4',
        confidence: data.accuracy || 0.91,
        timestamp: data.timestamp || new Date().toISOString(),
      };
    } catch (error: any) {
      const isConnectionError = error.message?.includes('Failed to fetch') || 
                                error.message?.includes('NetworkError') ||
                                error.message?.includes('ERR_') ||
                                error.name === 'AbortError';
      
      if (isConnectionError) {
        const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const savings = income - totalExpenses;
        const savingsRate = income > 0 ? (savings / income * 100).toFixed(1) : '0';
        
        return {
          content: `Based on your income of $${income.toLocaleString()} and expenses totaling $${totalExpenses.toLocaleString()}, I recommend:\n\n1. Allocate 50% to needs (housing, utilities, groceries)\n2. Allocate 30% to wants (entertainment, dining)\n3. Allocate 20% to savings and debt repayment\n\nYour current savings rate is ${savingsRate}%. Aim to increase this by reducing discretionary spending.`,
          model: 'demo-mode',
          confidence: 0.7,
          timestamp: new Date().toISOString(),
          error: 'AI service unavailable - using demo response'
        };
      }
      
      console.error('[AI Service] Error creating budget plan:', error);
      return {
        content: 'Unable to create budget plan at this time.',
        error: error.message,
      };
    }
  }

  /**
   * Recommend workout plan
   */
  async recommendWorkoutPlan(
    fitnessLevel: string,
    goals: string[],
    availableTime: number
  ): Promise<AIResponse> {
    // Check if AI service is available first
    const isAvailable = await this.isAIServiceAvailable();
    if (!isAvailable) {
      const goalText = goals.length > 0 ? goals.join(', ') : 'general fitness';
      const timeText = availableTime >= 60 ? `${Math.floor(availableTime / 60)} hours` : `${availableTime} minutes`;
      
      return {
        content: `For ${fitnessLevel} level training focusing on ${goalText}, with ${timeText} available:\n\n1. Warm-up: 5-10 minutes of dynamic stretching\n2. Main workout: Focus on compound movements (squats, deadlifts, bench press)\n3. Cardio: 20-30 minutes of moderate-intensity exercise\n4. Cool-down: 5-10 minutes of static stretching\n\nProgression: Increase weight or reps by 5-10% weekly.`,
        model: 'demo-mode',
        confidence: 0.7,
        timestamp: new Date().toISOString(),
        error: 'AI service unavailable - using demo response'
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${this.baseUrl}/api/ai/fitness/workout-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fitness_level: fitnessLevel,
          goals,
          available_time: availableTime,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Workout planning error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.workout_plan || data.insights || 'Workout plan generated',
        model: data.ai_model || 'gpt-4',
        confidence: data.accuracy || 0.88,
        timestamp: data.timestamp || new Date().toISOString(),
      };
    } catch (error: any) {
      const isConnectionError = error.message?.includes('Failed to fetch') || 
                                error.message?.includes('NetworkError') ||
                                error.message?.includes('ERR_') ||
                                error.name === 'AbortError';
      
      if (isConnectionError) {
        const goalText = goals.length > 0 ? goals.join(', ') : 'general fitness';
        const timeText = availableTime >= 60 ? `${Math.floor(availableTime / 60)} hours` : `${availableTime} minutes`;
        
        return {
          content: `For ${fitnessLevel} level training focusing on ${goalText}, with ${timeText} available:\n\n1. Warm-up: 5-10 minutes of dynamic stretching\n2. Main workout: Focus on compound movements (squats, deadlifts, bench press)\n3. Cardio: 20-30 minutes of moderate-intensity exercise\n4. Cool-down: 5-10 minutes of static stretching\n\nProgression: Increase weight or reps by 5-10% weekly.`,
          model: 'demo-mode',
          confidence: 0.7,
          timestamp: new Date().toISOString(),
          error: 'AI service unavailable - using demo response'
        };
      }
      
      console.error('[AI Service] Error recommending workout plan:', error);
      return {
        content: 'Unable to generate workout plan at this time.',
        error: error.message,
      };
    }
  }

  /**
   * Plan trip
   */
  async planTrip(
    destination: string,
    budget: number,
    duration: number,
    preferences: Record<string, any>
  ): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/travel/plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination,
          budget,
          duration,
          preferences,
        }),
      });

      if (!response.ok) {
        throw new Error(`Travel planning error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.travel_plan || data.insights || 'Travel plan generated',
        model: data.ai_model || 'gpt-4',
        confidence: data.accuracy || 0.85,
        timestamp: data.timestamp || new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('[AI Service] Error planning trip:', error);
      return {
        content: 'Unable to plan trip at this time.',
        error: error.message,
      };
    }
  }

  /**
   * Recommend products
   */
  async recommendProducts(
    userPreferences: Record<string, any>,
    purchaseHistory: any[]
  ): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/marketplace/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_preferences: userPreferences,
          purchase_history: purchaseHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`Product recommendation error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.recommendations || data.insights || 'Recommendations generated',
        model: data.ai_model || 'gpt-4',
        confidence: data.accuracy || 0.87,
        timestamp: data.timestamp || new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('[AI Service] Error recommending products:', error);
      return {
        content: 'Unable to generate product recommendations at this time.',
        error: error.message,
      };
    }
  }

  /**
   * Generate social post
   */
  async generateSocialPost(contentType: string, context: Record<string, any>): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/social/generate-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_type: contentType,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`Social post generation error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.post_content || data.content || 'Post generated',
        model: data.ai_model || 'gpt-4',
        timestamp: data.timestamp || new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('[AI Service] Error generating social post:', error);
      return {
        content: 'Unable to generate social post at this time.',
        error: error.message,
      };
    }
  }

  /**
   * Analyze chat sentiment
   */
  async analyzeChatSentiment(messages: any[]): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/chat/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat sentiment analysis error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.sentiment_analysis || data.insights || 'Sentiment analysis generated',
        model: data.ai_model || 'gpt-4',
        confidence: data.accuracy || 0.90,
        timestamp: data.timestamp || new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('[AI Service] Error analyzing chat sentiment:', error);
      return {
        content: 'Unable to analyze chat sentiment at this time.',
        error: error.message,
      };
    }
  }

  /**
   * Generate insights for any module
   */
  async generateInsights(module: string, userData: Record<string, any>): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          module,
          user_data: userData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Insights generation error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.insights || data.content || 'Insights generated',
        model: data.ai_model || 'gpt-4',
        confidence: data.accuracy || 0.87,
        timestamp: data.timestamp || new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('[AI Service] Error generating insights:', error);
      return {
        content: 'Unable to generate insights at this time.',
        error: error.message,
      };
    }
  }

  /**
   * Create intelligent reminder
   */
  async createReminder(
    task: string,
    priority: string,
    context: Record<string, any>
  ): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/reminders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task,
          priority,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`Reminder creation error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.reminder || data.content || 'Reminder created',
        model: data.ai_model || 'gpt-4',
        timestamp: data.timestamp || new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('[AI Service] Error creating reminder:', error);
      return {
        content: 'Unable to create reminder at this time.',
        error: error.message,
      };
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;

