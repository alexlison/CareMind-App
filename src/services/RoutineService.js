import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
const API_BASE_URL = API_URL;

export const getPatientRoutines = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      return { status: 'FAILED', message: 'No token found', data: null };
    }

    const response = await axios.get(`${API_BASE_URL}/patient/routines`, {
      headers: { token }
    });

    return response.data;
  } catch (error) {
    console.error('Get routines error:', error);
    return {
      status: 'FAILED',
      message: error.response?.data?.message || 'Failed to fetch routines',
      data: null
    };
  }
};