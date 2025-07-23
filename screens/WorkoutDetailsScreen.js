import React, { useState } from 'react'; 
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { workoutAPI, exerciseAPI } from '../services/api'; // Make sure exerciseAPI is imported!
const getAchievementNote = (value) => {
  if (value === 100) return 'Completed 🎉';
  if (value >= 76) return 'Nearly complete ⚡';
  if (value >= 51) return 'Almost done 🔥';
  if (value >= 26) return 'Getting there 🏃‍♂️';
  if (value >= 1) return 'Just started 💪';
  return 'Not started ❌';
};

const WorkoutDetailsScreen = ({ route, navigation }) => {
  const { workout: initialWorkout } = route.params;
  const [workout, setWorkout] = useState(initialWorkout);
  const [orderEdits, setOrderEdits] = useState({}); // track order edits keyed by exercise id

  // Function to update the pivot table for an exercise inside a workout
  const updateExercisePivot = async (exerciseId, updatedFields) => {
    try {
      await workoutAPI.updateExercisePivot(workout.id, exerciseId, updatedFields);
      setWorkout(prevWorkout => ({
        ...prevWorkout,
        exercises: prevWorkout.exercises.map(ex =>
          ex.id === exerciseId
            ? { ...ex, pivot: { ...ex.pivot, ...updatedFields } }
            : ex
        ),
      }));
    } catch (error) {
      console.error('Failed to update pivot:', error);
      Alert.alert('Error', 'Failed to update exercise data.');
    }
  };

  // Toggle done status function
  const toggleDoneStatus = async (exerciseId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await updateExercisePivot(exerciseId, { is_done: newStatus });
    } catch (error) {
      console.error('Failed to toggle done status:', error);
      Alert.alert('Error', 'Could not update exercise status. Please try again.');
    }
  };

  // Update order function
  const updateOrder = async (exerciseId) => {
    const newOrderStr = orderEdits[exerciseId];
    const newOrder = parseInt(newOrderStr);
    if (isNaN(newOrder)) {
      Alert.alert('Invalid input', 'Please enter a valid number for order.');
      return;
    }

    const currentOrder = workout.exercises.find(ex => ex.id === exerciseId)?.pivot?.order;
    if (newOrder === currentOrder) return; // no change

    try {
      await updateExercisePivot(exerciseId, { order: newOrder });
      Alert.alert('Success', 'Order updated!');
    } catch (error) {
      console.error('Failed to update order:', error);
      Alert.alert('Error', 'Failed to update order. Please try again.');
    }
  };

  const handleDeleteExercise = (exerciseId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to REMOVE this exercise from the workout AND DELETE it permanently?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await workoutAPI.removeExercise(workout.id, exerciseId);
              await exerciseAPI.delete(exerciseId);

              setWorkout((prevWorkout) => ({
                ...prevWorkout,
                exercises: prevWorkout.exercises.filter(ex => ex.id !== exerciseId),
              }));

              Alert.alert('Success', 'Exercise removed and deleted successfully.');
            } catch (error) {
              console.error('Failed to delete exercise:', error);
              Alert.alert('Error', 'Failed to remove and delete exercise. Please try again.');
            }
          }
        },
      ]
    );
  };

  const renderExercise = ({ item }) => {
    const isDone = item.pivot?.is_done;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          !isDone && { backgroundColor: '#1caa0dff' } // Red background if not done
        ]}
      >
        <Text style={[styles.title, !isDone && { color: '#FFF' }]}>{item.name}</Text>
        <Text style={[styles.subtitle, !isDone && { color: '#FFF' }]}>{item.title}</Text>

        <View style={styles.detailsContainer}>
          <Text style={[styles.detailLabel, !isDone && { color: '#EEE' }]}>Order :</Text>
          <TextInput
            style={[styles.detailValue, styles.orderInput, !isDone && { color: '#FFF', borderBottomColor: '#FFF' }]}
            keyboardType="numeric"
            value={
              orderEdits[item.id] !== undefined
                ? String(orderEdits[item.id])
                : String(item.pivot?.order || '')
            }
            onChangeText={(text) => {
              // Allow only numbers
              const cleanText = text.replace(/[^0-9]/g, '');
              setOrderEdits(prev => ({ ...prev, [item.id]: cleanText }));
            }}
            onEndEditing={() => updateOrder(item.id)}
            returnKeyType="done"
          />
        </View>

        {/* Done status tappable to toggle */}
        <TouchableOpacity
          style={styles.detailsContainer}
          onPress={() => toggleDoneStatus(item.id, isDone)}
        >
          <Text style={[styles.detailLabel, !isDone && { color: '#EEE' }]}>Done :</Text>
          <Text style={[styles.detailValue, !isDone && { color: '#121212' }]}>
            {isDone ? '✅' : '❌'}
          </Text>
        </TouchableOpacity>

        <View style={styles.detailsContainer}>
  <Text style={[styles.detailLabel, !isDone && { color: '#EEE' }]}>Achievement :</Text>

  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <TextInput
      style={[
        styles.input,
        !isDone && { color: '#FFF', borderBottomColor: '#FFF' },
        { width: 60, marginRight: 4 }
      ]}
      keyboardType="numeric"
      defaultValue={item.pivot?.achievement?.toString() || '0'}
      onEndEditing={(e) => {
        const val = parseFloat(e.nativeEvent.text);
        if (!isNaN(val) && val >= 0 && val <= 100) {
          updateExercisePivot(item.id, { achievement: val });
        } else {
          Alert.alert('Invalid', 'Achievement must be between 0 and 100');
        }
      }}
    />
    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>%</Text>
  </View>
</View>

{/* 🎯 Achievement Note Below */}
{typeof item.pivot?.achievement === 'number' && (
  <Text style={{ marginTop: 4, color: '#AAA', fontStyle: 'italic' }}>
    {getAchievementNote(item.pivot.achievement)}
  </Text>
)}


        {item.movement && (
          <TouchableOpacity
            style={[styles.relatedItem, !isDone && { borderColor: '#FFF', backgroundColor: '#144819ff' }]}
            onPress={() => navigation.navigate('MovementDetails', { movement: item.movement })}
          >
            <Text style={[styles.relatedLabel, !isDone && { color: '#FFF' }]}>Movement :</Text>
            <Text style={[styles.relatedValue, !isDone && { color: '#FFF' }]}>{item.movement.name} →</Text>
          </TouchableOpacity>
        )}

        {item.machine && (
          <TouchableOpacity
            style={[styles.relatedItem, !isDone && { borderColor: '#FFF', backgroundColor: '#144819ff' }]}
            onPress={() => navigation.navigate('MachineDetails', { machine: item.machine })}
          >
            <Text style={[styles.relatedLabel, !isDone && { color: '#FFF' }]}>Machine :</Text>
            <Text style={[styles.relatedValue, !isDone && { color: '#FFF' }]}>{item.machine.name} →</Text>
          </TouchableOpacity>
        )}

        {item.charge && (
          <TouchableOpacity
            style={[styles.relatedItem, !isDone && { borderColor: '#FFF', backgroundColor: '#144819ff' }]}
            onPress={() => navigation.navigate('ChargeDetails', { charge: item.charge })}
          >
            <Text style={[styles.relatedLabel, !isDone && { color: '#FFF' }]}>Charge :</Text>
            <Text style={[styles.relatedValue, !isDone && { color: '#FFF' }]}>{item.charge.name || item.charge.weight} </Text>
          </TouchableOpacity>
        )}

        <View style={styles.setsRepsContainer}>
          <Text style={[styles.setsReps, !isDone && { backgroundColor: '#FFF', color: '#FF3B30' }]}>
            {item.sets} sets × {item.reps} reps
          </Text>
        </View>

        {/* Delete button */}
        <TouchableOpacity
          style={[styles.deleteButton, !isDone && { backgroundColor: '#FFF' }]}
          onPress={() => handleDeleteExercise(item.id)}
        >
          <Text style={[styles.deleteButtonText, !isDone && { color: '#FF3B30' }]}>Delete Exercise</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.header}>Exercises of « {workout.title} »</Text>
      <Text style={styles.notes}>Notes: {workout.notes || 'No notes'}</Text>

      <View style={styles.workoutInfo}>
        <Text style={styles.infoText}>Duration: {workout.duration} min</Text>
        <Text style={styles.infoText}>Water: {workout.water_consumption} L</Text>
        <Text style={styles.infoText}>Type: {workout.is_rest_day ? 'Rest day' : 'Workout'}</Text>
      </View>

      <FlatList
        data={workout.exercises || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExercise}
        ListEmptyComponent={<Text style={styles.emptyText}>No exercises found.</Text>}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 12,
    color: '#FF3B30',
    textAlign: 'center',
    letterSpacing: 2,
  },
  notes: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#999',
    marginBottom: 20,
    textAlign: 'center',
  },
  workoutInfo: {
    backgroundColor: '#1E1E1E',
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 15,
    color: '#BBBBBB',
    marginBottom: 6,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1E1E1E',
    padding: 18,
    marginBottom: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    shadowColor: '#FF3B30',
    shadowOpacity: 0.7,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FF3B30',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E90FF',
    marginBottom: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#DDD',
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
  orderInput: {
    color: '#DDD',
    fontWeight: '700',
    borderBottomWidth: 1,
    borderBottomColor: '#FF3B30',
    width: 50,
    paddingVertical: 0,
    marginLeft: 8,
  },
  input: {
    color: '#DDD',
    fontWeight: '700',
    borderBottomWidth: 1,
    borderBottomColor: '#FF3B30',
    width: 80,
    textAlign: 'center',
  },
  relatedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#121212',
    padding: 12,
    borderRadius: 20,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  relatedLabel: {
    fontSize: 14,
    color: '#777',
    fontWeight: '600',
  },
  relatedValue: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '900',
  },
  setsRepsContainer: {
    alignItems: 'center',
    marginTop: 14,
  },
  setsReps: {
    backgroundColor: '#FF3B30',
    color: '#121212',
    fontWeight: '900',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 40,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#666',
    marginTop: 60,
    fontWeight: '700',
  },
  deleteButton: {
    marginTop: 14,
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#121212',
    fontWeight: '900',
    fontSize: 16,
  },
});

export default WorkoutDetailsScreen;
