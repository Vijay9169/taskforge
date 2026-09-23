import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

function AppContent() {
  const { token, user } = useContext(AuthContext);

  if (!token || !user) {
    return <Auth />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}