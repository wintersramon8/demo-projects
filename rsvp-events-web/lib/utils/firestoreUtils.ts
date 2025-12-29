/**
 * Removes undefined values from an object recursively
 * Firestore doesn't allow undefined values, so we need to remove them before saving
 */
export const removeUndefined = <T>(obj: T): T => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeUndefined) as unknown as T;
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefined(value);
      }
    }
    return cleaned as T;
  }

  return obj;
};

