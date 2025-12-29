'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSocialStore } from '@/lib/store/socialStore';

export default function ConnectionsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params?.userId as string;
  const type = searchParams?.get('type') || 'followers';
  const { user } = useAuth();
  const { users, getUserFollowers, getUserFollowing, loadFollowers, loadFollowing } = useSocialStore();
  
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      setLoading(true);
      if (type === 'followers') {
        loadFollowers(userId).then(() => {
          setConnections(getUserFollowers(userId));
          setLoading(false);
        });
      } else {
        loadFollowing(userId).then(() => {
          setConnections(getUserFollowing(userId));
          setLoading(false);
        });
      }
    }
  }, [userId, type, loadFollowers, loadFollowing, getUserFollowers, getUserFollowing]);

  if (!user) {
    router.push('/login');
    return null;
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
            <h1 className="ml-4 text-xl font-bold text-gray-900">
              {type === 'followers' ? 'Followers' : 'Following'}
            </h1>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        ) : connections.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="mt-4 text-gray-600">
              No {type === 'followers' ? 'followers' : 'following'} yet
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {connections.map((connection) => (
                <Link
                  key={connection.id}
                  href={`/profile/${connection.id}`}
                  className="flex items-center p-4 hover:bg-gray-50 transition-colors"
                >
                  {connection.avatar ? (
                    <Image
                      src={connection.avatar}
                      alt={connection.name}
                      width={48}
                      height={48}
                      className="rounded-full mr-4"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center mr-4">
                      <span className="text-white font-semibold">
                        {connection.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{connection.name}</p>
                    {connection.username && (
                      <p className="text-sm text-gray-600">@{connection.username}</p>
                    )}
                  </div>
                  {connection.isFollowing && (
                    <span className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
                      Following
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

