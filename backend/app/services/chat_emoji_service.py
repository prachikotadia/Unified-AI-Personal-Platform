import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from app.cache import redis_cache

logger = structlog.get_logger()

class ChatEmojiService:
    def __init__(self):
        self.emoji_categories = {
            "smileys": ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃"],
            "gestures": ["👋", "🤚", "🖐", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞"],
            "people": ["👤", "👥", "👶", "🧒", "👦", "👧", "🧑", "👨", "👩", "🧓"],
            "animals": ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯"],
            "food": ["🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑"],
            "activities": ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸"],
            "travel": ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎", "🚓", "🚑", "🚒", "🚐"],
            "objects": ["⌚", "📱", "📲", "💻", "⌨️", "🖥", "🖨", "🖱", "🖲", "🕹"],
            "symbols": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔"],
            "flags": ["🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇩🇪", "🇫🇷", "🇮🇹", "🇪🇸", "🇯🇵", "🇰🇷"]
        }

    async def get_emoji_suggestions(
        self,
        query: Optional[str] = None,
        category: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Get emoji suggestions based on query or category"""
        try:
            suggestions = []

            if category and category in self.emoji_categories:
                # Get emojis from specific category
                emojis = self.emoji_categories[category][:limit]
                suggestions = [{"emoji": e, "category": category} for e in emojis]
            elif query:
                # Search across all categories
                query_lower = query.lower()
                for cat, emojis in self.emoji_categories.items():
                    for emoji in emojis:
                        if query_lower in emoji or query_lower in cat:
                            suggestions.append({"emoji": emoji, "category": cat})
                            if len(suggestions) >= limit:
                                break
                    if len(suggestions) >= limit:
                        break
            else:
                # Return popular emojis
                popular = ["😀", "😂", "❤️", "👍", "😍", "🙏", "😊", "🎉", "🔥", "💯"]
                suggestions = [{"emoji": e, "category": "popular"} for e in popular[:limit]]

            return suggestions[:limit]

        except Exception as e:
            logger.error(f"Error getting emoji suggestions: {e}")
            return []

    async def get_recent_emojis(
        self,
        user_id: int,
        limit: int = 10
    ) -> List[str]:
        """Get user's recently used emojis"""
        try:
            cache_key = f"recent_emojis_{user_id}"
            recent = await redis_cache.get_cache(cache_key)
            if recent:
                return recent[:limit]
            return []

        except Exception as e:
            logger.error(f"Error getting recent emojis: {e}")
            return []

    async def track_emoji_usage(
        self,
        user_id: int,
        emoji: str
    ) -> None:
        """Track emoji usage for suggestions"""
        try:
            cache_key = f"recent_emojis_{user_id}"
            recent = await redis_cache.get_cache(cache_key) or []
            
            # Remove if already exists
            if emoji in recent:
                recent.remove(emoji)
            
            # Add to front
            recent.insert(0, emoji)
            
            # Keep only last 20
            recent = recent[:20]
            
            await redis_cache.set_cache(cache_key, recent, expire=86400 * 30)  # 30 days

        except Exception as e:
            logger.error(f"Error tracking emoji usage: {e}")

# Global service instance
chat_emoji_service = ChatEmojiService()

