import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Image 
} from 'react-native';
import { machineAPI } from '../services/api';
import Icon from 'react-native-vector-icons/FontAwesome';

const MachineListScreen = ({ route, navigation }) => {
  const { branch } = route.params;
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMachines();
  }, []);

  const loadMachines = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await machineAPI.getByBranch(branch.id);
    setMachines(response.data.data);  // <-- Fix here
    } catch (err) {
      console.error('Failed to load machines:', err);
      setError('Failed to load machines. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMachinePress = (machine) => {
    navigation.navigate('MachineDetail', { machine });
  };

  const renderMachineItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.machineCard}
      onPress={() => handleMachinePress(item)}
    >
      {item.image_url && (
        <Image 
          source={{ uri: item.image_url }} 
          style={styles.machineImage} 
          resizeMode="cover"
        />
      )}
      <View style={styles.machineInfo}>
        <Text style={styles.machineName}>{item.name}</Text>
        <Text style={styles.machineType}>{item.type}</Text>
        {item.description && (
          <Text style={styles.machineDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.chargesContainer}>
          <Icon name="bolt" size={14} color="#ffc107" />
          <Text style={styles.chargesText}>
            {item.charges.length} charges available
          </Text>
        </View>
      </View>
      <Icon name="chevron-right" size={16} color="#999" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMachines}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Machines at {branch.name}</Text>
      
      <FlatList
        data={machines}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMachineItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.noMachinesText}>No machines available at this branch</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  machineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  machineImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  machineInfo: {
    flex: 1,
  },
  machineName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  machineType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  machineDescription: {
    fontSize: 13,
    color: '#777',
    marginBottom: 5,
  },
  chargesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chargesText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 5,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noMachinesText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default MachineListScreen;