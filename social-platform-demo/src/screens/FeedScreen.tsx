import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSocialStore } from '../store/socialStore';
import { PostCard } from '../components/PostCard';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const FeedScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { posts, currentUser, toggleLike, loadPosts, loading } = useSocialStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }, [loadPosts]);

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      if (dateB !== dateA) {
        return dateB - dateA; // Newest first
      }
      // If dates are equal, sort by ID for consistent ordering
      return b.id.localeCompare(a.id);
    });
  }, [posts]);

  const handleLike = async (postId: string) => {
    try {
      await toggleLike(postId);
    } catch (error: any) {
      console.error('Failed to toggle like:', error);
    }
  };

  const renderPost = ({ item }: { item: typeof posts[0] }) => (
    <PostCard
      post={item}
      onPress={() => navigation.navigate('PostDetails', { postId: item.id })}
      onLike={() => handleLike(item.id)}
      onComment={() => navigation.navigate('PostDetails', { postId: item.id })}
      onShare={() => {}}
      onProfilePress={() =>
        navigation.navigate('Profile', { userId: item.userId })
      }
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Social Feed</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Ionicons name="create-outline" size={24} color="#4ECDC4" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() =>
              navigation.navigate('Profile', { userId: currentUser?.id })
            }
          >
            <Ionicons name="person-circle-outline" size={24} color="#4ECDC4" />
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
        </View>
      ) : (
        <FlatList
          data={sortedPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No posts yet</Text>
              <Text style={styles.emptySubtext}>Be the first to share something!</Text>
            </View>
          }
        />
      )}
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
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 4,
  },
  listContent: {
    padding: 12,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
});

