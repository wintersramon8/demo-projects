'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEventStore } from '@/lib/store/eventStore';
import { EventCard } from '@/components/EventCard';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type TabType = 'all' | 'my-rsvps';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut, userProfile } = useAuth();
  const {
    events,
    currentUser,
    getUserRSVPs,
    loadEvents,
    loadRSVPs,
    loading,
    setCurrentUser,
  } = useEventStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [refreshing, setRefreshing] = useState(false);

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
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadEvents();
      if (currentUser) {
        loadRSVPs(undefined, currentUser.id);
      }
    }
  }, [user, currentUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    if (currentUser) {
      await loadRSVPs(undefined, currentUser.id);
    }
    setRefreshing(false);
  };

  const filteredEvents = useMemo(() => {
    if (activeTab === 'my-rsvps' && currentUser) {
      const userRSVPs = getUserRSVPs(currentUser.id);
      const rsvpEventIds = userRSVPs.map((rsvp) => rsvp.eventId);
      return events.filter((event) => rsvpEventIds.includes(event.id));
    }
    return events;
  }, [events, activeTab, currentUser, getUserRSVPs]);

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}:00`).getTime();
      const dateB = new Date(`${b.date}T${b.time || '00:00'}:00`).getTime();
      if (dateA !== dateB) {
        return dateA - dateB; // Earliest first
      }
      // If dates/times are equal, sort by createdAt for consistency
      const createdA = new Date(a.createdAt || 0).getTime();
      const createdB = new Date(b.createdAt || 0).getTime();
      if (createdA !== createdB) {
        return createdA - createdB;
      }
      // If everything is equal, sort by ID for consistency
      return a.id.localeCompare(b.id);
    });
  }, [filteredEvents]);

  if (authLoading || loading) {
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
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">RSVP Events</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                {currentUser?.avatar ? (
                  <Image
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {currentUser?.name.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </Link>
              <button
                onClick={async () => {
                  await signOut();
                  router.push('/login');
                }}
                className="rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-500 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Hello, {currentUser?.name || 'User'}!
          </h2>
          <p className="text-gray-600 mt-1">Discover events near you</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setActiveTab('my-rsvps')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'my-rsvps'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My RSVPs
          </button>
        </div>

        {/* Events List */}
        {refreshing ? (
          <div className="flex justify-center py-8">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-4 text-gray-600">No events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => router.push(`/event/${event.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <Link
        href="/create-event"
        className="fixed bottom-8 right-8 bg-teal-600 text-white rounded-full p-4 shadow-lg hover:bg-teal-500 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  );
}
