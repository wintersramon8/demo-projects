import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useEventStore } from '../store/eventStore';
import { RootStackParamList } from '../types';
import { formatEventDate } from '../utils/dateUtils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type EventDetailsRouteProp = RouteProp<RootStackParamList, 'EventDetails'>;

export const EventDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EventDetailsRouteProp>();
  const { eventId } = route.params;
  
  const { events, currentUser, rsvps, setRSVP, loadRSVPs, loading } = useEventStore();
  const event = events.find((e) => e.id === eventId);
  
  const userRSVP = rsvps.find(
    (r) => r.eventId === eventId && r.userId === currentUser?.id
  );
  
  const [rsvpStatus, setRsvpStatus] = useState<'going' | 'maybe' | 'not-going' | null>(
    userRSVP?.status || null
  );

  React.useEffect(() => {
    if (eventId) {
      loadRSVPs(eventId);
    }
  }, [eventId]);

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleRSVP = async (status: 'going' | 'maybe' | 'not-going') => {
    if (!currentUser) {
      Alert.alert('Error', 'Please log in to RSVP');
      return;
    }

    if (!event) {
      Alert.alert('Error', 'Event not found');
      return;
    }

    try {
      await setRSVP(event.id, status);
      setRsvpStatus(status);
      await loadRSVPs(event.id);
      Alert.alert('Success', `You've marked yourself as ${status === 'going' ? 'going' : status === 'maybe' ? 'maybe' : 'not going'}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update RSVP');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>

        {event.imageUrl && (
          <Image source={{ uri: event.imageUrl }} style={styles.image} />
        )}

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
            <Text style={styles.title}>{event.title}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#4ECDC4" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date & Time</Text>
                <Text style={styles.infoValue}>{formatEventDate(event.date, event.time)}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#4ECDC4" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{event.location}</Text>
                {event.locationDetails?.address && (
                  <Text style={styles.infoSubtext}>{event.locationDetails.address}</Text>
                )}
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={20} color="#4ECDC4" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Attendees</Text>
                <Text style={styles.infoValue}>
                  {event.rsvpCount} {event.maxAttendees ? `of ${event.maxAttendees}` : ''} attending
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#4ECDC4" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Organizer</Text>
                <Text style={styles.infoValue}>{event.organizer.name}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {event.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {event.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.rsvpSection}>
            <Text style={styles.sectionTitle}>RSVP</Text>
            <View style={styles.rsvpButtons}>
              <TouchableOpacity
                style={[
                  styles.rsvpButton,
                  rsvpStatus === 'going' && styles.rsvpButtonActive,
                ]}
                onPress={() => handleRSVP('going')}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={rsvpStatus === 'going' ? '#fff' : '#4ECDC4'}
                />
                <Text
                  style={[
                    styles.rsvpButtonText,
                    rsvpStatus === 'going' && styles.rsvpButtonTextActive,
                  ]}
                >
                  Going
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.rsvpButton,
                  rsvpStatus === 'maybe' && styles.rsvpButtonActive,
                ]}
                onPress={() => handleRSVP('maybe')}
              >
                <Ionicons
                  name="help-circle"
                  size={20}
                  color={rsvpStatus === 'maybe' ? '#fff' : '#4ECDC4'}
                />
                <Text
                  style={[
                    styles.rsvpButtonText,
                    rsvpStatus === 'maybe' && styles.rsvpButtonTextActive,
                  ]}
                >
                  Maybe
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.rsvpButton,
                  rsvpStatus === 'not-going' && styles.rsvpButtonActive,
                ]}
                onPress={() => handleRSVP('not-going')}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={rsvpStatus === 'not-going' ? '#fff' : '#4ECDC4'}
                />
                <Text
                  style={[
                    styles.rsvpButtonText,
                    rsvpStatus === 'not-going' && styles.rsvpButtonTextActive,
                  ]}
                >
                  Can't Go
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5F4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 36,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  infoSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  rsvpSection: {
    marginBottom: 40,
  },
  rsvpButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rsvpButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    backgroundColor: '#fff',
  },
  rsvpButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  rsvpButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  rsvpButtonTextActive: {
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

