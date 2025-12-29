import * as ImagePicker from 'expo-image-picker';
import { uploadToCloudinary } from './cloudinary';

export const storageService = {
  requestPermissions: async (): Promise<boolean> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  },

  pickImage: async (): Promise<string | null> => {
    try {
      const hasPermission = await storageService.requestPermissions();
      if (!hasPermission) {
        throw new Error('Permission to access media library is required');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to pick image');
    }
  },

  /**
   * Upload image to Cloudinary
   */
  uploadImage: async (
    uri: string,
    folder: string,
    publicId?: string
  ): Promise<string> => {
    try {
      return await uploadToCloudinary(uri, folder, publicId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload image');
    }
  },

  uploadPostImage: async (uri: string, postId: string): Promise<string> => {
    const folder = `social-platform/posts/${postId}`;
    const publicId = `post-${postId}-${Date.now()}`;
    return storageService.uploadImage(uri, folder, publicId);
  },

  uploadAvatar: async (uri: string, userId: string): Promise<string> => {
    const folder = `social-platform/avatars/${userId}`;
    const publicId = `avatar-${userId}`;
    return storageService.uploadImage(uri, folder, publicId);
  },

  /**
   * Delete image from Cloudinary
   * Note: This requires backend implementation for security
   */
  deleteImage: async (publicId: string): Promise<void> => {
    try {
      // Cloudinary deletion should be handled by backend
      // This is a placeholder
      console.warn('Image deletion should be handled by backend');
      throw new Error('Image deletion should be handled by backend');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete image');
    }
  },
};

