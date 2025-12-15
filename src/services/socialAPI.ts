import { API_BASE_URL, isBackendAvailable } from '../config/api';
import { SocialPost } from '../store/social';

// Types
export interface SocialUser {
  id: string;
  username: string;
  display_name: string;
  avatar?: string;
  bio?: string;
  is_online: boolean;
  last_seen?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
}

export interface SocialConnection {
  id: string;
  user_id: string;
  connected_user_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
}

export interface SocialInteraction {
  id: string;
  user_id: string;
  post_id: string;
  interaction_type: 'like' | 'save' | 'hide';
  created_at: string;
}

class SocialAPIService {
  private baseURL = `${API_BASE_URL}/api/social`;
  // Initialize cache as unavailable to skip first health check
  private serverAvailableCache: { available: boolean; timestamp: number } = {
    available: false,
    timestamp: Date.now()
  };
  private readonly CACHE_DURATION = 30000; // 30 seconds cache
  private healthCheckInProgress: boolean = false;
  private healthCheckPromise: Promise<boolean> | null = null;

  // Check if social server is available (with caching and debouncing)
  private async isSocialServerAvailable(): Promise<boolean> {
    // Check cache first
    const cacheAge = Date.now() - this.serverAvailableCache.timestamp;
    if (cacheAge < this.CACHE_DURATION) {
      return this.serverAvailableCache.available;
    }
    
    // If a health check is already in progress, wait for it
    if (this.healthCheckInProgress && this.healthCheckPromise) {
      return await this.healthCheckPromise;
    }
    
    // Start new health check
    this.healthCheckInProgress = true;
    this.healthCheckPromise = (async () => {
      try {
        // First check general backend availability
        const backendAvailable = await isBackendAvailable();
        if (!backendAvailable) {
          this.serverAvailableCache = { available: false, timestamp: Date.now() };
          this.healthCheckInProgress = false;
          this.healthCheckPromise = null;
          return false;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout
        
        const response = await fetch(`${this.baseURL}/health`, {
          method: 'GET',
          signal: controller.signal,
          mode: 'cors',
          credentials: 'omit',
        });
        
        clearTimeout(timeoutId);
        const available = response.ok;
        
        // Cache the result
        this.serverAvailableCache = {
          available,
          timestamp: Date.now()
        };
        
        this.healthCheckInProgress = false;
        this.healthCheckPromise = null;
        return available;
      } catch (error) {
        // Cache the failure result
        this.serverAvailableCache = {
          available: false,
          timestamp: Date.now()
        };
        this.healthCheckInProgress = false;
        this.healthCheckPromise = null;
        return false;
      }
    })();
    
    return await this.healthCheckPromise;
  }

  // Helper method for API calls with offline fallback
  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {},
    fallback: () => T
  ): Promise<T> {
    // Check cache first - if server was unavailable recently, skip check entirely
    const cacheAge = Date.now() - this.serverAvailableCache.timestamp;
    if (cacheAge < this.CACHE_DURATION && !this.serverAvailableCache.available) {
      // Server was recently unavailable, return fallback immediately
      return fallback();
    }
    
    // Check if server is available before making request
    const isAvailable = await this.isSocialServerAvailable();
    if (!isAvailable) {
      // Return fallback immediately without making request
      return fallback();
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Update cache if server becomes unavailable
        this.serverAvailableCache = { available: false, timestamp: Date.now() };
        return fallback();
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      // Update cache if server becomes unavailable
      this.serverAvailableCache = { available: false, timestamp: Date.now() };
      return fallback();
    }
  }

  // Get user's social profile
  async getUserProfile(userId: string): Promise<SocialUser | null> {
    return this.apiCall<SocialUser | null>(
      `/users/${userId}`,
      { method: 'GET' },
      () => null // Fallback: return null
    );
  }

  // Get user's connections
  async getConnections(userId: string): Promise<SocialConnection[]> {
    return this.apiCall<SocialConnection[]>(
      `/users/${userId}/connections`,
      { method: 'GET' },
      () => [] // Fallback: return empty array
    );
  }

  // Follow/Unfollow a user
  async toggleFollow(userId: string, targetUserId: string): Promise<{ following: boolean }> {
    return this.apiCall<{ following: boolean }>(
      `/users/${userId}/follow/${targetUserId}`,
      { method: 'POST' },
      () => ({ following: false }) // Fallback: return not following
    );
  }

  // Block/Unblock a user
  async toggleBlock(userId: string, targetUserId: string): Promise<{ blocked: boolean }> {
    return this.apiCall<{ blocked: boolean }>(
      `/users/${userId}/block/${targetUserId}`,
      { method: 'POST' },
      () => ({ blocked: false }) // Fallback: return not blocked
    );
  }

  // Get user's posts
  async getPosts(userId?: string, limit: number = 50, offset: number = 0): Promise<SocialPost[]> {
    const endpoint = userId 
      ? `/users/${userId}/posts?limit=${limit}&offset=${offset}`
      : `/posts?limit=${limit}&offset=${offset}`;
    
    return this.apiCall<SocialPost[]>(
      endpoint,
      { method: 'GET' },
      () => [] // Fallback: return empty array
    );
  }

  // Create a new post
  async createPost(userId: string, postData: Omit<SocialPost, 'id' | 'createdAt' | 'likes' | 'comments' | 'shares'>): Promise<SocialPost> {
    return this.apiCall<SocialPost>(
      `/users/${userId}/posts`,
      {
        method: 'POST',
        body: JSON.stringify(postData),
      },
      () => {
        // Fallback: return mock post
        return {
          ...postData,
          id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          likes: 0,
          comments: 0,
          shares: 0,
        };
      }
    );
  }

  // Delete a post
  async deletePost(userId: string, postId: string): Promise<{ success: boolean }> {
    return this.apiCall<{ success: boolean }>(
      `/users/${userId}/posts/${postId}`,
      { method: 'DELETE' },
      () => ({ success: true }) // Fallback: return success (local deletion)
    );
  }

  // Like/Unlike a post
  async toggleLike(userId: string, postId: string): Promise<{ liked: boolean }> {
    return this.apiCall<{ liked: boolean }>(
      `/posts/${postId}/like`,
      {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      },
      () => ({ liked: false }) // Fallback: return not liked
    );
  }

  // Save/Unsave a post
  async toggleSave(userId: string, postId: string): Promise<{ saved: boolean }> {
    return this.apiCall<{ saved: boolean }>(
      `/posts/${postId}/save`,
      {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      },
      () => ({ saved: false }) // Fallback: return not saved
    );
  }

  // Hide a post
  async hidePost(userId: string, postId: string): Promise<{ success: boolean }> {
    return this.apiCall<{ success: boolean }>(
      `/posts/${postId}/hide`,
      {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      },
      () => ({ success: true }) // Fallback: return success (local hide)
    );
  }

  // Get user's liked posts
  async getLikedPosts(userId: string): Promise<string[]> {
    return this.apiCall<string[]>(
      `/users/${userId}/liked-posts`,
      { method: 'GET' },
      () => [] // Fallback: return empty array
    );
  }

  // Get user's saved posts
  async getSavedPosts(userId: string): Promise<string[]> {
    return this.apiCall<string[]>(
      `/users/${userId}/saved-posts`,
      { method: 'GET' },
      () => [] // Fallback: return empty array
    );
  }

  // Get user's following list
  async getFollowing(userId: string): Promise<string[]> {
    return this.apiCall<string[]>(
      `/users/${userId}/following`,
      { method: 'GET' },
      () => [] // Fallback: return empty array
    );
  }

  // Get user's followers list
  async getFollowers(userId: string): Promise<string[]> {
    return this.apiCall<string[]>(
      `/users/${userId}/followers`,
      { method: 'GET' },
      () => [] // Fallback: return empty array
    );
  }

  // Sync local state with backend
  async syncState(userId: string, localState: {
    following: string[];
    likedPosts: string[];
    savedPosts: string[];
    posts: SocialPost[];
  }): Promise<{
    following: string[];
    likedPosts: string[];
    savedPosts: string[];
    posts: SocialPost[];
  }> {
    return this.apiCall<{
      following: string[];
      likedPosts: string[];
      savedPosts: string[];
      posts: SocialPost[];
    }>(
      `/users/${userId}/sync`,
      {
        method: 'POST',
        body: JSON.stringify(localState),
      },
      () => localState // Fallback: return local state
    );
  }

  // Check if server is available (public method)
  async isAvailable(): Promise<boolean> {
    return await this.isSocialServerAvailable();
  }
}

// Create singleton instance
const socialAPI = new SocialAPIService();
export default socialAPI;

