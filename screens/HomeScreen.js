import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Alert, // <-- Import Alert here
} from 'react-native';
import { branchAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const CARD_SPACING = 15;

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
      if (storedUserName) setUserName(storedUserName);
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
      setError('Failed to load branches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              navigation.replace('Auth');
            } catch (error) {
              console.error('Logout failed:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleBranchPress = (branch) => {
    navigation.navigate('BranchDetail', { branch });
  };

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
        <TouchableOpacity style={styles.retryButton} onPress={loadBranches}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <Text style={styles.heroTitle}>🏋️‍♂️ Welcome, {userName}!</Text>
        <Text style={styles.heroSubtitle}>Find your perfect training location.</Text>
        <Image
          source={require('../assets/gym-banner.jpg')} // Replace with your image path
          style={styles.heroImage}
        />
      </View>

      {/* Branch List */}
      <FlatList
        horizontal
        data={branches}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: CARD_SPACING }}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.branchCard}
            onPress={() => handleBranchPress(item)}
          >
            <Text style={styles.branchName}>{item.name}</Text>
            <Text style={styles.branchAddress}>
              {item.address}, {item.city}
            </Text>
            <Text style={styles.branchContact}>Phone: {item.phone}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Buttons */}
      <TouchableOpacity
        style={styles.progressButton}
        onPress={() => navigation.navigate('UserProgress')}
      >
        <FontAwesome name="line-chart" size={16} color="white" style={styles.icon} />
        <Text style={styles.progressButtonText}>Check My Progress</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.progressButton}
        onPress={() => navigation.navigate('WorkoutList')}
      >
        <FontAwesome name="heartbeat" size={16} color="white" style={styles.icon} />
        <Text style={styles.progressButtonText}>View My Workouts</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.progressButton, { backgroundColor: '#333', marginBottom: 40 }]}
        onPress={handleLogout}
      >
        <FontAwesome name="sign-out" size={16} color="#FF3B30" style={styles.icon} />
        <Text style={[styles.progressButtonText, { color: '#FF3B30' }]}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  heroBanner: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 15,
  },
  heroImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    backgroundColor: '#222',
  },
  branchCard: {
    width: CARD_WIDTH,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    marginRight: CARD_SPACING,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  branchName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 10,
  },
  branchAddress: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  branchContact: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  progressButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  progressButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
  icon: {
    marginRight: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 18,
    marginBottom: 12,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
});

export default HomeScreen;
