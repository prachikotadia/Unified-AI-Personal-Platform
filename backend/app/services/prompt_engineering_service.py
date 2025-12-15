import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from app.cache import redis_cache

logger = structlog.get_logger()

class PromptEngineeringService:
    """Service for managing and optimizing AI prompts"""
    
    def __init__(self):
        self.prompt_templates = {
            "finance": {
                "budget_planning": """
                You are an expert financial advisor. Analyze the following financial data and create a personalized budget plan:
                
                Income: ${income}
                Expenses: {expenses}
                Goals: {goals}
                
                Provide:
                1. Recommended budget allocation by category
                2. Savings recommendations
                3. Actionable steps to achieve financial goals
                4. Risk assessment
                """,
                "investment_recommendations": """
                You are an investment advisor. Based on the user's profile:
                - Risk tolerance: {risk_tolerance}
                - Investment goals: {goals}
                - Current portfolio: {portfolio}
                - Time horizon: {time_horizon}
                
                Provide personalized investment recommendations with:
                1. Asset allocation strategy
                2. Specific investment suggestions
                3. Risk analysis
                4. Expected returns
                """,
                "debt_payoff": """
                Analyze the following debt situation and provide a payoff strategy:
                Debts: {debts}
                Monthly income: ${income}
                Available for debt: ${available}
                
                Recommend:
                1. Payoff order (snowball vs avalanche)
                2. Monthly payment plan
                3. Timeline to debt-free
                4. Total interest savings
                """
            },
            "fitness": {
                "workout_plan": """
                Create a personalized workout plan:
                - Goal: {goal}
                - Experience: {experience_level}
                - Time available: {time_per_week} hours/week
                - Equipment: {equipment}
                - Preferences: {preferences}
                
                Provide:
                1. Weekly schedule
                2. Exercise details (sets, reps, rest)
                3. Progressive overload plan
                4. Recovery recommendations
                """,
                "nutrition_plan": """
                Create a personalized nutrition plan:
                - Goal: {goal}
                - Calorie target: {calories}
                - Dietary restrictions: {restrictions}
                - Preferences: {preferences}
                
                Provide:
                1. Daily meal plan
                2. Macro breakdown
                3. Meal timing
                4. Recipe suggestions
                """
            },
            "travel": {
                "trip_planning": """
                Plan a trip to {destination}:
                - Duration: {duration} days
                - Budget: ${budget}
                - Travel style: {travel_style}
                - Interests: {interests}
                
                Provide:
                1. Day-by-day itinerary
                2. Activity recommendations
                3. Restaurant suggestions
                4. Budget breakdown
                5. Travel tips
                """,
                "destination_suggestions": """
                Suggest travel destinations based on:
                - Budget: {budget_range}
                - Travel style: {travel_style}
                - Interests: {interests}
                - Previous trips: {past_destinations}
                
                Provide:
                1. Top 5 destination recommendations
                2. Why each destination matches
                3. Best time to visit
                4. Estimated costs
                """
            },
            "marketplace": {
                "product_recommendations": """
                Recommend products based on:
                - User preferences: {preferences}
                - Purchase history: {history}
                - Budget: ${budget}
                - Category: {category}
                
                Provide:
                1. Top product recommendations
                2. Why each product is recommended
                3. Price comparisons
                4. Alternative options
                """,
                "deal_finder": """
                Find the best deals for:
                - Category: {category}
                - Budget: ${budget}
                - Preferences: {preferences}
                
                Provide:
                1. Current deals
                2. Price predictions
                3. Best time to buy
                4. Deal alerts
                """
            },
            "social": {
                "post_suggestions": """
                Suggest social media post content for:
                - Type: {post_type}
                - Context: {context}
                - Audience: {audience}
                
                Provide:
                1. Post content
                2. Hashtag suggestions
                3. Best posting time
                4. Engagement tips
                """,
                "friend_suggestions": """
                Suggest friends based on:
                - User interests: {interests}
                - Mutual connections: {mutual_friends}
                - Activity: {activity}
                
                Provide:
                1. Friend suggestions
                2. Common interests
                3. Connection reasons
                """
            },
            "chat": {
                "message_suggestions": """
                Suggest message responses for:
                - Conversation context: {context}
                - User input: {user_input}
                - Tone: {tone}
                
                Provide:
                1. Natural response suggestions
                2. Alternative phrasings
                3. Tone-appropriate options
                """,
                "summarization": """
                Summarize the following conversation:
                {conversation}
                
                Provide:
                1. Main topics
                2. Key decisions
                3. Action items
                4. Overall sentiment
                """
            }
        }
    
    def get_prompt(
        self,
        module: str,
        feature: str,
        variables: Dict[str, Any]
    ) -> str:
        """Get and format a prompt template"""
        try:
            if module not in self.prompt_templates:
                return ""
            
            if feature not in self.prompt_templates[module]:
                return ""
            
            template = self.prompt_templates[module][feature]
            
            # Format template with variables
            try:
                prompt = template.format(**variables)
            except KeyError as e:
                logger.warning(f"Missing variable in prompt: {e}")
                prompt = template
            
            return prompt
            
        except Exception as e:
            logger.error(f"Error getting prompt: {e}")
            return ""
    
    def optimize_prompt(
        self,
        prompt: str,
        context: Dict[str, Any]
    ) -> str:
        """Optimize a prompt based on context"""
        # Add context information
        if context.get("user_preferences"):
            prompt += f"\n\nUser preferences: {context['user_preferences']}"
        
        if context.get("previous_interactions"):
            prompt += f"\n\nPrevious context: {context['previous_interactions']}"
        
        # Add instructions for better responses
        prompt += "\n\nPlease provide clear, actionable, and specific recommendations."
        
        return prompt

# Global service instance
prompt_engineering_service = PromptEngineeringService()

