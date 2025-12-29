# RSVP Events Web

A Next.js web app for discovering and managing events. Users can browse events, RSVP with different statuses, create their own events, and view their event history - all in the browser.

## Environment Setup

Create a `.env.local` file in the root directory with your Firebase and Cloudinary credentials:

```env
# Firebase Configuration (required)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Cloudinary Configuration (required for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
```

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
# rsvp-web-demo
