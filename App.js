

import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Platform, AppState } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import TaskDetailsScreen from './src/screens/TaskDetailsScreen';
import MedicinesScreen from './src/screens/MedicinesScreen';
import RoutinesScreen from './src/screens/RoutinesScreen';
import RelationsScreen from './src/screens/RelationsScreen';
import EmergencyContactScreen from './src/screens/EmergencyContactScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MyDayScreen from './src/screens/MyDayScreen';

import { checkLoginStatus } from './src/services/LoginService';
import NotifeeService from './src/services/NotifeeService';
import {
  startNotificationPolling,
  stopNotificationPolling,
  checkForNewNotifications,
  checkPendingNotification,
} from './src/services/PushNotificationService';
import CaregiverInfoScreen from './src/screens/CaregiverInfoScreen';

const Stack = createNativeStackNavigator();
const navigationRef = React.createRef();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');
  const [isReady, setIsReady] = useState(false);

  // Bug 1 FIX: ref instead of state — never triggers useEffect re-run
  const pollingIntervalRef = useRef(null);

  // Bug 1 FIX: empty deps array — runs exactly once, no duplicate listeners
  useEffect(() => {
    initializeApp();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') checkForNewNotifications(true);
    });

    return () => {
      subscription.remove();
      if (pollingIntervalRef.current) {
        stopNotificationPolling(pollingIntervalRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isReady && navigationRef.current) {
      checkPendingNotification(navigationRef.current);
    }
  }, [isReady]);

  const initializeApp = async () => {
    try {
      const result = await checkLoginStatus();

      if (result.isLoggedIn) {
        setInitialRoute('Home');

        if (Platform.OS !== 'web') {
          try {
            await NotifeeService.requestPermissions();
            await NotifeeService.createChannels();

            // Store in ref — does NOT cause useEffect re-run
            pollingIntervalRef.current = startNotificationPolling();

            await checkForNewNotifications(true);
          } catch (notifError) {
            console.log('Notification init error:', notifError);
          }
        }
      } else {
        setInitialRoute('Login');
      }
    } catch (error) {
      console.log('App init error:', error);
      setInitialRoute('Login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} onReady={() => setIsReady(true)}>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
        <Stack.Screen name="Medicines" component={MedicinesScreen} />
        <Stack.Screen name="Routines" component={RoutinesScreen} />
        <Stack.Screen name="Relations" component={RelationsScreen} />
        <Stack.Screen name="EmergencyContact" component={EmergencyContactScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="MyDay" component={MyDayScreen} />
        <Stack.Screen name="CaregiverInfo" component={CaregiverInfoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;