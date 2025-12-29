import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { Comment } from '../types';
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

export const commentService = {
  getPostComments: async (postId: string): Promise<Comment[]> => {
    try {
      const q = query(
        collection(db, 'comments'),
        where('postId', '==', postId),
        orderBy('createdAt', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt) || data.createdAt,
        } as Comment;
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch comments');
    }
  },

  addComment: async (
    postId: string,
    userId: string,
    userName: string,
    userAvatar: string | undefined,
    content: string
  ): Promise<string> => {
    try {
      const commentData = removeUndefined({
        postId,
        userId,
        userName,
        userAvatar: userAvatar || null,
        content,
        likesCount: 0,
        createdAt: Timestamp.now(),
      });
      const docRef = await addDoc(collection(db, 'comments'), commentData);

      // Update post comment count
      await updateDoc(doc(db, 'posts', postId), {
        commentsCount: increment(1),
      });

      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add comment');
    }
  },

  deleteComment: async (commentId: string, postId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'comments', commentId));
      
      // Update post comment count
      await updateDoc(doc(db, 'posts', postId), {
        commentsCount: increment(-1),
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete comment');
    }
  },

  subscribeToComments: (
    postId: string,
    callback: (comments: Comment[]) => void
  ): (() => void) => {
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const comments = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: convertTimestamp(data.createdAt) || data.createdAt,
          } as Comment;
        });
        callback(comments);
      },
      (error) => {
        console.error('Error subscribing to comments:', error);
        callback([]);
      }
    );
  },
};

