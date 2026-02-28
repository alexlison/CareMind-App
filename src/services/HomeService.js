

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';

const BASE_URL = API_URL;

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

export const logoutUser = async (navigation) => {
  try {
    await AsyncStorage.multiRemove(['userToken', 'userData', 'userRole', 'autoLogin']);
    if (navigation) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

export const getPatientDashboard = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/patient/dashboard`, await authConfig());
    return response.data;
  } catch (error) {
    console.log('Dashboard error:', error.response?.data || error.message);
    return { status: 'FAILED', message: 'Failed to fetch dashboard', data: null };
  }
};

export const getPatientNotifications = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/patient/notifications`, await authConfig());
    return response.data;
  } catch (error) {
    console.log('Notifications error:', error.response?.data || error.message);
    return { status: 'FAILED', message: 'Failed to fetch notifications', data: [], unreadCount: 0 };
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/patient/notifications/${notificationId}/read`,
      {},
      await authConfig()
    );
    return response.data;
  } catch (error) {
    console.log('Mark read error:', error.response?.data || error.message);
    return { status: 'FAILED', message: 'Failed to mark as read', data: null };
  }
};

export const getReinforcementProfile = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/patient/reinforcement/profile`, await authConfig());
    return response.data;
  } catch (error) {
    return { status: 'FAILED', message: 'Failed to fetch profile', data: null };
  }
};

export const getTodayTasks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/patient/today-tasks`, await authConfig());
    return response.data;
  } catch (error) {
    console.log('Tasks error:', error.response?.data || error.message);
    return { status: 'FAILED', message: 'Failed to fetch tasks', data: null };
  }
};

export const getTaskDetails = async (taskId) => {
  try {
    const response = await axios.get(`${BASE_URL}/patient/task/${taskId}`, await authConfig());
    return response.data;
  } catch (error) {
    return { status: 'FAILED', message: 'Failed to fetch task details', data: null };
  }
};

export const completeTask = async (taskId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/patient/tasks/complete`,
      { taskId },
      await authConfig()
    );
    return response.data;
  } catch (error) {
    console.log('Complete task error:', error.response?.data || error.message);
    return { status: 'FAILED', message: 'Failed to complete task', data: null };
  }
};

export default {
  logoutUser,
  getPatientDashboard,
  getPatientNotifications,
  markNotificationAsRead,
  getReinforcementProfile,
  getTodayTasks,
  getTaskDetails,
  completeTask,
};