'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Event } from '@/lib/types';
import { formatShortDate, getEventStatus } from '@/lib/utils/dateUtils';
import React from 'react';

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const status = getEventStatus(event.date, event.time);
  const statusColor = status === 'past' ? 'bg-gray-500' : status === 'today' ? 'bg-red-500' : 'bg-teal-500';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onPress}>
      {event.imageUrl && (
        <div className="relative w-full h-48">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`${statusColor} text-white text-xs font-semibold px-2 py-1 rounded`}>
            {status.toUpperCase()}
          </span>
          <span className="text-xs text-gray-500 font-medium">{event.category}</span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {event.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="truncate">
              {formatShortDate(event.date)} • {event.time}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{event.location}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>
              {event.rsvpCount} {event.maxAttendees ? `/ ${event.maxAttendees}` : ''} attending
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

