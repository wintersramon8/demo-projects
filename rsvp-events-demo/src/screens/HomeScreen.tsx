import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEventStore } from '../store/eventStore';
import { EventCard } from '../components/EventCard';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabType = 'all' | 'my-rsvps';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { events, currentUser, getUserRSVPs, loadEvents, loadRSVPs, loading } = useEventStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvents();
    if (currentUser) {
      loadRSVPs(undefined, currentUser.id);
    }
  }, [currentUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    if (currentUser) {
      await loadRSVPs(undefined, currentUser.id);
    }
    setRefreshing(false);
  };

  const filteredEvents = useMemo(() => {
    if (activeTab === 'my-rsvps' && currentUser) {
      const userRSVPs = getUserRSVPs(currentUser.id);
      const rsvpEventIds = userRSVPs.map((rsvp) => rsvp.eventId);
      return events.filter((event) => rsvpEventIds.includes(event.id));
    }
    return events;
  }, [events, activeTab, currentUser, getUserRSVPs]);

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}:00`).getTime();
      const dateB = new Date(`${b.date}T${b.time || '00:00'}:00`).getTime();
      if (dateA !== dateB) {
        return dateA - dateB; // Earliest first
      }
      // If dates/times are equal, sort by createdAt for consistency
      const createdA = new Date(a.createdAt || 0).getTime();
      const createdB = new Date(b.createdAt || 0).getTime();
      if (createdA !== createdB) {
        return createdA - createdB;
      }
      // If everything is equal, sort by ID for consistency
      return a.id.localeCompare(b.id);
    });
  }, [filteredEvents]);

  const renderEvent = ({ item }: { item: typeof events[0] }) => (
    <EventCard
      event={item}
      onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Ramon!</Text>
          <Text style={styles.subtitle}>Discover events near you</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle-outline" size={32} color="#4ECDC4" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text
            style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}
          >
            All Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-rsvps' && styles.activeTab]}
          onPress={() => setActiveTab('my-rsvps')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'my-rsvps' && styles.activeTabText,
            ]}
          >
            My RSVPs
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
        </View>
      ) : (
        <FlatList
          data={sortedEvents}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No events found</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateEvent')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: '#4ECDC4',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});

