import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next';
import type { Message, ChatTopic, ModuleType, PresetTemplate, RAGPartition, RAGFile } from '../types';
import { streamChatResponse, deleteChatHistory } from "../services/api";
import MessageList from "./chat/MessageList";

import MessageInput from "./chat/MessageInput.tsx";
import ChatSidebar from "./chat/ChatSidebar";
import { v4 as uuidv4 } from 'uuid';
import localForage from "localforage"
import { getModuleDetails } from '../services/documents'
import { useAuth } from '../contexts/AuthContext';



interface ChatInterfaceProps {
    moduleType: ModuleType;
}

export default function ChatInterface({ moduleType }: ChatInterfaceProps) {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
    // const [chatTopics, setChatTopics] = useState<ChatTopic[]>([]);
    const streamTimerRef = useRef<NodeJS.Timeout>();
    const isStreamingCompleteRef = useRef(false);
    const isTypingRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const completeMessageRef = useRef("");
    const [displayedMessage, setDisplayedMessage] = useState("");
    const displayIndexRef = useRef(0);
    const updatedMessagesRef = useRef<Message[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const filesRef = useRef<File[]>([]);
    filesRef.current = uploadedFiles;

    const [topicTemplates, setTopicTemplates] = useState<PresetTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [chatting, setChatting] = useState(false);


    const getWelcomeMessage = (module: ModuleType) => {
        switch (module) {
            case 'general':
                return 'Hi, this is CEDD chatbot General application module.';
            case 'tender':
                return 'Hi, this is CEDD chatbot Works Contract Tender Module. At present, this module is temporarily unavailable';
            case 'consultancy':
                return 'Hi, this is CEDD chatbot Consultancy Assignment Module. At present, this module is temporarily unavailable';
            case 'contract':
                return 'Hi, this is CEDD chatbot Contractual Query Module.';
            default:
                return 'Hi, this is CEDD chatbot.';
        }
    };

    const [usePrompt, setUsePrompt] = useState(false)

    let chatid = uuidv4().toString()

    const [currentChat, setCurrentChat] = useState<ChatTopic>({
        id: `${user?.email}_chatHistory_${moduleType}_${chatid}`,
        title: 'Welcome',
        lastMessage: new Date(),
        moduleType,
        messages: [{
            id: 'welcome',
            content: getWelcomeMessage(moduleType),
            timestamp: new Date(),
            sender: 'bot'
        }],
    } as ChatTopic);


    const [chatTopics, setChatTopics] = useState<ChatTopic[]>([]);


    // 模块切换逻辑
    useEffect(() => {
        const loadChatTopics = async () => {
            try {
                const keys = await localForage.keys();
                const topicKeys = keys.filter(key => key.startsWith(`${user?.email}_chatHistory_${moduleType}`));

                console.log(topicKeys);
                const topics = await Promise.all(
                    topicKeys.map(async key => await localForage.getItem<ChatTopic>(key))
                );
                var tempChat = topics.filter(Boolean).sort((a, b) => new Date(b.lastMessage).getTime() - new Date(a.lastMessage).getTime()) as ChatTopic[];
                setChatTopics(() => tempChat);
                console.log("切换模块后新模块的历史对话为", tempChat.length)
                if (tempChat.length === 0) {
                    handleNewChat();
                } else {
                    setCurrentChat(tempChat[0]);
                    setMessages(tempChat[0].messages);
                }
            } catch (error) {
                console.error('Failed to load chat topics from localForage:', error);
            }
        };
        loadChatTopics();
        console.log("完成初始化")
        setTopicTemplates([]);
        if (moduleType === 'contract') {
            const defaultTemplates: PresetTemplate[] = [
                {
                    id: "1",
                    type: 'Inquiry',
                    title: 'General Clause or Procedure Inquiry',
                    content: `I have a question about the [NEC3/4/HK] ECC [Option A/B/C/D] for 
[specific clause number or topic, e.g., Clause 31 or programme submission]. 
Could you explain how [specific aspect, e.g., the process for submitting a programme 
or assessing compensation events] works under the ECC? My project involves [brief scope], 
and I’d like to understand [specific detail, e.g., the Client’s obligations 
or timeframes involved].`,
                },
                {
                    id: "2",
                    type: "Resolution",
                    title: 'Dispute or Issue Resolution',
                    content: `I’m dealing with a potential issue under the [NEC3/4/HK] ECC [Option A/B/C/D] 
related to [specific issue, e.g., a delay or disagreement over payment]. Can you clarify
how [specific process, e.g., dispute resolution or early warning] is handled under the ECC? 
My situation involves [brief context, e.g., a Contractor claiming an extension of time], 
and I need guidance on [specific aspect, e.g., steps to resolve the issue or relevant clauses].`
                }, // 添加缺失的逗号
                {
                    id: "3",
                    type: "Application",
                    title: 'Practical Application or Scenario-Based',
                    content: `I’m working on an NEC [NEC3/4/HK] project involving [brief scope of works] with [Option A/B/C/D]. 
Could you guide me on how to handle [specific scenario, e.g., a change in scope, late completion, or defect correction] 
under the ECC? Please explain [specific detail, e.g., the relevant clauses, steps to follow, or potential risks].`
                }
            ];
            setTopicTemplates(defaultTemplates.filter(item => item.type === 'Inquiry'));
        }
    }, [moduleType]);


    // try {
    //     localStorage.clear(); // 清空当前域名下所有存储的数据
    //     console.log("localStorage 已清空");
    // } catch (error) {
    //     console.error("清除失败：", error);
    // }

    const removeSomeChats = async (totalSize: number) => {
        const MAX_SIZE = 200 * 1024 * 1024
        try {
            const keys = await localForage.keys();
            const userConfirmed = window.confirm(
                `本地存储已超过200MB (当前: ${(totalSize / (1024 * 1024)).toFixed(2)}MB)。\n\n是否删除最早的对话记录以释放空间？`
            );
            if (userConfirmed) {
                // 获取所有以chatHistory_开头的键并按创建时间排序
                const chatKeys = keys.filter(key => key.startsWith(`${user?.email}_chatHistory_`));

                // 先等待Promise.all解析完成，得到数组
                const chatKeyWithLastMessage = await Promise.all(
                    chatKeys.map(async key => ({
                        key,
                        lastMessage: (await localForage.getItem<ChatTopic>(key)).lastMessage
                    }))
                );

                // 然后对解析后的数组进行过滤和排序
                const sortedChatKeys = chatKeyWithLastMessage
                    .sort((a, b) => a.lastMessage.getTime() - b.lastMessage.getTime());
                let deletedCount = 0;
                while (totalSize > MAX_SIZE * 0.8 && sortedChatKeys.length > 0) {
                    const oldestKey = sortedChatKeys.shift()?.key;
                    if (oldestKey) {
                        const value = await localForage.getItem(oldestKey);
                        if (value !== null) {
                            const valueSize = new Blob([JSON.stringify(value)]).size;
                            totalSize -= valueSize;
                        }
                        // await localForage.removeItem(oldestKey);
                        handleDeleteTopic(oldestKey)
                        deletedCount++;
                    }
                }

                if (deletedCount > 0) {
                    alert(`已删除 ${deletedCount} 条最早的对话记录，释放了 ${((MAX_SIZE - totalSize) / (1024 * 1024)).toFixed(2)}MB 空间。`);
                    // 刷新聊天列表
                    setChatTopics(prev => prev.filter(topic => !chatKeys.includes(topic.id)));
                }
            }
        } catch (err) {
            console.error('检查存储使用量时出错:', err);
        }
    };


    async function getIndexedDBUsage() {
        if (!navigator.storage?.estimate) {
            console.warn("浏览器不支持 StorageManager API");
            return;
        }

        try {
            const { usage, quota } = await navigator.storage.estimate();
            console.log(`已用空间: ${(usage / 1024 / 1024).toFixed(2)}MB`);
            console.log(`总配额: ${(quota / 1024 / 1024).toFixed(2)}MB`);
            return usage; // 返回字节为单位的已用空间
        } catch (error) {
            console.error("获取存储空间失败:", error);
        }
    }


    // 存储当前对话
    useEffect(() => {
        if (currentChat.messages.length > 1) {
            localForage.setItem(
                currentChat.id,
                currentChat
            ).then(function (value) {
                // 当值被存储后，可执行其他操作
                console.log(value);
            }).catch(function (err) {
                // 当出错时，此处代码运行
                console.log(err);
            });
        }
    }, [currentChat]); // 依赖

    useEffect(() => {
        console.log("All Chat", chatTopics)
        console.log("New Chat", currentChat)
        setChatTopics(prev => {
            // 检查currentChat是否已存在于chatTopics中
            const chatExists = prev.some(topic => topic.id === currentChat.id);
            console.log("chatExists", chatExists)
            if (chatExists) {
                // 如果存在，只更新匹配的话题
                return prev.map(topic =>
                    topic.id === currentChat.id
                        ? currentChat
                        : topic
                );
            } else {
                // 如果不存在，添加新话题到数组开头
                return [currentChat, ...prev.filter(topic => topic.title !== 'Welcome')];
            }
        });
    }, [currentChat]); // 依赖项包含


    // 修改updateDisplayedMessage函数
    const updateDisplayedMessage = () => {
        if (displayIndexRef.current < completeMessageRef.current.length) {
            setDisplayedMessage(
                completeMessageRef.current.slice(0, displayIndexRef.current + 1)
            );
            displayIndexRef.current += 1;
            streamTimerRef.current = setTimeout(updateDisplayedMessage, 5);
        } else if (isStreamingCompleteRef.current) {
            isTypingRef.current = false;
            if (streamTimerRef.current) {
                clearTimeout(streamTimerRef.current);
            }
        }
    };

    useEffect(() => {
        if (messages) {
            // 更新当前聊天状态
            setCurrentChat(prevChat => ({
                ...prevChat,
                messages,
            }));

            // 同步到历史记录
            // setChatTopics(prev =>
            //     prev.map(topic =>
            //         topic.id === currentChat.id
            //             ? { ...topic, messages, lastMessage: new Date() }
            //             : topic
            //     )
            // );
        }
    }, [messages]); // 保持现有依赖项

    const [reasoningProgress, setReasoningProgress] = useState(-1);

    useEffect(() => {
        console.log("CurrentChat 已更新:", currentChat);
    }, [currentChat]);

    useEffect(() => {
        console.log("chatTopics 已更新:", chatTopics);
        // console.log("CurrentChat 已更新:", currentChat);
    }, [currentChat]);

    useEffect(() => {
        console.log("Messages updated:", messages);
    }, [messages]);

    // 处理新对话
    const handleNewChat = async () => {
        if (chatting) {
            return;
        }
        console.log("创建新对话")
        console.log("Chat module", currentChat.moduleType)
        console.log("Real module", moduleType)


        var totalSize = await getIndexedDBUsage()
        const MAX_SIZE = 200 * 1024 * 1024; // 200MB
        console.log(`Now used ${totalSize} memory!`)
        if (totalSize && typeof totalSize === 'number' && totalSize > MAX_SIZE) {
            await removeSomeChats(totalSize)
        }

        console.log("old chat", currentChat)
        console.log("Real module2", moduleType)
        console.log("切换模块后创建新对话")
        if (currentChat.title === 'Welcome' && currentChat.moduleType === moduleType && chatTopics.length > 0) {
            return;
        }
        console.log("新建会话")
        console.log(chatTopics)
        const welcomeTopic = chatTopics.find(t => t.title === 'Welcome' && t.moduleType === moduleType);
        if (welcomeTopic) {
            setCurrentChat(() => welcomeTopic);
            setMessages(() => [...welcomeTopic.messages]);
            return;
        }
        const newchatid = uuidv4().toString()
        var tempMessages = [{
            id: 'welcome',
            content: getWelcomeMessage(moduleType),
            timestamp: new Date(),
            sender: 'bot'
        }] as Message[];
        console.log(tempMessages)
        setMessages(() => tempMessages);
        const newChat = {
            id: `${user?.email}_chatHistory_${moduleType}_${newchatid}`,
            title: 'Welcome',
            lastMessage: new Date(),
            moduleType,
            messages: tempMessages,
        } as ChatTopic;

        setCurrentChat(() => newChat);
        // console.log("Current Chat: ", currentChat)
        // console.log("Current ChatTopics: ", chatTopics)
        // setChatTopics(prev => [newChat, ...prev.filter(topic =>
        //     topic.title !== 'Welcome'
        // )]);
        // setMessages(() => [...newChat.messages]);
        setDisplayedMessage(() => ""); // 清空流式显示内容
        displayIndexRef.current = 0; // 重置打字机效果索引
    };

    // 处理选择话题
    const handleTopicSelect = (topicId: string) => {
        if (chatting) return;

        const topic = chatTopics.find(t => t.id === topicId);
        if (topic) {
            setMessages(() => [...topic.messages]); // 使用函数式更新确保新数组引用
            setDisplayedMessage(''); // 清空流式显示内容
            displayIndexRef.current = 0; // 重置打字机效果索引
        }
        setCurrentChat(() => topic as ChatTopic);
    };

    // 删除对话历史
    const handleDeleteTopic = async (topicID: string) => {
        console.log(chatting);
        if (chatting) {
            return;
        };
        const tempTopic = chatTopics.find(t => t.id === topicID);
        if (tempTopic?.title === 'Welcome') {
            return;
        }
        console.log("删除对话: ", topicID)
        deleteChatHistory(topicID);
        const allRefs = tempTopic.messages
            .filter(message => message.references) // 过滤出有references的消息
            .flatMap(message => message.references);

        allRefs.forEach(ref => {
            localForage.removeItem(ref.content).then(function () {
                // 当值被移除后，此处代码运行
                console.log(`Key ${ref.content} is removed`);
            }).catch(function (err) {
                // 当出错时，此处代码运行
                console.log(err);
            });
        })

        localForage.removeItem(topicID).then(function () {
            // 当值被移除后，此处代码运行
            console.log(`Key ${topicID} is removed`);
        }).catch(function (err) {
            // 当出错时，此处代码运行
            console.log(err);
        });
        setChatTopics(prev => prev.filter(t => t.id !== topicID));
        if (currentChat?.id === topicID) {
            handleNewChat()
        }
        // 删除原有的localStorage直接操作
    };

    const handleFeedback = (messageId: string, isPositive: boolean) => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
                return {
                    ...msg,
                    feedback: isPositive ? 'positive' : 'negative'
                };
            }
            return msg;
        }));
    }


    const updateStreamingMessage = (content: string) => {
        completeMessageRef.current = content;
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            displayIndexRef.current = 1;
            setDisplayedMessage(content.charAt(0));
            // streamTimerRef.current = setTimeout(updateDisplayedMessage, 5);
        }
    };

    const handleStopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        if (streamTimerRef.current) {
            clearTimeout(streamTimerRef.current);
        }
        isStreamingCompleteRef.current = true;
        isTypingRef.current = false;
        setIsProcessing(false);
        setReasoningProgress(-1);
        setChatting(false);
        // handleSend();
    };

    // 在组件内添加处理函数
    const handlePresetTemplate = (template: PresetTemplate | null) => {
        if (template) {
            setInput(template.content);
            setSelectedTemplate(template.id);
        }
        else {
            setInput('');
            setSelectedTemplate("");
        }
    };

    //上传文件
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // 支持的文件类型
        const allowedTypes = [
            'application/msword', // .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/pdf' // .pdf
        ];
        const validFiles = Array.from(files).filter(file => {
            return allowedTypes.includes(file.type) &&
                !filesRef.current.some(
                    f => f.name === file.name &&
                        f.size === file.size &&
                        f.lastModified === file.lastModified
                );
        });

        // 新增文件大小校验函数
        const checkTotalSize = (existingFiles: File[], newFiles: File[]) => {
            const total = [...existingFiles, ...newFiles].reduce((sum, file) => sum + file.size, 0);
            return total <= 10 * 1024 * 1024; // 10MB
        };

        // 修改原有代码
        if (validFiles.length > 0) {
            // 添加大小校验
            if (!checkTotalSize(uploadedFiles, validFiles)) {
                window.alert(t('large_files'));
                // return;
            }

            // 添加新文件而不是替换
            setUploadedFiles(prev => [...prev, ...validFiles]);
            filesRef.current = [...filesRef.current, ...validFiles];
        }

        e.target.value = ''; // 清空input以便重复选择文件
    };

    function extractPdfData(rawData: string) {
        // 实现具体解析逻辑，例如：
        const match = rawData.match(/data:pdf;base64,([\s\S]+)/);
        return match ? match[1] : '';
    }


    //处理消息
    const handleSend = async () => {
        setChatting(true);
        console.log("use prompt", usePrompt)
        if (!input.trim()) return;
        const newMessage: Message = {
            id: Date.now().toString(),
            content: input,
            timestamp: new Date(),
            sender: 'user',
            // attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
            filenames: uploadedFiles.length > 0 ? uploadedFiles.map(file => file.name) : undefined,
            uploadPercentage: uploadedFiles.length > 0 ? 0 : -1
        };
        setUploadedFiles([])
        const updatedMessages = [...messages, newMessage];
        updatedMessagesRef.current = updatedMessages;
        setMessages(updatedMessages);
        setInput('');

        // 更新对话标题为输入内容的前30个字符
        if (currentChat.title === "Welcome") {
            setCurrentChat(prev => ({
                ...prev,
                title: input.slice(0, 30) + (input.length > 30 ? '...' : '')
            }));
        }

        console.log("Current topic: ", currentChat.id);

        setChatTopics(prev => prev.map(topic =>
            topic.id === currentChat.id
                ? currentChat
                : topic
        ));

        console.log("Updated chat topics: ", chatTopics);
        let reasoningDisplayIndex = 0;
        let currentReasoning = true;
        try {
            abortControllerRef.current = new AbortController();
            const signal = abortControllerRef.current.signal;
            let accumulatedResponse = "";
            let reasoningResponse = "";
            let i = 0;
            reasoningDisplayIndex = -1;
            let hasRef = false
            currentReasoning = true;
            setIsProcessing(true);
            // let references: { title: string; url: string }[] = [];
            let references: { title: string; content: string }[] = [];
            // 统计用户发送消息的字数，据此预测思考的进度
            const messageContent = JSON.stringify(
                updatedMessages.map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.content
                }))
            );
            const wordCount = messageContent.split(/\s+/).length;
            const totalFileBytes = uploadedFiles.reduce((total, file) => total + file.size, 0);
            const promptWords = 200;
            const totalWords = Math.trunc(wordCount + totalFileBytes / 1000 + promptWords); // 假设每个单词2字节
            const predictThinkingWords = Math.min(Math.trunc(totalWords * 0.4 + 1), 1000); // 假设思考30%的字数
            console.log("Total words:", totalWords);
            let temp_partition = validPartitions
            temp_partition = temp_partition.filter(partition => partition.status)
            let partition_names = temp_partition.flatMap(partition => partition.doc_names)
            for await (const delta of streamChatResponse(
                usePrompt,
                partition_names,
                currentChat.id,
                updatedMessages,
                signal,
                filesRef.current,
                moduleType,
                (percent) => {  // 新增进度回调参数
                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === newMessage.id
                                ? { ...msg, uploadPercentage: percent }
                                : msg
                        )
                    );
                },
            )) {
                // 参考文献部分

                if (delta.includes('<reference>')) {
                    console.log("Delta " + i + ":", delta);
                    const refContent = delta.replace(/<\/?reference>/g, '').trim();
                    const ref_dict = JSON.parse(refContent);
                    references = Object.values(ref_dict).map(ref => ({
                        title: ref.title,
                        content: ref.chunk_uid,
                        collection_name: moduleType
                    }));
                    console.log(references)
                    // 存储到临时变量，后续合并到消息中
                    hasRef = true;
                    continue;
                }

                // console.log("Delta " + i + ":", delta);
                // console.log("Delta " + i + ": answer", accumulatedResponse);
                // console.log("Current reasoning:", reasoningResponse);
                if (delta.includes("<think>")) {
                    console.log("Found <think> tag");
                    // console.log("Predicted thinking length:", predictThinkingWords);
                    const parts = delta.split("</think>");
                    if (parts.length > 1) {
                        reasoningDisplayIndex = 100;
                        currentReasoning = false;
                        reasoningResponse += parts[0].replace("<think>", "");
                        accumulatedResponse += parts[1];

                    } else {
                        reasoningResponse += delta.replace("<think>", "");
                        if (reasoningResponse.length > predictThinkingWords * 0.5) {
                            reasoningDisplayIndex = Math.trunc(reasoningResponse.length * 100 / (predictThinkingWords * 0.5 + reasoningResponse.length));
                        }
                        else {
                            reasoningDisplayIndex = Math.trunc(reasoningResponse.length * 100 / predictThinkingWords);
                        }
                    }
                } else if (delta.includes("</think>")) {
                    console.log("Found </think> tag");
                    const parts = delta.split("</think>");
                    if (parts.length > 1) {
                        reasoningResponse += parts[0];
                        accumulatedResponse += parts[1];
                    }
                    reasoningDisplayIndex = 100;
                    currentReasoning = false;
                } else {
                    if (!currentReasoning) {
                        accumulatedResponse += delta;
                    } else {
                        reasoningResponse += delta;
                        if (reasoningResponse.length > predictThinkingWords * 0.5) {
                            reasoningDisplayIndex = Math.trunc(reasoningResponse.length * 100 / (predictThinkingWords * 0.5 + reasoningResponse.length));
                        }
                        else {
                            reasoningDisplayIndex = Math.trunc(reasoningResponse.length * 100 / predictThinkingWords);
                        }
                    }
                }
                setReasoningProgress(reasoningDisplayIndex);
                if (reasoningDisplayIndex == 100) {
                    console.log("Updating streaming message:", accumulatedResponse);
                    updateStreamingMessage(accumulatedResponse);
                }
                while (displayIndexRef.current < accumulatedResponse.length) {
                    setDisplayedMessage(
                        accumulatedResponse.slice(0, displayIndexRef.current + 1)
                    );
                    displayIndexRef.current += 1;
                    // await new Promise((resolve) => setTimeout(resolve, 20));
                }
                i++;
            }

            if (signal.aborted) {
                const targetMessage = messages.find(msg => msg.id === newMessage.id);
                const uploadProgress = targetMessage?.uploadPercentage || 0; // 默认0%
                console.log("Uploading status", uploadProgress)
                if (uploadProgress === 50) {
                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === newMessage.id
                                ? { ...msg, uploadPercentage: -1 }
                                : msg
                        )
                    );
                    newMessage.uploadPercentage = -1;
                    throw new Error("Sending stopped by user");
                }
                else {
                    throw new Error("Generation stopped by user");
                }
            }

            isStreamingCompleteRef.current = true;
            isTypingRef.current = true;

            while (displayIndexRef.current < accumulatedResponse.length) {
                setDisplayedMessage(
                    accumulatedResponse.slice(0, displayIndexRef.current + 1)
                );
                displayIndexRef.current += 1;
                // await new Promise((resolve) => setTimeout(resolve, 20));
            }

            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                content: accumulatedResponse,
                // reasoning: reasoningResponse,
                timestamp: new Date(),
                sender: "bot",
            };
            if (hasRef) {
                botResponse.references = references;
            }
            const finalMessages = [...updatedMessages, botResponse];
            setMessages(finalMessages);

            setDisplayedMessage("");
            displayIndexRef.current = 0;
            completeMessageRef.current = "";
            isStreamingCompleteRef.current = false;
            isTypingRef.current = false;
        } catch (error: any) {
            const targetMessage = messages.find(msg => msg.id === newMessage.id);
            const uploadProgress = targetMessage?.uploadPercentage || 0; // 默认0%
            console.log("Uploading status2", uploadProgress)
            if (uploadProgress < 100) {
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === newMessage.id
                            ? { ...msg, uploadPercentage: -1 }
                            : msg
                    )
                );
                newMessage.uploadPercentage = -1;
            }
            console.log("Uploading status", newMessage.uploadPercentage)
            if (error.name === 'AbortError' || newMessage.uploadPercentage === 100) {
                console.log('Generation stopped by user');
            } else {
                console.error('Error:', error);
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    content: t('errorMessage') || 'Sorry, there was an error processing your request.',
                    timestamp: new Date(),
                    sender: 'bot'
                };
                setMessages([...updatedMessages, errorMessage]);
            }
        } finally {
            if (streamTimerRef.current) {
                clearTimeout(streamTimerRef.current);
            }
            setIsProcessing(false);
            abortControllerRef.current = null;
            setReasoningProgress(-1);
            setChatTopics(prev => prev.map(topic =>
                topic.id === currentChat.id
                    ? { ...topic, messages: messages, lastMessage: new Date() }
                    : topic
            ));
        }
        setChatting(false)
        setUploadedFiles([]);
    };


    // const [general_Partition, setGeneral_Partition] = useState<RAGPartition[]>([{ id: "a", doc_names: ["PAH_Ch1.pdf", "PAH_Ch2.pdf", "PAH_Ch3.pdf", "PAH_Ch4.pdf", "PAH_Ch5.pdf", "PAH_Ch6.pdf", "PAH_Ch7.pdf", "PAH_Ch8.pdf", "PAH_Ch9.pdf"], status: true, partition_name: "PAH", rank: 1 }]);
    // const [contract_Partition, setContract_Partition] = useState<RAGPartition[]>([
    //     { id: "a", doc_names: ["02_NEC4 ECC.pdf"], status: true, partition_name: "NEC4 ECC & library of amendment", rank: 1 },
    //     { id: "b", doc_names: ["01_Pratice Notes for NEC4 ECC.pdf"], status: true, partition_name: "Practice Notes", rank: 2 },
    //     { id: "c", doc_names: ["09_CEDD NEC Playbook.pdf"], status: true, partition_name: "CEDD Playbook", rank: 3 },
    //     { id: "d", doc_names: ["03_ECC4_Manage_UG4_Jan 2023.pdf"], status: true, partition_name: "NEC ECC User guide", rank: 4 },
    //     { id: "e", doc_names: ["06_DEVB memo - Full Implementation of NEC form of Contract.pdf"], status: true, partition_name: "DEVB memo", rank: 5 },
    //     { id: "f", doc_names: ["04_TC2_2023.pdf"], status: true, partition_name: "TC2/2023 (with Appendices A and B)", rank: 6 },
    //     { id: "g", doc_names: ["05_TC5_2021.pdf"], status: true, partition_name: "TC5/2021", rank: 7 },
    // ]);

    const docNECRank = {
        "02_NEC4 ECC.pdf": 1, "01_Pratice Notes for NEC4 ECC.pdf": 2,
        "09_CEDD NEC Playbook.pdf": 3, "03_ECC4_Manage_UG4_Jan 2023.pdf": 4,
        "06_DEVB memo - Full Implementation of NEC form of Contract.pdf": 5,
        "04_TC2_2023.pdf": 6, "05_TC5_2021.pdf": 7
    }

    const pahRank = {
        "PAH_Ch1.pdf": 1, "PAH_Ch2.pdf": 2, "PAH_Ch3.pdf": 3, "PAH_Ch4.pdf": 4,
        "PAH_Ch5.pdf": 5, "PAH_Ch6.pdf": 6, "PAH_Ch7.pdf": 7, "PAH_Ch8.pdf": 8,
        "PAH_Ch9.pdf": 9
    }


    const [validPartitions, setValidPartitions] = useState<RAGPartition[]>([])

    const refreshModuleInfo = async () => {
        try {
            const res = await getModuleDetails(moduleType);
            var base_rank = 0
            var mockFiles = {}
            if (moduleType === "contract") {
                base_rank = Object.keys(docNECRank).length
                mockFiles = docNECRank
            }
            else if (moduleType == "general") {
                base_rank = Object.keys(pahRank).length
                mockFiles = pahRank
            }
            else {
                base_rank = 0
            }

            const ragFiles: RAGPartition[] = res
                .filter(item => item.metadata?.status === 'done')
                .map((item, index) => ({
                    id: item.id || item._id,
                    doc_names: [item.filename || item.name],
                    status: moduleType == "contract" ? true : false,
                    partition_name: item.filename || item.name,
                    rank: mockFiles[item.filename || item.name] !== undefined ? mockFiles[item.filename || item.name] : base_rank + index + 1,
                }));

            setValidPartitions(ragFiles);
            console.log(validPartitions)
        } catch (error) {
            setValidPartitions([]);
            console.error('Error fetching module details:', error);
        }
    };

    // useEffect(() => {
    //     // 设置定时刷新，每30秒刷新一次数据
    //     const interval = setInterval(() => {
    //         refreshModuleInfo()
    //     }, 60000);

    //     return () => clearInterval(interval);
    // }, [moduleType]);

    useEffect(() => {
        refreshModuleInfo()
    }, [moduleType])


    // const [selectedPartitions, setSelectedPartitions] = useState<string[]>([]);

    const handleSelectedPartitions = (value: RAGPartition[]) => {
        setValidPartitions(value)
    }

    return (
        <div className="flex flex-row flex-1 w-full h-[calc(100vh-5rem)] "> {/* 修改为min-h-screen避免高度叠加 */}
            <div className="flex flex-col h-full"> {/* 将h-screen改为h-full，避免与父容器高度叠加 */}
                <ChatSidebar
                    moduleType={moduleType}
                    chatTopics={chatTopics}
                    selectedTopic={currentChat.id}
                    isLeftSidebarCollapsed={isLeftSidebarCollapsed}
                    setIsLeftSidebarCollapsed={setIsLeftSidebarCollapsed}
                    handleNewChat={handleNewChat}
                    handleTopicSelect={handleTopicSelect}
                    handleDeleteTopic={handleDeleteTopic}
                    chatting={chatting}
                />
            </div>

            <div className="flex-1 flex flex-col h-full"> {/* 将h-screen改为h-full */}
                {/* 对话消息显示区域 */}
                <div className="flex-col flex flex-1 bg-white rounded-lg shadow overflow-y-auto">
                    <MessageList
                        messages={messages}
                        isReasoning={isProcessing}
                        displayedMessage={displayedMessage}
                        percentage={reasoningProgress}
                        handleFeedback={handleFeedback}
                    />
                </div>
                {/* 对话消息输入部分 */}
                <div className="bg-white rounded-lg shadow p-1.5 mx-auto w-full flex flex-col min-h-[30%]"> {/* 移除bottom-[20px]固定定位 */}
                    {(moduleType === 'contract' || moduleType === "general") && (
                        <div >
                            <MessageInput
                                input={input}
                                setInput={setInput}
                                handleSend={handleSend}
                                handleFileUpload={handleFileUpload}
                                handleStopGeneration={handleStopGeneration}
                                isGenerating={isProcessing}
                                uploadedFiles={uploadedFiles}
                                setUploadedFiles={setUploadedFiles}
                                handlePresetTemplate={handlePresetTemplate}
                                moduleTemplates={topicTemplates}
                                selectedTemplateId={selectedTemplate}
                                availablePartitions={validPartitions}
                                handleSelectedPartitions={handleSelectedPartitions}
                                handleUsePrompt={setUsePrompt}
                                usePrompt={usePrompt}
                            />
                        </div>
                    )
                    }
                    <div className="flex-1 text-gray text-sm flex items-center justify-center">
                        <p>{t('notice')}</p>
                    </div>
                </div>
            </div>
        </div >
    );

}
