from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import structlog
from typing import Union
import traceback

logger = structlog.get_logger()

async def error_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global error handler for all exceptions"""
    
    # Log the error
    logger.error(
        "Unhandled exception",
        path=request.url.path,
        method=request.method,
        error=str(exc),
        traceback=traceback.format_exc()
    )
    
    # Handle different types of exceptions
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": True,
                "message": exc.detail,
                "status_code": exc.status_code,
                "path": request.url.path
            }
        )
    
    elif isinstance(exc, RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={
                "error": True,
                "message": "Validation error",
                "details": exc.errors(),
                "status_code": 422,
                "path": request.url.path
            }
        )
    
    elif isinstance(exc, StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": True,
                "message": exc.detail,
                "status_code": exc.status_code,
                "path": request.url.path
            }
        )
    
    else:
        # Generic error handler
        return JSONResponse(
            status_code=500,
            content={
                "error": True,
                "message": "Internal server error",
                "status_code": 500,
                "path": request.url.path
            }
        )

def not_found(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle 404 errors"""
    return JSONResponse(
        status_code=404,
        content={
            "error": True,
            "message": "Resource not found",
            "status_code": 404,
            "path": request.url.path
        }
    )

def validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle validation errors"""
    return JSONResponse(
        status_code=422,
        content={
            "error": True,
            "message": "Validation error",
            "details": exc.errors(),
            "status_code": 422,
            "path": request.url.path
        }
    )

def rate_limit_exceeded(request: Request, exc: Exception) -> JSONResponse:
    """Handle rate limiting errors"""
    return JSONResponse(
        status_code=429,
        content={
            "error": True,
            "message": "Rate limit exceeded. Please try again later.",
            "status_code": 429,
            "path": request.url.path
        }
    )

def database_error(request: Request, exc: Exception) -> JSONResponse:
    """Handle database errors"""
    logger.error(f"Database error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": "Database operation failed",
            "status_code": 500,
            "path": request.url.path
        }
    )

def authentication_error(request: Request, exc: Exception) -> JSONResponse:
    """Handle authentication errors"""
    return JSONResponse(
        status_code=401,
        content={
            "error": True,
            "message": "Authentication required",
            "status_code": 401,
            "path": request.url.path
        }
    )

def authorization_error(request: Request, exc: Exception) -> JSONResponse:
    """Handle authorization errors"""
    return JSONResponse(
        status_code=403,
        content={
            "error": True,
            "message": "Access denied",
            "status_code": 403,
            "path": request.url.path
        }
    )
