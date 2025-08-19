import React from 'react';
import { Menu, User, Settings, Database, FileText, BookOpen, FileQuestion, Users, Activity, Layout as LayoutIcon, Shield, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSystemStatus } from '../hooks/useSystemStatus';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils';
import type { Language, ModuleType } from '../types';
import logo from './assets/logo.png';


interface LayoutProps {
  activeModule: 'chat' | 'rag' | 'admin-settings' | 'user-management';
  currentChatModule: ModuleType;
  onModuleChange: (module: 'chat' | 'rag' | 'admin-settings' | 'user-management', chatModule?: ModuleType) => void;
  children: React.ReactNode;
}

// 用户信息组件
const UserInfo: React.FC<{ onModuleChange: (module: 'chat' | 'rag' | 'admin-settings' | 'user-management') => void }> = ({ onModuleChange }) => {
  const { user, logout, isAdmin } = useAuth();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 flex-1">
        {isAdmin() ? <Shield className="w-5 h-5 text-gray-600" /> : <User className="w-5 h-5 text-gray-600" />}
        <div className="flex-1 text-left">
          <div className="font-medium">{user?.email || t('visitor')}</div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {user?.role === 'root' ? t('administrator') : t('user')}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        {isAdmin() && (
          <div>
            <button
              onClick={() => onModuleChange('user-management')}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title={t('user_management')}
            >
              <Users className="w-4 h-4" />
            </button>

            {/* <button
              onClick={() => onModuleChange('admin-settings')}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title={isAdmin() ? `${t('administor')}${t('settings')}` : t('settings')}
            >
              <Settings className="w-4 h-4" />
            </button> */}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title={t('logout')}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default function Layout({ children, onModuleChange, activeModule, currentChatModule }: LayoutProps) {
  const { t, i18n } = useTranslation();
  const { activeUsers, congestionLevel } = useSystemStatus();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(event.target.value as Language);
  };

  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const { isAdmin } = useAuth();

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* header */}
      <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
        <div className="flex items-center">
          <img src={logo} className="w-8 h-8 mr-3" />
          <h1 className="text-xl font-bold text-gray-800">{t('appName')}</h1>
        </div>

        <div className="hidden md:block">
          <h2 className="text-xl font-semibold text-gray-800">{t('dashboard')}</h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* System Status */}
          {/* <div className="hidden md:flex items-center space-x-4 px-3 py-1.5 bg-gray-50 rounded-lg text-sm">
            <div className="flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-gray-600" />
              <span>{activeUsers} {t('activeUsers')}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Activity className={cn("w-4 h-4", getCongestionColor(congestionLevel))} />
              <span className="capitalize">{congestionLevel} {t('load')}</span>
            </div>
          </div> */}

          {/* Language Selector */}
          <select
            value={i18n.language}
            onChange={handleLanguageChange}
            className="text-sm bg-gray-50 rounded-lg px-3 py-1.5 border-0 focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">{t('English')}</option>
            <option value="zh-CN">{t('Chinese')}</option>
            <option value="zh-TW">{t('TraditionalChinese')}</option>
          </select>
        </div>
      </header>

      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg flex flex-col md:w-72 h-full sticky top-0">
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">

            {isAdmin() ? (<div className="mb-8">
              <h2 className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase">{t('databases')}</h2>
              <button
                onClick={() => onModuleChange('rag')}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors",
                  activeModule === 'rag'
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-100"
                )}
              >
                <Database className={cn(
                  "w-5 h-5",
                  activeModule === 'rag' ? "text-blue-700" : "text-blue-600"
                )} />
                <span>{t('ragDatabaseManagement')}</span>
              </button>
            </div>) : null
            }




            <div className="mb-8">
              <h2 className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase">{t('modules')}</h2>
              <button
                onClick={() => onModuleChange('chat', 'general')}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors",
                  activeModule === 'chat' && currentChatModule === 'general'
                    ? "bg-indigo-50 text-indigo-700"
                    : "hover:bg-gray-100"
                )}
              >
                <LayoutIcon className={cn(
                  "w-5 h-5",
                  activeModule === 'chat' && currentChatModule === 'general' ? "text-indigo-700" : "text-indigo-600"
                )} />
                <div>
                  <div className="font-medium">{t('generalApplicationModule')}</div>
                  <div className="text-sm text-gray-500">{t('generalApplicationDescription')}</div>
                </div>
              </button>
              {/* <button
                onClick={() => onModuleChange('chat', 'tender')}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors",
                  activeModule === 'chat' && currentChatModule === 'tender'
                    ? "bg-green-50 text-green-700"
                    : "hover:bg-gray-100"
                )}
              >
                <FileText className={cn(
                  "w-5 h-5",
                  activeModule === 'chat' && currentChatModule === 'tender' ? "text-green-700" : "text-green-600"
                )} />
                <div>
                  <div className="font-medium">{t('worksContractTenderModule')}</div>
                  <div className="text-sm text-gray-500">{t('manageTenderProcesses')}</div>
                </div>
              </button> */}
              <button
                // onClick={() => onModuleChange('chat', 'consultancy')}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors",
                  activeModule === 'chat' && currentChatModule === 'consultancy'
                    ? "bg-purple-50 text-purple-700"
                    : "hover:bg-gray-100"
                )}
              >
                <BookOpen className={cn(
                  "w-5 h-5",
                  activeModule === 'chat' && currentChatModule === 'consultancy' ? "text-purple-700" : "text-purple-600"
                )} />
                <div>
                  <div className="font-medium">{t('consultancyAssignmentModule')}</div>
                  <div className="text-sm text-gray-500">{t('handleConsultancyTasks')}</div>
                </div>
              </button>
              <button
                onClick={() => onModuleChange('chat', 'contract')}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors",
                  activeModule === 'chat' && currentChatModule === 'contract'
                    ? "bg-orange-50 text-orange-700"
                    : "hover:bg-gray-100"
                )}
              >
                <FileQuestion className={cn(
                  "w-5 h-5",
                  activeModule === 'chat' && currentChatModule === 'contract' ? "text-orange-700" : "text-orange-600"
                )} />
                <div>
                  <div className="font-medium">{t('contractualQueryModule')}</div>
                  <div className="text-sm text-gray-500">{t('resolveContractInquiries')}</div>
                </div>
              </button>
            </div>
          </nav>
          <div className="p-4 border-t bg-gray-50">
            <UserInfo onModuleChange={onModuleChange} />
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 flex-col bg-gray-50 p-4 h-full w-full flex sticky top-0">
          {children}
        </main>
      </div>
    </div>
  );
}