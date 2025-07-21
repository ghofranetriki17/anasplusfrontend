import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const WorkoutDetailsScreen = ({ route, navigation }) => {
  const { workout } = route.params;

  const renderExercise = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ExerciseDetails', { exercise: item })}
    >
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.subtitle}>{item.title}</Text>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.detailLabel}>Ordre :</Text>
        <Text style={styles.detailValue}>{item.pivot?.order || '-'}</Text>
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.detailLabel}>Réalisé :</Text>
        <Text style={styles.detailValue}>{item.pivot?.is_done ? '✅ Oui' : '❌ Non'}</Text>
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.detailLabel}>Performance :</Text>
        <Text style={styles.detailValue}>{item.pivot?.achievement || '0'} %</Text>
      </View>

      {/* Movement */}
      {item.movement && (
        <TouchableOpacity 
          style={styles.relatedItem}
          onPress={() => navigation.navigate('MovementDetails', { movement: item.movement })}
        >
          <Text style={styles.relatedLabel}>Mouvement :</Text>
          <Text style={styles.relatedValue}>{item.movement.name} →</Text>
        </TouchableOpacity>
      )}

      {/* Machine */}
      {item.machine && (
        <TouchableOpacity 
          style={styles.relatedItem}
          onPress={() => navigation.navigate('MachineDetails', { machine: item.machine })}
        >
          <Text style={styles.relatedLabel}>Machine :</Text>
          <Text style={styles.relatedValue}>{item.machine.name} →</Text>
        </TouchableOpacity>
      )}

      {/* Charge */}
      {item.charge && (
        <TouchableOpacity 
          style={styles.relatedItem}
          onPress={() => navigation.navigate('ChargeDetails', { charge: item.charge })}
        >
          <Text style={styles.relatedLabel}>Charge :</Text>
          <Text style={styles.relatedValue}>{item.charge.name || item.charge.weight} →</Text>
        </TouchableOpacity>
      )}

      <View style={styles.setsRepsContainer}>
        <Text style={styles.setsReps}>{item.sets} séries × {item.reps} reps</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Exercices de « {workout.title} »</Text>
      <Text style={styles.notes}>Notes: {workout.notes || 'Aucune note'}</Text>
      
      <View style={styles.workoutInfo}>
        <Text style={styles.infoText}>Durée: {workout.duration} min</Text>
        <Text style={styles.infoText}>Eau: {workout.water_consumption} L</Text>
        <Text style={styles.infoText}>
          Type: {workout.is_rest_day ? 'Jour de repos' : 'Entraînement'}
        </Text>
      </View>

      <FlatList
        data={workout.exercises || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExercise}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun exercice trouvé.</Text>}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#f8f9fa' 
  },
  header: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 8,
    color: '#2c3e50'
  },
  notes: { 
    marginBottom: 12, 
    fontSize: 14, 
    fontStyle: 'italic',
    color: '#7f8c8d'
  },
  workoutInfo: {
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 4,
  },
  card: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 4,
    color: '#2c3e50'
  },
  subtitle: {
    fontSize: 16,
    color: '#3498db',
    marginBottom: 12,
    fontWeight: '600'
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500'
  },
  detailValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600'
  },
  relatedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    marginVertical: 4,
  },
  relatedLabel: {
    fontSize: 14,
    color: '#5a6c7d',
    fontWeight: '500'
  },
  relatedValue: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600'
  },
  setsRepsContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  setsReps: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    backgroundColor: '#fdf2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 50,
  }
});
export default WorkoutDetailsScreen;
