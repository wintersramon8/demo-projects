# RSVP Events Demo

A React Native mobile app for discovering and managing events. Users can browse events, RSVP with different statuses (Going, Maybe, Can't Go), create their own events, and view their event history.

## Environment Setup

Create a `.env` file in the root directory with your Firebase and Cloudinary credentials:

```env
# Firebase Configuration (required)
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id

# Cloudinary Configuration (required for image uploads)
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
EXPO_PUBLIC_CLOUDINARY_API_KEY=your-api-key
```

## Getting Started

```bash
# Install dependencies
npm install

# Start the app
npm start
```
