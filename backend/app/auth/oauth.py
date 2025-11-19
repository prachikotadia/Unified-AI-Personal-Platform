from fastapi import HTTPException, status
from typing import Dict, Any, Optional
import httpx
import os
from dotenv import load_dotenv
import structlog

load_dotenv()
logger = structlog.get_logger()

class OAuthHandler:
    """OAuth authentication handler for Google and GitHub"""
    
    # Google OAuth Configuration
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")
    
    # GitHub OAuth Configuration
    GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
    GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
    GITHUB_REDIRECT_URI = os.getenv("GITHUB_REDIRECT_URI", "http://localhost:8000/api/auth/github/callback")
    
    @classmethod
    async def get_google_user_info(cls, code: str) -> Dict[str, Any]:
        """Get user information from Google OAuth"""
        try:
            # Exchange code for access token
            token_url = "https://oauth2.googleapis.com/token"
            token_data = {
                "client_id": cls.GOOGLE_CLIENT_ID,
                "client_secret": cls.GOOGLE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": cls.GOOGLE_REDIRECT_URI
            }
            
            async with httpx.AsyncClient() as client:
                token_response = await client.post(token_url, data=token_data)
                token_response.raise_for_status()
                token_info = token_response.json()
                
                access_token = token_info["access_token"]
                
                # Get user information
                user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
                headers = {"Authorization": f"Bearer {access_token}"}
                
                user_response = await client.get(user_info_url, headers=headers)
                user_response.raise_for_status()
                user_info = user_response.json()
                
                return {
                    "provider": "google",
                    "provider_id": user_info["id"],
                    "email": user_info["email"],
                    "first_name": user_info.get("given_name", ""),
                    "last_name": user_info.get("family_name", ""),
                    "avatar": user_info.get("picture"),
                    "verified": user_info.get("verified_email", False)
                }
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Google OAuth error: {e.response.text}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to authenticate with Google"
            )
        except Exception as e:
            logger.error(f"Google OAuth error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="OAuth authentication failed"
            )
    
    @classmethod
    async def get_github_user_info(cls, code: str) -> Dict[str, Any]:
        """Get user information from GitHub OAuth"""
        try:
            # Exchange code for access token
            token_url = "https://github.com/login/oauth/access_token"
            token_data = {
                "client_id": cls.GITHUB_CLIENT_ID,
                "client_secret": cls.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": cls.GITHUB_REDIRECT_URI
            }
            
            async with httpx.AsyncClient() as client:
                token_response = await client.post(
                    token_url, 
                    data=token_data,
                    headers={"Accept": "application/json"}
                )
                token_response.raise_for_status()
                token_info = token_response.json()
                
                if "error" in token_info:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"GitHub OAuth error: {token_info['error_description']}"
                    )
                
                access_token = token_info["access_token"]
                
                # Get user information
                user_info_url = "https://api.github.com/user"
                headers = {
                    "Authorization": f"token {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                }
                
                user_response = await client.get(user_info_url, headers=headers)
                user_response.raise_for_status()
                user_info = user_response.json()
                
                # Get user email (if not public)
                email = user_info.get("email")
                if not email:
                    emails_response = await client.get(
                        "https://api.github.com/user/emails",
                        headers=headers
                    )
                    emails_response.raise_for_status()
                    emails = emails_response.json()
                    primary_email = next((e for e in emails if e["primary"]), None)
                    email = primary_email["email"] if primary_email else None
                
                return {
                    "provider": "github",
                    "provider_id": str(user_info["id"]),
                    "email": email,
                    "first_name": user_info.get("name", "").split()[0] if user_info.get("name") else "",
                    "last_name": " ".join(user_info.get("name", "").split()[1:]) if user_info.get("name") else "",
                    "avatar": user_info.get("avatar_url"),
                    "verified": True  # GitHub accounts are verified
                }
                
        except httpx.HTTPStatusError as e:
            logger.error(f"GitHub OAuth error: {e.response.text}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to authenticate with GitHub"
            )
        except Exception as e:
            logger.error(f"GitHub OAuth error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="OAuth authentication failed"
            )
    
    @classmethod
    def get_oauth_url(cls, provider: str) -> str:
        """Get OAuth authorization URL"""
        if provider == "google":
            return (
                f"https://accounts.google.com/o/oauth2/v2/auth?"
                f"client_id={cls.GOOGLE_CLIENT_ID}&"
                f"redirect_uri={cls.GOOGLE_REDIRECT_URI}&"
                f"response_type=code&"
                f"scope=openid email profile&"
                f"access_type=offline"
            )
        elif provider == "github":
            return (
                f"https://github.com/login/oauth/authorize?"
                f"client_id={cls.GITHUB_CLIENT_ID}&"
                f"redirect_uri={cls.GITHUB_REDIRECT_URI}&"
                f"scope=user:email"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported OAuth provider: {provider}"
            )
