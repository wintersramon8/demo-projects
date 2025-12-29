import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { initializeAuth, getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Try to import getReactNativePersistence - may not be in types but should be available at runtime
let getReactNativePersistence: any;
try {
  // @ts-ignore - Type definitions may not include this export
  const authModule = require('firebase/auth');
  getReactNativePersistence = authModule.getReactNativePersistence;
} catch {
  // Fallback if not available
  getReactNativePersistence = null;
}

// Firebase configuration
const envApiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const envProjectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
const configApiKey = Constants.expoConfig?.extra?.firebaseApiKey;
const configProjectId = Constants.expoConfig?.extra?.firebaseProjectId;

// Ensure all values are strings (not undefined) and filter out empty strings
const firebaseConfig = {
  apiKey: (envApiKey || configApiKey || '').toString().trim(),
  authDomain: (process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || Constants.expoConfig?.extra?.firebaseAuthDomain || '').toString().trim(),
  projectId: (envProjectId || configProjectId || '').toString().trim(),
  storageBucket: (process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || Constants.expoConfig?.extra?.firebaseStorageBucket || '').toString().trim(),
  messagingSenderId: (process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || Constants.expoConfig?.extra?.firebaseMessagingSenderId || '').toString().trim(),
  appId: (process.env.EXPO_PUBLIC_FIREBASE_APP_ID || Constants.expoConfig?.extra?.firebaseAppId || '').toString().trim(),
};

// Validate Firebase configuration - all fields are required for Auth
if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.authDomain) {
  console.error(
    '❌ Firebase configuration is missing required fields!\n\n' +
    'Current values:\n' +
    `  API Key: ${firebaseConfig.apiKey ? '✅ Set (' + firebaseConfig.apiKey.substring(0, 10) + '...)' : '❌ Missing'}\n` +
    `  Project ID: ${firebaseConfig.projectId ? '✅ Set (' + firebaseConfig.projectId + ')' : '❌ Missing'}\n` +
    `  Auth Domain: ${firebaseConfig.authDomain ? '✅ Set (' + firebaseConfig.authDomain + ')' : '❌ Missing (REQUIRED for Auth)'}\n` +
    `  Storage Bucket: ${firebaseConfig.storageBucket ? '✅ Set' : '❌ Missing'}\n` +
    `  Sender ID: ${firebaseConfig.messagingSenderId ? '✅ Set' : '❌ Missing'}\n` +
    `  App ID: ${firebaseConfig.appId ? '✅ Set' : '❌ Missing'}\n\n` +
    'Please set up your Firebase configuration:\n' +
    '1. Create a .env file in the project root with:\n' +
    '   EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key\n' +
    '   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com\n' +
    '   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id\n' +
    '   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com\n' +
    '   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id\n' +
    '   EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id\n\n' +
    '2. Restart the Expo server with: npx expo start --clear\n\n' +
    '3. Or add the config to app.json under expo.extra\n\n' +
    'See QUICK_FIREBASE_SETUP.md for detailed instructions.'
  );
  throw new Error(
    'Firebase configuration not found. Required fields: apiKey, projectId, authDomain. ' +
    'See QUICK_FIREBASE_SETUP.md for instructions.'
  );
}

// Initialize Firebase
let app: FirebaseApp;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
} catch (error: any) {
  console.error('❌ Failed to initialize Firebase App:', error);
  console.error('Config being used:', {
    apiKey: firebaseConfig.apiKey ? 'Set (' + firebaseConfig.apiKey.substring(0, 10) + '...)' : 'Missing',
    projectId: firebaseConfig.projectId || 'Missing',
    authDomain: firebaseConfig.authDomain || 'Missing',
    storageBucket: firebaseConfig.storageBucket || 'Missing',
    messagingSenderId: firebaseConfig.messagingSenderId || 'Missing',
    appId: firebaseConfig.appId || 'Missing',
  });
  throw error;
}

// Initialize Auth with AsyncStorage persistence for React Native
// Try getAuth first (works if auth was already initialized)
// Only use initializeAuth if getAuth fails
let auth: Auth;
try {
  // First, try to get existing auth instance
  auth = getAuth(app);
} catch (getAuthError: any) {
  // If getAuth fails, initialize new auth instance
  try {
    if (getReactNativePersistence) {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } else {
      auth = initializeAuth(app);
    }
  } catch (initError: any) {
    // If initializeAuth fails, check if it's because auth is already initialized
    if (initError.code === 'auth/already-initialized') {
      auth = getAuth(app);
    } else {
      console.error('❌ Failed to initialize Firebase Auth:', initError);
      console.error('Error code:', initError.code);
      console.error('Error message:', initError.message);
      console.error('App name:', app.name);
      console.error('App options:', {
        apiKey: app.options.apiKey ? app.options.apiKey.substring(0, 10) + '...' : 'missing',
        projectId: app.options.projectId || 'missing',
        authDomain: app.options.authDomain || 'missing',
      });
      throw new Error(
        `Firebase Auth initialization failed: ${initError.message}. ` +
        `Make sure your Firebase configuration is correct and the server has been restarted with --clear flag.`
      );
    }
  }
}

// Verify auth is properly initialized and linked to app
if (!auth || !auth.app) {
  console.error('❌ Auth instance is not properly initialized');
  throw new Error('Firebase Auth instance is not properly initialized');
}

// Initialize services
export { auth };
export const db: Firestore = getFirestore(app);
// Note: Storage is now handled by Cloudinary, not Firebase Storage

export default app;

