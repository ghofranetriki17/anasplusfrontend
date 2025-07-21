import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';

const MovementDetailsScreen = ({ route }) => {
  const { movement } = route.params;

  const openVideo = () => {
    if (movement.video_url) {
      Linking.openURL(movement.video_url);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{movement.name}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {movement.description || 'Aucune description disponible'}
        </Text>
      </View>

      {movement.video_url && (
        <TouchableOpacity style={styles.videoButton} onPress={openVideo}>
          <Text style={styles.videoButtonText}>📹 Voir la vidéo du mouvement</Text>
        </TouchableOpacity>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Informations</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ID :</Text>
          <Text style={styles.infoValue}>{movement.id}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Créé le :</Text>
          <Text style={styles.infoValue}>
            {movement.created_at ? new Date(movement.created_at).toLocaleDateString() : 'N/A'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Modifié le :</Text>
          <Text style={styles.infoValue}>
            {movement.updated_at ? new Date(movement.updated_at).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </View>

      {movement.exercises && movement.exercises.length > 0 && (
        <View style={styles.exercisesCard}>
          <Text style={styles.sectionTitle}>Exercices associés</Text>
          {movement.exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseItem}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseInfo}>
                {exercise.sets} séries × {exercise.reps} reps
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exercisesCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495e',
  },
  videoButton: {
    backgroundColor: '#e74c3c',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  videoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  infoValue: {
    fontSize: 14,
    color: '#2c3e50',
  },
  exerciseItem: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  exerciseInfo: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});

export default MovementDetailsScreen;