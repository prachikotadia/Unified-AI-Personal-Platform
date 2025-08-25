import openai
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import structlog
from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
import os
from dotenv import load_dotenv

load_dotenv()

logger = structlog.get_logger()

class AIService:
    def __init__(self):
        self.openai_client = openai.AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.llm = ChatOpenAI(
            temperature=0.7,
            model_name="gpt-4",
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
    async def generate_response(self, prompt: str, context: Dict[str, Any] = None) -> str:
        """Generate AI response using OpenAI"""
        try:
            messages = [
                {"role": "system", "content": "You are OmniLife AI, a helpful personal assistant for finance, fitness, travel, and lifestyle management."},
                {"role": "user", "content": prompt}
            ]
            
            if context:
                context_str = json.dumps(context, indent=2)
                messages[0]["content"] += f"\n\nContext: {context_str}"
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            return "I'm sorry, I'm having trouble processing your request right now."

    async def analyze_financial_data(self, transactions: List[Dict], budgets: List[Dict]) -> Dict[str, Any]:
        """Analyze financial data and provide insights"""
        try:
            # Prepare data for analysis
            total_income = sum(t['amount'] for t in transactions if t['type'] == 'income')
            total_expenses = sum(t['amount'] for t in transactions if t['type'] == 'expense')
            
            # Categorize expenses
            expense_categories = {}
            for t in transactions:
                if t['type'] == 'expense':
                    category = t['category']
                    expense_categories[category] = expense_categories.get(category, 0) + t['amount']
            
            # Generate insights
            prompt = f"""
            Analyze this financial data and provide insights:
            
            Total Income: ${total_income}
            Total Expenses: ${total_expenses}
            Net Savings: ${total_income - total_expenses}
            
            Expense Breakdown:
            {json.dumps(expense_categories, indent=2)}
            
            Budgets:
            {json.dumps(budgets, indent=2)}
            
            Provide:
            1. Spending patterns analysis
            2. Budget recommendations
            3. Savings opportunities
            4. Financial health score (1-10)
            """
            
            analysis = await self.generate_response(prompt)
            
            return {
                "analysis": analysis,
                "summary": {
                    "total_income": total_income,
                    "total_expenses": total_expenses,
                    "net_savings": total_income - total_expenses,
                    "top_expense_category": max(expense_categories.items(), key=lambda x: x[1])[0] if expense_categories else None
                }
            }
            
        except Exception as e:
            logger.error(f"Error analyzing financial data: {e}")
            return {"error": "Failed to analyze financial data"}

    async def create_budget_plan(self, income: float, goals: List[str], expenses: Dict[str, float]) -> Dict[str, Any]:
        """Create a personalized budget plan"""
        try:
            prompt = f"""
            Create a personalized budget plan based on:
            
            Monthly Income: ${income}
            Financial Goals: {', '.join(goals)}
            Current Expenses: {json.dumps(expenses, indent=2)}
            
            Provide:
            1. Recommended budget allocation (50/30/20 rule or similar)
            2. Specific category budgets
            3. Savings recommendations
            4. Tips for sticking to the budget
            """
            
            budget_plan = await self.generate_response(prompt)
            
            # Parse the response to extract structured data
            # This is a simplified version - in production, you'd use more sophisticated parsing
            return {
                "plan": budget_plan,
                "recommended_allocation": {
                    "needs": income * 0.5,
                    "wants": income * 0.3,
                    "savings": income * 0.2
                }
            }
            
        except Exception as e:
            logger.error(f"Error creating budget plan: {e}")
            return {"error": "Failed to create budget plan"}

    async def recommend_workout_plan(self, fitness_level: str, goals: List[str], available_time: int) -> Dict[str, Any]:
        """Recommend personalized workout plan"""
        try:
            prompt = f"""
            Create a personalized workout plan for:
            
            Fitness Level: {fitness_level}
            Goals: {', '.join(goals)}
            Available Time: {available_time} minutes per session
            
            Provide:
            1. Weekly workout schedule
            2. Specific exercises for each day
            3. Progression plan
            4. Nutrition tips
            5. Recovery recommendations
            """
            
            workout_plan = await self.generate_response(prompt)
            
            return {
                "plan": workout_plan,
                "schedule": {
                    "days_per_week": 4,
                    "session_duration": available_time,
                    "rest_days": ["Wednesday", "Sunday"]
                }
            }
            
        except Exception as e:
            logger.error(f"Error creating workout plan: {e}")
            return {"error": "Failed to create workout plan"}

    async def plan_trip(self, destination: str, budget: float, duration: int, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Plan a personalized trip"""
        try:
            prompt = f"""
            Plan a trip to {destination} with:
            
            Budget: ${budget}
            Duration: {duration} days
            Preferences: {json.dumps(preferences, indent=2)}
            
            Provide:
            1. Daily itinerary
            2. Budget breakdown
            3. Accommodation recommendations
            4. Transportation options
            5. Must-see attractions
            6. Local tips and safety advice
            """
            
            trip_plan = await self.generate_response(prompt)
            
            return {
                "plan": trip_plan,
                "estimated_cost": budget,
                "duration": duration,
                "destination": destination
            }
            
        except Exception as e:
            logger.error(f"Error planning trip: {e}")
            return {"error": "Failed to plan trip"}

    async def recommend_products(self, user_preferences: Dict[str, Any], budget: float, category: str) -> List[Dict[str, Any]]:
        """Recommend products based on user preferences"""
        try:
            prompt = f"""
            Recommend products in the {category} category:
            
            Budget: ${budget}
            Preferences: {json.dumps(user_preferences, indent=2)}
            
            Provide 5 product recommendations with:
            - Product name
            - Price
            - Key features
            - Why it's recommended
            """
            
            recommendations = await self.generate_response(prompt)
            
            # In a real implementation, you'd integrate with a product database
            # For now, return mock data
            return [
                {
                    "id": "1",
                    "name": "Recommended Product 1",
                    "price": budget * 0.3,
                    "features": ["Feature 1", "Feature 2"],
                    "reason": "Matches your preferences"
                }
            ]
            
        except Exception as e:
            logger.error(f"Error recommending products: {e}")
            return []

    async def generate_social_post(self, topic: str, tone: str, platform: str) -> Dict[str, Any]:
        """Generate social media post content"""
        try:
            prompt = f"""
            Create a {tone} social media post about {topic} for {platform}:
            
            Requirements:
            - Engaging and authentic
            - Platform-appropriate length
            - Include relevant hashtags
            - Call-to-action if appropriate
            """
            
            post_content = await self.generate_response(prompt)
            
            return {
                "content": post_content,
                "platform": platform,
                "topic": topic,
                "tone": tone
            }
            
        except Exception as e:
            logger.error(f"Error generating social post: {e}")
            return {"error": "Failed to generate post"}

    async def analyze_chat_sentiment(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze chat conversation sentiment"""
        try:
            # Combine messages for analysis
            conversation = "\n".join([msg.get('content', '') for msg in messages])
            
            prompt = f"""
            Analyze the sentiment and tone of this conversation:
            
            {conversation}
            
            Provide:
            1. Overall sentiment (positive/negative/neutral)
            2. Key topics discussed
            3. Emotional tone
            4. Suggestions for better communication
            """
            
            analysis = await self.generate_response(prompt)
            
            return {
                "analysis": analysis,
                "sentiment": "positive",  # Simplified - would use proper sentiment analysis
                "topics": ["general conversation"],
                "suggestions": ["Continue the positive interaction"]
            }
            
        except Exception as e:
            logger.error(f"Error analyzing chat sentiment: {e}")
            return {"error": "Failed to analyze sentiment"}

    async def create_reminder(self, task: str, priority: str, due_date: datetime) -> Dict[str, Any]:
        """Create a smart reminder with AI suggestions"""
        try:
            prompt = f"""
            Create a smart reminder for: {task}
            
            Priority: {priority}
            Due Date: {due_date}
            
            Provide:
            1. Reminder message
            2. Suggested preparation steps
            3. Time management tips
            4. Related tasks or dependencies
            """
            
            reminder_content = await self.generate_response(prompt)
            
            return {
                "task": task,
                "reminder": reminder_content,
                "priority": priority,
                "due_date": due_date,
                "suggestions": ["Prepare in advance", "Set multiple reminders"]
            }
            
        except Exception as e:
            logger.error(f"Error creating reminder: {e}")
            return {"error": "Failed to create reminder"}

    async def process_natural_language_command(self, command: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Process natural language commands and execute actions"""
        try:
            prompt = f"""
            Process this command: "{command}"
            
            User Context: {json.dumps(user_context, indent=2)}
            
            Determine the action type and provide:
            1. Action type (message, product_search, budget_create, workout_plan, trip_plan, social_post, reminder)
            2. Action data
            3. Confirmation message
            4. Next steps
            """
            
            response = await self.generate_response(prompt)
            
            # Parse response to determine action type
            action_type = "general"
            if "send message" in command.lower() or "message" in command.lower():
                action_type = "message"
            elif "find product" in command.lower() or "search" in command.lower():
                action_type = "product_search"
            elif "budget" in command.lower():
                action_type = "budget_create"
            elif "workout" in command.lower() or "exercise" in command.lower():
                action_type = "workout_plan"
            elif "trip" in command.lower() or "travel" in command.lower():
                action_type = "trip_plan"
            elif "post" in command.lower() or "social" in command.lower():
                action_type = "social_post"
            elif "remind" in command.lower():
                action_type = "reminder"
            
            return {
                "action_type": action_type,
                "response": response,
                "command": command,
                "executed": True
            }
            
        except Exception as e:
            logger.error(f"Error processing command: {e}")
            return {"error": "Failed to process command"}

    async def generate_insights(self, module: str, user_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate AI insights for different modules"""
        try:
            insights = []
            
            if module == "finance":
                insights = await self._generate_finance_insights(user_data)
            elif module == "fitness":
                insights = await self._generate_fitness_insights(user_data)
            elif module == "travel":
                insights = await self._generate_travel_insights(user_data)
            elif module == "social":
                insights = await self._generate_social_insights(user_data)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating insights: {e}")
            return []

    async def _generate_finance_insights(self, user_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate finance-specific insights"""
        insights = []
        
        # Analyze spending patterns
        if 'transactions' in user_data:
            total_spent = sum(t['amount'] for t in user_data['transactions'] if t['type'] == 'expense')
            if total_spent > 1000:
                insights.append({
                    "type": "spending_alert",
                    "title": "High Spending Detected",
                    "description": f"You've spent ${total_spent} this month. Consider reviewing your expenses.",
                    "confidence": 0.8,
                    "action": "review_expenses"
                })
        
        # Budget recommendations
        if 'income' in user_data and 'expenses' in user_data:
            savings_rate = (user_data['income'] - user_data['expenses']) / user_data['income']
            if savings_rate < 0.2:
                insights.append({
                    "type": "savings_recommendation",
                    "title": "Increase Savings",
                    "description": "Your savings rate is below the recommended 20%. Consider reducing non-essential expenses.",
                    "confidence": 0.9,
                    "action": "create_budget"
                })
        
        return insights

    async def _generate_fitness_insights(self, user_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate fitness-specific insights"""
        insights = []
        
        # Workout consistency
        if 'workouts' in user_data:
            recent_workouts = [w for w in user_data['workouts'] if w['completed']]
            if len(recent_workouts) < 3:
                insights.append({
                    "type": "workout_reminder",
                    "title": "Stay Active",
                    "description": "You haven't worked out much this week. Try to fit in at least 3 sessions.",
                    "confidence": 0.7,
                    "action": "schedule_workout"
                })
        
        return insights

    async def _generate_travel_insights(self, user_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate travel-specific insights"""
        insights = []
        
        # Travel opportunities
        if 'preferences' in user_data and 'budget' in user_data:
            insights.append({
                "type": "travel_suggestion",
                "title": "Travel Opportunity",
                "description": "Based on your preferences, consider visiting [destination] within your budget.",
                "confidence": 0.6,
                "action": "plan_trip"
            })
        
        return insights

    async def _generate_social_insights(self, user_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate social-specific insights"""
        insights = []
        
        # Social engagement
        if 'posts' in user_data:
            recent_posts = len([p for p in user_data['posts'] if p['created_at'] > datetime.now().isoformat()])
            if recent_posts < 2:
                insights.append({
                    "type": "social_engagement",
                    "title": "Stay Connected",
                    "description": "You haven't posted much recently. Share something with your network!",
                    "confidence": 0.5,
                    "action": "create_post"
                })
        
        return insights
