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
  Linking,
 
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getMyRelations } from '../services/RelationsService'; 
import styles from '../styles/RelationStyles';
import { API_URL } from '@env';

const BASE_URL = API_URL.replace('/api', '');
const IMAGE_BASE_URL = BASE_URL;

const RelationsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [relations, setRelations] = useState([]);
  const [error, setError] = useState(null);

  const fetchRelations = useCallback(async () => {
    try {
      setError(null);
      console.log('Fetching relations...');
      
      const response = await getMyRelations();
      console.log('Fetch relations response:', response);
      
      if (response.status === 'SUCCESS') {
        setRelations(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch relations');
        setRelations([]);
      }
    } catch (error) {
      console.log('Fetch relations error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRelations();
  }, [fetchRelations]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRelations();
  };

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleMessage = (phone) => {
    if (phone) {
      Linking.openURL(`sms:${phone}`);
    }
  };

  const handleEmail = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  const handleOpenMaps = (address) => {
    if (address) {
      const addressString = [
        address.street,
        address.city,
        address.state,
        address.country,
        address.pincode
      ].filter(Boolean).join(', ');
      
      Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(addressString)}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getRelationDescription = (relation) => {
    const status = relation.alive === 'Alive' ? 'is' : 'was';
    return `${relation.name} ${status} your ${relation.relation?.toLowerCase() || 'relative'}`;
  };

  const getAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (e) {
      return null;
    }
  };

  const getAliveStatusColor = (alive) => {
    return alive === 'Alive' ? '#2E7D32' : '#9E9E9E';
  };

  const getAliveIcon = (alive) => {
    return alive === 'Alive' ? 'heart' : 'heart-broken';
  };

  const getAliveText = (alive) => {
    return alive === 'Alive' ? 'Alive' : 'Died';
  };

  const renderRelationCard = (relation) => {
    const age = getAge(relation.dateOfBirth);
    const formattedDob = formatDate(relation.dateOfBirth);
    const hasAddress = relation.address && (
      relation.address.street || 
      relation.address.city || 
      relation.address.state || 
      relation.address.country || 
      relation.address.pincode
    );

    return (
      <View key={relation._id} style={styles.relationCard}>
        <View style={styles.cardHeader}>
          <View style={styles.imageContainer}>
            {relation.photo ? (
              <Image
                source={{ uri: `${IMAGE_BASE_URL}${relation.photo}` }}
                style={styles.relationImage}
                onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <MaterialCommunityIcons name="account" size={30} color="#8DA887" />
              </View>
            )}
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.relationName}>{relation.name}</Text>
            <View style={styles.relationBadge}>
              <MaterialCommunityIcons 
                name="family-tree" 
                size={14} 
                color="#2E7D32" 
              />
              <Text style={styles.relationTypeText}>{relation.relation}</Text>
            </View>
          </View>

          <View style={[styles.aliveBadge, { backgroundColor: `${getAliveStatusColor(relation.alive)}20` }]}>
            <MaterialCommunityIcons
              name={getAliveIcon(relation.alive)}
              size={12}
              color={getAliveStatusColor(relation.alive)}
            />
            <Text style={[styles.aliveText, { color: getAliveStatusColor(relation.alive) }]}>
              {getAliveText(relation.alive)}
            </Text>
          </View>
        </View>

        <View style={styles.descriptionContainer}>
          <MaterialCommunityIcons name="format-quote-open" size={16} color="#8DA887" />
          <Text style={styles.descriptionText}>
            {getRelationDescription(relation)}
          </Text>
        </View>

        {(formattedDob || age) && (
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="cake-variant" size={16} color="#2E7D32" />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="cake" size={16} color="#8DA887" />
              <Text style={styles.infoLabel}>Birthday:</Text>
              <Text style={styles.infoValue}>
                {formattedDob || 'Not specified'}
                {age ? ` (${age} years old)` : ''}
              </Text>
            </View>
          </View>
        )}

        {hasAddress && (
          <TouchableOpacity 
            style={styles.infoSection}
            onPress={() => handleOpenMaps(relation.address)}
          >
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="home-map-marker" size={16} color="#2E7D32" />
              <Text style={styles.sectionTitle}>Where {relation.name?.split(' ')[0] || 'they'} Lives</Text>
            </View>
            
            <View style={styles.addressBlock}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#8DA887" />
              <View style={styles.addressTextContainer}>
                {relation.address.street && (
                  <Text style={styles.addressLine}>{relation.address.street}</Text>
                )}
                <Text style={styles.addressLine}>
                  {[
                    relation.address.city,
                    relation.address.state,
                    relation.address.country
                  ].filter(Boolean).join(', ')}
                </Text>
                {relation.address.pincode && (
                  <Text style={styles.addressLine}>PIN: {relation.address.pincode}</Text>
                )}
              </View>
              <MaterialCommunityIcons name="arrow-right" size={16} color="#8DA887" />
            </View>
          </TouchableOpacity>
        )}

        {(relation.phone || relation.email) && (
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="contacts" size={16} color="#2E7D32" />
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>
            
            {relation.phone && (
              <TouchableOpacity 
                style={styles.contactRow} 
                onPress={() => handleCall(relation.phone)}
              >
                <View style={styles.contactIconSmall}>
                  <MaterialCommunityIcons name="phone" size={14} color="#2E7D32" />
                </View>
                <Text style={styles.contactLabel}>Call:</Text>
                <Text style={styles.contactValue}>{relation.phone}</Text>
              </TouchableOpacity>
            )}

            {relation.email && (
              <TouchableOpacity 
                style={styles.contactRow} 
                onPress={() => handleEmail(relation.email)}
              >
                <View style={styles.contactIconSmall}>
                  <MaterialCommunityIcons name="email" size={14} color="#2E7D32" />
                </View>
                <Text style={styles.contactLabel}>Email:</Text>
                <Text style={styles.contactValue}>{relation.email}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {relation.notes && (
          <View style={styles.notesSection}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="note-text-outline" size={16} color="#F57C00" />
              <Text style={[styles.sectionTitle, styles.notesTitle]}>Additional Notes</Text>
            </View>
            <Text style={styles.notesText}>{relation.notes}</Text>
          </View>
        )}

        {relation.phone && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall(relation.phone)}
            >
              <MaterialCommunityIcons name="phone" size={18} color="#FFFFFF" />
              <Text style={styles.buttonText}>Call Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.messageButton}
              onPress={() => handleMessage(relation.phone)}
            >
              <MaterialCommunityIcons name="message-text" size={18} color="#FFFFFF" />
              <Text style={styles.buttonText}>Message</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading contacts...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F4F0" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Known Persons</Text>
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
            <TouchableOpacity style={styles.retryButton} onPress={fetchRelations}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : relations.length > 0 ? (
          relations.map(renderRelationCard)
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-group-outline" size={60} color="#8DA887" />
            <Text style={styles.emptyText}>No contacts found</Text>
            <Text style={styles.emptySubText}>Your caregiver hasn't added any relations yet</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RelationsScreen;