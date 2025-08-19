import { useState, useRef, useCallback } from 'react';
import type { Message, ChatTopic, ModuleType } from '../types';
import { sendMessage } from '../services/api';

export const useChat = (moduleType: ModuleType) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [chatTopics, setChatTopics] = useState<ChatTopic[]>([]);
  
  const completeMessageRef = useRef('');
  const [displayedMessage, setDisplayedMessage] = useState('');
  const displayIndexRef = useRef(0);
  const streamTimerRef = useRef<NodeJS.Timeout>();
  const updatedMessagesRef = useRef<Message[]>([]);
  const isStreamingCompleteRef = useRef(false);
  const isTypingRef = useRef(false);

  const getWelcomeMessage = (module: ModuleType) => {
    switch (module) {
      case 'general':
        return 'Hi, this is CEDD chatbot General application module.';
      case 'tender':
        return 'Hi, this is CEDD chatbot Works Contract Tender Module.';
      case 'consultancy':
        return 'Hi, this is CEDD chatbot Consultancy Assignment Module.';
      case 'contract':
        return 'Hi, this is CEDD chatbot Contractual Query Module.';
      default:
        return 'Hi, this is CEDD chatbot.';
    }
  };

  const updateDisplayedMessage = useCallback(() => {
    if (!isTypingRef.current) return;

    if (displayIndexRef.current < completeMessageRef.current.length) {
      setDisplayedMessage(completeMessageRef.current.slice(0, displayIndexRef.current + 1));
      displayIndexRef.current += 1;
      streamTimerRef.current = setTimeout(updateDisplayedMessage, 20);
    } else if (isStreamingCompleteRef.current) {
      isTypingRef.current = false;
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: completeMessageRef.current,
        timestamp: new Date(),
        sender: 'bot'
      };
      
      const finalMessages = [...updatedMessagesRef.current, botResponse];
      setMessages(finalMessages);
      
      if (selectedTopic) {
        setChatTopics((prev: ChatTopic[]) => prev.map((topic: ChatTopic) => 
          topic.id === selectedTopic 
            ? { ...topic, messages: finalMessages, lastMessage: new Date() }
            : topic
        ));
      }
      
      setDisplayedMessage('');
      displayIndexRef.current = 0;
      completeMessageRef.current = '';
      isStreamingCompleteRef.current = false;
    }
  }, [selectedTopic]);

  const handleSend = useCallback(async (input: string) => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      timestamp: new Date(),
      sender: 'user'
    };

    const updatedMessages = [...messages, newMessage];
    updatedMessagesRef.current = updatedMessages;
    setMessages(updatedMessages);
    setIsProcessing(true);
    displayIndexRef.current = 0;
    completeMessageRef.current = '';
    setDisplayedMessage('');
    isStreamingCompleteRef.current = false;
    isTypingRef.current = false;

    if (selectedTopic) {
      setChatTopics((prev: ChatTopic[]) => prev.map((topic: ChatTopic) => 
        topic.id === selectedTopic 
          ? { ...topic, messages: updatedMessages, lastMessage: new Date() }
          : topic
      ));
    } else {
      const newTopic: ChatTopic = {
        id: Date.now().toString(),
        title: input.slice(0, 30) + (input.length > 30 ? '...' : ''),
        lastMessage: new Date(),
        moduleType,
        messages: updatedMessages
      };
      setChatTopics((prev: ChatTopic[]) => [newTopic, ...prev]);
      setSelectedTopic(newTopic.id);
    }

    try {
      const response = await sendMessage(input);
      completeMessageRef.current = response.content;
      isStreamingCompleteRef.current = true;
      updateDisplayedMessage();
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error processing your message.',
        timestamp: new Date(),
        sender: 'bot'
      };
      setMessages((prev: Message[]) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [messages, selectedTopic, moduleType, updateDisplayedMessage]);

  const handleNewChat = useCallback(() => {
    setSelectedTopic(null);
    setMessages([{
      id: 'welcome',
      content: getWelcomeMessage(moduleType),
      timestamp: new Date(),
      sender: 'bot'
    }]);
  }, [moduleType]);

  const handleTopicSelect = useCallback((topicId: string) => {
    setSelectedTopic(topicId);
    const topic = chatTopics.find((t: ChatTopic) => t.id === topicId);
    if (topic) {
      setMessages(topic.messages);
    }
  }, [chatTopics]);

  return {
    messages,
    isProcessing,
    selectedTopic,
    chatTopics,
    displayedMessage,
    handleSend,
    handleNewChat,
    handleTopicSelect
  };
}; 