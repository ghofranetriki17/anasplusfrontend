import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ExerciseDetailsScreen = ({ route }) => {
  const { exercise } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{exercise.name || exercise.title}</Text>
      
      <Text style={styles.label}>Mouvement ID :</Text>
      <Text style={styles.value}>{exercise.movement_id || 'N/A'}</Text>

      <Text style={styles.label}>Machine ID :</Text>
      <Text style={styles.value}>{exercise.machine_id || 'N/A'}</Text>

      <Text style={styles.label}>Sets :</Text>
      <Text style={styles.value}>{exercise.sets}</Text>

      <Text style={styles.label}>Reps :</Text>
      <Text style={styles.value}>{exercise.reps}</Text>

      <Text style={styles.label}>Charge ID :</Text>
      <Text style={styles.value}>{exercise.charge_id || 'N/A'}</Text>

      <Text style={styles.label}>Instructions :</Text>
      <Text style={styles.value}>{exercise.instructions || 'Aucune instruction'}</Text>

      <Text style={styles.label}>Ordre :</Text>
      <Text style={styles.value}>{exercise.pivot?.order || '-'}</Text>

      <Text style={styles.label}>Réalisé :</Text>
      <Text style={styles.value}>{exercise.pivot?.is_done ? '✅ Oui' : '❌ Non'}</Text>

      <Text style={styles.label}>Performance :</Text>
      <Text style={styles.value}>{exercise.pivot?.achievement || '0'} %</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontWeight: '600', marginTop: 10, fontSize: 16 },
  value: { fontSize: 16, color: '#333' },
});

export default ExerciseDetailsScreen;
