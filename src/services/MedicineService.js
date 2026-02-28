import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

const API_BASE_URL = API_URL || 'http://10.199.164.6:5000/api';

export const getPatientMedicines = async () => {
  try {
    // Get token with proper error handling
    const token = await AsyncStorage.getItem('userToken');
    console.log('MedicineService - Token retrieved:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.log('No token found in storage');
      return { 
        status: 'FAILED', 
        message: 'No authentication token found. Please login again.', 
        data: null 
      };
    }

    console.log('Fetching medicines from:', `${API_BASE_URL}/patient/medicines`);
    
    const response = await axios.get(`${API_BASE_URL}/patient/medicines`, {
      headers: { 
        'token': token,
        'Content-Type': 'application/json'
      }
    });

    console.log('Medicines response status:', response.status);
    console.log('Medicines response data:', response.data);

    return response.data;
  } catch (error) {
    console.error('Get medicines error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      return { 
        status: 'FAILED', 
        message: 'Session expired. Please login again.', 
        data: null 
      };
    }
    
    return {
      status: 'FAILED',
      message: error.response?.data?.message || 'Failed to fetch medicines',
      data: null
    };
  }
};