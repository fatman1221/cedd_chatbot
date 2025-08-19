import React from 'react';
import { Plus, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils';
import type { ModuleType, ChatTopic } from '../../types';
import ChatHistory from './ChatHistory';


interface ChatSidebarProps {
    moduleType: ModuleType;
    chatTopics: ChatTopic[];
    selectedTopic: string | null;
    isLeftSidebarCollapsed: boolean;
    setIsLeftSidebarCollapsed: (value: boolean) => void;
    handleNewChat: () => void;
    handleTopicSelect: (topicId: string) => void;
    handleDeleteTopic: (topicId: string) => void;
    chatting: boolean;
}

export default function ChatSidebar({
    moduleType,
    chatTopics,
    selectedTopic,
    isLeftSidebarCollapsed,
    setIsLeftSidebarCollapsed,
    handleNewChat,
    handleTopicSelect,
    handleDeleteTopic,
    chatting,
}: ChatSidebarProps) {
    const { t } = useTranslation();

    return (
        <div className={cn(
            "flex-1 flex-col mr-4 space-y-4 min-h-screen",
            isLeftSidebarCollapsed ? "w-12" : "w-48"
        )}>
            <div className="sticky rounded-lg top-0 flex flex-col w-full bg-blue-600">
                <div className="p-4  flex rounded-lg  justify-between items-center bg-blue-600 ">
                    {!isLeftSidebarCollapsed && (
                        <button
                            onClick={handleNewChat}
                            className="flex-1 flex rounded-lg  items-center justify-center space-x-2 p-2 bg-blue-600 text-white hover:bg-blue-700"
                        >
                            <Plus className="w-5 h-5" />
                            <span>{t('newChat')}</span>
                        </button>
                    )}
                    <button
                        onClick={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
                        className="p-1 bg-blue-600 rounded-lg  text-white hover:bg-blue-700 justify-center items-center "
                    >
                        {isLeftSidebarCollapsed ? (
                            <ChevronRight className="w-5 h-5" />
                        ) : (
                            <ChevronLeft className="w-5 h-5" />
                        )}
                    </button>
                </div>
                {!isLeftSidebarCollapsed && (<span className='flex rounded-lg p-4 bg-blue-600 text-white justify-center items-center'>
                    {moduleType === 'contract' ? t('contractualQueryModule') : t(moduleType)}
                </span>)
                }
            </div>
            {!isLeftSidebarCollapsed &&
                <div className="flex flex-col rounded-lg flex-1 h-[calc(100vh-12rem)] overflow-hidden pb-10 pt-10">
                    <ChatHistory
                        chatTopics={chatTopics}
                        selectedTopic={selectedTopic}
                        chatting={chatting}
                        handleTopicSelect={handleTopicSelect}
                        handleDeleteTopic={handleDeleteTopic}
                    />
                </div>
            }
        </div>
    );
}