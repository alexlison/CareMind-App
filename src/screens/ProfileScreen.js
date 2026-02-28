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
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getMyProfile } from '../services/ProfileService';
import styles from '../styles/ProfileStyles';
import { API_URL } from '@env';
const BASE_URL = API_URL.replace('/api', '');
const IMAGE_BASE_URL = BASE_URL;


const ProfileScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await getMyProfile();
      if (response.status === 'SUCCESS') {
        setProfile(response.data);
      }
    } catch (error) {
      console.log('Fetch profile error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F4F0" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={34} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
        }
      >
        {profile ? (
          <>
            {/* Profile Image Section */}
            <View style={styles.profileImageSection}>
              <View style={styles.profileImageContainer}>
                {profile.imageUrl ? (
                  <Image
                    source={{ uri: `${IMAGE_BASE_URL}${profile.imageUrl}` }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Text style={styles.profileInitials}>
                      {profile.name?.charAt(0).toUpperCase() || 'P'}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.profileName}>{profile.name}</Text>
              {profile.nickName && (
                <Text style={styles.profileNickname}>Nick Name: "{profile.nickName}"</Text>
              )}
            </View>

            {/* Basic Information Card */}
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="account-details" size={20} color="#2E7D32" />
                <Text style={styles.cardTitle}>Basic Information</Text>
              </View>
              
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="email" size={20} color="#8DA887" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{profile.email || 'Not provided'}</Text>
                </View>
              </View>

              {profile.phone && (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="phone" size={20} color="#8DA887" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{profile.phone}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Personal Details Card */}
            {profile.personalDetails && (
              <View style={styles.infoCard}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name="heart-pulse" size={20} color="#2E7D32" />
                  <Text style={styles.cardTitle}>Personal Details</Text>
                </View>
                
                {profile.personalDetails.dob && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="cake" size={20} color="#8DA887" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Date of Birth</Text>
                      <Text style={styles.infoValue}>{formatDate(profile.personalDetails.dob)}</Text>
                    </View>
                  </View>
                )}

                {profile.personalDetails.gender && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="gender-male-female" size={20} color="#8DA887" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Gender</Text>
                      <Text style={styles.infoValue}>{profile.personalDetails.gender}</Text>
                    </View>
                  </View>
                )}

                {profile.personalDetails.bloodGroup && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="water" size={20} color="#8DA887" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Blood Group</Text>
                      <Text style={styles.infoValue}>{profile.personalDetails.bloodGroup}</Text>
                    </View>
                  </View>
                )}

                {profile.personalDetails.highestQualification && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="school" size={20} color="#8DA887" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Qualification</Text>
                      <Text style={styles.infoValue}>{profile.personalDetails.highestQualification}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Address Card */}
            {profile.address && (profile.address.street || profile.address.city || profile.address.state) && (
              <View style={styles.infoCard}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name="map-marker" size={20} color="#2E7D32" />
                  <Text style={styles.cardTitle}>Address</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="home" size={20} color="#8DA887" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoValue}>
                      {[
                        profile.address.street,
                        profile.address.city,
                        profile.address.state
                      ].filter(Boolean).join(', ') || 'Not provided'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Account Status */}
            <View style={styles.statusCard}>
              <View style={styles.statusRow}>
                <MaterialCommunityIcons 
                  name={profile.isActive ? 'check-circle' : 'alert-circle'} 
                  size={20} 
                  color={profile.isActive ? '#2E7D32' : '#C62828'} 
                />
                <Text style={[styles.statusText, profile.isActive ? styles.activeStatus : styles.inactiveStatus]}>
                  Account {profile.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
              <Text style={styles.memberSince}>
                Member since {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-question" size={60} color="#8DA887" />
            <Text style={styles.emptyText}>No profile information found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;