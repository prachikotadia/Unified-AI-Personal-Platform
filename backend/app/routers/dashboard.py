from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import structlog

from app.database_postgres import get_db
from app.models.user import User
from app.models.data_models import (
    FinanceTransaction, FinanceBudget, FinanceAccount,
    FitnessWorkout, FitnessGoal
)
from app.models.travel_db import Trip
from app.models.social_db import Friend, Post
from app.models.chat_db import Conversation, Message, ConversationParticipant

logger = structlog.get_logger()

router = APIRouter(tags=["dashboard"])

def get_current_user_id(user_id: Optional[str] = None) -> int:
    """Get current user ID - extract numeric ID from string or default to 1"""
    if not user_id:
        return 1
    
    # Handle guest user IDs like "guest_1765576097458"
    if isinstance(user_id, str) and user_id.startswith('guest_'):
        # Extract numeric part or use default
        try:
            numeric_part = user_id.replace('guest_', '')
            # For guest users, use a default user ID (1) or create a mapping
            return 1  # Default guest user ID
        except:
            return 1
    
    # Try to convert to int
    try:
        return int(user_id)
    except (ValueError, TypeError):
        return 1

@router.get("/summary")
async def get_dashboard_summary(
    user_id: Optional[str] = Query(None, description="User ID (supports guest_* format)"),
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard summary for all modules"""
    try:
        current_user_id = get_current_user_id(user_id)
        now = datetime.utcnow()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        start_of_week = now - timedelta(days=now.weekday())
        start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Finance Summary
        finance_summary = get_finance_summary(db, current_user_id, start_of_month)
        
        # Marketplace Summary
        marketplace_summary = get_marketplace_summary(db, current_user_id)
        
        # Fitness Summary
        fitness_summary = get_fitness_summary(db, current_user_id, start_of_week)
        
        # Travel Summary
        travel_summary = get_travel_summary(db, current_user_id)
        
        # Social Summary
        social_summary = get_social_summary(db, current_user_id)
        
        # Chat Summary
        chat_summary = get_chat_summary(db, current_user_id)
        
        return {
            "finance": finance_summary,
            "marketplace": marketplace_summary,
            "fitness": fitness_summary,
            "travel": travel_summary,
            "social": social_summary,
            "chat": chat_summary,
            "timestamp": now.isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting dashboard summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get dashboard summary: {str(e)}"
        )

def get_finance_summary(db: Session, user_id: int, start_of_month: datetime) -> Dict[str, Any]:
    """Get finance module summary"""
    try:
        # Get monthly transactions
        monthly_transactions = db.query(FinanceTransaction).filter(
            and_(
                FinanceTransaction.user_id == user_id,
                FinanceTransaction.date >= start_of_month
            )
        ).all()
        
        monthly_spend = sum(
            t.amount for t in monthly_transactions 
            if t.type == 'expense'
        )
        
        monthly_income = sum(
            t.amount for t in monthly_transactions 
            if t.type == 'income'
        )
        
        # Get active budgets
        active_budgets = db.query(FinanceBudget).filter(
            and_(
                FinanceBudget.user_id == user_id,
                FinanceBudget.status == 'active'
            )
        ).all()
        
        total_budget = sum(b.amount for b in active_budgets)
        
        # Calculate change from last month
        last_month_start = (start_of_month - timedelta(days=32)).replace(day=1)
        last_month_transactions = db.query(FinanceTransaction).filter(
            and_(
                FinanceTransaction.user_id == user_id,
                FinanceTransaction.date >= last_month_start,
                FinanceTransaction.date < start_of_month,
                FinanceTransaction.type == 'expense'
            )
        ).all()
        
        last_month_spend = sum(t.amount for t in last_month_transactions)
        change = 0
        if last_month_spend > 0:
            change = ((monthly_spend - last_month_spend) / last_month_spend) * 100
        
        return {
            "monthlySpend": float(monthly_spend),
            "monthlyIncome": float(monthly_income),
            "monthlyBudget": float(total_budget),
            "change": round(change, 2),
            "forecast": []  # Can be calculated separately
        }
    except Exception as e:
        logger.error(f"Error getting finance summary: {e}")
        return {
            "monthlySpend": 0,
            "monthlyBudget": 0,
            "change": 0,
            "forecast": []
        }

def get_marketplace_summary(db: Session, user_id: int) -> Dict[str, Any]:
    """Get marketplace module summary"""
    try:
        # For now, return basic structure
        # Cart items and recommendations would come from marketplace service
        return {
            "cartItems": 0,
            "totalValue": 0,
            "recommendations": []
        }
    except Exception as e:
        logger.error(f"Error getting marketplace summary: {e}")
        return {
            "cartItems": 0,
            "totalValue": 0,
            "recommendations": []
        }

def get_fitness_summary(db: Session, user_id: int, start_of_week: datetime) -> Dict[str, Any]:
    """Get fitness module summary"""
    try:
        # Get today's workouts
        today = datetime.utcnow().date()
        today_workouts = db.query(FitnessWorkout).filter(
            and_(
                FitnessWorkout.user_id == user_id,
                func.date(FitnessWorkout.date) == today
            )
        ).all()
        
        # Get today's nutrition (if NutritionEntry model exists)
        # For now, use FitnessWorkout data
        calories_burned = sum(w.calories_burned or 0 for w in today_workouts)
        
        # Get latest measurement for steps (simplified - use workout data)
        steps_today = 0  # Would need Measurement model
        
        # Get workouts this week
        week_workouts = db.query(FitnessWorkout).filter(
            and_(
                FitnessWorkout.user_id == user_id,
                FitnessWorkout.date >= start_of_week
            )
        ).all()
        
        workouts_this_week = len(week_workouts)
        
        # Calculate streak (simplified - would need more logic)
        streak = 7  # Placeholder
        
        return {
            "stepsToday": int(steps_today),
            "goalSteps": 10000,
            "caloriesBurned": int(calories_burned),
            "workoutsThisWeek": workouts_this_week,
            "streak": streak
        }
    except Exception as e:
        logger.error(f"Error getting fitness summary: {e}")
        return {
            "stepsToday": 0,
            "goalSteps": 10000,
            "caloriesBurned": 0,
            "workoutsThisWeek": 0,
            "streak": 0
        }

def get_travel_summary(db: Session, user_id: int) -> Dict[str, Any]:
    """Get travel module summary"""
    try:
        # Get upcoming trips
        upcoming_trips = db.query(Trip).filter(
            and_(
                Trip.user_id == user_id,
                Trip.start_date >= datetime.utcnow().date()
            )
        ).order_by(Trip.start_date.asc()).all()
        
        upcoming_count = len(upcoming_trips)
        next_trip = None
        
        if upcoming_trips:
            trip = upcoming_trips[0]
            next_trip = {
                "destination": trip.destination or "Unknown",
                "date": trip.start_date.isoformat() if trip.start_date else None,
                "image": trip.image_url or "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=150&h=150&fit=crop"
            }
        
        return {
            "upcomingTrips": upcoming_count,
            "nextTrip": next_trip
        }
    except Exception as e:
        logger.error(f"Error getting travel summary: {e}")
        return {
            "upcomingTrips": 0,
            "nextTrip": None
        }

def get_social_summary(db: Session, user_id: int) -> Dict[str, Any]:
    """Get social module summary"""
    try:
        # Get friends count
        friends_count = db.query(Friend).filter(
            or_(
                Friend.user_id == user_id,
                Friend.friend_id == user_id
            )
        ).count()
        
        # Get shared items count (from posts)
        shared_posts = db.query(Post).filter(
            and_(
                Post.user_id == user_id,
                Post.is_shared == True
            )
        ).count()
        
        # Get recent activity (simplified)
        recent_activity = []
        
        return {
            "connections": friends_count,
            "sharedItems": shared_posts,
            "recentActivity": recent_activity
        }
    except Exception as e:
        logger.error(f"Error getting social summary: {e}")
        return {
            "connections": 0,
            "sharedItems": 0,
            "recentActivity": []
        }

def get_chat_summary(db: Session, user_id: int) -> Dict[str, Any]:
    """Get chat module summary"""
    try:
        # Get active conversations where user is a participant
        active_conversations = db.query(ConversationParticipant).filter(
            and_(
                ConversationParticipant.user_id == user_id,
                ConversationParticipant.is_active == True
            )
        ).all()
        
        # Get unread messages count (messages in conversations where user is participant but not sender)
        conversation_ids = [cp.conversation_id for cp in active_conversations]
        unread_count = 0
        if conversation_ids:
            # Check messages where user is not the sender and hasn't read them
            # read_by is a JSON field, so we check if user_id is not in the list
            all_messages = db.query(Message).filter(
                and_(
                    Message.conversation_id.in_(conversation_ids),
                    Message.sender_id != user_id
                )
            ).all()
            
            # Count messages where user_id is not in read_by JSON array
            for msg in all_messages:
                read_by_list = msg.read_by if msg.read_by else []
                if user_id not in read_by_list:
                    unread_count += 1
        
        return {
            "activeConversations": len(active_conversations),
            "unreadMessages": unread_count
        }
    except Exception as e:
        logger.error(f"Error getting chat summary: {e}")
        return {
            "activeConversations": 0,
            "unreadMessages": 0
        }

