import { create } from 'zustand';
import { Event, RSVP, User } from '../types';
import { eventService } from '../services/eventService';
import { rsvpService } from '../services/rsvpService';
import { authService, UserProfile } from '../services/authService';

interface EventStore {
  events: Event[];
  rsvps: RSVP[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  
  // User management
  setCurrentUser: (user: User | null) => void;
  loadUserProfile: (userId: string) => Promise<void>;
  
  // Events
  loadEvents: () => Promise<void>;
  subscribeToEvents: () => (() => void) | null;
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'rsvpCount'>) => Promise<void>;
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  
  // RSVPs
  loadRSVPs: (eventId?: string, userId?: string) => Promise<void>;
  subscribeToEventRSVPs: (eventId: string) => (() => void) | null;
  setRSVP: (eventId: string, status: 'going' | 'maybe' | 'not-going') => Promise<void>;
  getEventRSVPs: (eventId: string) => RSVP[];
  getUserRSVPs: (userId: string) => RSVP[];
  
  // Utility
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  rsvps: [],
  currentUser: null,
  loading: false,
  error: null,
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  loadUserProfile: async (userId: string) => {
    try {
      const profile = await authService.getUserProfile(userId);
      if (profile) {
        set({
          currentUser: {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            avatar: profile.avatar,
          },
        });
      }
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  loadEvents: async () => {
    set({ loading: true, error: null });
    try {
      const events = await eventService.getEvents();
      set({ events, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  subscribeToEvents: () => {
    try {
      return eventService.subscribeToEvents((events) => {
        set({ events });
      });
    } catch (error: any) {
      set({ error: error.message });
      return null;
    }
  },
  
  addEvent: async (eventData) => {
    set({ loading: true, error: null });
    try {
      const eventId = await eventService.createEvent({
        ...eventData,
        rsvpCount: 0,
      });
      
      // Reload events to get the new one
      await get().loadEvents();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  updateEvent: async (eventId, updates) => {
    set({ loading: true, error: null });
    try {
      await eventService.updateEvent(eventId, updates);
      await get().loadEvents();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  deleteEvent: async (eventId) => {
    set({ loading: true, error: null });
    try {
      await eventService.deleteEvent(eventId);
      await get().loadEvents();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  loadRSVPs: async (eventId?, userId?) => {
    set({ loading: true, error: null });
    try {
      let rsvps: RSVP[] = [];
      
      if (eventId) {
        rsvps = await rsvpService.getEventRSVPs(eventId);
      } else if (userId) {
        rsvps = await rsvpService.getUserRSVPs(userId);
      }
      
      set({ rsvps, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  subscribeToEventRSVPs: (eventId: string) => {
    try {
      return rsvpService.subscribeToEventRSVPs(eventId, (rsvps) => {
        set((state) => ({
          rsvps: [...state.rsvps.filter((r) => r.eventId !== eventId), ...rsvps],
        }));
      });
    } catch (error: any) {
      set({ error: error.message });
      return null;
    }
  },
  
  setRSVP: async (eventId, status) => {
    const currentUser = get().currentUser;
    if (!currentUser) {
      throw new Error('User must be logged in to RSVP');
    }
    
    set({ loading: true, error: null });
    try {
      await rsvpService.setRSVP(
        eventId,
        currentUser.id,
        currentUser.name,
        currentUser.avatar,
        status
      );
      
      // Reload RSVPs and update event count
      await get().loadRSVPs(eventId);
      const eventRSVPs = get().getEventRSVPs(eventId);
      await get().updateEvent(eventId, { rsvpCount: eventRSVPs.length });
      
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  getEventRSVPs: (eventId) => {
    return get().rsvps.filter((r) => r.eventId === eventId && r.status === 'going');
  },
  
  getUserRSVPs: (userId) => {
    return get().rsvps.filter((r) => r.userId === userId);
  },
  
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
}));
