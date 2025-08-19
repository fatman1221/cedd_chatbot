import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { VerifyEmailPage } from './VerifyEmailPage';
import { ResetPasswordPage } from './ResetPasswordPage';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';


type AuthMode = 'login' | 'register' | 'forgot-password' | 'verify-email' | 'reset-password' | 'success';

interface AuthPageProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [successMessage, setSuccessMessage] = useState('');
  const { t } = useTranslation();
  const handleRegisterSuccess = (message: string) => {
    setSuccessMessage(message);
    setMode('success');
  };

  const handleBackToLogin = () => {
    setMode('login');
    setSuccessMessage('');
  };

  const renderContent = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm
            onSuccess={onLoginSuccess}
            onSwitchToRegister={() => setMode('register')}
            onForgotPassword={() => setMode('forgot-password')}
          />
        );
      case 'register':
        return (
          <RegisterForm
            onSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setMode('login')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onSuccess={handleRegisterSuccess}
            onBackToLogin={() => setMode('login')}
          />
        );
      case 'verify-email':
        return (
          <VerifyEmailPage
            onSuccess={handleRegisterSuccess}
            onBackToLogin={() => setMode('login')}
          />
        );
      case 'reset-password':
        return (
          <ResetPasswordPage
            onSuccess={handleRegisterSuccess}
            onBackToLogin={() => setMode('login')}
          />
        );
      case 'success':
        return (
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">t('success')</h2>
              <p className="text-gray-600 mb-6">{successMessage}</p>
              <button
                onClick={handleBackToLogin}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                t('backToLogin')
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {renderContent()}
      </div>
    </div>
  );
};