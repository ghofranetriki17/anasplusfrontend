import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Button,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { userProgressAPI } from '../services/api';
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get("window").width;

const formatImc = (imc) => {
  const val = parseFloat(imc);
  return !isNaN(val) ? val.toFixed(2) : '-';
};

const UserProgressScreen = () => {
  const [progresses, setProgresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [recordedAt, setRecordedAt] = useState('');
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      const storedUserName = await AsyncStorage.getItem('userName');
      
      if (storedUserId) {
        setUserId(parseInt(storedUserId));
        setUserName(storedUserName || 'User');
        // Load progress after getting user ID
        fetchProgresses();
      } else {
        Alert.alert('Error', 'User not logged in');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgresses = async () => {
    try {
      setLoading(true);
      // This will now use the protected route that returns only user's progress
      const data = await userProgressAPI.getAll();
      setProgresses(data);
    } catch (error) {
      console.error('Error fetching progress:', error);
      
      // Better error handling
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please log in again');
        // You might want to navigate to login screen here
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to load progress data';
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const addProgress = async () => {
    if (!recordedAt) {
      Alert.alert('Validation', 'Date is required');
      return;
    }

    // At least one measurement should be provided
    if (!weight && !height && !bodyFat && !muscleMass) {
      Alert.alert('Validation', 'Please provide at least one measurement');
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(recordedAt)) {
      Alert.alert('Validation', 'Please enter date in YYYY-MM-DD format');
      return;
    }

    // Validate numeric inputs
    if (weight && (isNaN(parseFloat(weight)) || parseFloat(weight) <= 0)) {
      Alert.alert('Validation', 'Please enter a valid weight');
      return;
    }

    if (height && (isNaN(parseFloat(height)) || parseFloat(height) <= 0)) {
      Alert.alert('Validation', 'Please enter a valid height');
      return;
    }

    if (bodyFat && (isNaN(parseFloat(bodyFat)) || parseFloat(bodyFat) < 0 || parseFloat(bodyFat) > 100)) {
      Alert.alert('Validation', 'Body fat percentage must be between 0 and 100');
      return;
    }

    if (muscleMass && (isNaN(parseFloat(muscleMass)) || parseFloat(muscleMass) < 0 || parseFloat(muscleMass) > 100)) {
      Alert.alert('Validation', 'Muscle mass percentage must be between 0 and 100');
      return;
    }

    try {
      const progressData = {
        recorded_at: recordedAt,
      };

      // Only include fields that have values
      if (weight) progressData.weight = parseFloat(weight);
      if (height) progressData.height = parseFloat(height);
      if (bodyFat) progressData.body_fat = parseFloat(bodyFat);
      if (muscleMass) progressData.muscle_mass = parseFloat(muscleMass);

      await userProgressAPI.create(progressData);
      Alert.alert('Success', 'Progress added successfully');
      fetchProgresses();
      
      // Clear form
      setWeight('');
      setHeight('');
      setBodyFat('');
      setMuscleMass('');
      setRecordedAt('');
    } catch (error) {
      console.error('Error adding progress:', error);
      
      let errorMessage = 'Failed to save progress';
      if (error.response?.data?.details) {
        // Handle validation errors
        const details = error.response.data.details;
        errorMessage = Object.values(details).flat().join('\n');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  // Set today's date as default
  const getTodaysDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const setTodaysDate = () => {
    setRecordedAt(getTodaysDate());
  };

  // Prepare chart data with better handling for missing data
  const getChartData = () => {
    if (progresses.length === 0) return null;
    
    const recentProgresses = progresses.slice(-5);
    const labels = recentProgresses.map(p => new Date(p.recorded_at).toLocaleDateString());
    
    const datasets = [];
    
    // Add weight data if available
    const weightData = recentProgresses.map(p => p.weight ? parseFloat(p.weight) : 0);
    if (weightData.some(w => w > 0)) {
      datasets.push({
        data: weightData,
        color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`, // blue
        strokeWidth: 2,
      });
    }
    
    // Add height data if available
    const heightData = recentProgresses.map(p => p.height ? parseFloat(p.height) : 0);
    if (heightData.some(h => h > 0)) {
      datasets.push({
        data: heightData,
        color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // red
        strokeWidth: 2,
      });
    }
    
    // Add muscle mass data if available
    const muscleMassData = recentProgresses.map(p => p.muscle_mass ? parseFloat(p.muscle_mass) : 0);
    if (muscleMassData.some(m => m > 0)) {
      datasets.push({
        data: muscleMassData,
        color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`, // turquoise
        strokeWidth: 2,
      });
    }
    
    // Add body fat data if available
    const bodyFatData = recentProgresses.map(p => p.body_fat ? parseFloat(p.body_fat) : 0);
    if (bodyFatData.some(b => b > 0)) {
      datasets.push({
        data: bodyFatData,
        color: (opacity = 1) => `rgba(255, 206, 86, ${opacity})`, // yellow
        strokeWidth: 2,
      });
    }
    
    return datasets.length > 0 ? { labels, datasets } : null;
  };

  const chartData = getChartData();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading progress...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{userName}'s Progress</Text>

        {chartData && (
          <>
            <LineChart
              data={chartData}
              width={screenWidth - 30}
              height={220}
              chartConfig={{
                backgroundColor: "#e26a00",
                backgroundGradientFrom: "#fb8c00",
                backgroundGradientTo: "#ffa726",
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#ffa726"
                }
              }}
              style={{ marginVertical: 8, borderRadius: 16 }}
              bezier
            />
            <View style={styles.legendContainer}>
              <Text style={[styles.legendText, { color: 'rgba(0, 123, 255, 1)' }]}>Weight</Text>
              <Text style={[styles.legendText, { color: 'rgba(255, 99, 132, 1)' }]}>Height</Text>
              <Text style={[styles.legendText, { color: 'rgba(75, 192, 192, 1)' }]}>Muscle Mass</Text>
              <Text style={[styles.legendText, { color: 'rgba(255, 206, 86, 1)' }]}>Body Fat</Text>
            </View>
          </>
        )}

        <FlatList
          data={progresses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.progressItem}>
              <Text style={styles.dateText}>{new Date(item.recorded_at).toLocaleDateString()}</Text>
              <Text>Weight: {item.weight ? `${item.weight} kg` : '-'}</Text>
              <Text>Height: {item.height ? `${item.height} cm` : '-'}</Text>
              <Text>Body Fat: {item.body_fat ? `${item.body_fat}%` : '-'}</Text>
              <Text>Muscle Mass: {item.muscle_mass ? `${item.muscle_mass}%` : '-'}</Text>
              <Text>BMI: {formatImc(item.imc)}</Text>
            </View>
          )}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No progress data yet. Add your first entry below!</Text>
            </View>
          }
        />

        <View style={styles.form}>
          <Text style={styles.formTitle}>Add New Progress</Text>
          <TextInput
            placeholder="Weight (kg) - optional"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
            style={styles.input}
          />
          <TextInput
            placeholder="Height (cm) - optional"
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
            style={styles.input}
          />
          <TextInput
            placeholder="Body Fat % - optional"
            keyboardType="numeric"
            value={bodyFat}
            onChangeText={setBodyFat}
            style={styles.input}
          />
          <TextInput
            placeholder="Muscle Mass % - optional"
            keyboardType="numeric"
            value={muscleMass}
            onChangeText={setMuscleMass}
            style={styles.input}
          />
          <View style={styles.dateInputContainer}>
            <TextInput
              placeholder="Recorded Date (YYYY-MM-DD) - required"
              value={recordedAt}
              onChangeText={setRecordedAt}
              style={[styles.input, { flex: 1 }]}
            />
            <Button title="Today" onPress={setTodaysDate} />
          </View>
          <Button title="Add Progress" onPress={addProgress} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: '#f5f5f5', flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  loadingText: { marginTop: 10, color: '#666' },
  progressItem: { 
    backgroundColor: 'white', 
    padding: 15, 
    marginBottom: 8, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee'
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#007bff'
  },
  form: { 
    marginTop: 20, 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee'
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333'
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    borderRadius: 6,
    backgroundColor: '#fafafa',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  legendText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default UserProgressScreen;