import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSocialStore } from '../store/socialStore';
import { RootStackParamList } from '../types';
import { formatPostDate } from '../utils/dateUtils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PostDetailsRouteProp = RouteProp<RootStackParamList, 'PostDetails'>;

export const PostDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PostDetailsRouteProp>();
  const { postId } = route.params;
  
  const { posts, comments, currentUser, toggleLike, addComment, getPostComments, loadComments, loading } =
    useSocialStore();
  const post = posts.find((p) => p.id === postId);
  const postComments = post ? getPostComments(post.id) : [];
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (postId) {
      loadComments(postId);
    }
  }, [postId]);

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Post not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddComment = async () => {
    if (!commentText.trim() || !currentUser || !post) return;

    setSubmitting(true);
    try {
      await addComment(post.id, commentText.trim());
      setCommentText('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    try {
      await toggleLike(post.id);
    } catch (error: any) {
      console.error('Failed to toggle like:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={90}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              {post.userAvatar ? (
                <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {post.userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.postUserInfo}>
                <Text style={styles.postUserName}>{post.userName}</Text>
                <Text style={styles.postTimestamp}>
                  {formatPostDate(post.createdAt)}
                </Text>
              </View>
            </View>

            <Text style={styles.postContent}>{post.content}</Text>
            {post.imageUrl && (
              <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
            )}

            <View style={styles.postActions}>
              <TouchableOpacity
                style={styles.postActionButton}
                onPress={handleLike}
              >
                <Ionicons
                  name={post.isLiked ? 'heart' : 'heart-outline'}
                  size={24}
                  color={post.isLiked ? '#FF6B6B' : '#666'}
                />
                <Text
                  style={[
                    styles.postActionText,
                    post.isLiked && styles.postActionTextActive,
                  ]}
                >
                  {post.likesCount}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.postActionButton}>
                <Ionicons name="chatbubble-outline" size={24} color="#666" />
                <Text style={styles.postActionText}>{post.commentsCount}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.postActionButton}>
                <Ionicons name="share-outline" size={24} color="#666" />
                <Text style={styles.postActionText}>{post.sharesCount}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>
              Comments ({postComments.length})
            </Text>
            {postComments.map((comment) => (
              <View key={comment.id} style={styles.comment}>
                {comment.userAvatar ? (
                  <Image
                    source={{ uri: comment.userAvatar }}
                    style={styles.commentAvatar}
                  />
                ) : (
                  <View style={styles.commentAvatarPlaceholder}>
                    <Text style={styles.commentAvatarText}>
                      {comment.userName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.commentContent}>
                  <Text style={styles.commentUserName}>{comment.userName}</Text>
                  <Text style={styles.commentText}>{comment.content}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.commentInputContainer}>
          {currentUser?.avatar ? (
            <View style={styles.commentInputAvatarPlaceholder}>
              <Text style={styles.commentInputAvatarText}>
                {currentUser.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          ) : (
            <View style={styles.commentInputAvatarPlaceholder}>
              <Text style={styles.commentInputAvatarText}>
                {currentUser?.name.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment..."
            placeholderTextColor="#999"
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.commentSendButton,
              (!commentText.trim() || submitting) && styles.commentSendButtonDisabled,
            ]}
            onPress={handleAddComment}
            disabled={!commentText.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#4ECDC4" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={commentText.trim() ? '#4ECDC4' : '#ccc'}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    padding: 16,
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  postCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  postUserInfo: {
    flex: 1,
  },
  postUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  postTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  postContent: {
    fontSize: 16,
    color: '#1a1a1a',
    lineHeight: 24,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 24,
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postActionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  postActionTextActive: {
    color: '#FF6B6B',
  },
  commentsSection: {
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 100,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  commentContent: {
    flex: 1,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  commentInputAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentInputAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  commentInput: {
    flex: 1,
    maxHeight: 100,
    fontSize: 14,
    color: '#1a1a1a',
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  commentSendButton: {
    padding: 8,
  },
  commentSendButtonDisabled: {
    opacity: 0.5,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },
});

