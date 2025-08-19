import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthPage } from './AuthPage';
import { Loader } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'root' | 'regular';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading, isAuthenticated, hasRole, login } = useAuth();

  // 显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Loader className="h-12 w-12 text-blue-500 mx-auto animate-spin mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 如果未认证，显示登录页面
  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={login} />;
  }

  // 如果需要特定角色但用户没有该角色
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">访问被拒绝</h2>
          <p className="text-gray-600 mb-6">
            您没有访问此页面的权限。需要 {requiredRole === 'root' ? '管理员' : '普通用户'} 权限。
          </p>
          <p className="text-sm text-gray-500">
            当前角色: {user?.role === 'root' ? '管理员' : '普通用户'}
          </p>
        </div>
      </div>
    );
  }

  // 用户已认证且有权限，显示受保护的内容
  return <>{children}</>;
};