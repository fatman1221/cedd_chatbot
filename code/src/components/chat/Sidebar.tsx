import React from 'react';
import { Plus, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils';
import type { ChatTopic } from '../../types';

interface ChatSidebarProps {
  chatTopics: ChatTopic[];
  selectedTopic: string | null;
  isLeftSidebarCollapsed: boolean;
  setIsLeftSidebarCollapsed: (value: boolean) => void;
  handleNewChat: () => void;
  handleTopicSelect: (topicId: string) => void;
}

export default function ChatSidebar({
  chatTopics,
  selectedTopic,
  isLeftSidebarCollapsed,
  setIsLeftSidebarCollapsed,
  handleNewChat,
  handleTopicSelect,
}: ChatSidebarProps) {
  const { t } = useTranslation();

  return (
    <div className={cn(
      "bg-white rounded-lg shadow mr-4  transition-all duration-400 easy-in-out h-screen",
      isLeftSidebarCollapsed ? "w-16" : "w-48"
    )}>
      <div className="sticky top-0">
        <div className="p-4 rounded-lg border-b flex justify-between items-center bg-blue-600 ">
          {!isLeftSidebarCollapsed && (
            <button
              onClick={handleNewChat}
              className="flex-1 flex items-center justify-center space-x-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              <span>{t('newChat')}</span>
            </button>
          )}
          <button
            onClick={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
            className="p-2 rounded-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isLeftSidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
        <div>
          {!isLeftSidebarCollapsed && (<div className="flex-1 p-2">
            {chatTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleTopicSelect(topic.id)}
                className={cn(
                  "w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 text-left mb-2",
                  selectedTopic === topic.id && "bg-gray-100"
                )}
              >
                <MessageSquare className="w-5 h-5 text-gray-600" />
                {!isLeftSidebarCollapsed && (
                  <div className="flex-1 truncate">
                    <div className="font-medium truncate">{topic.title}</div>
                    <div className="text-sm text-gray-500">
                      {t(topic.moduleType)}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}