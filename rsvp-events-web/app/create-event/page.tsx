'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEventStore } from '@/lib/store/eventStore';
import { storageService } from '@/lib/services/storageService';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function CreateEventPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const { addEvent, currentUser, loading, setCurrentUser } = useEventStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'Technology',
    maxAttendees: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const categories = ['Technology', 'Networking', 'Business', 'Social', 'Education', 'Other'];

  useEffect(() => {
    if (userProfile) {
      setCurrentUser({
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        avatar: userProfile.avatar,
      });
    }
  }, [userProfile, setCurrentUser]);

  // Redirect to login if not authenticated (only after auth has finished loading)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handlePickImage = async () => {
    try {
      const file = await storageService.pickImage();
      if (file) {
        setImageFile(file);
        const preview = URL.createObjectURL(file);
        setImagePreview(preview);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to pick image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    if (!currentUser) {
      alert('Please log in to create an event');
      return;
    }

    setUploading(true);
    try {
      let imageUrl: string | undefined;
      
      // Upload image if selected
      if (imageFile) {
        // Create a temporary event ID for the image path
        const tempEventId = `temp-${Date.now()}`;
        imageUrl = await storageService.uploadEventImage(imageFile, tempEventId);
      }

      // Create event (Firebase will generate the ID)
      await addEvent({
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        organizer: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
        },
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        category: formData.category,
        tags: [],
        imageUrl,
      });

      alert('Event created successfully!');
      router.push('/home');
    } catch (error: any) {
      alert(error.message || 'Failed to create event');
    } finally {
      setUploading(false);
    }
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (handled by useEffect, but show nothing while redirecting)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h1 className="ml-4 text-xl font-bold text-gray-900">Create Event</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter event title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Describe your event"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Date *
              </label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Time *
              </label>
              <input
                type="time"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Location *
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Event location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Event Image (Optional)
            </label>
            {imagePreview ? (
              <div className="relative">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={600}
                  height={300}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100"
                >
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePickImage}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-teal-500 transition-colors"
              >
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">Pick an image</p>
              </button>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setFormData({ ...formData, category })}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    formData.category === category
                      ? 'bg-teal-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-teal-500'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Max Attendees */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Max Attendees (Optional)
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Leave empty for unlimited"
              value={formData.maxAttendees}
              onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading || uploading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

