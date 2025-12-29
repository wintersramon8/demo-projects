export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  locationDetails?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  rsvpCount: number;
  maxAttendees?: number;
  category: string;
  imageUrl?: string;
  tags: string[];
  createdAt: string;
}

export interface RSVP {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  status: 'going' | 'maybe' | 'not-going';
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  EventDetails: { eventId: string };
  CreateEvent: undefined;
  Profile: undefined;
};

