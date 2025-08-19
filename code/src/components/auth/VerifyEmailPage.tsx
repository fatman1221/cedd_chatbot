import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle, ArrowLeft, Loader } from 'lucide-react';
import { authService } from '../../services/authService';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        // 没有token参数，显示需要验证邮箱的提示
        setLoading(false);
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        setSuccess(true);
        setTimeout(() => {
          navigate('/login', { state: { message: response.message } });
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('verificationFailed', '验证失败'));
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [navigate]);

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <Loader className="h-16 w-16 text-blue-500 mx-auto animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('verifying', '验证中...')}</h2>
            <p className="text-gray-600">{t('verifyingEmail', '正在验证您的邮箱地址，请稍候')}</p>
          </div>
        </div>
      </div>
    );
  }

  // 如果没有token参数，显示需要验证邮箱的提示
  if (!token && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('emailVerificationRequired', '需要验证邮箱')}</h2>
            <p className="text-gray-600 mb-6">
              {t('emailVerificationMessage', '您的账户需要验证邮箱后才能使用。请检查您的邮箱并点击验证链接。')}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToLogin')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('verificationSuccess', '验证成功！')}</h2>
            <p className="text-gray-600 mb-6">{t('verificationSuccessMessage', '您的邮箱已成功验证，即将跳转到登录页面')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('verificationFailed', '验证失败')}</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToLogin')}
          </button>
        </div>
      </div>
    </div>
  );
};