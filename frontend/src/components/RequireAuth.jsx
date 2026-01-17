import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';

export default function RequireAuth({ children }) {
  const auth = useAuth();
  if (!auth || !auth.user) return <Navigate to="/login" replace />;
  return children;
}
