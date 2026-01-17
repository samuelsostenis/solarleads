import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('sl_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  });

  useEffect(() => {
    if (user) localStorage.setItem('sl_user', JSON.stringify(user));
    else localStorage.removeItem('sl_user');
  }, [user]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const token = res.data?.data?.token;
    const userData = res.data?.data?.user;
    if (token) {
      localStorage.setItem('sl_token', token);
      setUser(userData || null);
    }
    return res;
  };

  const register = async (email, password, name) => {
    const res = await api.post('/auth/register', { email, password, name });
    const token = res.data?.data?.token;
    const userData = res.data?.data?.user;
    if (token) {
      localStorage.setItem('sl_token', token);
      setUser(userData || null);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('sl_token');
    localStorage.removeItem('sl_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
