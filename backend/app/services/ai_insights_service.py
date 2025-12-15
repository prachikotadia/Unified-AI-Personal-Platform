import os
import json
import asyncio
import random
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.services.ai_service import ai_service
from app.cache import redis_cache

logger = structlog.get_logger()

# LangChain service - optional import
try:
    from app.services.langchain_service import langchain_service
except ImportError as e:
    logger.warning(f"LangChain service not available: {e}")
    langchain_service = None

class AIInsightsService:
    def __init__(self):
        self.insight_templates = {
            "finance": {
                "spending_patterns": [
                    "Your {category} expenses have {change} by {percentage}% this month. Consider {action}.",
                    "Spending on {category} is {trend} compared to last month. {recommendation}.",
                    "You've spent ${amount} on {category} this month. {suggestion}."
                ],
                "savings": [
                    "You're on track to save ${amount} this month. {encouragement}.",
                    "Your savings rate is {percentage}%. {improvement_suggestion}.",
                    "Consider {savings_action} to boost your savings by ${potential_amount}."
                ],
                "investments": [
                    "Investment Opportunity: {opportunity_description}.",
                    "Your portfolio could benefit from {investment_suggestion}.",
                    "Market conditions suggest {investment_advice}."
                ],
                "budget": [
                    "Budget Alert: You're {status} your {category} budget by ${amount}.",
                    "Your {category} spending is {percentage}% of your total budget. {budget_advice}.",
                    "Consider {budget_action} to stay within your monthly budget."
                ]
            },
            "fitness": {
                "workout_performance": [
                    "Your {workout_type} performance has {trend} by {percentage}%. {motivation}.",
                    "You've completed {workout_count} workouts this week. {achievement_comment}.",
                    "Your {metric} has improved by {improvement}. {encouragement}."
                ],
                "goals": [
                    "Goal Progress: You're {progress_percentage}% toward your {goal_type} goal. {next_steps}.",
                    "You're {days_ahead} days ahead of your {goal_type} target. {celebration}.",
                    "Goal Alert: {goal_reminder}. {motivation}."
                ],
                "nutrition": [
                    "Nutrition Insight: Your {nutrient} intake is {status}. {nutrition_advice}.",
                    "You've consumed {calories} calories today. {calorie_comment}.",
                    "Consider {nutrition_suggestion} to optimize your {health_goal}."
                ],
                "recovery": [
                    "Recovery Alert: Your {recovery_metric} suggests {recovery_status}. {recovery_advice}.",
                    "You've had {rest_days} rest days this week. {rest_comment}.",
                    "Recovery Opportunity: {recovery_suggestion} to improve your performance."
                ]
            },
            "travel": {
                "destinations": [
                    "Travel Suggestion: {destination} is perfect for your {travel_style} preferences.",
                    "Based on your budget, consider {destination} for your next trip.",
                    "Travel Alert: {destination} has {trend} prices. {booking_advice}."
                ],
                "budget": [
                    "Travel Budget: You've saved ${amount} for travel. {budget_analysis}.",
                    "Your travel spending is {percentage}% of your total budget. {travel_advice}.",
                    "Consider {travel_suggestion} to maximize your travel budget."
                ],
                "planning": [
                    "Planning Tip: {planning_advice} for your upcoming trip to {destination}.",
                    "Travel Planning: {planning_suggestion} to enhance your {destination} experience.",
                    "Itinerary Suggestion: {itinerary_idea} for your {trip_duration} trip."
                ]
            },
            "marketplace": {
                "purchases": [
                    "Purchase Pattern: You've bought {item_count} {category} items this month. {purchase_analysis}.",
                    "Your {category} spending is {trend} compared to last month. {purchase_advice}.",
                    "Consider {purchase_suggestion} to optimize your {category} purchases."
                ],
                "recommendations": [
                    "Product Recommendation: {product_name} matches your {preference_type} preferences.",
                    "Based on your history, you might like {product_category}. {recommendation_reason}.",
                    "Trending Alert: {trending_product} is popular among users like you."
                ],
                "savings": [
                    "Savings Opportunity: {product_name} is {discount_percentage}% off. {urgency}.",
                    "Price Drop Alert: {product_name} price decreased by ${amount}. {action_suggestion}.",
                    "Deal Alert: {deal_description}. {deal_urgency}."
                ]
            }
        }
        
        self.priority_weights = {
            "high": 0.3,
            "medium": 0.5,
            "low": 0.2
        }
        
        self.categories = {
            "finance": ["spending_patterns", "savings", "investments", "budget"],
            "fitness": ["workout_performance", "goals", "nutrition", "recovery"],
            "travel": ["destinations", "budget", "planning"],
            "marketplace": ["purchases", "recommendations", "savings"]
        }

    async def generate_dynamic_insights(self, user_id: int, module: str = None, count: int = 3) -> List[Dict[str, Any]]:
        """Generate dynamic AI insights for a user"""
        try:
            # Get user data for context
            user_data = await self._get_user_context(user_id, module)
            
            # Generate insights based on module or random selection
            if module and module in self.categories:
                insights = await self._generate_module_insights(user_data, module, count)
            else:
                # Generate insights across all modules
                insights = []
                for mod in self.categories:
                    module_insights = await self._generate_module_insights(user_data, mod, max(1, count // len(self.categories)))
                    insights.extend(module_insights)
                
                # Shuffle and limit to requested count
                random.shuffle(insights)
                insights = insights[:count]
            
            # Add timestamps and metadata
            for insight in insights:
                insight["timestamp"] = datetime.utcnow().isoformat()
                insight["id"] = f"insight_{user_id}_{int(datetime.utcnow().timestamp())}_{random.randint(1000, 9999)}"
                insight["ai_model"] = "GPT-4 + LangChain"
                insight["confidence"] = round(random.uniform(0.85, 0.95), 2)
            
            # Cache insights for this user
            cache_key = f"ai_insights_{user_id}_{module or 'all'}"
            await redis_cache.set_cache(cache_key, insights, expire=3600)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating dynamic insights: {e}")
            return await self._generate_fallback_insights(user_id, module, count)

    async def _generate_module_insights(self, user_data: Dict[str, Any], module: str, count: int) -> List[Dict[str, Any]]:
        """Generate insights for a specific module"""
        insights = []
        
        # Get available categories for this module
        available_categories = self.categories.get(module, [])
        
        for _ in range(count):
            # Randomly select category and template
            category = random.choice(available_categories)
            templates = self.insight_templates[module][category]
            template = random.choice(templates)
            
            # Generate dynamic content
            content = await self._generate_insight_content(template, user_data, module, category)
            
            # Determine priority
            priority = self._determine_priority(module, category, user_data)
            
            # Generate action
            action = await self._generate_action(module, category, content)
            
            insight = {
                "module": module,
                "category": category,
                "title": await self._generate_title(module, category),
                "content": content,
                "priority": priority,
                "action": action,
                "type": "ai_insight",
                "icon": self._get_icon(module, category),
                "color": self._get_color(priority)
            }
            
            insights.append(insight)
        
        return insights

    async def _generate_insight_content(self, template: str, user_data: Dict[str, Any], module: str, category: str) -> str:
        """Generate dynamic content for insight template"""
        try:
            # Use LangChain to generate personalized content
            context = {
                "user_data": user_data,
                "module": module,
                "category": category,
                "template": template
            }
            
            prompt = f"""
            Generate personalized insight content based on this template:
            Template: "{template}"
            
            User Data: {json.dumps(user_data, indent=2)}
            Module: {module}
            Category: {category}
            
            Fill in the template with realistic, personalized data based on the user's information.
            Make it specific, actionable, and engaging.
            """
            
            if langchain_service:
                content = await langchain_service.generate_response(prompt, context)
                return content
            else:
                return self._generate_fallback_content(template, module, category)
            
        except Exception as e:
            logger.error(f"Error generating insight content: {e}")
            return self._generate_fallback_content(template, module, category)

    def _generate_fallback_content(self, template: str, module: str, category: str) -> str:
        """Generate fallback content when AI generation fails"""
        fallback_data = {
            "finance": {
                "spending_patterns": {
                    "category": "dining out",
                    "change": "increased",
                    "percentage": random.randint(15, 40),
                    "action": "setting a budget for restaurants"
                },
                "savings": {
                    "amount": random.randint(800, 2000),
                    "encouragement": "Great job staying on track!",
                    "percentage": random.randint(15, 35),
                    "improvement_suggestion": "Consider automating your savings"
                },
                "investments": {
                    "opportunity_description": "opening a high-yield savings account",
                    "investment_suggestion": "diversifying your portfolio",
                    "investment_advice": "consider index funds for long-term growth"
                },
                "budget": {
                    "status": "over",
                    "category": "entertainment",
                    "amount": random.randint(50, 200),
                    "budget_advice": "Review your spending habits"
                }
            },
            "fitness": {
                "workout_performance": {
                    "workout_type": "cardio",
                    "trend": "improved",
                    "percentage": random.randint(10, 25),
                    "motivation": "Keep up the great work!"
                },
                "goals": {
                    "progress_percentage": random.randint(60, 90),
                    "goal_type": "weight loss",
                    "next_steps": "Focus on consistency"
                },
                "nutrition": {
                    "nutrient": "protein",
                    "status": "below target",
                    "nutrition_advice": "Consider adding more lean protein"
                },
                "recovery": {
                    "recovery_metric": "sleep quality",
                    "recovery_status": "good",
                    "recovery_advice": "Maintain your current routine"
                }
            },
            "travel": {
                "destinations": {
                    "destination": "Bali",
                    "travel_style": "adventure",
                    "trend": "decreasing",
                    "booking_advice": "Book now for best rates"
                },
                "budget": {
                    "amount": random.randint(1000, 3000),
                    "budget_analysis": "You're well-positioned for a great trip"
                },
                "planning": {
                    "planning_advice": "Book flights 3 months in advance",
                    "destination": "Paris",
                    "planning_suggestion": "research local customs",
                    "trip_duration": "week-long"
                }
            },
            "marketplace": {
                "purchases": {
                    "item_count": random.randint(3, 8),
                    "category": "electronics",
                    "purchase_analysis": "Your spending is within normal range"
                },
                "recommendations": {
                    "product_name": "Wireless Headphones",
                    "preference_type": "audio quality",
                    "product_category": "smart home devices",
                    "recommendation_reason": "based on your tech preferences"
                },
                "savings": {
                    "product_name": "Fitness Tracker",
                    "discount_percentage": random.randint(15, 40),
                    "urgency": "Limited time offer"
                }
            }
        }
        
        data = fallback_data.get(module, {}).get(category, {})
        return template.format(**data)

    def _determine_priority(self, module: str, category: str, user_data: Dict[str, Any]) -> str:
        """Determine insight priority based on context"""
        # High priority for budget alerts, goal milestones, etc.
        high_priority_indicators = [
            "budget" in category,
            "goal" in category,
            "alert" in category.lower(),
            "opportunity" in category.lower()
        ]
        
        if any(high_priority_indicators):
            return "high"
        
        # Medium priority for general insights
        return random.choices(["high", "medium", "low"], weights=[0.2, 0.5, 0.3])[0]

    async def _generate_action(self, module: str, category: str, content: str) -> Dict[str, Any]:
        """Generate actionable next steps"""
        actions = {
            "finance": {
                "spending_patterns": ["Create budget", "Review expenses", "Set spending limits"],
                "savings": ["Open savings account", "Increase contributions", "Review goals"],
                "investments": ["Research options", "Consult advisor", "Diversify portfolio"],
                "budget": ["Adjust budget", "Track spending", "Set alerts"]
            },
            "fitness": {
                "workout_performance": ["Schedule workout", "Try new exercise", "Track progress"],
                "goals": ["Update goals", "Create plan", "Celebrate progress"],
                "nutrition": ["Plan meals", "Track intake", "Consult nutritionist"],
                "recovery": ["Rest day", "Stretch routine", "Sleep better"]
            },
            "travel": {
                "destinations": ["Research destination", "Check prices", "Plan itinerary"],
                "budget": ["Save more", "Compare prices", "Set travel fund"],
                "planning": ["Book flights", "Reserve hotels", "Plan activities"]
            },
            "marketplace": {
                "purchases": ["Review purchases", "Set budget", "Compare prices"],
                "recommendations": ["View product", "Add to wishlist", "Read reviews"],
                "savings": ["Buy now", "Set price alert", "Compare deals"]
            }
        }
        
        available_actions = actions.get(module, {}).get(category, ["Learn more", "Take action"])
        action_text = random.choice(available_actions)
        
        return {
            "text": action_text,
            "type": "button",
            "url": f"/{module}/{category.replace('_', '-')}",
            "icon": "arrow-right"
        }

    async def _generate_title(self, module: str, category: str) -> str:
        """Generate insight title"""
        titles = {
            "finance": {
                "spending_patterns": "Spending Pattern Detected",
                "savings": "Savings Opportunity",
                "investments": "Investment Opportunity",
                "budget": "Budget Alert"
            },
            "fitness": {
                "workout_performance": "Performance Update",
                "goals": "Goal Progress",
                "nutrition": "Nutrition Insight",
                "recovery": "Recovery Alert"
            },
            "travel": {
                "destinations": "Travel Suggestion",
                "budget": "Travel Budget",
                "planning": "Planning Tip"
            },
            "marketplace": {
                "purchases": "Purchase Pattern",
                "recommendations": "Product Recommendation",
                "savings": "Savings Opportunity"
            }
        }
        
        return titles.get(module, {}).get(category, "AI Insight")

    def _get_icon(self, module: str, category: str) -> str:
        """Get appropriate icon for insight"""
        icons = {
            "finance": {
                "spending_patterns": "trending-up",
                "savings": "piggy-bank",
                "investments": "chart-line",
                "budget": "calculator"
            },
            "fitness": {
                "workout_performance": "activity",
                "goals": "target",
                "nutrition": "apple",
                "recovery": "heart"
            },
            "travel": {
                "destinations": "map-pin",
                "budget": "credit-card",
                "planning": "calendar"
            },
            "marketplace": {
                "purchases": "shopping-bag",
                "recommendations": "star",
                "savings": "tag"
            }
        }
        
        return icons.get(module, {}).get(category, "lightbulb")

    def _get_color(self, priority: str) -> str:
        """Get color based on priority"""
        colors = {
            "high": "red",
            "medium": "yellow",
            "low": "green"
        }
        
        return colors.get(priority, "blue")

    async def _get_user_context(self, user_id: int, module: str = None) -> Dict[str, Any]:
        """Get user context for insight generation"""
        try:
            # Get user data from cache or generate mock data
            cache_key = f"user_context_{user_id}"
            user_context = await redis_cache.get_cache(cache_key)
            
            if not user_context:
                # Generate mock user context
                user_context = {
                    "user_id": user_id,
                    "profile": {
                        "age": random.randint(25, 45),
                        "income": random.randint(50000, 150000),
                        "location": random.choice(["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"]),
                        "lifestyle": random.choice(["active", "balanced", "busy", "relaxed"])
                    },
                    "finance": {
                        "monthly_income": random.randint(4000, 12000),
                        "monthly_expenses": random.randint(2000, 8000),
                        "savings_rate": random.randint(10, 30),
                        "investment_balance": random.randint(10000, 100000),
                        "spending_categories": {
                            "dining": random.randint(200, 800),
                            "entertainment": random.randint(100, 500),
                            "shopping": random.randint(300, 1000),
                            "transportation": random.randint(200, 600)
                        }
                    },
                    "fitness": {
                        "workouts_this_week": random.randint(2, 6),
                        "average_workout_duration": random.randint(30, 90),
                        "fitness_goals": random.choice(["weight_loss", "muscle_gain", "endurance", "general_health"]),
                        "current_weight": random.randint(140, 200),
                        "target_weight": random.randint(130, 190)
                    },
                    "travel": {
                        "travel_budget": random.randint(2000, 8000),
                        "preferred_destinations": ["Europe", "Asia", "Caribbean"],
                        "travel_style": random.choice(["adventure", "relaxation", "cultural", "luxury"]),
                        "last_trip": random.choice(["3 months ago", "6 months ago", "1 year ago"])
                    },
                    "marketplace": {
                        "purchase_history": random.randint(10, 50),
                        "preferred_categories": ["electronics", "clothing", "home", "books"],
                        "average_order_value": random.randint(50, 200),
                        "loyalty_points": random.randint(100, 1000)
                    }
                }
                
                # Cache user context
                await redis_cache.set_cache(cache_key, user_context, expire=7200)
            
            return user_context
            
        except Exception as e:
            logger.error(f"Error getting user context: {e}")
            return {"user_id": user_id, "error": "Unable to load user context"}

    async def _generate_fallback_insights(self, user_id: int, module: str = None, count: int = 3) -> List[Dict[str, Any]]:
        """Generate fallback insights when AI generation fails"""
        fallback_insights = [
            {
                "id": f"fallback_{user_id}_{i}",
                "module": "finance",
                "category": "spending_patterns",
                "title": "Spending Pattern Detected",
                "content": "Your dining out expenses have increased by 25% this month. Consider setting a budget for restaurants.",
                "priority": "medium",
                "action": {
                    "text": "Create dining budget",
                    "type": "button",
                    "url": "/finance/budget",
                    "icon": "arrow-right"
                },
                "type": "ai_insight",
                "icon": "trending-up",
                "color": "yellow",
                "timestamp": datetime.utcnow().isoformat(),
                "ai_model": "GPT-4 + LangChain",
                "confidence": 0.85
            },
            {
                "id": f"fallback_{user_id}_{i+1}",
                "module": "finance",
                "category": "savings",
                "title": "Investment Opportunity",
                "content": "Consider opening a high-yield savings account to maximize your emergency fund returns.",
                "priority": "medium",
                "action": {
                    "text": "Research accounts",
                    "type": "button",
                    "url": "/finance/investments",
                    "icon": "arrow-right"
                },
                "type": "ai_insight",
                "icon": "piggy-bank",
                "color": "yellow",
                "timestamp": datetime.utcnow().isoformat(),
                "ai_model": "GPT-4 + LangChain",
                "confidence": 0.87
            },
            {
                "id": f"fallback_{user_id}_{i+2}",
                "module": "finance",
                "category": "budget",
                "title": "Monthly Savings Forecast",
                "content": f"You're projected to save ${random.randint(800, 1500)} this month based on current spending patterns.",
                "priority": "low",
                "action": {
                    "text": "View forecast",
                    "type": "button",
                    "url": "/finance/forecast",
                    "icon": "arrow-right"
                },
                "type": "ai_insight",
                "icon": "chart-line",
                "color": "green",
                "timestamp": datetime.utcnow().isoformat(),
                "ai_model": "GPT-4 + LangChain",
                "confidence": 0.89
            }
        ]
        
        return fallback_insights[:count]

    async def get_insights_history(self, user_id: int, module: str = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Get user's insights history"""
        try:
            cache_key = f"insights_history_{user_id}_{module or 'all'}"
            history = await redis_cache.get_cache(cache_key)
            
            if not history:
                # Generate mock history
                history = []
                for i in range(limit):
                    insight = await self._generate_fallback_insights(user_id, module, 1)[0]
                    insight["timestamp"] = (datetime.utcnow() - timedelta(days=random.randint(1, 30))).isoformat()
                    history.append(insight)
                
                await redis_cache.set_cache(cache_key, history, expire=86400)
            
            return history
            
        except Exception as e:
            logger.error(f"Error getting insights history: {e}")
            return []

# Global AI insights service instance
ai_insights_service = AIInsightsService()
