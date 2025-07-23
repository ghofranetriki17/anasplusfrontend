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
      setMachines(response.data.data);
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
      activeOpacity={0.8}
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
          <Icon name="bolt" size={14} color="#FF3B30" />
          <Text style={styles.chargesText}>
            {item.charges.length} charges available
          </Text>
        </View>
      </View>
      <Icon name="chevron-right" size={16} color="#FF3B30" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF3B30" />
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
        contentContainerStyle={machines.length === 0 && styles.listEmptyContainer}
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
    padding: 20,
    backgroundColor: '#121212', // dark background
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#FF3B30',
    textAlign: 'center',
    letterSpacing: 1,
  },
  listEmptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  machineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  machineImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 15,
  },
  machineInfo: {
    flex: 1,
  },
  machineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 4,
  },
  machineType: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 6,
  },
  machineDescription: {
    fontSize: 13,
    color: '#AAAAAA',
    marginBottom: 6,
  },
  chargesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chargesText: {
    fontSize: 13,
    color: '#FF3B30',
    marginLeft: 6,
  },
  errorText: {
    color: '#FF6F61',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#121212',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noMachinesText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },
});

export default MachineListScreen;
