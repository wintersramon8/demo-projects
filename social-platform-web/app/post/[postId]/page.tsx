'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSocialStore } from '@/lib/store/socialStore';
import { formatPostDate, formatRelativeTime } from '@/lib/utils/dateUtils';

export default function PostDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.postId as string;
  const { user, userProfile, loading: authLoading } = useAuth();
  const { 
    posts, 
    comments, 
    currentUser, 
    toggleLike, 
    addComment, 
    getPostComments, 
    loadComments,
    subscribeToComments,
    loadPosts,
    setCurrentUser,
    loading 
  } = useSocialStore();
  
  const post = posts.find((p) => p.id === postId);
  const postComments = post ? getPostComments(post.id) : [];
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect to login if not authenticated (only after auth has finished loading)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

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

  // Load post and comments
  useEffect(() => {
    if (postId && user) {
      // Load posts first to get the post data
      if (!post) {
        loadPosts();
      }
      // Load comments
      loadComments(postId);
    }
  }, [postId, user, post, loadPosts, loadComments]);

  // Set up real-time subscription to comments
  useEffect(() => {
    if (postId && user) {
      const unsubscribe = subscribeToComments(postId);
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [postId, user, subscribeToComments]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser || !post) return;

    setSubmitting(true);
    try {
      await addComment(post.id, commentText.trim());
      setCommentText('');
      // Comments will update automatically via subscription
    } catch (error: any) {
      console.error('Failed to add comment:', error);
      alert(error.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    try {
      await toggleLike(post.id);
    } catch (error: any) {
      console.error('Failed to toggle like:', error);
    }
  };

  // Show loading state while auth is loading
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

  // Redirect if not authenticated (handled by useEffect, but show nothing while redirecting)
  if (!user) {
    return null;
  }

  if (loading && !post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
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
          <p className="text-gray-600">Post not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
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
            <h1 className="ml-4 text-xl font-bold text-gray-900">Post</h1>
          </div>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Post Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <Link href={`/profile/${post.userId}`} className="flex items-center flex-1 hover:opacity-80 transition-opacity">
                {post.userAvatar ? (
                  <Image
                    src={post.userAvatar}
                    alt={post.userName}
                    width={40}
                    height={40}
                    className="rounded-full mr-3"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center mr-3">
                    <span className="text-white font-semibold text-sm">
                      {post.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{post.userName}</p>
                  <p className="text-xs text-gray-500">{formatPostDate(post.createdAt)}</p>
                </div>
              </Link>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-gray-900 mb-3 whitespace-pre-wrap break-words">{post.content}</p>
              {post.imageUrl && (
                <div className="rounded-lg overflow-hidden mb-3">
                  <Image
                    src={post.imageUrl}
                    alt="Post image"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <button
                onClick={handleLike}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
              >
                <svg
                  className={`w-6 h-6 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`}
                  fill={post.isLiked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className={`text-sm font-medium ${post.isLiked ? 'text-red-500' : ''}`}>
                  {post.likesCount}
                </span>
              </button>

              <div className="flex items-center space-x-2 text-gray-600">
                <svg 
                  className="w-6 h-6 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <line x1="9" y1="10" x2="15" y2="10" />
                  <line x1="9" y1="14" x2="15" y2="14" />
                </svg>
                <span className="text-sm font-medium">{post.commentsCount}</span>
              </div>

              <button className="flex items-center space-x-2 text-gray-600 hover:text-teal-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342c8.288 0 12-3.94 12-7.908 0-4.356-3.712-8.434-12-8.434S-3.288 1.078-3.288 5.434c0 3.969 3.712 7.908 12 7.908m0 0l3.712-3.712m-3.712 3.712l-3.712 3.712"
                  />
                </svg>
                <span className="text-sm font-medium">{post.sharesCount}</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Comments ({postComments.length})
            </h2>
            
            {postComments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
              <div className="space-y-4">
                {postComments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    {comment.userAvatar ? (
                      <Image
                        src={comment.userAvatar}
                        alt={comment.userName}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-xs">
                          {comment.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Link
                          href={`/profile/${comment.userId}`}
                          className="font-semibold text-gray-900 hover:underline"
                        >
                          {comment.userName}
                        </Link>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 break-words">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Comment Input */}
      {currentUser && (
        <div className="bg-white border-t border-gray-200 sticky bottom-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <form onSubmit={handleAddComment} className="flex items-end space-x-3">
              {currentUser.avatar ? (
                <Image
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  width={32}
                  height={32}
                  className="rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 min-h-[40px] max-h-[100px] px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                rows={1}
                disabled={submitting}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || submitting}
                className="p-2 text-teal-600 hover:text-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

