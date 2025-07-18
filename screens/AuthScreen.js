import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { authAPI, tokenService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // Check for minimum length, at least one number, one uppercase, one lowercase
    const minLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    
    return {
      valid: minLength && hasNumber && hasUpper && hasLower,
      errors: {
        minLength,
        hasNumber,
        hasUpper,
        hasLower
      }
    };
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response.data;
      
      // Save both token and user data
      await tokenService.setToken(token);
      await AsyncStorage.setItem('userId', user.id.toString());
      await AsyncStorage.setItem('userName', user.name);
      await AsyncStorage.setItem('userEmail', user.email);
      
      // Set global variables for immediate use
      global.authToken = token;
      global.userId = user.id;
      global.userName = user.name;
      
      navigation.replace('Home');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      let errorMessage = 'Password must contain:\n';
      if (!passwordValidation.errors.minLength) errorMessage += '• At least 8 characters\n';
      if (!passwordValidation.errors.hasNumber) errorMessage += '• At least one number\n';
      if (!passwordValidation.errors.hasUpper) errorMessage += '• At least one uppercase letter\n';
      if (!passwordValidation.errors.hasLower) errorMessage += '• At least one lowercase letter\n';
      
      Alert.alert('Error', errorMessage);
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register({ 
        name, 
        email, 
        password, 
        password_confirmation: confirmPassword 
      });
      const { user, token } = response.data;
      
      // Save both token and user data
      await tokenService.setToken(token);
      await AsyncStorage.setItem('userId', user.id.toString());
      await AsyncStorage.setItem('userName', user.name);
      await AsyncStorage.setItem('userEmail', user.email);
      
      // Set global variables for immediate use
      global.authToken = token;
      global.userId = user.id;
      global.userName = user.name;
      
      navigation.replace('Home');
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed';
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat().join('\n');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    // Clear form when switching modes
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fitness App</Text>
      
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, isLogin && styles.activeToggle]}
          onPress={() => setIsLogin(true)}
        >
          <Text style={[styles.toggleText, isLogin && styles.activeToggleText]}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, !isLogin && styles.activeToggle]}
          onPress={() => setIsLogin(false)}
        >
          <Text style={[styles.toggleText, !isLogin && styles.activeToggleText]}>Register</Text>
        </TouchableOpacity>
      </View>

      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      )}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
      />

      {!isLogin && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoComplete="password"
          />
          <Text style={styles.passwordHint}>
            Password must be at least 8 characters with uppercase, lowercase, and number
          </Text>
        </>
      )}
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={isLogin ? handleLogin : handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  activeToggle: {
    backgroundColor: '#007bff',
  },
  toggleText: {
    color: '#333',
    fontWeight: '500',
  },
  activeToggleText: {
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: 'white',
    fontSize: 16,
  },
  passwordHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AuthScreen;