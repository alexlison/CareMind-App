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
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getPatientMedicines } from '../services/MedicineService';
import styles from '../styles/MedicineStyles';
import { API_URL } from '@env';

const BASE_URL = API_URL.replace('/api', '');
const IMAGE_BASE_URL = BASE_URL;

const MedicinesScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [error, setError] = useState(null);

  const fetchMedicines = useCallback(async () => {
    try {
      setError(null);
      const response = await getPatientMedicines();
      console.log('Medicines response:', response); 
      
      if (response.status === 'SUCCESS') {
        setMedicines(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch medicines');
        setMedicines([]);
      }
    } catch (error) {
      console.log('Fetch medicines error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMedicines();
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

  const formatTime = (time) => {
    if (!time) return '';
    return time;
  };

  const renderMedicineCard = (medicine) => {
    const completedCount = medicine.completedDoses || 0;
    const totalCount = medicine.totalDosesToday || (medicine.scheduledTime ? medicine.scheduledTime.length : 1);
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    let timings = [];
    if (medicine.scheduledTime) {
      timings = medicine.scheduledTime;
    } else if (medicine.timing) {
      if (typeof medicine.timing === 'string') {
        try {
          timings = JSON.parse(medicine.timing);
        } catch {
          timings = [medicine.timing];
        }
      } else if (Array.isArray(medicine.timing)) {
        timings = medicine.timing;
      }
    }

    return (
      <TouchableOpacity
        key={medicine._id}
        style={styles.medicineCard}
        onPress={() => Alert.alert('Medicine Info', medicine.instructions || 'Take as prescribed')}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.imageContainer}>
            {medicine.imageUrl ? (
              <Image
                source={{ uri: `${IMAGE_BASE_URL}${medicine.imageUrl}` }}
                style={styles.medicineImage}
                onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <MaterialCommunityIcons name="pill" size={30} color="#8DA887" />
              </View>
            )}
          </View>
          
          <View style={styles.medicineInfo}>
            <Text style={styles.medicineName}>{medicine.name}</Text>
            {medicine.dosage && (
              <Text style={styles.medicineDosage}>{medicine.dosage}</Text>
            )}
          </View>
          <View style={styles.doseCount}>
            <Text style={styles.doseCountText}>
              {completedCount}/{totalCount}
            </Text>
          </View>
        </View>

        {medicine.purpose && (
          <View style={styles.purposeContainer}>
            <MaterialCommunityIcons name="information-outline" size={16} color="#2E7D32" />
            <Text style={styles.purposeText}>{medicine.purpose}</Text>
          </View>
        )}

        <View style={styles.timingContainer}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#8DA887" />
          <Text style={styles.timingText}> Timings -
            {timings.length > 0 ? timings.join(' , ') : 'No schedule'}
          </Text>
        </View>

        {medicine.instructions && (
          <View style={styles.instructionsContainer}>
            <MaterialCommunityIcons name="note-text-outline" size={16} color="#2E7D32" />
            <Text style={styles.instructionsText}>{medicine.instructions}</Text>
          </View>
        )}

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Today's Progress</Text>
            <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Today's Doses */}
        <View style={styles.dosesContainer}>
          <Text style={styles.dosesTitle}>Today's Doses</Text>
          <View style={styles.todayStatus}>
            {medicine.todayStatus && medicine.todayStatus.length > 0 ? (
              medicine.todayStatus.map((dose, index) => (
                <View key={index} style={styles.doseStatus}>
                  <MaterialCommunityIcons
                    name={getStatusIcon(dose.status)}
                    size={14}
                    color={getStatusColor(dose.status)}
                  />
                  <Text style={styles.doseTime}>{formatTime(dose.scheduledTime)}</Text>
                  <Text style={[styles.doseStatusText, { color: getStatusColor(dose.status) }]}>
                    {dose.status}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDosesText}>No doses scheduled for today</Text>
            )}
          </View>
        </View>

        {/* Next Dose */}
        {medicine.nextDoseTime && (
          <View style={styles.nextDoseContainer}>
            <MaterialCommunityIcons name="bell-ring-outline" size={16} color="#2E7D32" />
            <Text style={styles.nextDoseText}>Next dose: {medicine.nextDoseTime}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading medicines...</Text>
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
        <Text style={styles.headerTitle}>My Medicines</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={50} color="#C62828" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchMedicines}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : medicines.length > 0 ? (
          medicines.map(renderMedicineCard)
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="pill-off" size={60} color="#8DA887" />
            <Text style={styles.emptyText}>No medicines prescribed</Text>
            <Text style={styles.emptySubText}>Your caregiver hasn't added any medicines yet</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MedicinesScreen;