import React, { useEffect, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from './src/types';
import { useAuth } from './src/hooks/useAuth';
import { AuthGuard } from './src/components/AuthGuard';
import { LoginScreen } from './src/screens/LoginScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';
import { FeedScreen } from './src/screens/FeedScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { CreatePostScreen } from './src/screens/CreatePostScreen';
import { PostDetailsScreen } from './src/screens/PostDetailsScreen';
import { ConnectionsScreen } from './src/screens/ConnectionsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Wrapper components for protected screens
const ProtectedFeedScreen = (props: any) => (
  <AuthGuard>
    <FeedScreen {...props} />
  </AuthGuard>
);

const ProtectedProfileScreen = (props: any) => (
  <AuthGuard>
    <ProfileScreen {...props} />
  </AuthGuard>
);

const ProtectedCreatePostScreen = (props: any) => (
  <AuthGuard>
    <CreatePostScreen {...props} />
  </AuthGuard>
);

const ProtectedPostDetailsScreen = (props: any) => (
  <AuthGuard>
    <PostDetailsScreen {...props} />
  </AuthGuard>
);

const ProtectedConnectionsScreen = (props: any) => (
  <AuthGuard>
    <ConnectionsScreen {...props} />
  </AuthGuard>
);

export default function App() {
  const { user, loading } = useAuth();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Navigate when auth state changes
  useEffect(() => {
    if (!loading && navigationRef.current) {
      if (user) {
        // User is logged in, navigate to Feed
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Feed' }],
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
        initialRouteName={user ? "Feed" : "Login"}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f5f5f5' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Feed" component={ProtectedFeedScreen} />
        <Stack.Screen name="Profile" component={ProtectedProfileScreen} />
        <Stack.Screen name="CreatePost" component={ProtectedCreatePostScreen} />
        <Stack.Screen name="PostDetails" component={ProtectedPostDetailsScreen} />
        <Stack.Screen name="Connections" component={ProtectedConnectionsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
