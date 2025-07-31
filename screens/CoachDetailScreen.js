import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { FontAwesome, MaterialIcons, Entypo, Ionicons } from '@expo/vector-icons';

const CoachDetailScreen = ({ route }) => {
  const { coach } = route.params;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Image
          source={{ uri: coach.photo_url || 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{coach.name}</Text>
        <Text style={styles.speciality}>
          {coach.specialities?.map((s) => s.name).join(', ') || 'No speciality'}
        </Text>
      </View>

      {/* Contact */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="call" size={20} color="#FF3B30" />
          <Text style={styles.sectionTitle}> Contact</Text>
        </View>
        <View style={styles.contactGrid}>
          <TouchableOpacity style={styles.contactCard}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="mail" size={24} color="#FFD700" />
            </View>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>{coach.email}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="call" size={24} color="#00FF88" />
            </View>
            <Text style={styles.contactLabel}>Téléphone</Text>
            <Text style={styles.contactValue}>{coach.phone}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bio */}
      {coach.bio && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color="#FF3B30" />
            <Text style={styles.sectionTitle}> Bio</Text>
          </View>
          <View style={styles.bioCard}>
            <Text style={styles.infoText}>{coach.bio}</Text>
          </View>
        </View>
      )}

      {/* Certifications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="school" size={20} color="#FF3B30" />
          <Text style={styles.sectionTitle}> Certifications</Text>
        </View>
        <View style={styles.bioCard}>
          <Text style={styles.infoText}>{coach.certifications || 'No certifications listed.'}</Text>
        </View>
      </View>

      {/* Availability */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar" size={20} color="#FF3B30" />
          <Text style={styles.sectionTitle}> Disponibilités</Text>
        </View>
        <View style={styles.availContainer}>
          {coach.availabilities?.length > 0 ? (
            coach.availabilities.map((a, i) => (
              <View key={i} style={styles.availBadge}>
                <Entypo name="calendar" size={14} color="#fff" />
                <Text style={styles.availText}>
                  {'  '}
                  {a.day_of_week.charAt(0).toUpperCase() + a.day_of_week.slice(1)}: {a.start_time} - {a.end_time}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.infoText}>No availability listed.</Text>
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="stats-chart" size={20} color="#FF3B30" />
          <Text style={styles.sectionTitle}> Statistiques</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statCard]}> 
            <Text style={styles.statValue}>⭐ {coach.rating || 'N/A'}</Text>
            <Text style={styles.statLabel}>Note</Text>
          </View>
          <View style={[styles.statCard]}>
            <Text style={styles.statValue}>{coach.total_sessions || 0}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={[styles.statCard]}>
            <Text style={styles.statValue}>{coach.total_earnings || 0} TND</Text>
            <Text style={styles.statLabel}>Revenus</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  heroSection: {
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FF3B30',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  speciality: {
    fontSize: 16,
    color: '#CCCCCC',
    marginTop: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginLeft: 8,
  },
  contactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  contactCard: {
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    width: '48%',
    alignItems: 'center',
  },
  contactIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  contactLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
    fontWeight: '600',
  },
  contactValue: {
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  bioCard: {
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  infoText: {
    color: '#CCCCCC',
    fontSize: 15,
    lineHeight: 20,
  },
  availContainer: {
    marginTop: 10,
  },
  availBadge: {
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  availText: {
    color: '#fff',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1A1A1A',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  statLabel: {
    color: '#CCCCCC',
    fontSize: 13,
    marginTop: 4,
  },
});

export default CoachDetailScreen;