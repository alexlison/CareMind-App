import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';

const BASE_URL = API_URL || 'http://10.199.164.6:5000/api';

const getToken = async () => {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    return null;
  }
};

const authConfig = async () => {
  const token = await getToken();
  return {
    headers: {
      token,
      'Content-Type': 'application/json',
    },
  };
};

export const getNotifications = async () => {
  try {
    const config = await authConfig();
    const response = await axios.get(`${BASE_URL}/patient/notifications`, config);
    return response.data;
  } catch (error) {
    console.log('Get notifications error:', error.response?.data || error.message);
    return { status: 'FAILED', message: 'Failed to fetch', data: [], unreadCount: 0 };
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const config = await authConfig();
    const response = await axios.put(
      `${BASE_URL}/patient/notifications/${notificationId}/read`,
      {},
      config
    );
    return response.data;
  } catch (error) {
    console.log('Mark read error:', error.response?.data || error.message);
    return { status: 'FAILED', message: 'Failed to mark as read', data: null };
  }
};

// REMOVED markAllNotificationsAsRead function

// Format helpers
export const formatNotificationTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
  return `${Math.floor(diffMins / 1440)} days ago`;
};

export const extractMinutesLate = (message) => {
  if (!message) return null;
  const match = message.match(/\((\d+)\s*minutes?\s*late\)/i);
  return match ? parseInt(match[1], 10) : null;
};

export const formatMessage = (message, sentAt) => {
  if (!message) return '';
  
  // Fix NaN minutes late
  if (message.includes('NaN minutes late')) {
    const sentDate = new Date(sentAt);
    const now = new Date();
    const diffMins = Math.floor((now - sentDate) / 60000);
    return message.replace('NaN minutes late', `${diffMins} minutes late`);
  }
  
  // Fix duplicate AM/PM
  message = message.replace(/AM AM/g, 'AM').replace(/PM PM/g, 'PM');
  
  return message;
};

export const getNotificationIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'reminder': return 'bell';
    case 'alert': return 'alert';
    case 'missed': return 'close-circle';
    default: return 'bell';
  }
};

export const getNotificationColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'reminder': return '#2E7D32';
    case 'alert': return '#F59E0B';
    case 'missed': return '#DC2626';
    default: return '#6B7280';
  }
};

export const getNotificationBgColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'reminder': return '#E8F5E9';
    case 'alert': return '#FEF3C7';
    case 'missed': return '#FEE2E2';
    default: return '#F3F4F6';
  }
};

export default {
  getNotifications,
  markNotificationAsRead,
  formatNotificationTime,
  extractMinutesLate,
  formatMessage,
  getNotificationIcon,
  getNotificationColor,
  getNotificationBgColor,
};