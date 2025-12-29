'use client';

import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEventStore } from '@/lib/store/eventStore';
import { formatEventDate } from '@/lib/utils/dateUtils';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.eventId as string;
  
  const { user, loading: authLoading } = useAuth();
  const {
    events,
    currentUser,
    rsvps,
    setRSVP,
    loadRSVPs,
    loadEvents,
    getEventRSVPs,
    subscribeToEventRSVPs,
  } = useEventStore();
  
  const event = events.find((e) => e.id === eventId);
  const userRSVP = rsvps.find(
    (r) => r.eventId === eventId && r.userId === currentUser?.id
  );
  
  const [rsvpStatus, setRsvpStatus] = useState<'going' | 'maybe' | 'not-going' | null>(
    userRSVP?.status || null
  );

  // Redirect to login if not authenticated (only after auth has finished loading)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (eventId) {
      loadEvents();
      loadRSVPs(eventId);
    }
  }, [eventId, loadEvents, loadRSVPs]);

  useEffect(() => {
    if (eventId) {
      const unsubscribe = subscribeToEventRSVPs(eventId);
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [eventId, subscribeToEventRSVPs]);

  useEffect(() => {
    if (userRSVP) {
      setRsvpStatus(userRSVP.status);
    }
  }, [userRSVP]);

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

  if (!event) {
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
          <p className="text-gray-600">Event not found</p>
        </div>
      </div>
    );
  }

  const handleRSVP = async (status: 'going' | 'maybe' | 'not-going') => {
    if (!currentUser) {
      alert('Please log in to RSVP');
      return;
    }

    if (!event) {
      alert('Event not found');
      return;
    }

    try {
      await setRSVP(event.id, status);
      setRsvpStatus(status);
      await loadRSVPs(event.id);
      alert(`You've marked yourself as ${status === 'going' ? 'going' : status === 'maybe' ? 'maybe' : 'not going'}`);
    } catch (error: any) {
      alert(error.message || 'Failed to update RSVP');
    }
  };

  const eventRSVPs = getEventRSVPs(event.id);

  return (
    <div className="min-h-screen bg-gray-50">
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
            <h1 className="ml-4 text-xl font-bold text-gray-900">Event Details</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Event Image */}
        {event.imageUrl && (
          <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-6">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Event Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-4">
            <span className="inline-block bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full">
              {event.category}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{event.title}</h1>

          {/* Event Info */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date & Time</p>
                <p className="text-base font-semibold text-gray-900">{formatEventDate(event.date, event.time)}</p>
              </div>
            </div>

            <div className="flex items-start">
              <svg className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Location</p>
                <p className="text-base font-semibold text-gray-900">{event.location}</p>
                {event.locationDetails?.address && (
                  <p className="text-sm text-gray-600 mt-1">{event.locationDetails.address}</p>
                )}
              </div>
            </div>

            <div className="flex items-start">
              <svg className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Attendees</p>
                <p className="text-base font-semibold text-gray-900">
                  {event.rsvpCount} {event.maxAttendees ? `of ${event.maxAttendees}` : ''} attending
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <svg className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Organizer</p>
                <p className="text-base font-semibold text-gray-900">{event.organizer.name}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">About</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* RSVP Section */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">RSVP</h2>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleRSVP('going')}
                className={`flex items-center justify-center space-x-2 py-3 rounded-lg border-2 transition-colors ${
                  rsvpStatus === 'going'
                    ? 'bg-teal-600 border-teal-600 text-white'
                    : 'bg-white border-teal-600 text-teal-600 hover:bg-teal-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold text-sm">Going</span>
              </button>

              <button
                onClick={() => handleRSVP('maybe')}
                className={`flex items-center justify-center space-x-2 py-3 rounded-lg border-2 transition-colors ${
                  rsvpStatus === 'maybe'
                    ? 'bg-teal-600 border-teal-600 text-white'
                    : 'bg-white border-teal-600 text-teal-600 hover:bg-teal-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-sm">Maybe</span>
              </button>

              <button
                onClick={() => handleRSVP('not-going')}
                className={`flex items-center justify-center space-x-2 py-3 rounded-lg border-2 transition-colors ${
                  rsvpStatus === 'not-going'
                    ? 'bg-teal-600 border-teal-600 text-white'
                    : 'bg-white border-teal-600 text-teal-600 hover:bg-teal-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="font-semibold text-sm">Can't Go</span>
              </button>
            </div>
          </div>
        </div>

        {/* Attendees List */}
        {eventRSVPs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Attendees ({eventRSVPs.length})
            </h2>
            <div className="space-y-3">
              {eventRSVPs.map((rsvp) => (
                <div key={rsvp.id} className="flex items-center space-x-3">
                  {rsvp.userAvatar ? (
                    <Image
                      src={rsvp.userAvatar}
                      alt={rsvp.userName}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {rsvp.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{rsvp.userName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

