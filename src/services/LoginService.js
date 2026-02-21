import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://172.22.173.6:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData',
  USER_ROLE: 'userRole',
  IS_LOGGED_IN: 'isLoggedIn',
  SAVED_EMAIL: 'savedEmail',
  SAVED_PASSWORD: 'savedPassword',
  REMEMBER_ME: 'rememberMe',
};


export const patientLogin = async (email, password, rememberMe = false) => {
  try {
    console.log('Attempting login with:', { email });

    const response = await api.post('/auth/patientLogin', {
      email: email.toLowerCase().trim(),
      password: password,
    });

    console.log('Login response:', response.data);

    const { status, message, user, token } = response.data;

    if (status === 'Success') {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, user.role || 'patient');
      await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');

      if (rememberMe) {
        await AsyncStorage.setItem(STORAGE_KEYS.SAVED_EMAIL, email);
        await AsyncStorage.setItem(STORAGE_KEYS.SAVED_PASSWORD, password);
        await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      } else {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.SAVED_EMAIL,
          STORAGE_KEYS.SAVED_PASSWORD,
          STORAGE_KEYS.REMEMBER_ME,
        ]);
      }

      return { success: true, user, token };
    } else {
      return { success: false, message: message || 'Login failed' };
    }
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);

    let errorMessage = 'Network error. Please check your connection.';

    if (error.response) {
      errorMessage = error.response.data?.message || 'Login failed';
      if (error.response.status === 401) errorMessage = 'Invalid email or password';
      else if (error.response.status === 400) errorMessage = 'Please enter email and password';
      else if (error.response.status === 404) errorMessage = 'Login service not found';
    }

    return { success: false, message: errorMessage };
  }
};


export const getSavedCredentials = async () => {
  try {
    const savedEmail = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_EMAIL);
    const savedPassword = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_PASSWORD);
    const rememberMe = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);

    if (savedEmail && savedPassword && rememberMe === 'true') {
      return { email: savedEmail, password: savedPassword, rememberMe: true };
    }

    return { email: '', password: '', rememberMe: false };
  } catch (error) {
    console.error('Error getting saved credentials:', error);
    return { email: '', password: '', rememberMe: false };
  }
};

export const checkLoginStatus = async () => {
  try {
    const isLoggedIn = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
    const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);

    if (isLoggedIn === 'true' && token && userData) {
      return { isLoggedIn: true, user: JSON.parse(userData), token };
    }

    return { isLoggedIn: false };
  } catch (error) {
    console.error('Login status check error:', error);
    return { isLoggedIn: false };
  }
};

export default { patientLogin, getSavedCredentials, checkLoginStatus };