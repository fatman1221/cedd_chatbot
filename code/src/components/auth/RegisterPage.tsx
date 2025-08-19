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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm
        onSuccess={handleRegisterSuccess}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
};