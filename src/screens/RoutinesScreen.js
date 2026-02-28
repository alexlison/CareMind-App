import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getPatientRoutines } from '../services/RoutineService';
import styles from '../styles/RoutineStyles';

const RoutinesScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [routines, setRoutines] = useState([]);

  const fetchRoutines = useCallback(async () => {
    try {
      const response = await getPatientRoutines();
      if (response.status === 'SUCCESS') {
        setRoutines(response.data || []);
      }
    } catch (error) {
      console.log('Fetch routines error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRoutines();
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'exercise': return 'run';
      case 'meal': return 'food';
      case 'therapy': return 'brain';
      default: return 'calendar-check';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'exercise': return '#2E7D32';
      case 'meal': return '#F57C00';
      case 'therapy': return '#7B1FA2';
      default: return '#2E7D32';
    }
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return '#2E7D32';
    if (status === 'missed') return '#C62828';
    return '#F57C00';
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return 'check-circle';
    if (status === 'missed') return 'close-circle';
    return 'clock-outline';
  };

  const renderRoutineCard = (routine) => {
    return (
      <TouchableOpacity
        key={routine._id}
        style={styles.routineCard}
        onPress={() => {
          if (routine.todayTaskId) {
            navigation.navigate('TaskDetails', { taskId: routine.todayTaskId });
          } else {
            Alert.alert('Info', `${routine.title} scheduled at ${routine.scheduledTime}`);
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.routineIconContainer, { backgroundColor: `${getTypeColor(routine.type)}20` }]}>
            <MaterialCommunityIcons
              name={getTypeIcon(routine.type)}
              size={24}
              color={getTypeColor(routine.type)}
            />
          </View>
          <View style={styles.routineInfo}>
            <Text style={styles.routineTitle}>{routine.title}</Text>
            {routine.type && (
              <Text style={styles.routineType}>{routine.type}</Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(routine.todayStatus)}20` }]}>
            <MaterialCommunityIcons
              name={getStatusIcon(routine.todayStatus)}
              size={14}
              color={getStatusColor(routine.todayStatus)}
            />
            <Text style={[styles.statusText, { color: getStatusColor(routine.todayStatus) }]}>
              {routine.todayStatus || 'pending'}
            </Text>
          </View>
        </View>

        <View style={styles.timeContainer}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#8DA887" />
          <Text style={styles.timeText}>{routine.scheduledTime}</Text>
        </View>

        {routine.description && (
          <View style={styles.descriptionContainer}>
            <MaterialCommunityIcons name="text-box-outline" size={16} color="#2E7D32" />
            <Text style={styles.descriptionText}>{routine.description}</Text>
          </View>
        )}

        {routine.frequency && (
          <View style={styles.frequencyContainer}>
            <MaterialCommunityIcons name="repeat" size={14} color="#8DA887" />
            <Text style={styles.frequencyText}>{routine.frequency}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading routines...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F4F0" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Routines</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
        }
      >
        {routines.length > 0 ? (
          routines.map(renderRoutineCard)
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-remove" size={60} color="#8DA887" />
            <Text style={styles.emptyText}>No routines scheduled</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RoutinesScreen;