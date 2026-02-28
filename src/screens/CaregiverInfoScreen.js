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
  Linking,
  Alert,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getMyCaregiver } from '../services/CaregiverService';
import styles from '../styles/CaregiverStyles';
import { API_URL } from '@env';

const BASE_URL = API_URL.replace('/api', '');
const IMAGE_BASE_URL = BASE_URL;

const CaregiverInfoScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [caregiver, setCaregiver] = useState(null);
  const [error, setError] = useState(null);

  const fetchCaregiver = useCallback(async () => {
    try {
      setError(null);
      console.log('Fetching caregiver info...');
      
      const response = await getMyCaregiver();
      console.log('Fetch caregiver response:', response);
      
      if (response.status === 'SUCCESS') {
        setCaregiver(response.data);
      } else {
        setError(response.message || 'Failed to fetch caregiver information');
        setCaregiver(null);
      }
    } catch (error) {
      console.log('Fetch caregiver error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCaregiver();
  }, [fetchCaregiver]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCaregiver();
  };

  const handleCall = () => {
    if (caregiver?.phone) {
      Linking.openURL(`tel:${caregiver.phone}`);
    } else {
      Alert.alert('Info', 'No phone number available');
    }
  };

  const handleEmail = () => {
    if (caregiver?.email) {
      Linking.openURL(`mailto:${caregiver.email}`);
    } else {
      Alert.alert('Info', 'No email address available');
    }
  };

  const handleMessage = () => {
    if (caregiver?.phone) {
      Linking.openURL(`sms:${caregiver.phone}`);
    } else {
      Alert.alert('Info', 'No phone number available');
    }
  };

  const handleOpenMaps = () => {
    if (caregiver?.address) {
      const addressString = [
        caregiver.address.street,
        caregiver.address.city,
        caregiver.address.state
      ].filter(Boolean).join(', ');
      
      if (addressString) {
        Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(addressString)}`);
      } else {
        Alert.alert('Info', 'No address available');
      }
    }
  };

  const getCaregiverDescription = () => {
    if (!caregiver) return '';
    return `${caregiver.name || 'Your caregiver'} is responsible for managing your daily medicines and routines, and ensuring you get the best care possible.`;
  };

  const getAvailabilityStatus = () => {
    return 'Available during working hours';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading caregiver information...</Text>
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
        <Text style={styles.headerTitle}>My Caregiver</Text>
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
            <TouchableOpacity style={styles.retryButton} onPress={fetchCaregiver}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : caregiver ? (
          <>
            <View style={styles.caregiverCard}>
              <View style={styles.cardHeader}>
                <View style={styles.imageContainer}>
                  {caregiver.profileImage ? (
                    <Image
                      source={{ uri: `${IMAGE_BASE_URL}${caregiver.profileImage}` }}
                      style={styles.caregiverImage}
                      onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <MaterialCommunityIcons name="shield-account" size={40} color="#2E7D32" />
                    </View>
                  )}
                </View>
                
                <View style={styles.headerInfo}>
                  <Text style={styles.caregiverName}>{caregiver.name || 'Not provided'}</Text>
                  <View style={styles.roleBadge}>
                    <MaterialCommunityIcons 
                      name="shield-account" 
                      size={14} 
                      color="#2E7D32" 
                    />
                    <Text style={styles.roleText}>Primary Caregiver</Text>
                  </View>
                </View>

                <View style={styles.statusBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.statusText}>Active</Text>
                </View>
              </View>

              <View style={styles.descriptionContainer}>
                <MaterialCommunityIcons name="format-quote-open" size={16} color="#8DA887" />
                <Text style={styles.descriptionText}>
                  {getCaregiverDescription()}
                </Text>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="account-details" size={16} color="#2E7D32" />
                  <Text style={styles.sectionTitle}>Personal Information</Text>
                </View>
                
                {caregiver.gender && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="gender-male-female" size={16} color="#8DA887" />
                    <Text style={styles.infoLabel}>Gender:</Text>
                    <Text style={styles.infoValue}>{caregiver.gender}</Text>
                  </View>
                )}
              </View>

              <View style={styles.infoSection}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="contacts" size={16} color="#2E7D32" />
                  <Text style={styles.sectionTitle}>Contact Information</Text>
                </View>
                
                {caregiver.email && (
                  <TouchableOpacity 
                    style={styles.contactRow} 
                    onPress={handleEmail}
                  >
                    <View style={styles.contactIconSmall}>
                      <MaterialCommunityIcons name="email" size={14} color="#2E7D32" />
                    </View>
                    <Text style={styles.contactLabel}>Email:</Text>
                    <Text style={styles.contactValue}>{caregiver.email}</Text>
                  </TouchableOpacity>
                )}

                {caregiver.phone && (
                  <TouchableOpacity 
                    style={styles.contactRow} 
                    onPress={handleCall}
                  >
                    <View style={styles.contactIconSmall}>
                      <MaterialCommunityIcons name="phone" size={14} color="#2E7D32" />
                    </View>
                    <Text style={styles.contactLabel}>Phone:</Text>
                    <Text style={styles.contactValue}>{caregiver.phone}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {caregiver.address && (
                <TouchableOpacity 
                  style={styles.infoSection}
                  onPress={handleOpenMaps}
                >
                  <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons name="home-map-marker" size={16} color="#2E7D32" />
                    <Text style={styles.sectionTitle}>Location</Text>
                  </View>
                  
                  <View style={styles.addressBlock}>
                    <MaterialCommunityIcons name="map-marker" size={16} color="#8DA887" />
                    <View style={styles.addressTextContainer}>
                      {caregiver.address.street && (
                        <Text style={styles.addressLine}>{caregiver.address.street}</Text>
                      )}
                      <Text style={styles.addressLine}>
                        {[
                          caregiver.address.city,
                          caregiver.address.state
                        ].filter(Boolean).join(', ')}
                      </Text>
                    </View>
                    <MaterialCommunityIcons name="arrow-right" size={16} color="#8DA887" />
                  </View>
                </TouchableOpacity>
              )}

              <View style={styles.infoSection}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="information" size={16} color="#2E7D32" />
                  <Text style={styles.sectionTitle}>Additional Information</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="#8DA887" />
                  <Text style={styles.infoLabel}>Availability:</Text>
                  <Text style={styles.infoValue}>{getAvailabilityStatus()}</Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                {caregiver.phone && (
                  <>
                    <TouchableOpacity
                      style={styles.callButton}
                      onPress={handleCall}
                    >
                      <MaterialCommunityIcons name="phone" size={20} color="#FFFFFF" />
                      <Text style={styles.buttonText}>Call</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.messageButton}
                      onPress={handleMessage}
                    >
                      <MaterialCommunityIcons name="message-text" size={20} color="#FFFFFF" />
                      <Text style={styles.buttonText}>Message</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="shield-account-outline" size={60} color="#8DA887" />
            <Text style={styles.emptyText}>No caregiver information found</Text>
            <Text style={styles.emptySubText}>Your caregiver details will appear here once assigned</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CaregiverInfoScreen;