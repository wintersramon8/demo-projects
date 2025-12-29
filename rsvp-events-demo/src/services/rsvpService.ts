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
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { RSVP } from '../types';
import { removeUndefined } from '../utils/firestoreUtils';

export const rsvpService = {
  /**
   * Create or update RSVP
   */
  setRSVP: async (
    eventId: string,
    userId: string,
    userName: string,
    userAvatar: string | undefined,
    status: 'going' | 'maybe' | 'not-going'
  ): Promise<string> => {
    try {
      // Check if RSVP already exists
      const existingRSVP = await rsvpService.getRSVP(eventId, userId);

      if (existingRSVP) {
        // Update existing RSVP
        await updateDoc(doc(db, 'rsvps', existingRSVP.id), {
          status,
          updatedAt: Timestamp.now(),
        });
        return existingRSVP.id;
      } else {
        // Create new RSVP
        const rsvpData = removeUndefined({
          eventId,
          userId,
          userName,
          userAvatar: userAvatar || null,
          status,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        const docRef = await addDoc(collection(db, 'rsvps'), rsvpData);
        return docRef.id;
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to set RSVP');
    }
  },

  /**
   * Get RSVP for a user and event
   */
  getRSVP: async (eventId: string, userId: string): Promise<RSVP | null> => {
    try {
      const q = query(
        collection(db, 'rsvps'),
        where('eventId', '==', eventId),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const rsvpDoc = querySnapshot.docs[0];
      const data = rsvpDoc.data();
      return {
        id: rsvpDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
      } as RSVP;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get RSVP');
    }
  },

  /**
   * Get all RSVPs for an event
   */
  getEventRSVPs: async (eventId: string): Promise<RSVP[]> => {
    try {
      const q = query(
        collection(db, 'rsvps'),
        where('eventId', '==', eventId),
        where('status', '==', 'going')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
        } as RSVP;
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get event RSVPs');
    }
  },

  /**
   * Get all RSVPs for a user
   */
  getUserRSVPs: async (userId: string): Promise<RSVP[]> => {
    try {
      const q = query(collection(db, 'rsvps'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
        } as RSVP;
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get user RSVPs');
    }
  },

  /**
   * Delete RSVP
   */
  deleteRSVP: async (rsvpId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'rsvps', rsvpId));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete RSVP');
    }
  },

  /**
   * Subscribe to RSVPs for an event (real-time)
   */
  subscribeToEventRSVPs: (
    eventId: string,
    callback: (rsvps: RSVP[]) => void
  ): (() => void) => {
    const q = query(
      collection(db, 'rsvps'),
      where('eventId', '==', eventId),
      where('status', '==', 'going')
    );

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const rsvps = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
          } as RSVP;
        });
        callback(rsvps);
      },
      (error) => {
        console.error('Error subscribing to RSVPs:', error);
        callback([]);
      }
    );
  },
};

