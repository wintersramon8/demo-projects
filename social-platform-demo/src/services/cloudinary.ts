import Constants from 'expo-constants';

/**
 * Cloudinary configuration
 * Get these from your Cloudinary dashboard: https://cloudinary.com/console
 */
export const cloudinaryConfig = {
  cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || Constants.expoConfig?.extra?.cloudinaryCloudName,
  uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || Constants.expoConfig?.extra?.cloudinaryUploadPreset,
  apiKey: process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || Constants.expoConfig?.extra?.cloudinaryApiKey,
};

// Validate configuration
if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
  console.warn(
    '⚠️ Cloudinary configuration is missing!\n\n' +
    'Please set up your Cloudinary configuration:\n' +
    '1. Create a .env file in the project root with:\n' +
    '   EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name\n' +
    '   EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset\n' +
    '   EXPO_PUBLIC_CLOUDINARY_API_KEY=your-api-key (optional for unsigned uploads)\n\n' +
    '2. Or add the config to app.json under expo.extra\n\n' +
    'Get your credentials from: https://cloudinary.com/console'
  );
}

/**
 * Upload image to Cloudinary
 */
export const uploadToCloudinary = async (
  uri: string,
  folder: string,
  publicId?: string
): Promise<string> => {
  if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
    throw new Error(
      'Cloudinary configuration not found. Please set up your Cloudinary credentials. ' +
      'See the console warning for instructions.'
    );
  }

  try {
    // Convert image URI to FormData
    const formData = new FormData();
    
    // Extract filename from URI or use default
    const filename = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // @ts-ignore - FormData.append accepts File or Blob
    formData.append('file', {
      uri,
      type,
      name: filename,
    } as any);

    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', folder);
    
    if (publicId) {
      formData.append('public_id', publicId);
    }

    // Note: Transformations should be configured in the upload preset, not here
    // For unsigned uploads, only specific parameters are allowed

    // Upload to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url || data.url;
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error(error.message || 'Failed to upload image to Cloudinary');
  }
};

/**
 * Delete image from Cloudinary
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  if (!cloudinaryConfig.cloudName || !cloudinaryConfig.apiKey) {
    throw new Error(
      'Cloudinary API key is required for deletion. Please set EXPO_PUBLIC_CLOUDINARY_API_KEY.'
    );
  }

  try {
    // Note: Deletion requires API key and secret
    // For client-side deletion, you might want to use a backend endpoint
    // This is a placeholder - implement based on your needs
    console.warn('Cloudinary deletion from client-side requires backend endpoint');
    throw new Error('Image deletion should be handled by backend');
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete image from Cloudinary');
  }
};

