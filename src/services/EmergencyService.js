import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL } from '@env';
const API_BASE_URL = API_URL;

export const getEmergencyContact = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      return { status: 'FAILED', message: 'No token found', data: null };
    }

    const response = await axios.get(`${API_BASE_URL}/patient/my-profile`, {
      headers: { token }
    });

    if (response.data.status === 'SUCCESS' && response.data.data) {
      // Extract emergency contact from patient profile
      const emergencyContact = response.data.data.emergencyContact || null;
      return {
        status: 'SUCCESS',
        message: 'Emergency contact retrieved successfully',
        data: emergencyContact
      };
    }

    return {
      status: 'FAILED',
      message: response.data.message || 'Failed to fetch emergency contact',
      data: null
    };
  } catch (error) {
    console.error('Get emergency contact error:', error);
    return {
      status: 'FAILED',
      message: error.response?.data?.message || 'Failed to fetch emergency contact',
      data: null
    };
  }
};