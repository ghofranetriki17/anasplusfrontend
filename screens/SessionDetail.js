import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SessionDetail = ({ route, navigation }) => {
  const { session } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{session.title}</Text>
        <Text style={styles.subtitle}>
          {new Date(session.session_date).toLocaleString()} • {session.duration} min
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Détails de la session</Text>
        <View style={styles.detailRow}>
          <Ionicons name="person" size={20} color="#FF3B30" />
          <Text style={styles.detailText}>Coach: {session.coach?.name || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="book" size={20} color="#FF3B30" />
          <Text style={styles.detailText}>Cours: {session.course?.name || 'N/A'}</Text>
        </View>
        {session.is_for_women && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Session Femmes</Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.bookButton}
        onPress={() => navigation.navigate('SessionBooking', { session })}
      >
        <Text style={styles.bookButtonText}>Réserver cette session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 10,
  },
  badge: {
    backgroundColor: 'rgba(255, 105, 180, 0.2)',
    padding: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FF69B4',
  },
  badgeText: {
    color: '#FF69B4',
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SessionDetail;