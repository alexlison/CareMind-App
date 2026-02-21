import AsyncStorage from '@react-native-async-storage/async-storage';

export const logoutUser = async (navigation) => {
  try {
    await AsyncStorage.multiRemove([
      'userToken',
      'userData',
      'userRole',
      'autoLogin',
    ]);

    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }], 
    });

    return { success: true };
  } catch (error) {
    console.log('Logout error:', error);
    return { success: false };
  }
};

export default { logoutUser };