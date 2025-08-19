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
          <div className={cn("h-full grid  gap-6", "grid-cols-10")}>
            <div className={cn(
              "transition-all duration-300 ease-in-out col-span-10"
            )}>
              <ChatInterface moduleType={currentChatModule} />
            </div>
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