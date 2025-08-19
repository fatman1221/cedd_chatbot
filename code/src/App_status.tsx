import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { cn } from './utils';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./components/auth/LoginPage";
import { RegisterPage } from "./components/auth/RegisterPage";
import { VerifyEmailPage } from "./components/auth/VerifyEmailPage";
import { ForgotPasswordPage } from "./components/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./components/auth/ResetPasswordPage";
import Layout from "./components/Layout";
import ChatInterface from "./components/ChatInterface";
import RAGDatabaseManager from "./components/rag/RAGDatabaseManager";
import { AdminSettings } from "./components/admin/AdminSettings";
import { ApprovalPage } from "./components/admin/ApprovalPage";
import { PendingApprovalPage } from "./components/auth/PendingApprovalPage";
import { UserManagement } from "./components/admin/UserManagement";
import type { RAGDatabase, ModuleType } from './types';

// 受保护的路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading, isAdmin } = useAuth();
    console.log("test test", user)
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

// 主应用组件
const MainApp: React.FC = () => {
    const { t } = useTranslation();
    const [activeModule, setActiveModule] = useState<'chat' | 'rag' | 'admin-settings' | 'user-management'>('chat');
    const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
    const [selectedDatabase, setSelectedDatabase] = useState<RAGDatabase | null>(null);
    const [currentChatModule, setCurrentChatModule] = useState<ModuleType>('general');
    const { isAdmin } = useAuth();

    const handleDatabaseClick = (database: RAGDatabase) => {
        setActiveModule('rag');
        setSelectedDatabase(database);
    };

    const handleModuleChange = (module: 'chat' | 'rag' | 'admin-settings' | 'user-management', chatModule?: ModuleType) => {
        setActiveModule(module);
        if (chatModule) {
            setCurrentChatModule(chatModule);
        }
    };

    const renderMainContent = () => {
        switch (activeModule) {
            case 'rag':
                return <RAGDatabaseManager selectedDatabase={selectedDatabase} />;
            case 'admin-settings':
                return <AdminSettings />;
            case 'user-management':
                return <UserManagement />;
            case 'chat':
            default:
                return (
                    <div className={cn("h-full grid  gap-6", isAdmin() ? "grid-cols-12" : "grid-cols-10")}>
                        <div className={cn(
                            "transition-all duration-300 ease-in-out",
                            isAdmin() && isRightSidebarCollapsed ? "col-span-11" : "col-span-10"
                        )}>
                            <ChatInterface moduleType={currentChatModule} />
                        </div>
                        {isAdmin() && <div className={cn(
                            "h-full flex flex-col transition-all duration-300 ease-in-out",
                            isRightSidebarCollapsed ? "col-span-1" : "col-span-2"
                        )}>
                            <div className="sticky top-0">
                                <div className="flex-1">
                                    <div className="bg-white rounded-lg shadow">
                                        <div className="p-6 border-b text-white flex justify-between items-center rounded-lg bg-blue-600">
                                            <button
                                                onClick={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
                                                className="flex-1 hover:bg-blue-700 rounded-lg"
                                                title={t('ragDatabaseStatus')}
                                            >
                                                <ChevronRight className={cn(
                                                    "flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 transition-transform duration-300",
                                                    isRightSidebarCollapsed ? "rotate-180" : ""
                                                )} />
                                            </button>
                                            {!isRightSidebarCollapsed && (
                                                <h3 className="text-lg font-semibold">{t('ragDatabaseStatus')}</h3>
                                            )}
                                        </div>
                                        {!isRightSidebarCollapsed && (
                                            <div className="p-4 space-y-4">
                                                <button
                                                    onClick={() => handleDatabaseClick({
                                                        id: 'public-db',
                                                        name: t('publicDatabase'),
                                                        type: 'public',
                                                        status: 'active',
                                                        lastUpdated: new Date(),
                                                        documentCount: 1234,
                                                        totalSize: 2.5 * 1024 * 1024 * 1024,
                                                        embeddingModel: 'e5-large-v2',
                                                        owner: 'admin',
                                                        visibility: 'public'
                                                    })}
                                                    className="w-full"
                                                >
                                                    <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="font-medium text-left">{t('publicDatabase')}</span>
                                                            <span className="text-green-600">{t('active')}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm text-gray-600">
                                                            <span>{t('lastUpdated')}:</span>
                                                            <span>2 {t('hours')}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm text-gray-600">
                                                            <span>{t('documents')}:</span>
                                                            <span>1,234</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm text-gray-600">
                                                            <span>{t('totalSize')}:</span>
                                                            <span>2.5 GB</span>
                                                        </div>
                                                    </div>
                                                </button>
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-medium text-left">{t('personalDatabase')}</span>
                                                        <span className="text-blue-600">{t('updating')}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm text-gray-600">
                                                        <span>{t('lastUpdated')}:</span>
                                                        <span>5 {t('minutes')}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm text-gray-600">
                                                        <span>{t('documents')}:</span>
                                                        <span>45</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm text-gray-600">
                                                        <span>{t('totalSize')}:</span>
                                                        <span>156 MB</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        }
                    </div>
                );
        }
    };

    return (
        <Layout
            onModuleChange={handleModuleChange}
            activeModule={activeModule}
            currentChatModule={currentChatModule}
        >
            {renderMainContent()}
        </Layout>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/admin/approve" element={<ApprovalPage />} />
                    <Route path="/pending-approval" element={<PendingApprovalPage />} />
                    <Route
                        path="/*"
                        element={
                            <ProtectedRoute>
                                <MainApp />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;