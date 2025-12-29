import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSocialStore } from '../store/socialStore';
import { storageService } from '../services/storageService';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CreatePostScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { addPost, currentUser, loading } = useSocialStore();
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'Please log in to create a post');
      return;
    }

    setUploading(true);
    try {
      let imageUrl: string | undefined;
      
      // Upload image if selected
      if (imageUri) {
        // Create a temporary post ID for the image path
        const tempPostId = `temp-${Date.now()}`;
        imageUrl = await storageService.uploadPostImage(imageUri, tempPostId);
      }

      // Create post (Firebase will generate the ID)
      await addPost({
        content: content.trim(),
        imageUrl,
      });

      setContent('');
      setImageUri(null);
      Alert.alert('Success', 'Post created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create post');
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
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading || uploading || !content.trim()}
        >
          {loading || uploading ? (
            <ActivityIndicator size="small" color="#4ECDC4" />
          ) : (
            <Text style={[styles.postButton, (!content.trim() && styles.postButtonDisabled)]}>
              Post
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.userInfo}>
            {currentUser?.avatar ? (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {currentUser?.name.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <Text style={styles.userName}>{currentUser?.name || 'User'}</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            placeholderTextColor="#999"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            autoFocus
            editable={!uploading}
          />

          {imageUri && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setImageUri(null)}
              >
                <Ionicons name="close-circle" size={24} color="#ff4444" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePickImage}
              disabled={uploading}
            >
              <Ionicons name="image-outline" size={24} color="#4ECDC4" />
              <Text style={styles.actionText}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} disabled>
              <Ionicons name="location-outline" size={24} color="#ccc" />
              <Text style={[styles.actionText, { color: '#ccc' }]}>Location</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  postButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    padding: 16,
    minHeight: 200,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  imageContainer: {
    position: 'relative',
    margin: 16,
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
  postButtonDisabled: {
    opacity: 0.5,
  },
});

