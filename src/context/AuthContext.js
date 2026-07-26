import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
        }
      } catch {
        await AsyncStorage.clear();
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password, phone) => {
    const res = await api.post('/auth/register', { name, email, password, phone });
    await AsyncStorage.setItem('token', res.data.token);
    const me = await api.get('/auth/me');
    setUser(me.data.data);
  };

  const logout = async () => {
    await AsyncStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
