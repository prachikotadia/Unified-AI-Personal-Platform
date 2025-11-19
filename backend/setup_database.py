#!/usr/bin/env python3
"""
Database setup script for OmniLife AI Platform
This script helps set up PostgreSQL database and run migrations
"""

import os
import sys
import subprocess
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_postgres_installation():
    """Check if PostgreSQL is installed"""
    try:
        result = subprocess.run(['psql', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print("PostgreSQL is installed")
            return True
        else:
            print("PostgreSQL is not installed")
            return False
    except FileNotFoundError:
        print("PostgreSQL is not installed or not in PATH")
        return False

def create_database():
    """Create the database if it doesn't exist"""
    try:
        # Get database configuration from environment
        db_name = os.getenv("POSTGRES_DB", "omnilife_db")
        db_user = os.getenv("POSTGRES_USER", "postgres")
        db_password = os.getenv("POSTGRES_PASSWORD", "password")
        db_host = os.getenv("POSTGRES_HOST", "localhost")
        db_port = os.getenv("POSTGRES_PORT", "5432")
        
        # Set password for psql
        env = os.environ.copy()
        env['PGPASSWORD'] = db_password
        
        # Check if database exists
        check_cmd = [
            'psql', '-h', db_host, '-p', db_port, '-U', db_user,
            '-d', 'postgres', '-c', f"SELECT 1 FROM pg_database WHERE datname='{db_name}'"
        ]
        
        result = subprocess.run(check_cmd, env=env, capture_output=True, text=True)
        
        if result.returncode == 0 and db_name in result.stdout:
            print(f"Database '{db_name}' already exists")
            return True
        else:
            # Create database
            create_cmd = [
                'psql', '-h', db_host, '-p', db_port, '-U', db_user,
                '-d', 'postgres', '-c', f"CREATE DATABASE {db_name}"
            ]
            
            result = subprocess.run(create_cmd, env=env, capture_output=True, text=True)
            
            if result.returncode == 0:
                print(f"Database '{db_name}' created successfully")
                return True
            else:
                print(f"Failed to create database: {result.stderr}")
                return False
                
    except Exception as e:
        print(f"Error creating database: {e}")
        return False

def run_migrations():
    """Run database migrations"""
    try:
        print("Running database migrations...")
        
        # Run alembic upgrade
        result = subprocess.run(['alembic', 'upgrade', 'head'], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("Database migrations completed successfully")
            return True
        else:
            print(f"Migration failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"Error running migrations: {e}")
        return False

def create_initial_data():
    """Create initial data for the application"""
    try:
        print("Creating initial data...")
        
        # Import database service
        from app.database_postgres import SessionLocal, init_database
        from app.services.database_service import DatabaseService
        from app.models_postgres import User, FinanceAccount, FitnessGoal, MarketplaceProduct
        
        # Initialize database
        init_database()
        
        # Create database session
        db = SessionLocal()
        db_service = DatabaseService(db)
        
        try:
            # Create sample user
            sample_user = db_service.create_user({
                "email": "demo@omnilife.com",
                "username": "demo_user",
                "full_name": "Demo User",
                "hashed_password": "hashed_password_here",  # In real app, hash this
                "status": "active"
            })
            
            # Create sample finance account
            db_service.create_finance_account({
                "user_id": sample_user.id,
                "name": "Main Checking Account",
                "account_type": "checking",
                "balance": 5000.0,
                "currency": "USD"
            })
            
            # Create sample fitness goal
            db_service.create_fitness_goal({
                "user_id": sample_user.id,
                "title": "Run 5K",
                "goal_type": "workout",
                "target_value": 5.0,
                "current_value": 0.0,
                "unit": "km"
            })
            
            # Create sample marketplace products
            products = [
                {
                    "name": "Wireless Headphones",
                    "description": "High-quality wireless headphones with noise cancellation",
                    "price": 199.99,
                    "category": "electronics",
                    "stock_quantity": 50
                },
                {
                    "name": "Fitness Tracker",
                    "description": "Smart fitness tracker with heart rate monitoring",
                    "price": 89.99,
                    "category": "fitness",
                    "stock_quantity": 30
                },
                {
                    "name": "Travel Backpack",
                    "description": "Durable travel backpack with laptop compartment",
                    "price": 79.99,
                    "category": "travel",
                    "stock_quantity": 25
                }
            ]
            
            for product_data in products:
                db_service.create_marketplace_product(product_data)
            
            print("Initial data created successfully")
            return True
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"Error creating initial data: {e}")
        return False

def main():
    """Main setup function"""
    print("Setting up OmniLife AI Platform Database")
    print("=" * 50)
    
    # Check PostgreSQL installation
    if not check_postgres_installation():
        print("\nTo install PostgreSQL:")
        print("   macOS: brew install postgresql")
        print("   Ubuntu: sudo apt-get install postgresql postgresql-contrib")
        print("   Windows: Download from https://www.postgresql.org/download/")
        return False
    
    # Create database
    if not create_database():
        print("\nMake sure PostgreSQL is running:")
        print("   macOS: brew services start postgresql")
        print("   Ubuntu: sudo systemctl start postgresql")
        print("   Windows: Start PostgreSQL service")
        return False
    
    # Run migrations
    if not run_migrations():
        print("\nCheck your database configuration in .env file")
        return False
    
    # Create initial data
    if not create_initial_data():
        print("\nInitial data creation failed, but database is ready")
    
    print("\nDatabase setup completed successfully!")
    print("\nNext steps:")
    print("   1. Start the backend: python start.py")
    print("   2. Start the frontend: npm run dev")
    print("   3. Visit: http://localhost:5173")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
