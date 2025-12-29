import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.authDomain) {
  console.error(
    '❌ Firebase configuration is missing required fields!\n\n' +
    'Please set up your Firebase configuration in .env.local:\n' +
    '   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key\n' +
    '   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com\n' +
    '   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id\n' +
    '   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com\n' +
    '   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id\n' +
    '   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id\n\n' +
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
  throw error;
}

// Initialize Auth with browser localStorage persistence (persists across page reloads)
let auth: Auth;
try {
  auth = getAuth(app);
  
  // Set persistence to LOCAL (browser localStorage) - persists until user logs out or token expires
  // Firebase Auth tokens refresh automatically, so users stay logged in for extended periods
  if (typeof window !== 'undefined') {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Failed to set auth persistence:', error);
    });
  }
} catch (error: any) {
  console.error('❌ Failed to initialize Firebase Auth:', error);
  throw new Error(
    `Firebase Auth initialization failed: ${error.message}. ` +
    `Make sure your Firebase configuration is correct.`
  );
}

// Verify auth is properly initialized
if (!auth || !auth.app) {
  console.error('❌ Auth instance is not properly initialized');
  throw new Error('Firebase Auth instance is not properly initialized');
}

// Initialize services
export { auth };
export const db: Firestore = getFirestore(app);
// Note: Storage is handled by Cloudinary, not Firebase Storage

export default app;

