import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEventStore } from '../store/eventStore';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { currentUser, events, getUserRSVPs } = useEventStore();
  
  const userRSVPs = currentUser ? getUserRSVPs(currentUser.id) : [];
  const userEvents = currentUser
    ? events.filter((e) => e.organizer.id === currentUser.id)
    : [];

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Please log in</Text>
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
            {currentUser.avatar ? (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.name}>{currentUser.name}</Text>
          <Text style={styles.email}>{currentUser.email}</Text>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userEvents.length}</Text>
            <Text style={styles.statLabel}>Events Created</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userRSVPs.length}</Text>
            <Text style={styles.statLabel}>RSVPs</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Events</Text>
          {userEvents.length > 0 ? (
            userEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventItem}
                onPress={() =>
                  navigation.navigate('EventDetails', { eventId: event.id })
                }
              >
                <View style={styles.eventItemContent}>
                  <Text style={styles.eventItemTitle}>{event.title}</Text>
                  <Text style={styles.eventItemDate}>
                    {event.date} • {event.time}
                  </Text>
                  <Text style={styles.eventItemLocation}>{event.location}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No events created yet</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('CreateEvent')}
              >
                <Text style={styles.createButtonText}>Create Your First Event</Text>
              </TouchableOpacity>
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
  profileSection: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
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
  email: {
    fontSize: 14,
    color: '#666',
  },
  statsSection: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4ECDC4',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 12,
  },
  eventItemContent: {
    flex: 1,
  },
  eventItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  eventItemDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  eventItemLocation: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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

