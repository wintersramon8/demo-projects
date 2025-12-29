import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../types';
import { formatPostDate } from '../utils/dateUtils';

interface PostCardProps {
  post: Post;
  onPress: () => void;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onProfilePress: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPress,
  onLike,
  onComment,
  onShare,
  onProfilePress,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={onProfilePress}
          activeOpacity={0.7}
        >
          {post.userAvatar ? (
            <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {post.userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{post.userName}</Text>
            <Text style={styles.timestamp}>{formatPostDate(post.createdAt)}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <Text style={styles.content}>{post.content}</Text>
        {post.imageUrl && (
          <Image source={{ uri: post.imageUrl }} style={styles.image} />
        )}
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onLike}
          activeOpacity={0.7}
        >
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={post.isLiked ? '#FF6B6B' : '#666'}
          />
          <Text
            style={[
              styles.actionText,
              post.isLiked && styles.actionTextActive,
            ]}
          >
            {post.likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onComment}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#666" />
          <Text style={styles.actionText}>{post.commentsCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onShare}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={24} color="#666" />
          <Text style={styles.actionText}>{post.sharesCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  content: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 22,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  actionTextActive: {
    color: '#FF6B6B',
  },
});

