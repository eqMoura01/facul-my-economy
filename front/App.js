import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ExpenseProvider } from './src/contexts/ExpenseContext';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import Home from './src/screens/Home';
import Profile from './src/screens/Profile';
import Expenses from './src/screens/Expenses';
import Limit from './src/screens/Limit';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ExpenseProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#1C1C1C' }
          }}
        >
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Expenses" component={Expenses} />
          <Stack.Screen name="Limit" component={Limit} />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </ExpenseProvider>
  );
}
