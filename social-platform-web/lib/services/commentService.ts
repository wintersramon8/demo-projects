import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { Comment } from '../types';
import { removeUndefined } from '../utils/firestoreUtils';

const convertTimestamp = (timestamp: any): string | undefined => {
  if (!timestamp) return undefined;
  if (typeof timestamp === 'string') return timestamp;
  if (timestamp && typeof timestamp.toDate === 'function') {
    try {
      return timestamp.toDate().toISOString();
    } catch {
      return undefined;
    }
  }
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    try {
      const seconds = timestamp.seconds || 0;
      const nanoseconds = timestamp.nanoseconds || 0;
      return new Date(seconds * 1000 + nanoseconds / 1000000).toISOString();
    } catch {
      return undefined;
    }
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return undefined;
};

export const commentService = {
  getPostComments: async (postId: string): Promise<Comment[]> => {
    try {
      // Query without orderBy to avoid needing a composite index
      // We'll sort client-side instead
      const q = query(
        collection(db, 'comments'),
        where('postId', '==', postId)
      );
      const querySnapshot = await getDocs(q);
      
      const comments = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt) || data.createdAt,
        } as Comment;
      });
      
      // Sort client-side by createdAt (ascending - oldest first)
      comments.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateA - dateB;
      });
      
      return comments;
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
    // Query without orderBy to avoid needing a composite index
    // We'll sort client-side instead
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId)
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
        
        // Sort client-side by createdAt (ascending - oldest first)
        comments.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateA - dateB;
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

