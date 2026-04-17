import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import ShopScreen from './screens/ShopScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import InventoryScreen from './screens/InventoryScreen';
import FriendsScreen from './screens/FriendsScreen';
import TournamentsScreen from './screens/TournamentsScreen';

import { AuthProvider, useAuth } from './context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
            case 'Play': iconName = focused ? 'game-controller' : 'game-controller-outline'; break;
            case 'Shop': iconName = focused ? 'cart' : 'cart-outline'; break;
            case 'Leaderboard': iconName = focused ? 'trophy' : 'trophy-outline'; break;
            case 'Profile': iconName = focused ? 'person' : 'person-outline'; break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#1f2937', borderTopColor: '#374151' },
        headerStyle: { backgroundColor: '#1f2937' },
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Play" component={GameScreen} />
      <Tab.Screen name="Shop" component={ShopScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user } = useAuth();
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Inventory" component={InventoryScreen} options={{ headerShown: true, title: 'My Inventory' }} />
            <Stack.Screen name="Friends" component={FriendsScreen} options={{ headerShown: true, title: 'Friends' }} />
            <Stack.Screen name="Tournaments" component={TournamentsScreen} options={{ headerShown: true, title: 'Tournaments' }} />
          </>
        )}
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
