/**
 * Maps Firebase error codes to user-friendly error messages
 */
export const getFirebaseErrorMessage = (error: any): string => {
  let errorCode = '';
  
  if (error?.code) {
    errorCode = error.code;
  } else if (error?.message) {
    const match = error.message.match(/auth\/([a-z-]+)/i);
    if (match) {
      errorCode = `auth/${match[1]}`;
    }
  }

  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered. Please sign in or use a different email.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    'auth/configuration-not-found': 'Authentication service is not configured. Please contact support.',
    'auth/requires-recent-login': 'For security, please sign in again to complete this action.',
    'auth/invalid-action-code': 'This link has expired or is invalid. Please request a new one.',
    'auth/expired-action-code': 'This link has expired. Please request a new one.',
  };

  if (errorCode && errorMessages[errorCode]) {
    return errorMessages[errorCode];
  }

  if (error?.message) {
    const message = error.message.replace(/^Firebase:\s*Error\s*\(?/i, '').replace(/\)$/, '');
    if (message.startsWith('auth/')) {
      return 'An authentication error occurred. Please try again.';
    }
    return message;
  }

  return 'An unexpected error occurred. Please try again.';
};

