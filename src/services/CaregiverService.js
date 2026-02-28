import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

const API_BASE_URL = API_URL;

export const getMyCaregiver = async () => {
  try {
    // Try both possible token keys
    let token = await AsyncStorage.getItem('userToken');
    
    // If userToken not found, try 'token'
    if (!token) {
      token = await AsyncStorage.getItem('token');
    }
    
    console.log('CaregiverService - Token found:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.log('No token found in storage');
      return { status: 'FAILED', message: 'No authentication token found', data: null };
    }

    console.log('Fetching caregiver from:', `${API_BASE_URL}/patient/my-caregiver`);
    
    const response = await axios.get(`${API_BASE_URL}/patient/my-caregiver`, {
      headers: { token }
    });

    console.log('Caregiver response status:', response.status);
    console.log('Caregiver data:', response.data);

    return response.data;
  } catch (error) {
    console.error('Get caregiver error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    return {
      status: 'FAILED',
      message: error.response?.data?.message || 'Failed to fetch caregiver information',
      data: null
    };
  }
};