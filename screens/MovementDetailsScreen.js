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
      <Text style={styles.header}>{movement.name}</Text>

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

      <View style={styles.card}>
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

      {movement.exercises?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Exercices associés</Text>
          {movement.exercises.map((exercise) => (
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
    backgroundColor: '#121212',
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1.5,
  },
  card: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    shadowColor: '#FF3B30',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FF3B30',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#DDD',
    lineHeight: 24,
  },
  videoButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 40,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FF3B30',
    shadowOpacity: 0.7,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  videoButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '900',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: '#2A2A2A',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DDD',
  },
  exerciseItem: {
    backgroundColor: '#2A2A2A',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E90FF',
    marginBottom: 6,
  },
  exerciseInfo: {
    fontSize: 14,
    color: '#CCC',
  },
});

export default MovementDetailsScreen;
