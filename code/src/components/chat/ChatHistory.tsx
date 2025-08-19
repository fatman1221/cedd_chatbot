
import { cn } from '../../utils';
import type { ChatTopic } from '../../types';
import { MessageSquare, X } from 'lucide-react';


interface ChatHistoryProps {
    chatTopics: ChatTopic[];
    selectedTopic: string | null;
    chatting: boolean;
    handleTopicSelect: (topicId: string) => void;
    handleDeleteTopic: (topicId: string) => void;
}

export default function ChatHistory({
    chatTopics,
    selectedTopic,
    chatting,
    handleTopicSelect,
    handleDeleteTopic,
}: ChatHistoryProps) {
    return (
        <div className="flex-1 overflow-y-auto h-full">
            {chatTopics.length > 0 && (
                <div className="h-full">
                    {chatTopics
                        .filter(t => t.id === selectedTopic)
                        .concat(
                            chatTopics
                                .filter(t => t.id !== selectedTopic)
                                .sort((a, b) => new Date(b.lastMessage).getTime() - new Date(a.lastMessage).getTime())
                        )
                        .map((topic) => (
                            <button
                                key={topic.id}
                                onClick={() => !chatting && handleTopicSelect(topic.id)}
                                className={cn(
                                    "w-full flex items-left space-x-3 rounded-lg text-left p-4 group relative",
                                    selectedTopic === topic.id ? "bg-blue-600 text-white" : "hover:bg-gray-300"
                                )}
                            >
                                <MessageSquare className={cn("w-5 h-5 text-gray-600", selectedTopic === topic.id && "bg-blue-600 text-white")} />
                                <span className={cn("flex-1 truncate flex justify-between items-center", selectedTopic === topic.id && "bg-blue-600 text-white")}>
                                    <div className="font-medium truncate">{topic.title}</div>
                                </span>
                                <X
                                    className={cn(
                                        "w-4 h-4 opacity-0 transition-opacity mr-2 justify-end ",
                                        selectedTopic === topic.id ? "text-white" : "text-red-500",
                                        "group-hover:opacity-100"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTopic(topic.id);
                                    }}
                                />
                            </button>
                        ))}
                </div>
            )}
        </div>
    );
}
