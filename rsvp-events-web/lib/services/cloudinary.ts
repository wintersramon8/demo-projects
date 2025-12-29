/**
 * Cloudinary configuration
 * Get these from your Cloudinary dashboard: https://cloudinary.com/console
 */
export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '',
};

// Validate configuration
if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
  console.warn(
    '⚠️ Cloudinary configuration is missing!\n\n' +
    'Please set up your Cloudinary configuration in .env.local:\n' +
    '   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name\n' +
    '   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset\n' +
    '   NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key (optional for unsigned uploads)\n\n' +
    'Get your credentials from: https://cloudinary.com/console'
  );
}

/**
 * Upload image to Cloudinary
 */
export const uploadToCloudinary = async (
  file: File,
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
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', folder);

    if (publicId) {
      formData.append('public_id', publicId);
    }

    // Upload to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      // Provide user-friendly error messages
      if (error.error?.message?.includes('File size too large')) {
        throw new Error(
          `Image is too large. Maximum size is 10MB. ` +
          `The image will be automatically compressed, but if it's still too large, please try a smaller image.`
        );
      }
      throw new Error(error.error?.message || 'Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url || data.url;
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error(error.message || 'Failed to upload image to Cloudinary');
  }
};

