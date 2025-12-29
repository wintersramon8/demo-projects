import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { getFirebaseErrorMessage } from '../utils/errorMessages';
import { removeUndefined } from '../utils/firestoreUtils';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export const authService = {
  /**
   * Sign up a new user
   */
  signUp: async (
    email: string,
    password: string,
    name: string
  ): Promise<UserCredential> => {
    try {
      // Verify auth is properly initialized
      if (!auth || !auth.app) {
        throw new Error('Firebase Auth is not properly initialized. Please restart the app.');
      }
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update display name
      await updateProfile(userCredential.user, { displayName: name });

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        id: userCredential.user.uid,
        name,
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Remove undefined values before saving to Firestore
      const cleanedProfile = removeUndefined(userProfile);
      await setDoc(doc(db, 'users', userCredential.user.uid), cleanedProfile);

      return userCredential;
    } catch (error: any) {
      const friendlyMessage = getFirebaseErrorMessage(error);
      throw new Error(friendlyMessage);
    }
  },

  /**
   * Sign in an existing user
   */
  signIn: async (
    email: string,
    password: string
  ): Promise<UserCredential> => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      const friendlyMessage = getFirebaseErrorMessage(error);
      throw new Error(friendlyMessage);
    }
  },

  /**
   * Sign out current user
   */
  signOut: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  },

  /**
   * Send password reset email
   */
  resetPassword: async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      const friendlyMessage = getFirebaseErrorMessage(error);
      throw new Error(friendlyMessage);
    }
  },

  /**
   * Get current user
   */
  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },

  /**
   * Get user profile from Firestore
   */
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get user profile');
    }
  },

  /**
   * Update user profile
   */
  updateUserProfile: async (
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<void> => {
    try {
      // Remove undefined values before saving to Firestore
      const cleanedUpdates = removeUndefined({
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      await setDoc(
        doc(db, 'users', userId),
        cleanedUpdates,
        { merge: true }
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  },
};

