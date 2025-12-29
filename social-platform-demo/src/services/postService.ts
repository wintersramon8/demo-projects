import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { Post } from '../types';
import { removeUndefined } from '../utils/firestoreUtils';

/**
 * Convert Firestore Timestamp to ISO string
 */
const convertTimestamp = (timestamp: any): string | undefined => {
  if (!timestamp) {
    return undefined;
  }

  // If it's already a string, return it
  if (typeof timestamp === 'string') {
    return timestamp;
  }

  // If it has a toDate method (Firestore Timestamp)
  if (timestamp && typeof timestamp.toDate === 'function') {
    try {
      return timestamp.toDate().toISOString();
    } catch {
      return undefined;
    }
  }

  // If it's a Firestore Timestamp object with seconds and nanoseconds
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    try {
      const seconds = timestamp.seconds || 0;
      const nanoseconds = timestamp.nanoseconds || 0;
      return new Date(seconds * 1000 + nanoseconds / 1000000).toISOString();
    } catch {
      return undefined;
    }
  }

  // If it's a Date object
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }

  return undefined;
};

export const postService = {
  getPosts: async (limitCount?: number, currentUserId?: string): Promise<Post[]> => {
    try {
      // Order by createdAt desc, then by document ID for consistent ordering
      let q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt) || data.createdAt,
          updatedAt: convertTimestamp(data.updatedAt) || data.updatedAt,
        } as Post;
      });

      // Client-side sort to ensure consistent ordering (by createdAt desc, then by id desc)
      posts.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        if (dateB !== dateA) {
          return dateB - dateA; // Newest first
        }
        // If dates are equal, sort by ID for consistency
        return b.id.localeCompare(a.id);
      });

      // Check like status for each post if user is logged in
      if (currentUserId) {
        const likeChecks = await Promise.all(
          posts.map(async (post) => {
            try {
              const likeDoc = await getDoc(doc(db, 'likes', `${post.id}_${currentUserId}`));
              return { postId: post.id, isLiked: likeDoc.exists() };
            } catch {
              return { postId: post.id, isLiked: false };
            }
          })
        );

        return posts.map((post) => {
          const likeCheck = likeChecks.find((lc) => lc.postId === post.id);
          return { ...post, isLiked: likeCheck?.isLiked || false };
        });
      }

      return posts.map((post) => ({ ...post, isLiked: false }));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch posts');
    }
  },

  getPostById: async (postId: string): Promise<Post | null> => {
    try {
      const postDoc = await getDoc(doc(db, 'posts', postId));
      if (postDoc.exists()) {
        const data = postDoc.data();
        return {
          id: postDoc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt) || data.createdAt,
          updatedAt: convertTimestamp(data.updatedAt) || data.updatedAt,
        } as Post;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch post');
    }
  },

  getUserPosts: async (userId: string): Promise<Post[]> => {
    try {
      const q = query(
        collection(db, 'posts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt) || data.createdAt,
          updatedAt: convertTimestamp(data.updatedAt) || data.updatedAt,
        } as Post;
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch user posts');
    }
  },

  createPost: async (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      // Remove undefined values before saving to Firestore
      const cleanedPost = removeUndefined({
        ...post,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      const docRef = await addDoc(collection(db, 'posts'), cleanedPost);

      // Update user's post count
      await updateDoc(doc(db, 'users', post.userId), {
        postsCount: increment(1),
      });

      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create post');
    }
  },

  updatePost: async (
    postId: string,
    updates: Partial<Post>
  ): Promise<void> => {
    try {
      // Remove undefined values before saving to Firestore
      const cleanedUpdates = removeUndefined({
        ...updates,
        updatedAt: Timestamp.now(),
      });
      await updateDoc(doc(db, 'posts', postId), cleanedUpdates);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update post');
    }
  },

  deletePost: async (postId: string, userId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      
      // Update user's post count
      await updateDoc(doc(db, 'users', userId), {
        postsCount: increment(-1),
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete post');
    }
  },

  toggleLike: async (postId: string, userId: string, isLiked: boolean): Promise<void> => {
    try {
      const postRef = doc(db, 'posts', postId);
      const likeRef = doc(db, 'likes', `${postId}_${userId}`);

      if (isLiked) {
        // Unlike: remove like document and decrement count
        await deleteDoc(likeRef);
        await updateDoc(postRef, {
          likesCount: increment(-1),
        });
      } else {
        // Like: create like document and increment count
        await setDoc(likeRef, {
          postId,
          userId,
          createdAt: Timestamp.now(),
        });
        await updateDoc(postRef, {
          likesCount: increment(1),
        });
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to toggle like');
    }
  },

  subscribeToPosts: (
    callback: (posts: Post[]) => void
  ): (() => void) => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const posts = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: convertTimestamp(data.createdAt) || data.createdAt,
            updatedAt: convertTimestamp(data.updatedAt) || data.updatedAt,
          } as Post;
        });

        // Client-side sort to ensure consistent ordering (by createdAt desc, then by id desc)
        posts.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          if (dateB !== dateA) {
            return dateB - dateA; // Newest first
          }
          // If dates are equal, sort by ID for consistency
          return b.id.localeCompare(a.id);
        });

        callback(posts);
      },
      (error) => {
        console.error('Error subscribing to posts:', error);
        callback([]);
      }
    );
  },
};

