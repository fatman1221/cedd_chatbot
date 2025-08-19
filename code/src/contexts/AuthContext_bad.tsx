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
                        // Token无效，清除本地存储
                        authService.logout();
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
        console.log("当前用户是否为管理员", hasRole('root'))
        return hasRole('root');
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