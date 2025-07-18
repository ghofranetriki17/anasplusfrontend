import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  TouchableOpacity 
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const MachineDetailScreen = ({ route }) => {
  const { machine } = route.params;

  return (
    <ScrollView style={styles.container}>
      {machine.image_url && (
        <Image 
          source={{ uri: machine.image_url }} 
          style={styles.machineImage} 
          resizeMode="cover"
        />
      )}
      
      <View style={styles.header}>
        <Text style={styles.machineName}>{machine.name}</Text>
        <Text style={styles.machineType}>{machine.type}</Text>
        
        {machine.description && (
          <Text style={styles.machineDescription}>{machine.description}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Charges</Text>
        
        {machine.charges.length > 0 ? (
          machine.charges.map((charge, index) => (
            <View key={index} style={styles.chargeItem}>
              <Icon name="bolt" size={16} color="#ffc107" />
              <Text style={styles.chargeText}>{charge.weight} kg</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No charges available for this machine</Text>
        )}
      </View>

      {machine.video_url && (
        <TouchableOpacity style={styles.videoButton}>
          <Icon name="play-circle" size={20} color="#007bff" />
          <Text style={styles.videoButtonText}>View Demonstration Video</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  machineImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  header: {
    marginBottom: 20,
  },
  machineName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  machineType: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  machineDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  chargeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chargeText: {
    fontSize: 16,
    marginLeft: 10,
  },
  noDataText: {
    fontSize: 15,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 10,
  },
  videoButtonText: {
    fontSize: 16,
    color: '#007bff',
    marginLeft: 10,
  },
});

export default MachineDetailScreen;