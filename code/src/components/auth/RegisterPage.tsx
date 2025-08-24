import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm } from './RegisterForm';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRegisterSuccess = (message: string) => {
    // 注册成功后跳转到等待审批页面
    navigate('/pending-approval', { state: { message } });
  };

  const handleSwitchToLogin = () => {
    navigate('/login');
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
        <RegisterForm
          onSuccess={handleRegisterSuccess}
          onSwitchToLogin={handleSwitchToLogin}
        />
      </div>
    </div>
  );
};