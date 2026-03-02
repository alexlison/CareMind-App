
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

const BASE_URL = API_URL || 'http://172.22.173.6:5000/api';

const getToken = async () => {
  const token = await AsyncStorage.getItem('userToken');
  if (!token) {
    return await AsyncStorage.getItem('token');
  }
  return token;
};

export const loadChatHistory = async () => {
  try {
    const token = await getToken();
    const response = await axios.get(`${BASE_URL}/patient/chat/history`, {
      headers: { token },
    });

    if (response.data.status === 'SUCCESS' && response.data.data) {
      // Map server shape → screen shape
      return response.data.data.map(m => ({
        id: m._id || Math.random().toString(),
        role: m.role,
        text: m.content,
        time: m.sentAt,
      }));
    }

    return [];
  } catch (error) {
    console.log('ChatService loadChatHistory error:', error.message);
    return [];
  }
};

// ── Send a message and get bot reply ─────────────────────────────────────────
export const sendChatMessage = async (message) => {
  try {
    const token = await getToken();
    const response = await axios.post(
      `${BASE_URL}/patient/chat`,
      { message },
      { headers: { token } }
    );

    if (response.data.status === 'SUCCESS') {
      return { 
        success: true, 
        reply: response.data.data.reply 
      };
    }

    return { success: false, reply: null };
  } catch (error) {
    console.log('ChatService sendChatMessage error:', error.message);
    return { success: false, reply: null };
  }
};

// ── Clear all chat history from server ───────────────────────────────────────
export const clearChatHistory = async () => {
  try {
    const token = await getToken();
    await axios.delete(`${BASE_URL}/patient/chat/clear`, {
      headers: { token },
    });
    return true;
  } catch (error) {
    console.log('ChatService clearChatHistory error:', error.message);
    return false;
  }
};