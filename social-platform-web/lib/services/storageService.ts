import { uploadToCloudinary } from './cloudinary';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const MAX_WIDTH = 1920; // Maximum width for resized images
const MAX_HEIGHT = 1920; // Maximum height for resized images
const COMPRESSION_QUALITY = 0.85; // JPEG quality (0-1)

/**
 * Compress and resize image if needed
 */
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    // If file is already small enough, return as-is
    if (file.size <= MAX_FILE_SIZE) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          } else {
            width = (width * MAX_HEIGHT) / height;
            height = MAX_HEIGHT;
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to create canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Create a new File from the blob
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            // If still too large, try with lower quality
            if (compressedFile.size > MAX_FILE_SIZE) {
              canvas.toBlob(
                (lowQualityBlob) => {
                  if (!lowQualityBlob) {
                    reject(new Error('Failed to compress image'));
                    return;
                  }
                  const finalFile = new File([lowQualityBlob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  resolve(finalFile);
                },
                'image/jpeg',
                0.7 // Lower quality
              );
            } else {
              resolve(compressedFile);
            }
          },
          'image/jpeg',
          COMPRESSION_QUALITY
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const storageService = {
  /**
   * Pick an image from file input
   */
  pickImage: (): Promise<File | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        resolve(file || null);
      };
      input.click();
    });
  },

  /**
   * Upload image to Cloudinary
   * Automatically compresses/resizes if file is too large
   */
  uploadImage: async (
    file: File,
    folder: string,
    publicId?: string
  ): Promise<string> => {
    try {
      // Check file size and compress if needed
      let fileToUpload = file;
      
      if (file.size > MAX_FILE_SIZE) {
        // Compress the image
        fileToUpload = await compressImage(file);
        
        // If still too large after compression, throw error
        if (fileToUpload.size > MAX_FILE_SIZE) {
          throw new Error(
            `Image is too large (${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB). ` +
            `Maximum size is ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB. ` +
            `Please try a smaller image.`
          );
        }
      }
      
      return await uploadToCloudinary(fileToUpload, folder, publicId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload image');
    }
  },

  /**
   * Upload post image
   */
  uploadPostImage: async (file: File, postId: string): Promise<string> => {
    const folder = `social-platform/posts/${postId}`;
    const publicId = `post-${postId}-${Date.now()}`;
    return storageService.uploadImage(file, folder, publicId);
  },

  /**
   * Upload user avatar
   */
  uploadAvatar: async (file: File, userId: string): Promise<string> => {
    const folder = `social-platform/avatars/${userId}`;
    const publicId = `avatar-${userId}`;
    return storageService.uploadImage(file, folder, publicId);
  },

  /**
   * Delete image from Cloudinary
   * Note: This requires backend implementation for security
   */
  deleteImage: async (publicId: string): Promise<void> => {
    try {
      console.warn('Image deletion should be handled by backend');
      throw new Error('Image deletion should be handled by backend');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete image');
    }
  },
};

