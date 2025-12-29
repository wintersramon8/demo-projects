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
  signUp: async (
    email: string,
    password: string,
    name: string
  ): Promise<UserCredential> => {
    try {
      if (!auth || !auth.app) {
        throw new Error('Firebase Auth is not properly initialized.');
      }
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, { displayName: name });

      const userProfile: UserProfile = {
        id: userCredential.user.uid,
        name,
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const cleanedProfile = removeUndefined(userProfile);
      await setDoc(doc(db, 'users', userCredential.user.uid), cleanedProfile);

      return userCredential;
    } catch (error: any) {
      const friendlyMessage = getFirebaseErrorMessage(error);
      throw new Error(friendlyMessage);
    }
  },

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

  signOut: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  },

  resetPassword: async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      const friendlyMessage = getFirebaseErrorMessage(error);
      throw new Error(friendlyMessage);
    }
  },

  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },

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

  updateUserProfile: async (
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<void> => {
    try {
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

