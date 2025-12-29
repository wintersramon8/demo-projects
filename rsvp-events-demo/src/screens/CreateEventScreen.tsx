import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEventStore } from '../store/eventStore';
import { storageService } from '../services/storageService';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CreateEventScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { addEvent, currentUser, loading } = useEventStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'Technology',
    maxAttendees: '',
  });
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const categories = ['Technology', 'Networking', 'Business', 'Social', 'Education', 'Other'];

  const handlePickImage = async () => {
    try {
      const uri = await storageService.pickImage();
      if (uri) {
        setImageUri(uri);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick image');
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'Please log in to create an event');
      return;
    }

    setUploading(true);
    try {
      let imageUrl: string | undefined;
      
      // Upload image if selected
      if (imageUri) {
        // Create a temporary event ID for the image path
        const tempEventId = `temp-${Date.now()}`;
        imageUrl = await storageService.uploadEventImage(imageUri, tempEventId);
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

      Alert.alert('Success', 'Event created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create event');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Event</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter event title"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your event"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Time *</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                value={formData.time}
                onChangeText={(text) => setFormData({ ...formData, time: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="Event location"
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Image (Optional)</Text>
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setImageUri(null)}
                >
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={handlePickImage}
              >
                <Ionicons name="image-outline" size={32} color="#4ECDC4" />
                <Text style={styles.imagePickerText}>Pick an image</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    formData.category === category && styles.categoryButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, category })}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      formData.category === category && styles.categoryButtonTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Max Attendees (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Leave empty for unlimited"
              value={formData.maxAttendees}
              onChangeText={(text) => setFormData({ ...formData, maxAttendees: text })}
              keyboardType="numeric"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, (loading || uploading) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading || uploading}
        >
          {loading || uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Event</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  row: {
    flexDirection: 'row',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  imageContainer: {
    position: 'relative',
    marginTop: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 4,
  },
  imagePickerButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  imagePickerText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
});

