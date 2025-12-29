'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEventStore } from '@/lib/store/eventStore';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, userProfile, signOut, loading: authLoading } = useAuth();
  const { currentUser, events, getUserRSVPs, setCurrentUser, loadEvents } = useEventStore();
  
  const userRSVPs = currentUser ? getUserRSVPs(currentUser.id) : [];
  const userEvents = currentUser
    ? events.filter((e) => e.organizer.id === currentUser.id)
    : [];

  // Redirect to login if not authenticated (only after auth has finished loading)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (userProfile) {
      setCurrentUser({
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        avatar: userProfile.avatar,
      });
    }
  }, [userProfile, setCurrentUser]);

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user, loadEvents]);

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
  if (!user || !currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
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
            <button
              onClick={async () => {
                await signOut();
                router.push('/login');
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col items-center text-center">
            {currentUser.avatar ? (
              <Image
                src={currentUser.avatar}
                alt={currentUser.name}
                width={96}
                height={96}
                className="rounded-full mb-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center mb-4">
                <span className="text-white font-bold text-3xl">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{currentUser.name}</h2>
            <p className="text-gray-600">{currentUser.email}</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-3xl font-bold text-teal-600 mb-2">{userEvents.length}</p>
            <p className="text-gray-600 font-medium">Events Created</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-3xl font-bold text-teal-600 mb-2">{userRSVPs.length}</p>
            <p className="text-gray-600 font-medium">RSVPs</p>
          </div>
        </div>

        {/* My Events Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">My Events</h3>
          {userEvents.length > 0 ? (
            <div className="space-y-3">
              {userEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/event/${event.id}`}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                    <p className="text-sm text-gray-600 mb-1">
                      {event.date} • {event.time}
                    </p>
                    <p className="text-sm text-gray-600">{event.location}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 mb-4">No events created yet</p>
              <Link
                href="/create-event"
                className="inline-block bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-500 transition-colors"
              >
                Create Your First Event
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

