import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.social_db import Post, Comment, Like, Share, Follow
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

# LangChain service - optional
try:
    from app.services.langchain_service import langchain_service
except ImportError:
    langchain_service = None

class AISocialInsightsService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

    async def get_social_insights(
        self,
        db: Session,
        user_id: int
    ) -> Dict[str, Any]:
        """Get AI-powered social insights"""
        try:
            # Get user's activity data
            posts = db.query(Post).filter(
                and_(
                    Post.user_id == user_id,
                    Post.is_deleted == False
                )
            ).all()

            # Calculate engagement metrics
            total_likes = sum(p.likes_count or 0 for p in posts)
            total_comments = sum(p.comments_count or 0 for p in posts)
            total_shares = sum(p.shares_count or 0 for p in posts)
            total_views = sum(p.views_count or 0 for p in posts)

            # Get followers
            followers_count = db.query(Follow).filter(Follow.following_id == user_id).count()
            following_count = db.query(Follow).filter(Follow.follower_id == user_id).count()

            # Analyze best posting times
            posting_times = [p.created_at.hour for p in posts if p.created_at]
            best_hours = self._analyze_best_posting_times(posting_times)

            # Analyze content performance
            top_posts = sorted(posts, key=lambda p: (p.likes_count or 0) + (p.comments_count or 0), reverse=True)[:5]

            insights = {
                "engagement_metrics": {
                    "total_posts": len(posts),
                    "total_likes": total_likes,
                    "total_comments": total_comments,
                    "total_shares": total_shares,
                    "total_views": total_views,
                    "average_engagement": (total_likes + total_comments + total_shares) / max(len(posts), 1)
                },
                "follower_metrics": {
                    "followers": followers_count,
                    "following": following_count,
                    "engagement_rate": (total_likes + total_comments) / max(followers_count, 1) * 100
                },
                "best_posting_times": best_hours,
                "top_posts": [
                    {
                        "id": p.id,
                        "content": p.content[:100] if p.content else "",
                        "engagement": (p.likes_count or 0) + (p.comments_count or 0)
                    }
                    for p in top_posts
                ],
                "recommendations": self._generate_recommendations(posts, followers_count, total_likes)
            }

            return {
                "success": True,
                "insights": insights
            }

        except Exception as e:
            logger.error(f"Error getting social insights: {e}")
            return {"success": False, "message": f"Error getting insights: {str(e)}"}

    async def get_post_recommendations(
        self,
        db: Session,
        user_id: int,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get AI-powered post recommendations"""
        try:
            # Get user's friends' posts
            from app.models.social_db import Friend
            friends = db.query(Friend).filter(
                and_(
                    Friend.user_id == user_id,
                    Friend.status == "active"
                )
            ).all()
            friend_ids = [f.friend_id for f in friends]

            # Get popular posts from friends
            posts = db.query(Post).filter(
                and_(
                    Post.user_id.in_(friend_ids),
                    Post.is_deleted == False,
                    Post.visibility == "public"
                )
            ).order_by(
                desc(Post.likes_count + Post.comments_count)
            ).limit(limit).all()

            return [
                {
                    "id": p.id,
                    "user_id": p.user_id,
                    "content": p.content[:200] if p.content else "",
                    "engagement": (p.likes_count or 0) + (p.comments_count or 0),
                    "reason": "Popular among your friends"
                }
                for p in posts
            ]

        except Exception as e:
            logger.error(f"Error getting post recommendations: {e}")
            return []

    async def get_hashtag_suggestions(
        self,
        db: Session,
        content: str
    ) -> List[str]:
        """Get AI-powered hashtag suggestions"""
        try:
            # Simple keyword extraction (in production, use NLP)
            words = content.lower().split()
            common_words = ["fitness", "travel", "food", "workout", "trip", "budget", "finance"]
            
            suggestions = []
            for word in words:
                if word in common_words:
                    suggestions.append(f"#{word}")

            # Add generic suggestions
            if "workout" in content.lower():
                suggestions.extend(["#fitness", "#health", "#exercise"])
            if "trip" in content.lower() or "travel" in content.lower():
                suggestions.extend(["#travel", "#adventure", "#wanderlust"])

            return list(set(suggestions))[:10]

        except Exception as e:
            logger.error(f"Error getting hashtag suggestions: {e}")
            return []

    async def get_timing_recommendations(
        self,
        db: Session,
        user_id: int
    ) -> Dict[str, Any]:
        """Get AI-powered post timing recommendations"""
        try:
            # Get user's posting history
            posts = db.query(Post).filter(
                and_(
                    Post.user_id == user_id,
                    Post.is_deleted == False
                )
            ).all()

            posting_times = [p.created_at.hour for p in posts if p.created_at]
            best_hours = self._analyze_best_posting_times(posting_times)

            return {
                "success": True,
                "best_hours": best_hours,
                "recommendation": f"Post between {best_hours[0]}:00 and {best_hours[-1]}:00 for maximum engagement"
            }

        except Exception as e:
            logger.error(f"Error getting timing recommendations: {e}")
            return {"success": False, "message": f"Error: {str(e)}"}

    def _analyze_best_posting_times(self, posting_times: List[int]) -> List[int]:
        """Analyze best posting times"""
        if not posting_times:
            return [9, 12, 18]  # Default: morning, noon, evening

        # Count posts by hour
        hour_counts = {}
        for hour in posting_times:
            hour_counts[hour] = hour_counts.get(hour, 0) + 1

        # Get top hours
        sorted_hours = sorted(hour_counts.items(), key=lambda x: x[1], reverse=True)
        return [h[0] for h in sorted_hours[:3]]

    def _generate_recommendations(
        self,
        posts: List[Post],
        followers_count: int,
        total_likes: int
    ) -> List[str]:
        """Generate recommendations"""
        recommendations = []

        if len(posts) < 5:
            recommendations.append("Post more frequently to increase engagement")
        
        if followers_count > 0:
            engagement_rate = total_likes / followers_count
            if engagement_rate < 0.05:
                recommendations.append("Try posting at different times to improve engagement")
        
        if len(posts) > 0:
            avg_engagement = (total_likes + sum(p.comments_count or 0 for p in posts)) / len(posts)
            if avg_engagement < 10:
                recommendations.append("Consider using more engaging content and hashtags")

        return recommendations

# Global service instance
ai_social_insights_service = AISocialInsightsService()

