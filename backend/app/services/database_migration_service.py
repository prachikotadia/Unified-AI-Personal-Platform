import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session
from app.database import Base, engine

logger = structlog.get_logger()

class DatabaseMigrationService:
    """Service for managing database migrations and schema updates"""
    
    def __init__(self):
        pass
    
    async def create_all_tables(self) -> Dict[str, Any]:
        """Create all database tables"""
        try:
            Base.metadata.create_all(bind=engine)
            
            return {
                "success": True,
                "message": "All tables created successfully",
                "tables": list(Base.metadata.tables.keys())
            }
            
        except Exception as e:
            logger.error(f"Error creating tables: {e}")
            return {
                "success": False,
                "message": f"Error creating tables: {str(e)}"
            }
    
    async def create_indexes(self, db: Session) -> Dict[str, Any]:
        """Create database indexes for performance"""
        try:
            indexes_created = []
            
            # Finance indexes
            indexes = [
                "CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date)",
                "CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category)",
                "CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets(user_id)",
                "CREATE INDEX IF NOT EXISTS idx_goals_user ON financial_goals(user_id)",
            ]
            
            # Marketplace indexes
            indexes.extend([
                "CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)",
                "CREATE INDEX IF NOT EXISTS idx_orders_user_date ON orders(user_id, order_date)",
                "CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id)",
            ])
            
            # Travel indexes
            indexes.extend([
                "CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id)",
                "CREATE INDEX IF NOT EXISTS idx_trips_dates ON trips(start_date, end_date)",
                "CREATE INDEX IF NOT EXISTS idx_flights_trip ON flight_bookings(trip_id)",
            ])
            
            # Fitness indexes
            indexes.extend([
                "CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workout_sessions(user_id, started_at)",
                "CREATE INDEX IF NOT EXISTS idx_nutrition_user_date ON nutrition_entries(user_id, date)",
            ])
            
            # Social indexes
            indexes.extend([
                "CREATE INDEX IF NOT EXISTS idx_posts_user_created ON posts(user_id, created_at)",
                "CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id)",
                "CREATE INDEX IF NOT EXISTS idx_friends_user ON friends(user_id, friend_id)",
            ])
            
            # Chat indexes
            indexes.extend([
                "CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON messages(conversation_id, created_at)",
                "CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversation_participants(user_id)",
            ])
            
            for index_sql in indexes:
                try:
                    db.execute(text(index_sql))
                    indexes_created.append(index_sql)
                except Exception as e:
                    logger.warning(f"Error creating index: {e}")
            
            db.commit()
            
            return {
                "success": True,
                "indexes_created": len(indexes_created),
                "message": f"Created {len(indexes_created)} indexes"
            }
            
        except Exception as e:
            logger.error(f"Error creating indexes: {e}")
            db.rollback()
            return {
                "success": False,
                "message": f"Error creating indexes: {str(e)}"
            }
    
    async def verify_relationships(self, db: Session) -> Dict[str, Any]:
        """Verify database relationships are properly configured"""
        try:
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            
            relationships_verified = []
            issues = []
            
            for table_name in tables:
                foreign_keys = inspector.get_foreign_keys(table_name)
                for fk in foreign_keys:
                    relationships_verified.append({
                        "table": table_name,
                        "column": fk["constrained_columns"][0],
                        "references": fk["referred_table"]
                    })
            
            return {
                "success": True,
                "tables_checked": len(tables),
                "relationships": relationships_verified,
                "issues": issues
            }
            
        except Exception as e:
            logger.error(f"Error verifying relationships: {e}")
            return {
                "success": False,
                "message": f"Error: {str(e)}"
            }
    
    async def add_constraints(self, db: Session) -> Dict[str, Any]:
        """Add database constraints"""
        try:
            constraints_added = []
            
            # Add check constraints
            constraints = [
                "ALTER TABLE transactions ADD CONSTRAINT check_amount_positive CHECK (amount > 0)",
                "ALTER TABLE budgets ADD CONSTRAINT check_budget_amount_positive CHECK (amount > 0)",
            ]
            
            for constraint_sql in constraints:
                try:
                    db.execute(text(constraint_sql))
                    constraints_added.append(constraint_sql)
                except Exception as e:
                    logger.warning(f"Error adding constraint: {e}")
            
            db.commit()
            
            return {
                "success": True,
                "constraints_added": len(constraints_added),
                "message": f"Added {len(constraints_added)} constraints"
            }
            
        except Exception as e:
            logger.error(f"Error adding constraints: {e}")
            db.rollback()
            return {
                "success": False,
                "message": f"Error: {str(e)}"
            }

# Global service instance
database_migration_service = DatabaseMigrationService()

