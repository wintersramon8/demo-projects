import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Event } from '../types';
import { removeUndefined } from '../utils/firestoreUtils';

export const eventService = {
  /**
   * Get all events
   */
  getEvents: async (filters?: {
    category?: string;
    location?: string;
    limitCount?: number;
  }): Promise<Event[]> => {
    try {
      let q = query(collection(db, 'events'), orderBy('date', 'asc'));

      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }

      if (filters?.location) {
        q = query(q, where('location', '>=', filters.location));
      }

      if (filters?.limitCount) {
        q = query(q, limit(filters.limitCount));
      }

      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.().toISOString() || doc.data().createdAt,
      })) as Event[];

      // Client-side sort to ensure consistent ordering (by date/time, then by createdAt, then by id)
      events.sort((a, b) => {
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

      return events;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch events');
    }
  },

  /**
   * Get event by ID
   */
  getEventById: async (eventId: string): Promise<Event | null> => {
    try {
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        return {
          id: eventDoc.id,
          ...eventDoc.data(),
          createdAt: eventDoc.data().createdAt?.toDate?.().toISOString() || eventDoc.data().createdAt,
        } as Event;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch event');
    }
  },

  /**
   * Create a new event
   */
  createEvent: async (event: Omit<Event, 'id' | 'createdAt'>): Promise<string> => {
    try {
      // Remove undefined values before saving to Firestore
      const cleanedEvent = removeUndefined({
        ...event,
        createdAt: Timestamp.now(),
      });
      
      const docRef = await addDoc(collection(db, 'events'), cleanedEvent);
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create event');
    }
  },

  /**
   * Update an event
   */
  updateEvent: async (
    eventId: string,
    updates: Partial<Event>
  ): Promise<void> => {
    try {
      // Remove undefined values before saving to Firestore
      const cleanedUpdates = removeUndefined(updates);
      await updateDoc(doc(db, 'events', eventId), cleanedUpdates);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update event');
    }
  },

  /**
   * Delete an event
   */
  deleteEvent: async (eventId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete event');
    }
  },

  /**
   * Subscribe to events (real-time)
   */
  subscribeToEvents: (
    callback: (events: Event[]) => void,
    filters?: {
      category?: string;
      location?: string;
    }
  ): (() => void) => {
    let q = query(collection(db, 'events'), orderBy('date', 'asc'));

    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const events = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.().toISOString() || doc.data().createdAt,
        })) as Event[];

        // Client-side sort to ensure consistent ordering (by date/time, then by createdAt, then by id)
        events.sort((a, b) => {
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

        callback(events);
      },
      (error) => {
        console.error('Error subscribing to events:', error);
        callback([]);
      }
    );
  },
};

