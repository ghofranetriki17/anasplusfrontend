import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';

const MachineDetailsScreen = ({ route }) => {
  const { machine } = route.params;

  const openVideo = () => {
    if (machine.video_url) {
      Linking.openURL(machine.video_url);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{machine.name}</Text>
        <Text style={styles.type}>{machine.type}</Text>
      </View>

      {machine.image_url && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: machine.image_url }} 
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {machine.description || 'Aucune description disponible'}
        </Text>
      </View>

      {machine.video_url && (
        <TouchableOpacity style={styles.videoButton} onPress={openVideo}>
          <Text style={styles.videoButtonText}>📹 Voir la vidéo de la machine</Text>
        </TouchableOpacity>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Informations</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Type :</Text>
          <Text style={styles.infoValue}>{machine.type}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Branche ID :</Text>
          <Text style={styles.infoValue}>{machine.branch_id}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Créé le :</Text>
          <Text style={styles.infoValue}>
            {machine.created_at ? new Date(machine.created_at).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </View>

      {machine.charges && machine.charges.length > 0 && (
        <View style={styles.chargesCard}>
          <Text style={styles.sectionTitle}>Charges disponibles</Text>
          {machine.charges.map((charge, index) => (
            <View key={charge.id} style={styles.chargeItem}>
              <Text style={styles.chargeName}>
                {charge.name || `Charge ${charge.id}`}
              </Text>
              <Text style={styles.chargeWeight}>
                {charge.weight ? `${charge.weight} kg` : 'Poids non spécifié'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {machine.categories && machine.categories.length > 0 && (
        <View style={styles.categoriesCard}>
          <Text style={styles.sectionTitle}>Catégories</Text>
          <View style={styles.categoriesContainer}>
            {machine.categories.map((category, index) => (
              <View key={category.id} style={styles.categoryTag}>
                <Text style={styles.categoryText}>{category.name}</Text>
              </View>
            ))}
          </View>
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
    backgroundColor: '#2ecc71',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  type: {
    fontSize: 16,
    color: '#ecf0f1',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  imageContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
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
  chargesCard: {
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
  categoriesCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
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
  chargeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  chargeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  chargeWeight: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MachineDetailsScreen;