#!/usr/bin/env python3
"""
Test script to verify OpenAI API connection
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_openai_connection():
    """Test OpenAI API connection"""
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        
        if not api_key:
            print("❌ ERROR: OPENAI_API_KEY not found in environment variables")
            return False
        
        if api_key == "your-openai-api-key-here":
            print("❌ ERROR: OPENAI_API_KEY is still set to placeholder value")
            return False
        
        if not api_key.startswith("sk-"):
            print("⚠️  WARNING: API key doesn't start with 'sk-' - may be invalid format")
        
        print(f"✅ API Key found: {api_key[:20]}...{api_key[-10:]}")
        
        # Try to import OpenAI
        try:
            import openai
            print("✅ OpenAI library imported successfully")
        except ImportError:
            print("❌ ERROR: OpenAI library not installed. Run: pip install openai")
            return False
        
        # Initialize OpenAI client
        try:
            client = openai.OpenAI(api_key=api_key)
            print("✅ OpenAI client initialized successfully")
        except Exception as e:
            print(f"❌ ERROR: Failed to initialize OpenAI client: {e}")
            return False
        
        # Test API call (simple, low-cost request)
        try:
            print("\n🔄 Testing API connection with a simple request...")
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "user", "content": "Say 'AI connection successful' if you can read this."}
                ],
                max_tokens=10
            )
            
            result = response.choices[0].message.content
            print(f"✅ API Response: {result}")
            print("\n🎉 SUCCESS: OpenAI API connection is working!")
            return True
            
        except openai.AuthenticationError:
            print("❌ ERROR: Authentication failed. Check if your API key is valid.")
            return False
        except openai.RateLimitError:
            print("⚠️  WARNING: Rate limit exceeded. API key is valid but you've hit the limit.")
            return True  # Key is valid, just rate limited
        except openai.APIError as e:
            print(f"❌ ERROR: API error: {e}")
            return False
        except Exception as e:
            print(f"❌ ERROR: Unexpected error: {e}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: Failed to test connection: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("OpenAI API Connection Test")
    print("=" * 60)
    print()
    
    success = test_openai_connection()
    
    print()
    print("=" * 60)
    if success:
        print("✅ All tests passed! AI integration is ready to use.")
        sys.exit(0)
    else:
        print("❌ Some tests failed. Please check the errors above.")
        sys.exit(1)

