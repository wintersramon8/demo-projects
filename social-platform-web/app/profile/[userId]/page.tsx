'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSocialStore } from '@/lib/store/socialStore';
import { PostCard } from '@/components/PostCard';

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;
  const { user, userProfile } = useAuth();
  const { 
    users, 
    currentUser, 
    posts,
    getUserPosts, 
    toggleFollow, 
    loadUser, 
    loadUserProfile,
    loadPosts,
    setCurrentUser,
    loading 
  } = useSocialStore();
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  
  const profileUserId = userId || currentUser?.id || userProfile?.id;
  const profileUser = userId
    ? users.find((u) => u.id === userId) || currentUser
    : currentUser;
  
  const isOwnProfile = !userId || userId === currentUser?.id || userId === userProfile?.id;
  const userPosts = profileUser ? getUserPosts(profileUser.id) : [];

  // Ensure currentUser is set
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

  useEffect(() => {
    if (userId && userId !== currentUser?.id) {
      loadUser(userId);
    } else if (!userId && userProfile) {
      loadUserProfile(userProfile.id);
    }
  }, [userId, currentUser, userProfile, loadUser, loadUserProfile]);

  // Load all posts and filter for user
  useEffect(() => {
    if (profileUser) {
      loadPosts(profileUser.id).then(() => {
        const filtered = posts.filter((p) => p.userId === profileUser.id);
        setUserPosts(filtered);
      });
    }
  }, [profileUser, posts, loadPosts]);

  // Load all posts to ensure user posts are available
  useEffect(() => {
    if (posts.length === 0) {
      loadPosts(currentUser?.id);
    }
  }, [posts.length, currentUser, loadPosts]);

  useEffect(() => {
    if (profileUser) {
      // Check follow status if viewing another user's profile
      if (!isOwnProfile && currentUser && profileUser.id) {
        // This would need to be implemented in the store
        // For now, we'll use the isFollowing property if available
        setIsFollowing(profileUser.isFollowing || false);
      }
    }
  }, [profileUser, currentUser, isOwnProfile]);

  const handleFollow = async () => {
    if (!userId || !currentUser || !profileUser) return;
    
    setLoadingFollow(true);
    try {
      await toggleFollow(userId);
      setIsFollowing(!isFollowing);
    } catch (error: any) {
      console.error('Failed to update follow status:', error);
    } finally {
      setLoadingFollow(false);
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  if (loading && !profileUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>
        </nav>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-gray-600">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="ml-4 text-xl font-bold text-gray-900">Profile</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {profileUser.avatar ? (
              <Image
                src={profileUser.avatar}
                alt={profileUser.name}
                width={100}
                height={100}
                className="rounded-full"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center">
                <span className="text-white font-bold text-3xl">
                  {profileUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{profileUser.name}</h2>
              {profileUser.username && (
                <p className="text-gray-600">@{profileUser.username}</p>
              )}
              {profileUser.bio && (
                <p className="mt-2 text-gray-700">{profileUser.bio}</p>
              )}
              
              <div className="flex items-center space-x-6 mt-4">
                <div>
                  <span className="font-semibold text-gray-900">{profileUser.postsCount || 0}</span>
                  <span className="text-gray-600 ml-1">posts</span>
                </div>
                <Link
                  href={`/connections/${profileUser.id}?type=followers`}
                  className="hover:underline"
                >
                  <span className="font-semibold text-gray-900">{profileUser.followersCount || 0}</span>
                  <span className="text-gray-600 ml-1">followers</span>
                </Link>
                <Link
                  href={`/connections/${profileUser.id}?type=following`}
                  className="hover:underline"
                >
                  <span className="font-semibold text-gray-900">{profileUser.followingCount || 0}</span>
                  <span className="text-gray-600 ml-1">following</span>
                </Link>
              </div>
            </div>

            {!isOwnProfile && currentUser && (
              <button
                onClick={handleFollow}
                disabled={loadingFollow}
                className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loadingFollow ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </span>
                ) : isFollowing ? (
                  'Unfollow'
                ) : (
                  'Follow'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Posts */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Posts</h3>
          {userPosts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4 text-gray-600">No posts yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={async () => {
                    const { toggleLike } = useSocialStore.getState();
                    await toggleLike(post.id);
                  }}
                  onComment={() => router.push(`/post/${post.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

