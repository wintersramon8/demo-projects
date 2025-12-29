import { format, parseISO, isPast, isToday, isTomorrow } from 'date-fns';

/**
 * Convert various date formats to a Date object
 */
const parseDate = (dateInput: any): Date | null => {
  if (!dateInput) {
    return null;
  }

  // If it's already a Date object
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }

  // If it's a Firestore Timestamp object
  if (dateInput && typeof dateInput === 'object' && 'seconds' in dateInput) {
    try {
      const seconds = dateInput.seconds || 0;
      const nanoseconds = dateInput.nanoseconds || 0;
      return new Date(seconds * 1000 + nanoseconds / 1000000);
    } catch {
      return null;
    }
  }

  // If it has a toDate method (Firestore Timestamp)
  if (dateInput && typeof dateInput.toDate === 'function') {
    try {
      return dateInput.toDate();
    } catch {
      return null;
    }
  }

  // If it's a string, try to parse it
  if (typeof dateInput === 'string') {
    try {
      const date = parseISO(dateInput);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  // If it's a number (timestamp)
  if (typeof dateInput === 'number') {
    const date = new Date(dateInput);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
};

export const formatEventDate = (dateString: string | undefined | null | any, timeString: string | undefined | null | any): string => {
  if (!dateString || !timeString) {
    return 'Date TBD';
  }
  
  try {
    // Convert date and time strings to a Date object
    const dateStr = typeof dateString === 'string' ? dateString : String(dateString);
    const timeStr = typeof timeString === 'string' ? timeString : String(timeString);
    const date = parseISO(`${dateStr}T${timeStr}:00`);
    
    if (isNaN(date.getTime())) {
      return 'Date TBD';
    }
    return format(date, 'MMM d, yyyy • h:mm a');
  } catch (error) {
    console.error('Error formatting event date:', error, dateString, timeString);
    return 'Date TBD';
  }
};

export const formatShortDate = (dateInput: string | undefined | null | any): string => {
  if (!dateInput) {
    return 'TBD';
  }
  
  try {
    const date = parseDate(dateInput);
    if (!date) {
      return 'TBD';
    }
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  } catch (error) {
    console.error('Error formatting short date:', error, dateInput);
    return 'TBD';
  }
};

export const isEventPast = (dateString: string | undefined | null | any, timeString: string | undefined | null | any): boolean => {
  if (!dateString || !timeString) {
    return false;
  }
  
  try {
    const dateStr = typeof dateString === 'string' ? dateString : String(dateString);
    const timeStr = typeof timeString === 'string' ? timeString : String(timeString);
    const date = parseISO(`${dateStr}T${timeStr}:00`);
    
    if (isNaN(date.getTime())) {
      return false;
    }
    return isPast(date);
  } catch (error) {
    console.error('Error checking if event is past:', error);
    return false;
  }
};

export const getEventStatus = (dateString: string | undefined | null | any, timeString: string | undefined | null | any): 'upcoming' | 'today' | 'past' => {
  if (!dateString || !timeString) {
    return 'upcoming';
  }
  
  try {
    const dateStr = typeof dateString === 'string' ? dateString : String(dateString);
    const timeStr = typeof timeString === 'string' ? timeString : String(timeString);
    const date = parseISO(`${dateStr}T${timeStr}:00`);
    
    if (isNaN(date.getTime())) {
      return 'upcoming';
    }
    if (isPast(date)) return 'past';
    if (isToday(date)) return 'today';
    return 'upcoming';
  } catch (error) {
    console.error('Error getting event status:', error);
    return 'upcoming';
  }
};
