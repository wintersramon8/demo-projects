import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSocialStore } from '../store/socialStore';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ProfileRouteProp = RouteProp<RootStackParamList, 'Profile'>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ProfileRouteProp>();
  const { userId } = route.params || {};
  const { user } = useAuth();
  
  const { users, currentUser, getUserPosts, toggleFollow, loadUser, loadUserPosts, loading } = useSocialStore();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  
  const profileUserId = userId || currentUser?.id;
  const profileUser = userId
    ? users.find((u) => u.id === userId) || currentUser
    : currentUser;
  
  const isOwnProfile = !userId || userId === currentUser?.id;
  const userPosts = profileUser ? getUserPosts(profileUser.id) : [];

  useEffect(() => {
    if (userId && userId !== currentUser?.id) {
      loadUser(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (profileUser) {
      loadUserPosts(profileUser.id);
    }
  }, [profileUser]);

  const handleFollow = async () => {
    if (!userId || !currentUser) return;
    
    setLoadingFollow(true);
    try {
      await toggleFollow(userId);
      setIsFollowing(!isFollowing);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update follow status');
    } finally {
      setLoadingFollow(false);
    }
  };

  if (!profileUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#4ECDC4" />
          ) : (
            <Text style={styles.errorText}>User not found</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {profileUser.avatar ? (
              <Image source={{ uri: profileUser.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {profileUser.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.name}>{profileUser.name}</Text>
          <Text style={styles.username}>@{profileUser.username}</Text>
          {profileUser.bio && (
            <Text style={styles.bio}>{profileUser.bio}</Text>
          )}
        </View>

        <View style={styles.statsSection}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() =>
              !isOwnProfile &&
              navigation.navigate('Connections', {
                userId: profileUser.id,
                type: 'followers',
              })
            }
          >
            <Text style={styles.statNumber}>{profileUser.followersCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() =>
              !isOwnProfile &&
              navigation.navigate('Connections', {
                userId: profileUser.id,
                type: 'following',
              })
            }
          >
            <Text style={styles.statNumber}>{profileUser.followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{profileUser.postsCount}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
        </View>

        {!isOwnProfile && (
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[
                styles.followButton,
                profileUser.isFollowing && styles.followButtonActive,
              ]}
              onPress={handleFollow}
              disabled={loadingFollow}
            >
              <Text
                style={[
                  styles.followButtonText,
                  profileUser.isFollowing && styles.followButtonTextActive,
                ]}
              >
                {profileUser.isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.postsSection}>
          <Text style={styles.sectionTitle}>Posts</Text>
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.postItem}
                onPress={() =>
                  navigation.navigate('PostDetails', { postId: post.id })
                }
              >
                {post.imageUrl && (
                  <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
                )}
                <View style={styles.postContent}>
                  <Text style={styles.postText} numberOfLines={3}>
                    {post.content}
                  </Text>
                  <View style={styles.postStats}>
                    <Ionicons name="heart" size={14} color="#999" />
                    <Text style={styles.postStatText}>{post.likesCount}</Text>
                    <Ionicons
                      name="chatbubble"
                      size={14}
                      color="#999"
                      style={{ marginLeft: 16 }}
                    />
                    <Text style={styles.postStatText}>{post.commentsCount}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No posts yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsSection: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4ECDC4',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  actionsSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  followButton: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  followButtonActive: {
    backgroundColor: '#4ECDC4',
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  followButtonTextActive: {
    color: '#fff',
  },
  postsSection: {
    backgroundColor: '#fff',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  postItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  postImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  postContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  postText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  postStatText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
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

