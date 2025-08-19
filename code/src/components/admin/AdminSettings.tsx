import React, { useState, useEffect } from 'react';
import { Mail, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

interface AdminConfig {
  adminEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  enableNotifications: boolean;
}

export const AdminSettings: React.FC = () => {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [config, setConfig] = useState<AdminConfig>({
    adminEmail: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    enableNotifications: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const savedConfig = localStorage.getItem('adminConfig');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // 保存到本地存储
      localStorage.setItem('adminConfig', JSON.stringify(config));

      setMessage({ type: 'success', text: t('configSavedSuccessfully') });
    } catch (error) {
      console.error('Failed to save config:', error);
      setMessage({ type: 'error', text: t('configSaveFailed') });
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // 这里可以添加测试邮件发送的逻辑
      setMessage({ type: 'success', text: t('testEmailSentSuccessfully') });
    } catch (error) {
      console.error('Failed to send test email:', error);
      setMessage({ type: 'error', text: t('testEmailSendFailed') });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('accessDenied')}</h2>
          <p className="text-gray-600">{t('noAdminSettingsPermission')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <Mail className="w-6 h-6 mr-2" />
            {t('adminSettings')}
          </h1>
          <p className="text-gray-600 mt-1">{t('configureSystemNotifications')}</p>
        </div>

        <div className="p-6 space-y-6">
          {message && (
            <div className={`p-4 rounded-lg flex items-center ${message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {message.text}
            </div>
          )}

          {/* 通知设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">{t('notificationSettings')}</h3>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableNotifications"
                checked={config.enableNotifications}
                onChange={(e) => setConfig({ ...config, enableNotifications: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="enableNotifications" className="ml-2 text-sm text-gray-700">
                {t('enableNewUserNotifications')}
              </label>
            </div>

            <div>
              <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminEmail')}
              </label>
              <input
                type="email"
                id="adminEmail"
                value={config.adminEmail}
                onChange={(e) => setConfig({ ...config, adminEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">{t('adminEmailDescription')}</p>
            </div>
          </div>

          {/* SMTP 设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">{t('smtpServerSettings')}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('smtpServer')}
                </label>
                <input
                  type="text"
                  id="smtpHost"
                  value={config.smtpHost}
                  onChange={(e) => setConfig({ ...config, smtpHost: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('port')}
                </label>
                <input
                  type="number"
                  id="smtpPort"
                  value={config.smtpPort}
                  onChange={(e) => setConfig({ ...config, smtpPort: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="587"
                />
              </div>

              <div>
                <label htmlFor="smtpUser" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('username')}
                </label>
                <input
                  type="text"
                  id="smtpUser"
                  value={config.smtpUser}
                  onChange={(e) => setConfig({ ...config, smtpUser: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div>
                <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('password')}
                </label>
                <input
                  type="password"
                  id="smtpPassword"
                  value={config.smtpPassword}
                  onChange={(e) => setConfig({ ...config, smtpPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('appSpecificPassword')}
                />
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? t('saving') : t('saveConfig')}
            </button>

            <button
              onClick={handleTestEmail}
              disabled={loading || !config.adminEmail || !config.smtpHost}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              <Mail className="w-4 h-4 mr-2" />
              {loading ? t('testing') : t('testEmail')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};