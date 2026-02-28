import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
const API_BASE_URL = API_URL;

export const getTodayTasks = async () => {
  try {
    // FIXED: Use 'token' consistently (not 'userToken')
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      return { status: 'FAILED', message: 'No token found', data: null };
    }

    const response = await axios.get(`${API_BASE_URL}/patient/today-tasks`, {
      headers: { token }
    });

    return response.data;
  } catch (error) {
    console.error('Get today tasks error:', error);
    return {
      status: 'FAILED',
      message: error.response?.data?.message || 'Failed to fetch tasks',
      data: null
    };
  }
};

export const getTaskDetails = async (taskId) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      return { status: 'FAILED', message: 'No token found', data: null };
    }

    const response = await axios.get(`${API_BASE_URL}/patient/task/${taskId}`, {
      headers: { token }
    });

    return response.data;
  } catch (error) {
    console.error('Get task details error:', error);
    return {
      status: 'FAILED',
      message: error.response?.data?.message || 'Failed to fetch task details',
      data: null
    };
  }
};

export const completeTask = async (taskId) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      return { status: 'FAILED', message: 'No token found', data: null };
    }

    const response = await axios.post(
      `${API_BASE_URL}/patient/tasks/complete`,
      { taskId },
      { headers: { token } }
    );

    return response.data;
  } catch (error) {
    console.error('Complete task error:', error);
    return {
      status: 'FAILED',
      message: error.response?.data?.message || 'Failed to complete task',
      data: null
    };
  }
};