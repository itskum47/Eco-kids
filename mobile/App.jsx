/**
 * @fileoverview Main mobile app entry point
 * Handles navigation, Redux store, and app initialization
 */

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { Provider as ReduxProvider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider } from 'react-native-paper';
import { ActivityIndicator, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import store from './src/store';
import { DatabaseService, StorageService } from './src/services/storage';
import ApiService from './src/services/api';

// Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import ChallengesScreen from './src/screens/challenges/ChallengesScreen';
import ChallengeDetailScreen from './src/screens/challenges/ChallengeDetailScreen';
import SubmissionScreen from './src/screens/submission/SubmissionScreen';
import HabitsScreen from './src/screens/habits/HabitsScreen';
import LeaderboardScreen from './src/screens/leaderboard/LeaderboardScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
});

// ============================================================================
// TAB NAVIGATION STACK
// ============================================================================

const DashboardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      cardStyle: { backgroundColor: '#f9fafb' }
    }}
  >
    <Stack.Screen
      name="DashboardHome"
      component={DashboardScreen}
      options={{
        title: 'Dashboard',
        headerLargeTitle: true
      }}
    />
  </Stack.Navigator>
);

const ChallengesStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerBackTitle: '',
      cardStyle: { backgroundColor: '#f9fafb' }
    }}
  >
    <Stack.Screen
      name="ChallengesList"
      component={ChallengesScreen}
      options={{
        title: 'Challenges',
        headerLargeTitle: true
      }}
    />
    <Stack.Screen
      name="ChallengeDetail"
      component={ChallengeDetailScreen}
      options={({ route }) => ({
        title: route.params?.title || 'Challenge Details'
      })}
    />
    <Stack.Screen
      name="Submission"
      component={SubmissionScreen}
      options={{
        title: 'Submit Activity',
        presentation: 'modal'
      }}
    />
  </Stack.Navigator>
);

const HabitsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      cardStyle: { backgroundColor: '#f9fafb' }
    }}
  >
    <Stack.Screen
      name="HabitsList"
      component={HabitsScreen}
      options={{
        title: 'Daily Habits',
        headerLargeTitle: true
      }}
    />
  </Stack.Navigator>
);

const LeaderboardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      cardStyle: { backgroundColor: '#f9fafb' }
    }}
  >
    <Stack.Screen
      name="LeaderboardList"
      component={LeaderboardScreen}
      options={{
        title: 'Leaderboard',
        headerLargeTitle: true
      }}
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      cardStyle: { backgroundColor: '#f9fafb' }
    }}
  >
    <Stack.Screen
      name="ProfileView"
      component={ProfileScreen}
      options={{
        title: 'Profile',
        headerLargeTitle: true
      }}
    />
  </Stack.Navigator>
);

// ============================================================================
// MAIN TAB NAVIGATOR
// ============================================================================

const MainTabs = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check connectivity every 30 seconds
    const interval = setInterval(async () => {
      const online = await ApiService.checkConnectivity();
      setIsOnline(online);

      // Sync offline data when back online
      if (online) {
        await ApiService.syncOfflineData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 5,
          paddingTop: 5
        },
        tabBarIcon: ({ focused, color, size }) => {
          let icon;

          if (route.name === 'DashboardStack') {
            icon = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ChallengesStack') {
            icon = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'HabitsStack') {
            icon = focused ? 'calendar-check' : 'calendar-outline';
          } else if (route.name === 'LeaderboardStack') {
            icon = focused ? 'chart-line' : 'chart-box-outline';
          } else if (route.name === 'ProfileStack') {
            icon = focused ? 'account' : 'account-outline';
          }

          return <MaterialCommunityIcons name={icon} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen
        name="DashboardStack"
        component={DashboardStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="ChallengesStack"
        component={ChallengesStack}
        options={{ tabBarLabel: 'Challenges' }}
      />
      <Tab.Screen
        name="HabitsStack"
        component={HabitsStack}
        options={{ tabBarLabel: 'Habits' }}
      />
      <Tab.Screen
        name="LeaderboardStack"
        component={LeaderboardStack}
        options={{ tabBarLabel: 'Leaderboard' }}
      />
      <Tab.Screen
        name="ProfileStack"
        component={ProfileStack}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// ============================================================================
// AUTH STACK
// ============================================================================

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: '#ffffff' }
    }}
  >
    <Stack.Screen
      name="Login"
      component={LoginScreen}
    />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
      options={{ animationEnabled: true }}
    />
  </Stack.Navigator>
);

// ============================================================================
// ROOT NAVIGATOR
// ============================================================================

const RootNavigator = ({ isLoading, isLoggedIn }) => {
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      // Initialize database
      await DatabaseService.initializeDatabase();

      // Check for existing auth token
      const token = await StorageService.getAuthToken();
      const userProfile = await StorageService.getUserProfile();

      if (token && userProfile) {
        // Try to validate token with server
        const result = await ApiService.getUserProfile();
        if (result.success) {
          setIsLoggedIn(true);
        } else {
          // Token invalid, clear it
          await StorageService.clearAuthToken();
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }

      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        console.log('[App] Notification permissions granted');
      }
    } catch (error) {
      console.error('[App] Bootstrap error:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <RootNavigator isLoading={isLoading} isLoggedIn={isLoggedIn} />
      </PaperProvider>
    </ReduxProvider>
  );
}
