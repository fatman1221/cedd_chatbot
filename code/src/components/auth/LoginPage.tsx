import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { useAuth } from '../../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLoginSuccess = (user: any, token: string) => {
    login(user, token);
    navigate('/', { replace: true });
  };

  const handleSwitchToRegister = () => {
    navigate('/register');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm
        onSuccess={handleLoginSuccess}
        onSwitchToRegister={handleSwitchToRegister}
        onForgotPassword={handleForgotPassword}
      />
    </div>
  );
};