import { format, formatDistanceToNow, parseISO } from 'date-fns';

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
      // Firestore Timestamp has seconds and nanoseconds
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

export const formatPostDate = (dateInput: string | undefined | null | any): string => {
  if (!dateInput) {
    return 'Just now';
  }
  
  try {
    const date = parseDate(dateInput);
    if (!date) {
      return 'Just now';
    }
    
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    if (diffInHours < 24) {
      return format(date, 'h:mm a');
    }
    if (diffInHours < 168) { // Less than a week
      return format(date, 'EEE h:mm a');
    }
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error, dateInput);
    return 'Just now';
  }
};

export const formatRelativeTime = (dateInput: string | undefined | null | any): string => {
  if (!dateInput) {
    return 'Just now';
  }
  
  try {
    const date = parseDate(dateInput);
    if (!date) {
      return 'Just now';
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error, dateInput);
    return 'Just now';
  }
};

