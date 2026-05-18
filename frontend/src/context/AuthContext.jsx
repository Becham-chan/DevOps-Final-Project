import React, { createContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await api.get('/api/auth/user/');
      setUser(response.data);
    } catch {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = useCallback(async (username, email, password, firstName = '', lastName = '') => {
    const response = await api.post('/api/auth/register/', { username, email, password, first_name: firstName, last_name: lastName });
    setUser(response.data.user);
    setToken(response.data.token);
    localStorage.setItem('token', response.data.token);
    api.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
    return response.data;
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await api.post('/api/auth/login/', { email, password });
    setUser(response.data.user);
    setToken(response.data.token);
    localStorage.setItem('token', response.data.token);
    api.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
    return response.data;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout, isAuthenticated: !!token && !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
