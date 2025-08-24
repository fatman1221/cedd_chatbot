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
    <div 
      style={{ 
        backgroundColor: 'rgba(245, 247, 255, 1)',
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 'clamp(24px, 12.8vh, 138px)',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <LoginForm
          onSuccess={handleLoginSuccess}
          onSwitchToRegister={handleSwitchToRegister}
          onForgotPassword={handleForgotPassword}
        />
      </div>
    </div>
  );
};

export default LoginPage;