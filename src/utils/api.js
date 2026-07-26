import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ganti dengan IP komputer kamu (cek dengan ipconfig)
// Jangan pakai localhost karena emulator Android tidak bisa akses localhost PC
const BASE_URL = 'https://funday-production.up.railway.app/api';

const api = axios.create({ baseURL: BASE_URL });

// Auto attach token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
export { BASE_URL };
