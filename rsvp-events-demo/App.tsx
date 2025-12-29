import React, { useEffect, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from './src/types';
import { useAuth } from './src/hooks/useAuth';
import { AuthGuard } from './src/components/AuthGuard';
import { LoginScreen } from './src/screens/LoginScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { EventDetailsScreen } from './src/screens/EventDetailsScreen';
import { CreateEventScreen } from './src/screens/CreateEventScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Wrapper components for protected screens
const ProtectedHomeScreen = (props: any) => (
  <AuthGuard>
    <HomeScreen {...props} />
  </AuthGuard>
);

const ProtectedEventDetailsScreen = (props: any) => (
  <AuthGuard>
    <EventDetailsScreen {...props} />
  </AuthGuard>
);

const ProtectedCreateEventScreen = (props: any) => (
  <AuthGuard>
    <CreateEventScreen {...props} />
  </AuthGuard>
);

const ProtectedProfileScreen = (props: any) => (
  <AuthGuard>
    <ProfileScreen {...props} />
  </AuthGuard>
);

export default function App() {
  const { user, loading } = useAuth();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Navigate when auth state changes
  useEffect(() => {
    if (!loading && navigationRef.current) {
      if (user) {
        // User is logged in, navigate to Home
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        // User is logged out, navigate to Login
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }
  }, [user, loading]);

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName={user ? "Home" : "Login"}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f5f5f5' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Home" component={ProtectedHomeScreen} />
        <Stack.Screen name="EventDetails" component={ProtectedEventDetailsScreen} />
        <Stack.Screen name="CreateEvent" component={ProtectedCreateEventScreen} />
        <Stack.Screen name="Profile" component={ProtectedProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
