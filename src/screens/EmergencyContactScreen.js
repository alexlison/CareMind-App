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
  Platform,
  PermissionsAndroid,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from 'react-native-geolocation-service';
import { getEmergencyContact } from '../services/EmergencyService';
import styles from '../styles/EmergencyStyles';

const EmergencyContactScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState(null);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const fetchEmergencyContact = useCallback(async () => {
    try {
      const response = await getEmergencyContact();
      console.log('Emergency contact response:', response);
      if (response.status === 'SUCCESS') {
        setEmergencyContact(response.data);
      } else {
        console.log('Failed to fetch emergency contact:', response.message);
      }
    } catch (error) {
      console.log('Fetch emergency contact error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEmergencyContact();
    checkPermissionStatus();
  }, [fetchEmergencyContact]);

  // FIXED: Added onRefresh function
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEmergencyContact();
  }, [fetchEmergencyContact]);

  const checkPermissionStatus = async () => {
    try {
      if (Platform.OS === 'ios') {
        // For iOS, we'll check when we need it
        setHasPermission(true);
        return;
      }

      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      console.log('Location permission status:', granted);
      setHasPermission(granted);
    } catch (err) {
      console.warn('Permission check error:', err);
      setHasPermission(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        // iOS handles permission when we call getCurrentPosition
        return true;
      }

      console.log('Requesting location permission...');
      
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'CareMind needs access to your location to share it with emergency contacts.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      
      console.log('Permission request result:', granted);
      
      const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      setHasPermission(isGranted);
      return isGranted;
    } catch (err) {
      console.warn('Permission request error:', err);
      Alert.alert('Error', 'Failed to request location permission');
      return false;
    }
  };

  const handleCall = () => {
    if (emergencyContact?.phone) {
      Linking.openURL(`tel:${emergencyContact.phone}`);
    } else {
      Alert.alert('Error', 'No phone number available');
    }
  };

  const handleMessage = () => {
    if (emergencyContact?.phone) {
      Linking.openURL(`sms:${emergencyContact.phone}`);
    } else {
      Alert.alert('Error', 'No phone number available');
    }
  };

  const handleEmail = () => {
    if (emergencyContact?.email) {
      Linking.openURL(`mailto:${emergencyContact.email}`);
    } else {
      Alert.alert('Error', 'No email available');
    }
  };

  const handleShareLocation = async () => {
    if (!emergencyContact?.phone) {
      Alert.alert('Error', 'No phone number available to share location');
      return;
    }

    Alert.alert(
      'Share Location',
      'Choose how you want to share your current location',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'WhatsApp', 
          onPress: () => handleLocationShare('whatsapp')
        },
        { 
          text: 'SMS', 
          onPress: () => handleLocationShare('sms')
        },
      ]
    );
  };

  const handleLocationShare = async (method) => {
    try {
      // Check if we have permission
      if (!hasPermission) {
        console.log('No permission, requesting...');
        const permissionGranted = await requestLocationPermission();
        if (!permissionGranted) {
          Alert.alert(
            'Permission Required',
            'Location permission is needed to share your location.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open Settings', 
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                }
              }
            ]
          );
          return;
        }
      }

      // Get location
      setSharingLocation(true);
      console.log('Getting location...');

      Geolocation.getCurrentPosition(
        (position) => {
          console.log('Location obtained:', position);
          const { latitude, longitude } = position.coords;
          
          const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          const message = `🚨 EMERGENCY ALERT 🚨\n\nI need immediate help!\n\nMy current location:\n${locationUrl}\n\nCoordinates:\nLat: ${latitude.toFixed(6)}\nLng: ${longitude.toFixed(6)}`;
          
          shareLocation(method, message);
          setSharingLocation(false);
        },
        (error) => {
          console.log('Location error:', error);
          let errorMessage = 'Unable to get your location.';
          
          switch (error.code) {
            case 1:
              errorMessage = 'Location permission denied.';
              break;
            case 2:
              errorMessage = 'Unable to get location. Please check if GPS is enabled.';
              break;
            case 3:
              errorMessage = 'Location request timed out.';
              break;
            default:
              errorMessage = error.message;
          }

          Alert.alert('Location Error', errorMessage);
          setSharingLocation(false);
        },
        { 
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
          distanceFilter: 0,
        }
      );
    } catch (error) {
      console.log('Location share error:', error);
      Alert.alert('Error', 'Failed to share location');
      setSharingLocation(false);
    }
  };

  const shareLocation = (method, message) => {
    const phoneNumber = emergencyContact.phone.replace(/[^0-9]/g, '');
    console.log('Sharing via:', method, 'to:', phoneNumber);
    
    if (method === 'whatsapp') {
      const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
      
      Linking.openURL(whatsappUrl).catch(() => {
        // Fallback to web WhatsApp
        const webWhatsAppUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
        Linking.openURL(webWhatsAppUrl).catch(() => {
          Alert.alert(
            'WhatsApp Not Available',
            'WhatsApp is not installed. Would you like to send an SMS instead?',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Send SMS', 
                onPress: () => sendSMS(phoneNumber, message)
              }
            ]
          );
        });
      });
    } else {
      sendSMS(phoneNumber, message);
    }
  };

  const sendSMS = (phoneNumber, message) => {
    const smsUrl = Platform.select({
      ios: `sms:${phoneNumber}&body=${encodeURIComponent(message)}`,
      android: `sms:${phoneNumber}?body=${encodeURIComponent(message)}`,
    });
    
    Linking.openURL(smsUrl).catch((err) => {
      console.log('SMS error:', err);
      Alert.alert('Error', 'Unable to send SMS. Please try again.');
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading emergency contact...</Text>
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
        <Text style={styles.headerTitle}>Emergency Contact</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#2E7D32" 
            colors={["#2E7D32"]} // Added colors prop for Android
          />
        }
      >
        {emergencyContact ? (
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyHeader}>
              <View style={styles.emergencyIconContainer}>
                <MaterialCommunityIcons name="alert-circle" size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.emergencyTitle}>EMERGENCY CONTACT</Text>
            </View>

            <View style={styles.contactSection}>
              <View style={styles.contactRow}>
                <MaterialCommunityIcons name="account" size={22} color="#2E7D32" />
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactLabel}>Name</Text>
                  <Text style={styles.contactValue}>{emergencyContact.name || 'Not provided'}</Text>
                </View>
              </View>

              {emergencyContact.relationship && (
                <View style={styles.contactRow}>
                  <MaterialCommunityIcons name="account-heart" size={22} color="#2E7D32" />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>Relationship</Text>
                    <Text style={styles.contactValue}>{emergencyContact.relationship}</Text>
                  </View>
                </View>
              )}

              {emergencyContact.phone && (
                <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
                  <MaterialCommunityIcons name="phone" size={22} color="#2E7D32" />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>Phone</Text>
                    <Text style={styles.contactValue}>{emergencyContact.phone}</Text>
                  </View>
                </TouchableOpacity>
              )}

              {emergencyContact.email && (
                <TouchableOpacity style={styles.contactRow} onPress={handleEmail}>
                  <MaterialCommunityIcons name="email" size={22} color="#2E7D32" />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>Email</Text>
                    <Text style={styles.contactValue}>{emergencyContact.email}</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {emergencyContact.phone && (
              <>
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.emergencyCallButton} onPress={handleCall}>
                    <MaterialCommunityIcons name="phone" size={24} color="#FFFFFF" />
                    <Text style={styles.buttonText}>CALL NOW</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.emergencyMessageButton} onPress={handleMessage}>
                    <MaterialCommunityIcons name="message-text" size={24} color="#FFFFFF" />
                    <Text style={styles.buttonText}>MESSAGE</Text>
                  </TouchableOpacity>
                </View>

                {/* Location Share Button */}
                <View style={styles.locationShareContainer}>
                  <TouchableOpacity
                    style={[
                      styles.locationShareButton,
                      sharingLocation && styles.locationShareButtonDisabled
                    ]}
                    onPress={handleShareLocation}
                    disabled={sharingLocation}
                  >
                    {sharingLocation ? (
                      <>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.locationShareText}>Getting Location...</Text>
                      </>
                    ) : (
                      <>
                        <MaterialCommunityIcons name="map-marker" size={24} color="#FFFFFF" />
                        <Text style={styles.locationShareText}>SHARE MY LOCATION</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <Text style={styles.locationShareNote}>
                    Tap to share your current location via WhatsApp or SMS
                  </Text>
                </View>
              </>
            )}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#8DA887" />
            <Text style={styles.emptyText}>No emergency contact found</Text>
            <Text style={styles.emptySubText}>Please contact your caregiver to add an emergency contact</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default EmergencyContactScreen;