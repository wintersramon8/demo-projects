'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSocialStore } from '@/lib/store/socialStore';
import { storageService } from '@/lib/services/storageService';

export default function CreatePostPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const { addPost, currentUser, loading, setCurrentUser } = useSocialStore();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure currentUser is set in store
  useEffect(() => {
    if (userProfile && (!currentUser || currentUser.id !== userProfile.id)) {
      setCurrentUser({
        id: userProfile.id,
        name: userProfile.name,
        username: userProfile.username,
        email: userProfile.email,
        avatar: userProfile.avatar,
        bio: userProfile.bio,
        followersCount: userProfile.followersCount,
        followingCount: userProfile.followingCount,
        postsCount: userProfile.postsCount,
      });
    }
  }, [userProfile, currentUser, setCurrentUser]);

  const handlePickImage = async () => {
    try {
      const file = await storageService.pickImage();
      if (file) {
        setImageFile(file);
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to pick image');
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    if (!user || !userProfile) {
      setError('Please log in to create a post');
      return;
    }

    // Ensure currentUser is set
    if (!currentUser) {
      setCurrentUser({
        id: userProfile.id,
        name: userProfile.name,
        username: userProfile.username,
        email: userProfile.email,
        avatar: userProfile.avatar,
        bio: userProfile.bio,
        followersCount: userProfile.followersCount,
        followingCount: userProfile.followingCount,
        postsCount: userProfile.postsCount,
      });
    }

    setUploading(true);
    try {
      let imageUrl: string | undefined;
      
      // Upload image if selected
      if (imageFile) {
        // Create a temporary post ID for the image path
        const tempPostId = `temp-${Date.now()}`;
        imageUrl = await storageService.uploadPostImage(imageFile, tempPostId);
      }

      // Create post
      await addPost({
        content: content.trim(),
        imageUrl,
      });

      // Clean up preview URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      setContent('');
      setImageFile(null);
      setImagePreview(null);
      
      // Navigate back to feed
      router.push('/feed');
    } catch (error: any) {
      console.error('Error creating post:', error);
      setError(error.message || 'Failed to create post');
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Create Post</h1>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || uploading || !content.trim()}
              className="px-4 py-2 text-sm font-semibold text-teal-600 hover:text-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading || uploading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </span>
              ) : (
                'Post'
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            {currentUser?.avatar || userProfile?.avatar ? (
              <Image
                src={currentUser?.avatar || userProfile?.avatar || ''}
                alt={currentUser?.name || userProfile?.name || 'User'}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {(currentUser?.name || userProfile?.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="font-semibold text-gray-900">
              {currentUser?.name || userProfile?.name || 'User'}
            </span>
          </div>

          {/* Text Input */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full min-h-[200px] p-4 text-gray-900 placeholder-gray-500 border-0 focus:ring-0 focus:outline-none resize-none text-lg"
            disabled={uploading}
            autoFocus
          />

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={imagePreview}
                alt="Preview"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePickImage}
              disabled={uploading}
              className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Photo</span>
            </button>
            <button
              type="button"
              disabled
              className="flex items-center space-x-2 text-gray-400 cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">Location</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

