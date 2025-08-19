import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: 'root' | 'regular') => boolean;
  isAdmin: () => boolean;
  removeDocument: (filename: string, module: string) => Promise<void>;
  processDocument: (file_id: string, module: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = authService.getToken();
        const savedUser = authService.getUser();
        if (savedToken && savedUser) {
          // 验证token是否仍然有效

          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            setToken(savedToken);
          } catch (error) {
            console.error('Token验证失败:', error);
            // 只有在确认token无效时才清除本地存储
            // 网络错误或服务器错误不应该导致用户登出
            if (error instanceof Error && error.message.includes('401')) {
              authService.logout();
            } else {
              // 网络错误等情况下，保持本地状态
              setUser(savedUser);
              setToken(savedToken);
            }
          }
        }
      } catch (error) {
        console.error('初始化认证失败:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    authService.saveToken(userToken);
    authService.saveUser(userData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    authService.logout();
  };

  const isAuthenticated = !!user && !!token;

  const hasRole = (role: 'root' | 'regular'): boolean => {
    return user?.role === role;
  };

  const isAdmin = (): boolean => {
    return hasRole('root');
  };

  const removeDocument = async (filename: string, module: string) => {
    await authService.removeModuleDocument(filename, module);
  };

  const processDocument = async (file_id: string, module: string) => {
    await authService.chunkDocument(file_id, module);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    isAdmin,
    removeDocument,
    processDocument,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
};
