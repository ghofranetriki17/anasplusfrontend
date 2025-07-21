import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { workoutAPI } from '../services/api';

const WorkoutListScreen = ({ navigation }) => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const data = await workoutAPI.getAll();
        setWorkouts(data);
      } catch (error) {
        console.error('Error fetching workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('WorkoutDetails', { workout: item })}
    >
      <Text style={styles.date}>{item.date || 'Date N/A'}</Text>
      <Text style={styles.titleText}>{item.title}</Text>
      <Text style={styles.detailText}>User: {item.user?.name || 'N/A'}</Text>
      <Text style={styles.detailText}>Duration: {item.duration} min</Text>
      <Text style={styles.detailText}>Water: {item.water_consumption} L</Text>
      <Text style={styles.detailText}>Notes: {item.notes}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Workout History</Text>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  item: { padding: 16, backgroundColor: '#f1f1f1', borderRadius: 10, marginBottom: 12 },
  date: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: '#000' },
  titleText: { fontSize: 18, fontWeight: '600', color: '#1a1a1a', marginBottom: 6 },
  detailText: { fontSize: 14, color: '#555', marginBottom: 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default WorkoutListScreen;
