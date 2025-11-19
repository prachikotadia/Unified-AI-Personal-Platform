from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Fitness Schemas
class FitnessGoalBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: Optional[str] = None
    target_value: Optional[float] = None
    unit: Optional[str] = None
    deadline: Optional[datetime] = None

class FitnessGoalCreate(FitnessGoalBase):
    pass

class FitnessGoalUpdate(FitnessGoalBase):
    current_value: Optional[float] = None
    status: Optional[str] = None
    progress_percentage: Optional[float] = None

class FitnessGoal(FitnessGoalBase):
    id: int
    user_id: int
    current_value: float
    status: str
    progress_percentage: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {
        "from_attributes": True
    }

class FitnessWorkoutBase(BaseModel):
    name: str
    type: Optional[str] = None
    duration: Optional[int] = None
    calories_burned: Optional[float] = None
    date: datetime
    notes: Optional[str] = None

class FitnessWorkoutCreate(FitnessWorkoutBase):
    pass

class FitnessWorkout(FitnessWorkoutBase):
    id: int
    user_id: int
    created_at: datetime
    
    model_config = {
        "from_attributes": True
    }

# Finance Schemas
class FinanceAccountBase(BaseModel):
    name: str
    type: Optional[str] = None
    balance: float = 0
    currency: str = "USD"

class FinanceAccountCreate(FinanceAccountBase):
    pass

class FinanceAccountUpdate(FinanceAccountBase):
    is_active: Optional[bool] = None

class FinanceAccount(FinanceAccountBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {
        "from_attributes": True
    }

class FinanceTransactionBase(BaseModel):
    account_id: int
    amount: float
    description: Optional[str] = None
    category: Optional[str] = None
    type: str
    date: datetime

class FinanceTransactionCreate(FinanceTransactionBase):
    pass

class FinanceTransaction(FinanceTransactionBase):
    id: int
    user_id: int
    created_at: datetime
    
    model_config = {
        "from_attributes": True
    }

class FinanceBudgetBase(BaseModel):
    name: str
    amount: float
    category: Optional[str] = None
    period: str = "monthly"

class FinanceBudgetCreate(FinanceBudgetBase):
    pass

class FinanceBudgetUpdate(FinanceBudgetBase):
    spent: Optional[float] = None
    status: Optional[str] = None

class FinanceBudget(FinanceBudgetBase):
    id: int
    user_id: int
    spent: float
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {
        "from_attributes": True
    }

class FinanceGoalBase(BaseModel):
    name: str
    description: Optional[str] = None
    target_amount: float
    currency: str = "USD"
    category: Optional[str] = None
    priority: Optional[str] = None
    deadline: Optional[datetime] = None

class FinanceGoalCreate(FinanceGoalBase):
    pass

class FinanceGoalUpdate(FinanceGoalBase):
    current_amount: Optional[float] = None
    status: Optional[str] = None

class FinanceGoal(FinanceGoalBase):
    id: int
    user_id: int
    current_amount: float
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {
        "from_attributes": True
    }
