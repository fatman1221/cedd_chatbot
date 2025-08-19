import React from 'react';
import { Send, Paperclip, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils';

interface MessageInputProps {
    input: string;
    setInput: (value: string) => void;
    handleSend: () => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleStopGeneration: () => void;
    isGenerating: boolean;
}

export default function MessageInput({
    input,
    setInput,
    handleSend,
    handleFileUpload,
    handleStopGeneration,
    isGenerating,
}: MessageInputProps) {
    const { t } = useTranslation();

    return (
        <div className="border-t p-4">
            <div className="flex items-center space-x-2">
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    multiple
                    onChange={handleFileUpload}
                />
                <label
                    htmlFor="file-upload"
                    className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
                    title={t('attachFile')}
                >
                    <Paperclip className="w-5 h-5 text-gray-600" />
                </label>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={t('typeMessage')}
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* <button
          onClick={handleSend}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          title={t('sendMessage')}
        >
          <Send className="w-5 h-5" />
        </button> */}

                <button
                    onClick={isGenerating ? handleStopGeneration : handleSend}
                    className={cn(
                        "p-2 rounded-full",
                        isGenerating
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                    )}
                    title={isGenerating ? t('stopGeneration') : t('sendMessage')}
                >
                    {isGenerating ? (
                        <Square className="w-5 h-5" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </button>

            </div>
        </div>
    );
} 