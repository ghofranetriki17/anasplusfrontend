import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // ✅ Import depuis Expo vector icons

const BranchDetailScreen = ({ route, navigation }) => {
  const { branch } = route.params;
  const [loading, setLoading] = useState(false);

  const formatTime = (time) => {
    if (!time) return 'Closed';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const sortedAvailabilities = branch.availabilities?.sort((a, b) => {
    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    return days.indexOf(a.day_of_week) - days.indexOf(b.day_of_week);
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.branchName}>{branch.name}</Text>
        <Text style={styles.branchInfo}>
          {branch.address}, {branch.city}
        </Text>
        <Text style={styles.branchInfo}>Phone: {branch.phone}</Text>
        <Text style={styles.branchInfo}>Email: {branch.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Opening Hours</Text>

        {loading ? (
          <ActivityIndicator size="small" color="#007bff" />
        ) : sortedAvailabilities && sortedAvailabilities.length > 0 ? (
          sortedAvailabilities.map((day) => (
            <View key={day.day_of_week} style={styles.dayRow}>
              <Text style={styles.dayText}>{day.day_of_week}</Text>
              {day.is_closed ? (
                <Text style={styles.closedText}>Closed</Text>
              ) : (
                <Text style={styles.timeText}>
                  {formatTime(day.opening_hour)} - {formatTime(day.closing_hour)}
                </Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>
            No availability information available
          </Text>
        )}
      </View>

      {/* Machines Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Machines</Text>
        <TouchableOpacity
          style={styles.machinesButton}
          onPress={() => navigation.navigate('MachineList', { branch })}
        >
          <Text style={styles.machinesButtonText}>View All Machines</Text>
          <FontAwesome name="chevron-right" size={16} color="#007bff" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  branchName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  branchInfo: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dayText: {
    fontSize: 16,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  closedText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'red',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  machinesButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  machinesButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '500',
  },
});

export default BranchDetailScreen;
