from typing import Dict, List, Any, Optional, Union
from sqlalchemy import text, create_engine, inspect
from sqlalchemy.orm import Session, Query
from sqlalchemy.exc import SQLAlchemyError
import logging
import time
from functools import wraps
from collections import defaultdict
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QueryOptimizer:
    """Database query optimization utility class"""
    
    def __init__(self, engine):
        self.engine = engine
        self.inspector = inspect(engine)
        self.query_stats = defaultdict(list)
        self.slow_query_threshold = 1.0  # seconds
        
    def optimize_query(self, query: Query, **kwargs) -> Query:
        """Apply query optimizations"""
        try:
            # Add eager loading for relationships
            if 'eager_load' in kwargs:
                query = self._add_eager_loading(query, kwargs['eager_load'])
            
            # Add select_from optimization
            if 'select_from' in kwargs:
                query = query.select_from(kwargs['select_from'])
            
            # Add index hints
            if 'use_index' in kwargs:
                query = self._add_index_hint(query, kwargs['use_index'])
            
            # Limit results if specified
            if 'limit' in kwargs:
                query = query.limit(kwargs['limit'])
            
            # Add specific columns selection
            if 'columns' in kwargs:
                query = query.with_entities(*kwargs['columns'])
            
            return query
            
        except Exception as e:
            logger.error(f"Query optimization failed: {e}")
            return query
    
    def _add_eager_loading(self, query: Query, relationships: List[str]) -> Query:
        """Add eager loading for specified relationships"""
        for relationship in relationships:
            query = query.options(query.joinedload(relationship))
        return query
    
    def _add_index_hint(self, query: Query, index_name: str) -> Query:
        """Add index hint to query"""
        # This is database-specific and may not work with all databases
        try:
            query = query.from_statement(text(f"SELECT /*+ INDEX({index_name}) */ * FROM {query.table.name}"))
        except Exception as e:
            logger.warning(f"Could not add index hint: {e}")
        return query
    
    def analyze_query_performance(self, query: Query) -> Dict[str, Any]:
        """Analyze query performance and provide recommendations"""
        try:
            # Get query execution plan
            explain_plan = self._get_explain_plan(query)
            
            # Analyze query complexity
            complexity = self._analyze_complexity(query)
            
            # Check for missing indexes
            missing_indexes = self._check_missing_indexes(query)
            
            return {
                'explain_plan': explain_plan,
                'complexity': complexity,
                'missing_indexes': missing_indexes,
                'recommendations': self._generate_recommendations(explain_plan, complexity, missing_indexes)
            }
            
        except Exception as e:
            logger.error(f"Query analysis failed: {e}")
            return {}
    
    def _get_explain_plan(self, query: Query) -> Dict[str, Any]:
        """Get query execution plan"""
        try:
            # Convert query to SQL
            sql = str(query.compile(compile_kwargs={"literal_binds": True}))
            
            # Execute EXPLAIN
            with self.engine.connect() as conn:
                result = conn.execute(text(f"EXPLAIN ANALYZE {sql}"))
                plan = result.fetchall()
                
            return {
                'sql': sql,
                'plan': [dict(row) for row in plan]
            }
            
        except Exception as e:
            logger.warning(f"Could not get explain plan: {e}")
            return {'sql': str(query), 'plan': []}
    
    def _analyze_complexity(self, query: Query) -> Dict[str, Any]:
        """Analyze query complexity"""
        sql = str(query.compile(compile_kwargs={"literal_binds": True}))
        
        complexity = {
            'joins': sql.upper().count('JOIN'),
            'subqueries': sql.upper().count('SELECT') - 1,
            'where_conditions': sql.upper().count('WHERE'),
            'order_by': sql.upper().count('ORDER BY'),
            'group_by': sql.upper().count('GROUP BY'),
            'distinct': 'DISTINCT' in sql.upper()
        }
        
        # Calculate complexity score
        score = (
            complexity['joins'] * 2 +
            complexity['subqueries'] * 3 +
            complexity['where_conditions'] * 1 +
            complexity['order_by'] * 1 +
            complexity['group_by'] * 2 +
            (3 if complexity['distinct'] else 0)
        )
        
        complexity['score'] = score
        complexity['level'] = 'low' if score < 5 else 'medium' if score < 10 else 'high'
        
        return complexity
    
    def _check_missing_indexes(self, query: Query) -> List[str]:
        """Check for potentially missing indexes"""
        missing_indexes = []
        sql = str(query.compile(compile_kwargs={"literal_binds": True}))
        
        # Check for WHERE clauses without indexes
        if 'WHERE' in sql.upper():
            # This is a simplified check - in production, you'd analyze the actual table structure
            missing_indexes.append("Consider adding indexes on WHERE clause columns")
        
        # Check for ORDER BY without indexes
        if 'ORDER BY' in sql.upper():
            missing_indexes.append("Consider adding indexes on ORDER BY columns")
        
        # Check for JOIN conditions without indexes
        if 'JOIN' in sql.upper():
            missing_indexes.append("Consider adding indexes on JOIN condition columns")
        
        return missing_indexes
    
    def _generate_recommendations(self, explain_plan: Dict, complexity: Dict, missing_indexes: List[str]) -> List[str]:
        """Generate optimization recommendations"""
        recommendations = []
        
        # Based on complexity
        if complexity['level'] == 'high':
            recommendations.append("Consider breaking down complex query into smaller queries")
        
        if complexity['joins'] > 3:
            recommendations.append("Consider reducing number of JOINs or using subqueries")
        
        if complexity['subqueries'] > 2:
            recommendations.append("Consider using CTEs (Common Table Expressions) instead of subqueries")
        
        # Based on missing indexes
        recommendations.extend(missing_indexes)
        
        # Based on explain plan (simplified)
        if explain_plan.get('plan'):
            recommendations.append("Review execution plan for potential optimizations")
        
        return recommendations
    
    def create_indexes(self, table_name: str, columns: List[str], index_type: str = 'btree') -> bool:
        """Create database indexes"""
        try:
            for column in columns:
                index_name = f"idx_{table_name}_{column}"
                sql = f"CREATE INDEX {index_name} ON {table_name} USING {index_type} ({column})"
                
                with self.engine.connect() as conn:
                    conn.execute(text(sql))
                    conn.commit()
                
                logger.info(f"Created index: {index_name}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to create indexes: {e}")
            return False
    
    def get_table_statistics(self, table_name: str) -> Dict[str, Any]:
        """Get table statistics for optimization"""
        try:
            with self.engine.connect() as conn:
                # Get row count
                count_result = conn.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
                row_count = count_result.scalar()
                
                # Get table size
                size_result = conn.execute(text(f"""
                    SELECT pg_size_pretty(pg_total_relation_size('{table_name}'))
                """))
                table_size = size_result.scalar()
                
                # Get index information
                index_result = conn.execute(text(f"""
                    SELECT indexname, indexdef 
                    FROM pg_indexes 
                    WHERE tablename = '{table_name}'
                """))
                indexes = [dict(row) for row in index_result.fetchall()]
                
                return {
                    'table_name': table_name,
                    'row_count': row_count,
                    'table_size': table_size,
                    'indexes': indexes
                }
                
        except Exception as e:
            logger.error(f"Failed to get table statistics: {e}")
            return {}
    
    def optimize_table(self, table_name: str) -> Dict[str, Any]:
        """Optimize table structure and indexes"""
        try:
            # Get current statistics
            stats = self.get_table_statistics(table_name)
            
            # Analyze table
            with self.engine.connect() as conn:
                conn.execute(text(f"ANALYZE {table_name}"))
                conn.commit()
            
            # Vacuum table if needed
            with self.engine.connect() as conn:
                conn.execute(text(f"VACUUM {table_name}"))
                conn.commit()
            
            # Get updated statistics
            updated_stats = self.get_table_statistics(table_name)
            
            return {
                'original_stats': stats,
                'updated_stats': updated_stats,
                'optimizations_applied': ['ANALYZE', 'VACUUM']
            }
            
        except Exception as e:
            logger.error(f"Table optimization failed: {e}")
            return {}

def query_performance_monitor(func):
    """Decorator to monitor query performance"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        
        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            
            # Log slow queries
            if execution_time > 1.0:
                logger.warning(f"Slow query detected in {func.__name__}: {execution_time:.2f}s")
            
            # Store query statistics
            query_stats = {
                'function': func.__name__,
                'execution_time': execution_time,
                'timestamp': time.time(),
                'args': str(args),
                'kwargs': str(kwargs)
            }
            
            # In production, you'd store this in a database
            logger.info(f"Query executed: {query_stats}")
            
            return result
            
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"Query failed in {func.__name__} after {execution_time:.2f}s: {e}")
            raise
    
    return wrapper

class DatabaseOptimizer:
    """Main database optimization class"""
    
    def __init__(self, engine):
        self.engine = engine
        self.query_optimizer = QueryOptimizer(engine)
        self.connection_pool = engine.pool
    
    def optimize_connection_pool(self, **kwargs):
        """Optimize database connection pool settings"""
        try:
            # Set pool size
            if 'pool_size' in kwargs:
                self.connection_pool.size = kwargs['pool_size']
            
            # Set max overflow
            if 'max_overflow' in kwargs:
                self.connection_pool.max_overflow = kwargs['max_overflow']
            
            # Set pool timeout
            if 'pool_timeout' in kwargs:
                self.connection_pool.timeout = kwargs['pool_timeout']
            
            # Set pool recycle
            if 'pool_recycle' in kwargs:
                self.connection_pool.recycle = kwargs['pool_recycle']
            
            logger.info("Connection pool optimized")
            
        except Exception as e:
            logger.error(f"Connection pool optimization failed: {e}")
    
    def get_connection_pool_stats(self) -> Dict[str, Any]:
        """Get connection pool statistics"""
        try:
            return {
                'size': self.connection_pool.size(),
                'checked_in': self.connection_pool.checkedin(),
                'checked_out': self.connection_pool.checkedout(),
                'overflow': self.connection_pool.overflow(),
                'invalid': self.connection_pool.invalid()
            }
        except Exception as e:
            logger.error(f"Failed to get pool stats: {e}")
            return {}
    
    def optimize_queries(self, queries: List[Query], **kwargs) -> List[Query]:
        """Optimize multiple queries"""
        optimized_queries = []
        
        for query in queries:
            optimized = self.query_optimizer.optimize_query(query, **kwargs)
            optimized_queries.append(optimized)
        
        return optimized_queries
    
    def batch_optimize_tables(self, table_names: List[str]) -> Dict[str, Any]:
        """Optimize multiple tables"""
        results = {}
        
        for table_name in table_names:
            try:
                result = self.query_optimizer.optimize_table(table_name)
                results[table_name] = result
            except Exception as e:
                results[table_name] = {'error': str(e)}
        
        return results
    
    def generate_optimization_report(self) -> Dict[str, Any]:
        """Generate comprehensive optimization report"""
        try:
            # Get connection pool stats
            pool_stats = self.get_connection_pool_stats()
            
            # Get database size
            with self.engine.connect() as conn:
                size_result = conn.execute(text("""
                    SELECT pg_size_pretty(pg_database_size(current_database()))
                """))
                db_size = size_result.scalar()
            
            # Get slow queries (from logs or monitoring)
            slow_queries = self._get_slow_queries()
            
            return {
                'connection_pool': pool_stats,
                'database_size': db_size,
                'slow_queries': slow_queries,
                'recommendations': self._generate_global_recommendations(pool_stats, slow_queries)
            }
            
        except Exception as e:
            logger.error(f"Failed to generate optimization report: {e}")
            return {}
    
    def _get_slow_queries(self) -> List[Dict[str, Any]]:
        """Get list of slow queries (simplified implementation)"""
        # In production, this would query a monitoring table or log files
        return []
    
    def _generate_global_recommendations(self, pool_stats: Dict, slow_queries: List) -> List[str]:
        """Generate global optimization recommendations"""
        recommendations = []
        
        # Connection pool recommendations
        if pool_stats.get('checked_out', 0) > pool_stats.get('size', 0) * 0.8:
            recommendations.append("Consider increasing connection pool size")
        
        if pool_stats.get('overflow', 0) > 0:
            recommendations.append("Connection pool overflow detected - consider tuning pool settings")
        
        # Slow query recommendations
        if slow_queries:
            recommendations.append(f"Found {len(slow_queries)} slow queries - review and optimize")
        
        return recommendations

# Utility functions for common optimizations
def add_eager_loading(query: Query, relationships: List[str]) -> Query:
    """Add eager loading to query"""
    for relationship in relationships:
        query = query.options(query.joinedload(relationship))
    return query

def add_pagination(query: Query, page: int = 1, per_page: int = 20) -> Query:
    """Add pagination to query"""
    offset = (page - 1) * per_page
    return query.offset(offset).limit(per_page)

def add_selective_columns(query: Query, columns: List[str]) -> Query:
    """Select only specific columns"""
    return query.with_entities(*columns)

def add_index_hint(query: Query, table_name: str, index_name: str) -> Query:
    """Add index hint to query (PostgreSQL specific)"""
    try:
        sql = f"SELECT /*+ INDEX({table_name} {index_name}) */ * FROM {table_name}"
        return query.from_statement(text(sql))
    except Exception as e:
        logger.warning(f"Could not add index hint: {e}")
        return query

# Performance monitoring utilities
def monitor_query_performance(func):
    """Decorator to monitor query performance"""
    return query_performance_monitor(func)

def log_slow_queries(threshold: float = 1.0):
    """Decorator to log slow queries"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            
            if execution_time > threshold:
                logger.warning(f"Slow query in {func.__name__}: {execution_time:.2f}s")
            
            return result
        return wrapper
    return decorator
