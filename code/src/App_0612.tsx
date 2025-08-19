import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { cn } from './utils';
import Layout from './components/Layout';
import ChatInterface from './components/ChatInterface';
import RAGDatabaseManager from './components/rag/RAGDatabaseManager';
import type { RAGDatabase, ModuleType } from './types';

function App() {
    const { t } = useTranslation();
    const [activeModule, setActiveModule] = useState<'chat' | 'rag'>('chat');
    const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
    const [selectedDatabase, setSelectedDatabase] = useState<RAGDatabase | null>(null);
    const [currentChatModule, setCurrentChatModule] = useState<ModuleType>('general');

    const handleDatabaseClick = (database: RAGDatabase) => {
        setActiveModule('rag');
        setSelectedDatabase(database);
    };

    const handleModuleChange = (module: 'chat' | 'rag', chatModule?: ModuleType) => {
        setActiveModule(module);
        if (chatModule) {
            setCurrentChatModule(chatModule);
        }
    };

    return (
        <Layout
            onModuleChange={handleModuleChange}
            activeModule={activeModule}
            currentChatModule={currentChatModule}
        >
            {activeModule === 'chat' ? (
                <div className="h-full grid grid-cols-12 gap-6">
                    <div className={cn(
                        "transition-all duration-300 ease-in-out",
                        isRightSidebarCollapsed ? "col-span-11" : "col-span-10"
                    )}>
                        <ChatInterface moduleType={currentChatModule} />
                    </div>
                    <div className={cn(
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
                                                "w-5 h-5 rounded-lg bg-blue-600transition-transform duration-300",
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
                </div>
            ) : (
                <RAGDatabaseManager selectedDatabase={selectedDatabase} />
            )}
        </Layout>
    );
}

export default App;