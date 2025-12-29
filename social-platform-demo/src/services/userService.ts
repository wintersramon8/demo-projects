import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { User } from '../types';

export const userService = {
  getUser: async (userId: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: userDoc.id,
          ...data,
        } as User;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get user');
    }
  },

  searchUsers: async (searchQuery: string): Promise<User[]> => {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation - consider using Algolia for production
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      
      const users = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as User))
        .filter((user) => {
          const query = searchQuery.toLowerCase();
          return (
            user.name.toLowerCase().includes(query) ||
            user.username?.toLowerCase().includes(query)
          );
        });
      
      return users;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search users');
    }
  },

  followUser: async (userId: string, targetUserId: string): Promise<void> => {
    try {
      // Create connection
      await setDoc(doc(db, 'connections', `${userId}_${targetUserId}`), {
        userId,
        connectedUserId: targetUserId,
        status: 'accepted',
        createdAt: new Date().toISOString(),
      });

      // Update follower/following counts
      await updateDoc(doc(db, 'users', targetUserId), {
        followersCount: increment(1),
      });
      await updateDoc(doc(db, 'users', userId), {
        followingCount: increment(1),
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to follow user');
    }
  },

  unfollowUser: async (userId: string, targetUserId: string): Promise<void> => {
    try {
      // Delete connection
      await deleteDoc(doc(db, 'connections', `${userId}_${targetUserId}`));

      // Update follower/following counts
      await updateDoc(doc(db, 'users', targetUserId), {
        followersCount: increment(-1),
      });
      await updateDoc(doc(db, 'users', userId), {
        followingCount: increment(-1),
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to unfollow user');
    }
  },

  isFollowing: async (userId: string, targetUserId: string): Promise<boolean> => {
    try {
      const connectionDoc = await getDoc(
        doc(db, 'connections', `${userId}_${targetUserId}`)
      );
      return connectionDoc.exists();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to check follow status');
    }
  },

  getFollowers: async (userId: string): Promise<User[]> => {
    try {
      const q = query(
        collection(db, 'connections'),
        where('connectedUserId', '==', userId),
        where('status', '==', 'accepted')
      );
      const querySnapshot = await getDocs(q);
      
      const followerIds = querySnapshot.docs.map((doc) => doc.data().userId);
      const users = await Promise.all(
        followerIds.map((id) => userService.getUser(id))
      );
      
      return users.filter((user): user is User => user !== null);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get followers');
    }
  },

  getFollowing: async (userId: string): Promise<User[]> => {
    try {
      const q = query(
        collection(db, 'connections'),
        where('userId', '==', userId),
        where('status', '==', 'accepted')
      );
      const querySnapshot = await getDocs(q);
      
      const followingIds = querySnapshot.docs.map((doc) => doc.data().connectedUserId);
      const users = await Promise.all(
        followingIds.map((id) => userService.getUser(id))
      );
      
      return users.filter((user): user is User => user !== null);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get following');
    }
  },
};

