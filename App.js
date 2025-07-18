import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import BranchDetailScreen from './screens/BranchDetailScreen';
import MachineListScreen from './screens/MachineListScreen';
import MachineDetailScreen from './screens/MachineDetailScreen';
import UserProgressScreen from './screens/UserProgressScreen'; // Correct path

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Our Branches' }} 
        />
        <Stack.Screen 
          name="BranchDetail" 
          component={BranchDetailScreen} 
          options={({ route }) => ({ title: route.params.branch.name })} 
        />
       <Stack.Screen 
          name="MachineList" 
          component={MachineListScreen} 
          options={({ route }) => ({ title: `${route.params.branch.name} Machines` })}
        />
        <Stack.Screen 
          name="MachineDetail" 
          component={MachineDetailScreen} 
          options={({ route }) => ({ title: route.params.machine.name })}
        />
        <Stack.Screen name="UserProgress" component={UserProgressScreen} />

      </Stack.Navigator>
      
    </NavigationContainer>
  );
}