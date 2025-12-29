import { Event, RSVP, User } from '../types';

export const mockUser: User = {
  id: 'user-1',
  name: 'Ramon Winters',
  email: 'wintersramon8@gmail.com',
  avatar: 'https://i.pravatar.cc/150?img=12',
};

export const mockEvents: Event[] = [
  {
    id: 'event-1',
    title: 'Tech Meetup: React Native Deep Dive',
    description: 'Join us for an evening of React Native discussions, networking, and pizza. We\'ll cover the latest features, best practices, and share real-world experiences.',
    date: '2024-12-20',
    time: '18:00',
    location: 'Tech Hub Downtown',
    locationDetails: {
      latitude: 41.4993,
      longitude: -81.6944,
      address: '123 Main St, Cleveland, OH 44115',
    },
    organizer: {
      id: 'org-1',
      name: 'Cleveland Tech Community',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    rsvpCount: 45,
    maxAttendees: 100,
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    tags: ['React Native', 'Networking', 'Tech'],
    createdAt: '2024-12-01T10:00:00Z',
  },
  {
    id: 'event-2',
    title: 'Holiday Networking Mixer',
    description: 'End-of-year networking event with drinks, appetizers, and great conversations. Perfect for meeting new people and reconnecting with colleagues.',
    date: '2024-12-22',
    time: '19:00',
    location: 'The Social Club',
    locationDetails: {
      latitude: 41.5023,
      longitude: -81.6924,
      address: '456 Social Ave, Cleveland, OH 44115',
    },
    organizer: {
      id: 'org-2',
      name: 'Professional Network',
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
    rsvpCount: 78,
    maxAttendees: 150,
    category: 'Networking',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
    tags: ['Networking', 'Holiday', 'Social'],
    createdAt: '2024-11-28T14:00:00Z',
  },
  {
    id: 'event-3',
    title: 'Startup Pitch Night',
    description: 'Watch local entrepreneurs pitch their ideas to investors. Great opportunity to see innovation in action and support the startup community.',
    date: '2024-12-25',
    time: '17:00',
    location: 'Innovation Center',
    locationDetails: {
      latitude: 41.4963,
      longitude: -81.6904,
      address: '789 Innovation Blvd, Cleveland, OH 44115',
    },
    organizer: {
      id: 'org-3',
      name: 'Startup Cleveland',
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
    rsvpCount: 32,
    maxAttendees: 80,
    category: 'Business',
    imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
    tags: ['Startups', 'Pitch', 'Business'],
    createdAt: '2024-12-05T09:00:00Z',
  },
  {
    id: 'event-4',
    title: 'Code & Coffee Morning',
    description: 'Casual coding session with coffee and pastries. Bring your laptop and work on personal projects or collaborate with others.',
    date: '2024-12-21',
    time: '09:00',
    location: 'Local Coffee Shop',
    locationDetails: {
      latitude: 41.5013,
      longitude: -81.6964,
      address: '321 Coffee St, Cleveland, OH 44115',
    },
    organizer: {
      id: 'org-4',
      name: 'Dev Community',
      avatar: 'https://i.pravatar.cc/150?img=4',
    },
    rsvpCount: 23,
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
    tags: ['Coding', 'Coffee', 'Casual'],
    createdAt: '2024-12-10T08:00:00Z',
  },
];

export const mockRSVPs: RSVP[] = [
  {
    id: 'rsvp-1',
    eventId: 'event-1',
    userId: 'user-1',
    userName: 'Ramon Winters',
    userAvatar: 'https://i.pravatar.cc/150?img=12',
    status: 'going',
    createdAt: '2024-12-15T10:00:00Z',
  },
  {
    id: 'rsvp-2',
    eventId: 'event-2',
    userId: 'user-1',
    userName: 'Ramon Winters',
    userAvatar: 'https://i.pravatar.cc/150?img=12',
    status: 'going',
    createdAt: '2024-12-16T11:00:00Z',
  },
];

