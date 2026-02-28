/**
 * NotificationScreen.js
 * Shows all notifications with proper formatting and actions
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { 
  getPatientNotifications, 
  markNotificationAsRead,
  getTodayTasks 
} from '../services/HomeService';
import styles from '../styles/NotificationStyles';

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [taskMap, setTaskMap] = useState({});

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await getPatientNotifications();
      if (response.status === 'SUCCESS') {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.log('Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Build a map of task name + time to task tracking ID
  const buildTaskMap = useCallback(async () => {
    try {
      const tasksRes = await getTodayTasks();
      if (tasksRes.status === 'SUCCESS' && tasksRes.data) {
        const map = {};
        // Use allTasks array which contains task tracking IDs
        (tasksRes.data.allTasks || []).forEach(task => {
          // Create a key using task name and time
          const key = `${task.taskName}_${task.scheduledTime}`;
          map[key] = task.id || task._id; // This is the task tracking ID
          console.log(`Mapping ${key} -> ${map[key]}`);
        });
        setTaskMap(map);
      }
    } catch (error) {
      console.log('Build task map error:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    buildTaskMap();
    
    // Refresh every 15 seconds
    const interval = setInterval(() => {
      fetchNotifications();
      buildTaskMap();
    }, 15000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications, buildTaskMap]);

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([fetchNotifications(), buildTaskMap()]).finally(() => {
      setRefreshing(false);
    });
  };

  const handleNotificationPress = async (notification) => {
    try {
      setNavigating(true);
      console.log('Notification pressed:', {
        taskName: notification.taskName,
        scheduledTime: notification.scheduledTime,
        notificationTaskId: notification.taskId
      });
      
      // Create key from notification
      const key = `${notification.taskName}_${notification.scheduledTime}`;
      console.log('Looking for key:', key);
      console.log('Available taskMap:', taskMap);
      
      // Find the correct task tracking ID from our map
      const taskTrackingId = taskMap[key];
      
      if (!taskTrackingId) {
        console.log('No matching task found for key:', key);
        Alert.alert(
          'Error',
          'Could not find the corresponding task. It may have been completed or deleted.',
          [{ text: 'OK' }]
        );
        setNavigating(false);
        return;
      }

      console.log('Found task tracking ID:', taskTrackingId);
      
      // Navigate directly to task details with the correct task tracking ID
      navigation.navigate('TaskDetails', { taskId: taskTrackingId });
      
      // Mark as read after navigation
      if (!notification.read) {
        try {
          await markNotificationAsRead(notification._id);
          setNotifications(prev => 
            prev.map(n => 
              n._id === notification._id ? { ...n, read: true } : n
            )
          );
        } catch (markError) {
          console.log('Mark read error:', markError);
        }
      }
    } catch (error) {
      console.log('Notification press error:', error);
      Alert.alert(
        'Error',
        'Failed to load task details. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setNavigating(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const getIconAndColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'reminder':
        return { 
          icon: 'bell-ring', 
          color: '#2E7D32',
          bg: '#E8F5E9',
          label: 'REMINDER'
        };
      case 'alert':
        return { 
          icon: 'alert', 
          color: '#F59E0B',
          bg: '#FEF3C7',
          label: 'ALERT'
        };
      case 'missed':
        return { 
          icon: 'close-circle', 
          color: '#DC2626',
          bg: '#FEE2E2',
          label: 'MISSED'
        };
      default:
        return { 
          icon: 'bell', 
          color: '#6B7280',
          bg: '#F3F4F6',
          label: 'INFO'
        };
    }
  };

  const extractMinutesLate = (message) => {
    if (!message) return null;
    const match = message.match(/(\d+)\s*minutes?\s*late/i);
    return match ? parseInt(match[1], 10) : null;
  };

  const renderNotification = ({ item }) => {
    const { icon, color, bg, label } = getIconAndColor(item.type);
    const minutesLate = extractMinutesLate(item.message);
    
    return (
      <TouchableOpacity
        style={[styles.card, !item.read && styles.unreadCard]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
        disabled={navigating}
      >
        <View style={[styles.iconContainer, { backgroundColor: bg }]}>
          <MaterialCommunityIcons name={icon} size={28} color={color} />
        </View>
        
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={[styles.typeTag, { color, backgroundColor: bg }]}>{label}</Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
          
          <View style={styles.footer}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#9CA3AF" />
            <Text style={styles.time}>{formatTime(item.sentAt)}</Text>
            
            {minutesLate !== null && (
              <View style={[styles.timeBadge, { backgroundColor: bg }]}>
                <MaterialCommunityIcons name="timer" size={14} color={color} />
                <Text style={[styles.timeBadgeText, { color }]}>
                  {minutesLate >= 60
                    ? `${Math.floor(minutesLate / 60)}h${minutesLate % 60 > 0 ? ` ${minutesLate % 60}m` : ''} late`
                    : `${minutesLate} min late`}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header - REMOVED Mark All button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {/* Removed the Mark All button and placeholder */}
        <View style={styles.placeholder} />
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="bell-off" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptyText}>No notifications to show</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationScreen;