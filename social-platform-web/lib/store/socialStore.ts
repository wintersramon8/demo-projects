'use client';

import { create } from 'zustand';
import { User, Post, Comment } from '../types';
import { postService } from '../services/postService';
import { userService } from '../services/userService';
import { commentService } from '../services/commentService';
import { authService, UserProfile } from '../services/authService';

interface SocialStore {
  currentUser: User | null;
  users: User[];
  posts: Post[];
  comments: Comment[];
  loading: boolean;
  error: string | null;
  
  setCurrentUser: (user: User | null) => void;
  loadUserProfile: (userId: string) => Promise<void>;
  loadUser: (userId: string) => Promise<void>;
  
  loadPosts: (userId?: string) => Promise<void>;
  subscribeToPosts: () => (() => void) | null;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'commentsCount' | 'sharesCount'>) => Promise<void>;
  updatePost: (postId: string, updates: Partial<Post>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  
  loadComments: (postId: string) => Promise<void>;
  subscribeToComments: (postId: string) => (() => void) | null;
  addComment: (postId: string, content: string) => Promise<void>;
  
  toggleFollow: (userId: string) => Promise<void>;
  loadFollowers: (userId: string) => Promise<void>;
  loadFollowing: (userId: string) => Promise<void>;
  
  getPostComments: (postId: string) => Comment[];
  getUserPosts: (userId: string) => Post[];
  getUserFollowers: (userId: string) => User[];
  getUserFollowing: (userId: string) => User[];
  
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useSocialStore = create<SocialStore>((set, get) => ({
  currentUser: null,
  users: [],
  posts: [],
  comments: [],
  loading: false,
  error: null,
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  loadUserProfile: async (userId: string) => {
    try {
      const profile = await authService.getUserProfile(userId);
      if (profile) {
        set({
          currentUser: {
            id: profile.id,
            name: profile.name,
            username: profile.username,
            email: profile.email,
            avatar: profile.avatar,
            bio: profile.bio,
            followersCount: profile.followersCount,
            followingCount: profile.followingCount,
            postsCount: profile.postsCount,
          },
        });
      }
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  loadUser: async (userId: string) => {
    try {
      const user = await userService.getUser(userId);
      if (user) {
        set((state) => ({
          users: [...state.users.filter((u) => u.id !== userId), user],
        }));
      }
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  loadPosts: async (userId?: string) => {
    set({ loading: true, error: null });
    try {
      const currentUserId = userId || get().currentUser?.id;
      const posts = await postService.getPosts(undefined, currentUserId);
      set({ posts, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  subscribeToPosts: () => {
    try {
      return postService.subscribeToPosts((posts) => {
        set({ posts });
      });
    } catch (error: any) {
      set({ error: error.message });
      return null;
    }
  },
  
  addPost: async (postData) => {
    const currentUser = get().currentUser;
    if (!currentUser) {
      throw new Error('User must be logged in to create a post');
    }
    
    set({ loading: true, error: null });
    try {
      await postService.createPost({
        ...postData,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false,
      });
      
      // Reload posts with current user ID to get like status
      await get().loadPosts(currentUser.id);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  updatePost: async (postId, updates) => {
    set({ loading: true, error: null });
    try {
      await postService.updatePost(postId, updates);
      await get().loadPosts();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  deletePost: async (postId) => {
    const currentUser = get().currentUser;
    if (!currentUser) {
      throw new Error('User must be logged in');
    }
    
    set({ loading: true, error: null });
    try {
      await postService.deletePost(postId, currentUser.id);
      await get().loadPosts();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  toggleLike: async (postId) => {
    const currentUser = get().currentUser;
    if (!currentUser) {
      throw new Error('User must be logged in to like posts');
    }
    
    const post = get().posts.find((p) => p.id === postId);
    if (!post) return;
    
    const isLiked = post.isLiked || false;
    
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !isLiked, likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1 }
          : p
      ),
    }));
    
    try {
      await postService.toggleLike(postId, currentUser.id, isLiked);
      await get().loadPosts();
    } catch (error: any) {
      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === postId
            ? { ...p, isLiked, likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1 }
            : p
        ),
      }));
      set({ error: error.message });
      throw error;
    }
  },
  
  loadComments: async (postId: string) => {
    set({ loading: true, error: null });
    try {
      const comments = await commentService.getPostComments(postId);
      set((state) => ({
        comments: [...state.comments.filter((c) => c.postId !== postId), ...comments],
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  subscribeToComments: (postId: string) => {
    try {
      return commentService.subscribeToComments(postId, (comments) => {
        set((state) => ({
          comments: [...state.comments.filter((c) => c.postId !== postId), ...comments],
        }));
      });
    } catch (error: any) {
      set({ error: error.message });
      return null;
    }
  },
  
  addComment: async (postId, content) => {
    const currentUser = get().currentUser;
    if (!currentUser) {
      throw new Error('User must be logged in to comment');
    }
    
    set({ loading: true, error: null });
    try {
      await commentService.addComment(
        postId,
        currentUser.id,
        currentUser.name,
        currentUser.avatar,
        content
      );
      
      await get().loadComments(postId);
      await get().loadPosts();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  toggleFollow: async (userId) => {
    const currentUser = get().currentUser;
    if (!currentUser) {
      throw new Error('User must be logged in to follow users');
    }
    
    if (userId === currentUser.id) {
      return;
    }
    
    try {
      const isFollowing = await userService.isFollowing(currentUser.id, userId);
      
      if (isFollowing) {
        await userService.unfollowUser(currentUser.id, userId);
      } else {
        await userService.followUser(currentUser.id, userId);
      }
      
      await get().loadUser(userId);
      await get().loadUserProfile(currentUser.id);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
  
  loadFollowers: async (userId) => {
    try {
      const followers = await userService.getFollowers(userId);
      set((state) => ({
        users: [...state.users, ...followers.filter((f) => !state.users.find((u) => u.id === f.id))],
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  loadFollowing: async (userId) => {
    try {
      const following = await userService.getFollowing(userId);
      set((state) => ({
        users: [...state.users, ...following.filter((f) => !state.users.find((u) => u.id === f.id))],
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  getPostComments: (postId) => {
    return get().comments
      .filter((c) => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },
  
  getUserPosts: (userId) => {
    return get().posts
      .filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  getUserFollowers: (userId) => {
    return get().users.filter((u) => true);
  },
  
  getUserFollowing: (userId) => {
    return get().users.filter((u) => true);
  },
  
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
}));

