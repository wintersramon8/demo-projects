'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSocialStore } from '@/lib/store/socialStore';
import { PostCard } from '@/components/PostCard';

export default function FeedPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut, userProfile } = useAuth();
  const { posts, currentUser, toggleLike, loadPosts, loading: postsLoading } = useSocialStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && userProfile) {
      // Set current user in store
      const store = useSocialStore.getState();
      if (!store.currentUser || store.currentUser.id !== userProfile.id) {
        store.setCurrentUser({
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
      
      // Load posts with user ID for like status
      loadPosts(userProfile.id);
    }
  }, [user, userProfile, authLoading, router, loadPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      if (dateB !== dateA) {
        return dateB - dateA;
      }
      return b.id.localeCompare(a.id);
    });
  }, [posts]);

  const handleLike = async (postId: string) => {
    try {
      await toggleLike(postId);
    } catch (error: any) {
      console.error('Failed to toggle like:', error);
    }
  };

  if (authLoading || (authLoading && !user)) {
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
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Social Feed</h1>
            <div className="flex items-center space-x-4">
              <Link
                href="/create-post"
                className="p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-full transition-colors"
                title="Create Post"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Link>
              <Link
                href={`/profile/${currentUser?.id || user.uid}`}
                className="p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-full transition-colors"
                title="Profile"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
              <button
                onClick={async () => {
                  await signOut();
                  router.push('/login');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Feed Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {postsLoading && !refreshing ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading posts...</p>
            </div>
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="text-center py-20">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No posts yet</h3>
            <p className="mt-2 text-sm text-gray-500">Be the first to share something!</p>
            <Link
              href="/create-post"
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Create Your First Post
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => handleLike(post.id)}
                onComment={() => router.push(`/post/${post.id}`)}
              />
            ))}
          </div>
        )}

        {/* Refresh Button */}
        {!postsLoading && sortedPosts.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {refreshing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                'Refresh Feed'
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
