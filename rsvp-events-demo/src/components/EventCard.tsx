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
import { Event } from '../types';
import { formatShortDate, getEventStatus } from '../utils/dateUtils';

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const status = getEventStatus(event.date, event.time);
  const statusColor = status === 'past' ? '#999' : status === 'today' ? '#FF6B6B' : '#4ECDC4';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {event.imageUrl && (
        <Image source={{ uri: event.imageUrl }} style={styles.image} />
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{status.toUpperCase()}</Text>
          </View>
          <Text style={styles.category}>{event.category}</Text>
        </View>
        
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {event.description}
        </Text>
        
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {formatShortDate(event.date)} • {event.time}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.detailText} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {event.rsvpCount} {event.maxAttendees ? `/ ${event.maxAttendees}` : ''} attending
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
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
    height: 180,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  category: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
});

