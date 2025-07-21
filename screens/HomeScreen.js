import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { branchAPI, authAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadBranches();
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const storedUserName = await AsyncStorage.getItem('userName');
      if (storedUserName) {
        setUserName(storedUserName);
      }
    } catch (error) {
      console.error('Error loading user name:', error);
    }
  };

  const loadBranches = async () => {
    try {
      setLoading(true);
      const response = await branchAPI.getAll();
      setBranches(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load branches:', err);
      setError('Failed to load branches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await authAPI.logout();
              navigation.replace('Auth');
            } catch (error) {
              console.error('Logout error:', error);
              // Even if logout fails on server, clear local data and redirect
              navigation.replace('Auth');
            }
          },
        },
      ]
    );
  };

  const handleBranchPress = (branch) => {
    navigation.navigate('BranchDetail', { branch });
  };

  const renderBranchItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.branchCard}
      onPress={() => handleBranchPress(item)}
    >
      <Text style={styles.branchName}>{item.name}</Text>
      <Text style={styles.branchAddress}>{item.address}, {item.city}</Text>
      <Text style={styles.branchContact}>Phone: {item.phone}</Text>
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
        <TouchableOpacity style={styles.retryButton} onPress={loadBranches}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with welcome message and logout */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {userName}!</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Our Branches</Text>
      
      <FlatList
        data={branches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item}) => (
          <TouchableOpacity 
            style={styles.branchCard}
            onPress={() => navigation.navigate('BranchDetail', { branch: item })}
          >
            <Text style={styles.branchName}>{item.name}</Text>
            <Text style={styles.branchAddress}>{item.address}, {item.city}</Text>
            <Text style={styles.branchContact}>Phone: {item.phone}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.noBranchesText}>No branches available</Text>
          </View>
        }
      />

      {/* Progress button */}
      <TouchableOpacity 
        style={styles.progressButton} 
        onPress={() => navigation.navigate('UserProgress')}
      >
        <Text style={styles.progressButtonText}>Check My Progress</Text>
      </TouchableOpacity>
      <TouchableOpacity 
  style={styles.progressButton} 
  onPress={() => navigation.navigate('WorkoutList')}
>
  <Text style={styles.progressButtonText}>View My Workouts</Text>
</TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  progressButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  progressButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  branchCard: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  branchName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  branchAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  branchContact: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noBranchesText: {
    fontSize: 16,
    color: '#666',
  },
});
export default HomeScreen;