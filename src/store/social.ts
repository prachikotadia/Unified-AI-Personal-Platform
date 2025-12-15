import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SocialPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  images?: string[]; // Base64 strings
  videos?: string[];
  privacy: 'public' | 'friends' | 'private';
  hashtags?: string[];
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
}

interface SocialState {
  // User interactions
  following: Set<string>; // User IDs being followed
  followers: Set<string>; // User IDs following current user
  blockedUsers: Set<string>; // Blocked user IDs
  connections: Set<string>; // Connected user IDs
  
  // Posts
  posts: SocialPost[]; // User's created posts
  
  // Post interactions
  likedPosts: Set<string>; // Liked post IDs
  savedPosts: Set<string>; // Saved post IDs
  hiddenPosts: Set<string>; // Hidden post IDs
  
  // Connection status
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  toggleFollow: (userId: string, targetUserId?: string) => Promise<void>;
  toggleBlock: (userId: string, targetUserId?: string) => Promise<void>;
  addConnection: (userId: string) => void;
  removeConnection: (userId: string) => void;
  createPost: (userId: string, post: Omit<SocialPost, 'id' | 'createdAt' | 'likes' | 'comments' | 'shares'>) => Promise<void>;
  deletePost: (userId: string, postId: string) => Promise<void>;
  toggleLike: (userId: string, postId: string) => Promise<void>;
  toggleSave: (userId: string, postId: string) => Promise<void>;
  hidePost: (userId: string, postId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  isBlocked: (userId: string) => boolean;
  isLiked: (postId: string) => boolean;
  isSaved: (postId: string) => boolean;
  isHidden: (postId: string) => boolean;
  syncWithBackend: (userId: string) => Promise<void>;
  checkConnection: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  following: new Set<string>(),
  followers: new Set<string>(),
  blockedUsers: new Set<string>(),
  connections: new Set<string>(),
  posts: [] as SocialPost[],
  likedPosts: new Set<string>(),
  savedPosts: new Set<string>(),
  hiddenPosts: new Set<string>(),
  isConnected: false,
  isLoading: false,
  error: null,
};

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      ...initialState,

      toggleFollow: async (userId: string, targetUserId?: string) => {
        const currentUserId = targetUserId || userId; // Use targetUserId if provided, otherwise userId
        const isCurrentlyFollowing = get().following.has(currentUserId);
        
        // Update local state immediately
        set((state) => {
          const newFollowing = new Set(state.following);
          if (isCurrentlyFollowing) {
            newFollowing.delete(currentUserId);
          } else {
            newFollowing.add(currentUserId);
          }
          return { following: newFollowing };
        });
        
        // Try to sync with backend (non-blocking)
        try {
          const result = await socialAPI.toggleFollow(userId, currentUserId);
          // Backend response takes precedence if different
          if (result.following !== !isCurrentlyFollowing) {
            set((state) => {
              const newFollowing = new Set(state.following);
              if (result.following) {
                newFollowing.add(currentUserId);
              } else {
                newFollowing.delete(currentUserId);
              }
              return { following: newFollowing };
            });
          }
        } catch (error) {
          // Silently fail - local state is already updated
          // Error is expected when backend is unavailable
        }
      },

      toggleBlock: async (userId: string, targetUserId?: string) => {
        const currentUserId = targetUserId || userId;
        const isCurrentlyBlocked = get().blockedUsers.has(currentUserId);
        
        // Update local state immediately
        set((state) => {
          const newBlocked = new Set(state.blockedUsers);
          if (isCurrentlyBlocked) {
            newBlocked.delete(currentUserId);
          } else {
            newBlocked.add(currentUserId);
            // Remove from following and connections if blocked
            const newFollowing = new Set(state.following);
            const newConnections = new Set(state.connections);
            newFollowing.delete(currentUserId);
            newConnections.delete(currentUserId);
            return { 
              blockedUsers: newBlocked,
              following: newFollowing,
              connections: newConnections,
            };
          }
          return { blockedUsers: newBlocked };
        });
        
        // Try to sync with backend (non-blocking)
        try {
          await socialAPI.toggleBlock(userId, currentUserId);
        } catch (error) {
          // Silently fail - local state is already updated
        }
      },

      addConnection: (userId: string) => {
        set((state) => {
          const newConnections = new Set(state.connections);
          newConnections.add(userId);
          return { connections: newConnections };
        });
      },

      removeConnection: (userId: string) => {
        set((state) => {
          const newConnections = new Set(state.connections);
          newConnections.delete(userId);
          return { connections: newConnections };
        });
      },

      createPost: async (userId: string, postData: Omit<SocialPost, 'id' | 'createdAt' | 'likes' | 'comments' | 'shares'>) => {
        // Create post locally first
        const localPost: SocialPost = {
          ...postData,
          id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          likes: 0,
          comments: 0,
          shares: 0,
        };
        
        set((state) => ({
          posts: [localPost, ...state.posts],
        }));
        
        // Try to sync with backend (non-blocking)
        try {
          const serverPost = await socialAPI.createPost(userId, postData);
          // Update with server post ID if different
          if (serverPost.id !== localPost.id) {
            set((state) => ({
              posts: state.posts.map(p => p.id === localPost.id ? serverPost : p),
            }));
          }
        } catch (error) {
          // Silently fail - local post is already created
        }
      },

      deletePost: async (userId: string, postId: string) => {
        // Delete locally first
        set((state) => ({
          posts: state.posts.filter(p => p.id !== postId),
        }));
        
        // Try to sync with backend (non-blocking)
        try {
          await socialAPI.deletePost(userId, postId);
        } catch (error) {
          // Silently fail - local post is already deleted
        }
      },

      toggleLike: async (userId: string, postId: string) => {
        const isCurrentlyLiked = get().likedPosts.has(postId);
        
        // Update local state immediately
        set((state) => {
          const newLiked = new Set(state.likedPosts);
          if (isCurrentlyLiked) {
            newLiked.delete(postId);
          } else {
            newLiked.add(postId);
          }
          return { likedPosts: newLiked };
        });
        
        // Try to sync with backend (non-blocking)
        try {
          const result = await socialAPI.toggleLike(userId, postId);
          // Backend response takes precedence if different
          if (result.liked !== !isCurrentlyLiked) {
            set((state) => {
              const newLiked = new Set(state.likedPosts);
              if (result.liked) {
                newLiked.add(postId);
              } else {
                newLiked.delete(postId);
              }
              return { likedPosts: newLiked };
            });
          }
        } catch (error) {
          // Silently fail - local state is already updated
        }
      },

      toggleSave: async (userId: string, postId: string) => {
        const isCurrentlySaved = get().savedPosts.has(postId);
        
        // Update local state immediately
        set((state) => {
          const newSaved = new Set(state.savedPosts);
          if (isCurrentlySaved) {
            newSaved.delete(postId);
          } else {
            newSaved.add(postId);
          }
          return { savedPosts: newSaved };
        });
        
        // Try to sync with backend (non-blocking)
        try {
          const result = await socialAPI.toggleSave(userId, postId);
          // Backend response takes precedence if different
          if (result.saved !== !isCurrentlySaved) {
            set((state) => {
              const newSaved = new Set(state.savedPosts);
              if (result.saved) {
                newSaved.add(postId);
              } else {
                newSaved.delete(postId);
              }
              return { savedPosts: newSaved };
            });
          }
        } catch (error) {
          // Silently fail - local state is already updated
        }
      },

      hidePost: async (userId: string, postId: string) => {
        // Hide locally first
        set((state) => {
          const newHidden = new Set(state.hiddenPosts);
          newHidden.add(postId);
          return { hiddenPosts: newHidden };
        });
        
        // Try to sync with backend (non-blocking)
        try {
          await socialAPI.hidePost(userId, postId);
        } catch (error) {
          // Silently fail - local post is already hidden
        }
      },
      
      syncWithBackend: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await socialAPI.syncState(userId, {
            following: Array.from(get().following),
            likedPosts: Array.from(get().likedPosts),
            savedPosts: Array.from(get().savedPosts),
            posts: get().posts,
          });
          
          // Update state with synced data
          set({
            following: new Set(result.following),
            likedPosts: new Set(result.likedPosts),
            savedPosts: new Set(result.savedPosts),
            posts: result.posts,
            isConnected: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isConnected: false,
            isLoading: false,
            error: error.message || 'Failed to sync with backend',
          });
        }
      },
      
      checkConnection: async () => {
        try {
          const isAvailable = await socialAPI.isAvailable();
          set({ isConnected: isAvailable, error: null });
        } catch (error: any) {
          set({ isConnected: false, error: error.message || 'Connection check failed' });
        }
      },

      isFollowing: (userId: string) => {
        return get().following.has(userId);
      },

      isBlocked: (userId: string) => {
        return get().blockedUsers.has(userId);
      },

      isLiked: (postId: string) => {
        return get().likedPosts.has(postId);
      },

      isSaved: (postId: string) => {
        return get().savedPosts.has(postId);
      },

      isHidden: (postId: string) => {
        return get().hiddenPosts.has(postId);
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'social-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            ...persistedState,
            following: persistedState.following || [],
            followers: persistedState.followers || [],
            blockedUsers: persistedState.blockedUsers || [],
            connections: persistedState.connections || [],
            posts: persistedState.posts || [],
            likedPosts: persistedState.likedPosts || [],
            savedPosts: persistedState.savedPosts || [],
            hiddenPosts: persistedState.hiddenPosts || [],
          };
        }
        return persistedState;
      },
      // Custom serialization for Sets
      storage: {
        getItem: (name) => {
          try {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const parsed = JSON.parse(str);
            if (!parsed.state) {
              console.warn(`[Social Store] Invalid localStorage structure for ${name}, resetting...`);
              return null;
            }
            return {
              state: {
                ...parsed.state,
                following: new Set(parsed.state.following || []),
                followers: new Set(parsed.state.followers || []),
                blockedUsers: new Set(parsed.state.blockedUsers || []),
                connections: new Set(parsed.state.connections || []),
                posts: parsed.state.posts || [],
                likedPosts: new Set(parsed.state.likedPosts || []),
                savedPosts: new Set(parsed.state.savedPosts || []),
                hiddenPosts: new Set(parsed.state.hiddenPosts || []),
              },
              version: parsed.version || 1,
            };
          } catch (error) {
            console.error(`[Social Store] Failed to parse localStorage for ${name}:`, error);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            const serialized = {
              state: {
                ...value.state,
                following: Array.from(value.state.following),
                followers: Array.from(value.state.followers),
                blockedUsers: Array.from(value.state.blockedUsers),
                connections: Array.from(value.state.connections),
                posts: value.state.posts || [],
                likedPosts: Array.from(value.state.likedPosts),
                savedPosts: Array.from(value.state.savedPosts),
                hiddenPosts: Array.from(value.state.hiddenPosts),
              },
              version: value.version || 1,
            };
            localStorage.setItem(name, JSON.stringify(serialized));
          } catch (error) {
            console.error(`[Social Store] Failed to save to localStorage for ${name}:`, error);
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (error) {
            console.error(`[Social Store] Failed to remove from localStorage for ${name}:`, error);
          }
        },
      },
    }
  )
);

