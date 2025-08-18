import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';

const MovementDetailsScreen = ({ route }) => {
  const { movement } = route.params;

  const openVideo = () => {
    if (movement.video_url) {
      Linking.openURL(movement.video_url).catch(() =>
        Alert.alert('Erreur', 'Impossible d’ouvrir la vidéo')
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{movement.name || 'Sans nom'}</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {movement.description || 'Aucune description disponible'}
        </Text>
      </View>

      {movement.video_url && (
        <TouchableOpacity style={styles.videoButton} onPress={openVideo}>
          <Text style={styles.videoButtonText}>📹 Voir la vidéo</Text>
        </TouchableOpacity>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Informations</Text>
        <InfoRow label="ID" value={movement.id} />
        <InfoRow label="Créé le" value={formatDate(movement.created_at)} />
        <InfoRow label="Modifié le" value={formatDate(movement.updated_at)} />
      </View>

      {movement.exercises?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Exercices associés</Text>
          {movement.exercises.map((ex) => (
            <View key={ex.id} style={styles.exerciseItem}>
              <Text style={styles.exerciseName}>{ex.name}</Text>
              <Text style={styles.exerciseInfo}>
                {ex.sets} séries × {ex.reps} reps
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label} :</Text>
    <Text style={styles.infoValue}>{value || 'N/A'}</Text>
  </View>
);

const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString() : 'N/A';
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  header: { fontSize: 26, fontWeight: '900', color: '#FF3B30', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 24, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#FF3B30', marginBottom: 12 },
  description: { fontSize: 16, color: '#DDD', lineHeight: 24 },
  videoButton: { backgroundColor: '#FF3B30', padding: 16, borderRadius: 40, alignItems: 'center', marginBottom: 20 },
  videoButtonText: { color: '#121212', fontSize: 16, fontWeight: '900' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomColor: '#2A2A2A', borderBottomWidth: 1, paddingVertical: 10 },
  infoLabel: { fontSize: 14, fontWeight: '700', color: '#999' },
  infoValue: { fontSize: 14, fontWeight: '700', color: '#DDD' },
  exerciseItem: { backgroundColor: '#2A2A2A', padding: 14, borderRadius: 16, marginBottom: 12 },
  exerciseName: { fontSize: 16, fontWeight: '900', color: '#1E90FF', marginBottom: 6 },
  exerciseInfo: { fontSize: 14, color: '#CCC' },
});

export default MovementDetailsScreen;
