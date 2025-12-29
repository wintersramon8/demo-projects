import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { useEventStore } from '../store/eventStore';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigation = useNavigation<NavigationProp>();
  const { user, userProfile, loading: authLoading } = useAuth();
  const { loadUserProfile, loadEvents, subscribeToEvents } = useEventStore();

  useEffect(() => {
    if (!authLoading) {
      if (user && userProfile) {
        // User is authenticated
        loadUserProfile(user.uid);
        loadEvents();
        
        // Subscribe to real-time updates
        const unsubscribe = subscribeToEvents();
        return () => {
          if (unsubscribe) unsubscribe();
        };
      } else if (user && !userProfile) {
        // User exists but profile not loaded
        loadUserProfile(user.uid);
      } else {
        // User not authenticated - navigate to login
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }
  }, [user, userProfile, authLoading]);

  if (authLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  if (!user) {
    return null; // Navigation will handle redirect
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

