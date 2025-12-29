import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { authService, UserProfile } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        try {
          const profile = await authService.getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch (err: any) {
          setError(err.message);
        }
      } else {
        setUserProfile(null);
      }
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      await authService.signUp(email, password, name);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      await authService.signIn(email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await authService.signOut();
      setUserProfile(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await authService.resetPassword(email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    user,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
  };
};

