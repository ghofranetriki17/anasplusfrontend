import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { FontAwesome, MaterialIcons, Entypo } from '@expo/vector-icons'; // Expo vector icons

const BranchDetailScreen = ({ route, navigation }) => {
  const { branch } = route.params;
  const [loading, setLoading] = useState(false);

  const formatTime = (time) => {
    if (!time) return 'Closed';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  // Days ordered Mon to Sun
  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  // Sort availabilities by day order
  const sortedAvailabilities = branch.availabilities?.sort(
    (a, b) => daysOfWeek.indexOf(a.day_of_week) - daysOfWeek.indexOf(b.day_of_week)
  );

  // Create a map day => availability for quick lookup
  const availabilityMap = {};
  if (sortedAvailabilities) {
    sortedAvailabilities.forEach((avail) => {
      availabilityMap[avail.day_of_week] = avail;
    });
  }

  // Get today's day name string (e.g. Monday)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Fallback coordinates and Plus Code
  const fallbackLatitude = 34.7745429;
  const fallbackLongitude = 10.7338536;
  const fallbackPlusCode = 'QPFM+RG9, Sfax';

  // Use branch coordinates or fallback
  const latitude = branch.latitude || fallbackLatitude;
  const longitude = branch.longitude || fallbackLongitude;

  // Open map app with coords or plus code
  const openMapApp = () => {
    let url = '';
    if (branch.latitude && branch.longitude) {
      // Open by coordinates
      url = Platform.select({
        ios: `maps://maps.apple.com/?ll=${latitude},${longitude}`,
        android: `geo:${latitude},${longitude}`,
      });
    } else {
      // Open by Plus Code fallback
      const query = encodeURIComponent(fallbackPlusCode);
      url = Platform.select({
        ios: `maps://maps.apple.com/?q=${query}`,
        android: `geo:0,0?q=${query}`,
      });
    }
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Enhanced Header with Map */}
      <View style={styles.headerCard}>
        <Text style={styles.branchName}>{branch.name}</Text>

        <MapView
          style={styles.map}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker coordinate={{ latitude, longitude }} />
        </MapView>

        <View style={styles.infoRow}>
          <Entypo name="location-pin" size={20} color="#FF3B30" />
          <Text style={styles.branchInfo}>
            {branch.address && branch.city ? `${branch.address}, ${branch.city}` : fallbackPlusCode}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <FontAwesome name="phone" size={20} color="#FF3B30" />
          <Text style={styles.branchInfo}>{branch.phone}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="email" size={20} color="#FF3B30" />
          <Text style={styles.branchInfo}>{branch.email}</Text>
        </View>

        <TouchableOpacity onPress={openMapApp} style={styles.openMapButton}>
          <Text style={styles.openMapText}>Open in Maps</Text>
        </TouchableOpacity>
      </View>

      {/* Opening Hours Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Opening Hours</Text>

        {loading ? (
          <ActivityIndicator size="small" color="#FF3B30" />
        ) : sortedAvailabilities && sortedAvailabilities.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10 }}
          >
            {daysOfWeek.map((day) => {
              const dayData = availabilityMap[day];
              const isToday = day === today;
              const isClosed = dayData?.is_closed;

              return (
                <View key={day} style={[styles.dayCell, isToday && styles.todayCell]}>
                  <Text style={[styles.dayName, isToday && styles.todayDayName]}>
                    {day.slice(0, 3)}
                  </Text>
                  <Text style={[styles.timeText, isClosed && styles.closedText]}>
                    {dayData
                      ? isClosed
                        ? 'Closed'
                        : `${formatTime(dayData.opening_hour)} - ${formatTime(dayData.closing_hour)}`
                      : 'No data'}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={styles.noDataText}>No availability information available</Text>
        )}
      </View>

      {/* Machines Section */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.machinesButton}
          onPress={() => navigation.navigate('MachineList', { branch })}
        >
          <Text style={styles.machinesButtonText}>View All Machines</Text>
          <FontAwesome name="chevron-right" size={16} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212', // dark background
  },

  // Header Card styles
  headerCard: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  branchName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
  map: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  branchInfo: {
    color: '#CCCCCC',
    fontSize: 16,
    marginLeft: 8,
    flexShrink: 1,
  },
  openMapButton: {
    marginTop: 10,
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  openMapText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Opening hours styles
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#FF3B30',
  },
  dayCell: {
    width: 110,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  todayCell: {
    backgroundColor: '#FF3B30',
  },
  dayName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  todayDayName: {
    color: '#121212',
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 6,
    textAlign: 'center',
  },
  closedText: {
    color: '#FF6F61',
    fontWeight: '700',
  },
  noDataText: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 10,
  },

  // Machines button
  machinesButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  machinesButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500',
  },
});

export default BranchDetailScreen;
