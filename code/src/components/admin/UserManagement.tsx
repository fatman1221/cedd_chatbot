import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, XCircle, Mail, Shield, User, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authService, PendingUser, User as UserType } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

export const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<UserType[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
    // 设置定时刷新，每30秒刷新一次数据
    const interval = setInterval(() => {
      if (isAdmin()) {
        loadUsers();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  const loadUsers = async () => {
    if (isAdmin()) {
      try {
        const pending = await authService.getPendingUsers();
        const approved = await authService.getApprovedUsers();
        setPendingUsers(pending);
        setApprovedUsers(approved);
      } catch (error) {
        console.error('加载用户列表失败:', error);
      }
    }
  };

  const handleApproval = async (user: PendingUser, action: 'approve' | 'reject') => {
    setLoading(true);
    try {
      await authService.approveUser(user.approvalToken, action);
      loadUsers(); // 重新加载用户列表
      alert(`${t('user')} ${user.email} ${action === 'approve' ? t('approvalPassed') : t('applicationRejected')}`);
    } catch (error) {
      alert(`${t('operationFailed')}: ${error instanceof Error ? error.message : t('unknownError')}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('accessDenied')}</h2>
          <p className="text-gray-600">{t('noUserManagementPermission')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
                <Users className="w-6 h-6 mr-2" />
                {t('userManagement')}
              </h1>
              <p className="text-gray-600 mt-1">{t('manageUserRegistrations')}</p>
            </div>
            <button
              onClick={loadUsers}
              disabled={loading}
              className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              {t('refreshData')}
            </button>
          </div>
        </div>

        {/* 标签页 */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              {t('pendingUsers')} ({pendingUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'approved'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <CheckCircle className="w-4 h-4 inline mr-2" />
              {t('approvedUsers')} ({approvedUsers.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'pending' ? (
            <div className="space-y-4">
              {pendingUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">{t('noPendingUsers')}</p>
                </div>
              ) : (
                pendingUsers.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {user.role === 'root' ? <Shield className="w-5 h-5 text-gray-600" /> : <User className="w-5 h-5 text-gray-600" />}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{user.email}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'root'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                              }`}>
                              {user.role === 'root' ? t('administrator') : t('regularUser')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {t('applicationTime')}: {new Date(user.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproval(user, 'approve')}
                          disabled={loading}
                          className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {t('approve')}
                        </button>
                        <button
                          onClick={() => handleApproval(user, 'reject')}
                          disabled={loading}
                          className="flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          {t('reject')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {approvedUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">{t('noApprovedUsers')}</p>
                </div>
              ) : (
                approvedUsers.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {user.role === 'root' ? <Shield className="w-5 h-5 text-gray-600" /> : <User className="w-5 h-5 text-gray-600" />}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{user.email}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'root'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                              }`}>
                              {user.role === 'root' ? t('administrator') : t('regularUser')}
                            </span>
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              {t('approved')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {t('registrationTime')}: {new Date(user.createdAt).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {t('approvalTime')}: {new Date(user.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};