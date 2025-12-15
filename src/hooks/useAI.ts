/**
 * React Hook for AI functionality
 * Provides easy access to AI services across all components
 */

import { useState, useCallback } from 'react';
import aiService, { AIResponse, AIContext } from '../services/aiService';
import { useToastHelpers } from '../components/ui/Toast';

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToastHelpers();

  /**
   * Generate AI response for any prompt
   */
  const generateResponse = useCallback(
    async (prompt: string, context?: AIContext): Promise<string> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await aiService.generateResponse(prompt, context);
        if (response.error) {
          throw new Error(response.error);
        }
        return response.content;
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to generate AI response';
        setError(errorMsg);
        
        // Provide more helpful error messages
        if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
          showError('AI Service Unavailable', 'Unable to connect to AI service. Please check your connection or try again later.');
        } else if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
          showError('AI Authentication Error', 'AI service authentication failed. Please check your API key configuration.');
        } else if (errorMsg.includes('429') || errorMsg.includes('Rate limit')) {
          showError('AI Rate Limit', 'AI service rate limit exceeded. Please try again in a few moments.');
        } else {
          showError('AI Error', errorMsg);
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [showError]
  );

  /**
   * Analyze financial data
   */
  const analyzeFinance = useCallback(
    async (transactions: any[], budgets: any[]): Promise<AIResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await aiService.analyzeFinance(transactions, budgets);
        if (response.error) {
          throw new Error(response.error);
        }
        success('Analysis Complete', 'Financial analysis generated successfully');
        return response;
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to analyze financial data';
        setError(errorMsg);
        
        // Provide more helpful error messages
        if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
          showError('AI Service Unavailable', 'Unable to connect to AI service. Analysis will use local calculations.');
        } else {
          showError('Analysis Error', errorMsg);
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [success, showError]
  );

  /**
   * Create budget plan
   */
  const createBudgetPlan = useCallback(
    async (income: number, expenses: any[], goals: any[]): Promise<AIResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await aiService.createBudgetPlan(income, expenses, goals);
        if (response.error) {
          throw new Error(response.error);
        }
        success('Budget Plan Created', 'AI-generated budget plan is ready');
        return response;
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to create budget plan';
        setError(errorMsg);
        
        // Provide more helpful error messages
        if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
          showError('AI Service Unavailable', 'Unable to connect to AI service. Budget recommendations will use local calculations.');
        } else {
          showError('Budget Planning Error', errorMsg);
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [success, showError]
  );

  /**
   * Recommend workout plan
   */
  const recommendWorkoutPlan = useCallback(
    async (
      fitnessLevel: string,
      goals: string[],
      availableTime: number
    ): Promise<AIResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await aiService.recommendWorkoutPlan(fitnessLevel, goals, availableTime);
        if (response.error) {
          throw new Error(response.error);
        }
        success('Workout Plan Ready', 'AI-generated workout plan is ready');
        return response;
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to generate workout plan';
        setError(errorMsg);
        showError('Workout Planning Error', errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [success, showError]
  );

  /**
   * Plan trip
   */
  const planTrip = useCallback(
    async (
      destination: string,
      budget: number,
      duration: number,
      preferences: Record<string, any>
    ): Promise<AIResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await aiService.planTrip(destination, budget, duration, preferences);
        if (response.error) {
          throw new Error(response.error);
        }
        success('Travel Plan Ready', 'AI-generated travel plan is ready');
        return response;
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to plan trip';
        setError(errorMsg);
        showError('Travel Planning Error', errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [success, showError]
  );

  /**
   * Recommend products
   */
  const recommendProducts = useCallback(
    async (
      userPreferences: Record<string, any>,
      purchaseHistory: any[]
    ): Promise<AIResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await aiService.recommendProducts(userPreferences, purchaseHistory);
        if (response.error) {
          throw new Error(response.error);
        }
        return response;
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to generate recommendations';
        setError(errorMsg);
        showError('Recommendation Error', errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [showError]
  );

  /**
   * Generate social post
   */
  const generateSocialPost = useCallback(
    async (contentType: string, context: Record<string, any>): Promise<AIResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await aiService.generateSocialPost(contentType, context);
        if (response.error) {
          throw new Error(response.error);
        }
        success('Post Generated', 'AI-generated social post is ready');
        return response;
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to generate social post';
        setError(errorMsg);
        showError('Post Generation Error', errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [success, showError]
  );

  /**
   * Analyze chat sentiment
   */
  const analyzeChatSentiment = useCallback(
    async (messages: any[]): Promise<AIResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await aiService.analyzeChatSentiment(messages);
        if (response.error) {
          throw new Error(response.error);
        }
        return response;
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to analyze sentiment';
        setError(errorMsg);
        showError('Sentiment Analysis Error', errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [showError]
  );

  /**
   * Generate insights
   */
  const generateInsights = useCallback(
    async (module: string, userData: Record<string, any>): Promise<AIResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await aiService.generateInsights(module, userData);
        if (response.error) {
          throw new Error(response.error);
        }
        return response;
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to generate insights';
        setError(errorMsg);
        showError('Insights Error', errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [showError]
  );

  /**
   * Create reminder
   */
  const createReminder = useCallback(
    async (
      task: string,
      priority: string,
      context: Record<string, any>
    ): Promise<AIResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await aiService.createReminder(task, priority, context);
        if (response.error) {
          throw new Error(response.error);
        }
        success('Reminder Created', 'AI-optimized reminder is ready');
        return response;
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to create reminder';
        setError(errorMsg);
        showError('Reminder Error', errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [success, showError]
  );

  return {
    // State
    isLoading,
    error,
    
    // Actions
    generateResponse,
    analyzeFinance,
    createBudgetPlan,
    recommendWorkoutPlan,
    planTrip,
    recommendProducts,
    generateSocialPost,
    analyzeChatSentiment,
    generateInsights,
    createReminder,
    
    // Direct service access
    aiService,
  };
};

export default useAI;

