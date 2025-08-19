import type { Message, ModuleType } from '../types';

const API_BASE_URL = 'http://61.135.204.117:25104/cedd';  // 完整代理路径

interface ChatResponse {
    choices: Array<{
        delta: {
            content: string;
            reasoning_content: string;
        };
    }>;
}


export async function* streamChatResponse_bad(
    usePrompt: boolean,
    partition_names: string[],
    sessionId: string,  // 会话ID
    updatedMessages: Message[],
    signal?: AbortSignal,
    files: File[] = [],
    moduleType?: ModuleType,
    onProgress?: (percentage: number) => void,
): AsyncGenerator<string> {


    const getTemperature = (module: ModuleType) => {
        switch (module) {
            case 'general':
                return 0.9;
            case 'tender':
                return 0.9;
            case 'consultancy':
                return 0.9;
            case 'contract':
                return 0.1;
            default:
                return 0.6;
        }
    };

    const formData = new FormData();
    console.log('files', files.length);
    console.log("contents", files)
    if (files.length > 0) {
        files.forEach((file, index) => {
            formData.append(`document_files_${index}`, file);  // 每个文件使用独立参数名
        });
        formData.append('num_documents', files.length.toString());  // 文档数量
    }
    console.log('document_name', partition_names)

    console.log(partition_names)
    if (partition_names.length > 0) {
        formData.append('num_rag', `${partition_names.length}`);  // 文档数量
        // formData.append('num_rag', `-1`);  // 文档数量
        partition_names.forEach((partition_name, index) => {
            formData.append(`partition_${index}`, partition_name);  // 每个文件使用独立参数名
        })
    }
    else {
        formData.append('num_rag', '0')
    }
    formData.append('use_prompt', "1");
    console.log('current formadata', formData);
    const messageContent = JSON.stringify(
        updatedMessages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
        }))
    );
    // 添加 JSON 结构数据（需转换为字符串）
    let collection_name = 'demo_nec';

    // collection_name = moduleType ? getCollectName(moduleType) : collection_name;
    collection_name = moduleType ? moduleType : "general"
    let temperature = moduleType ? getTemperature(moduleType) : 0.1;
    if (usePrompt) {
        formData.append('use_prompt', "1");
    }
    else {
        formData.append('use_prompt', "0");
    }
    formData.append('session_id', sessionId);
    formData.append('temperature', temperature.toString());
    formData.append('collection_name', collection_name);
    formData.append('messages', messageContent);
    formData.append('module', moduleType || 'contract');

    onProgress?.(1);
    console.log('Uploading ', 1);
    const response = await fetch(`${API_BASE_URL}/rag/qa_stream_url_local_rag`, {
        method: 'POST',
        body: formData,
        signal
    });
    onProgress?.(50);
    console.log('Uploading ', 50);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    if (!response.body) {
        throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let findThinking = false;
    let sendingDone = false;
    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            if (buffer) {
                try {
                    const data = buffer.replace('data: ', '');
                    if (data !== '[DONE]') {
                        const json = JSON.parse(data) as ChatResponse;
                        const delta = json.choices[0].delta.content;
                        if (delta) {
                            yield delta;
                        }
                    }
                } catch (e) {
                    console.debug('Error processing final buffer:', e);
                }
            }
            break;
        }

        buffer += decoder.decode(value, { stream: true });
        // const chunks = buffer.split('\n\n').slice(-1);
        console.log('buffer', buffer);
        const chunks = buffer.split('\n\n');

        for (let i = 0; i < chunks.length - 1; i++) {
            const chunk = chunks[i];
            if (!chunk.trim()) continue;
            if (!sendingDone) {
                sendingDone = true;
                onProgress?.(100);
            }
            // 解析reference标签
            if (chunk.startsWith('<reference>')) {
                try {
                    const refContent = chunk.replace(/<\/?reference>/g, '');
                    if (refContent.trim() === "{}") {
                        // yield '';
                        continue;
                    }

                    const references = JSON.parse(refContent);
                    // 将对象转换为数组并处理路径
                    // console.log(references)
                    if (Object.keys(references).length > 0) {
                        const output = Object.values(references)
                            .map((ref: any) => {
                                const path = String(ref?.title || 'Untitled');
                                const parts = path.split(/[\\/]/);
                                return parts[parts.length - 1];
                            })
                            .join('\n');
                        yield `<reference> ${refContent}`;
                    } else {
                        yield '';
                    }
                    continue;
                } catch (e) {
                    console.error('Error parsing reference:', e);
                    yield '';
                }
            }

            const data = chunk.replace('data: ', '');
            if (data === '[DONE]') continue;

            try {
                const json = JSON.parse(data) as ChatResponse;
                if (('reasoning_content' in json.choices[0].delta) && !findThinking) {
                    findThinking = true;
                    const delta = json.choices[0].delta.reasoning_content;
                    if (delta && !delta.includes("<think>")) {
                        yield '<think>' + delta;
                    }
                    else {
                        yield delta;
                    }
                    continue;
                }
                else if (findThinking && ('reasoning_content' in json.choices[0].delta)) {
                    const delta = json.choices[0].delta.reasoning_content;
                    if (delta) {
                        yield delta;
                    }
                    continue;
                }
                else if (findThinking && !('reasoning_content' in json.choices[0].delta)) {
                    findThinking = false;
                    yield '</think>';
                }
                const delta = json.choices[0].delta.content;
                if (delta) {
                    yield delta;
                }
            } catch (e) {
                console.debug('Error processing chunk:', e);
            }
        }
        buffer = chunks[chunks.length - 1];
    }
}

export async function* streamChatResponse(
    usePrompt: boolean,
    partition_names: string[],
    sessionId: string,  // 会话ID
    updatedMessages: Message[],
    signal?: AbortSignal,
    files: File[] = [],
    moduleType?: ModuleType,
    onProgress?: (percentage: number) => void,
): AsyncGenerator<string> {

    // 1. 封装文件上传为Promise
    if (files.length > 0) {
        await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const file_formData = new FormData();

            // 添加文件到FormData
            files.forEach((file, index) => {
                file_formData.append(`document_${index}`, file);
            });
            file_formData.append('num_documents', files.length.toString());
            file_formData.append('session_id', sessionId);

            // 监听上传进度
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    console.log(`总上传进度: ${percentComplete.toFixed(2)}%`);
                    // 映射到全局进度0-50%
                    onProgress?.(percentComplete);
                }
            });

            // 处理上传结果
            xhr.onload = function () {
                if (xhr.status === 200) {
                    console.log('所有文件上传成功');
                    resolve();
                } else {
                    console.error('上传失败，状态码:', xhr.status);
                    reject(new Error(`文件上传失败，状态码: ${xhr.status}`));
                }
            };

            xhr.onerror = function () {
                reject(new Error('文件上传失败，网络错误'));
            };

            // 支持取消操作
            if (signal) {
                signal.addEventListener('abort', () => {
                    xhr.abort();
                    reject(new Error('文件上传被取消'));
                });
            }

            // 发送请求
            xhr.open('POST', `${API_BASE_URL}/rag/upload_documents_chat`, true);
            xhr.send(file_formData);
        });
    }

    const getTemperature = (module: ModuleType) => {
        switch (module) {
            case 'general':
                return 0.9;
            case 'tender':
                return 0.9;
            case 'consultancy':
                return 0.9;
            case 'contract':
                return 0.1;
            default:
                return 0.6;
        }
    };

    const formData = new FormData();
    console.log('files', files.length);
    console.log("contents", files)
    if (files.length > 0) {
        files.forEach((file, index) => {
            formData.append(`document_${index}`, file.name);  // 每个文件使用独立参数名
        });
        formData.append('num_upload_documents', files.length.toString());  // 文档数量
    }
    else {
        formData.append('num_upload_documents', '0');  // 文档数量
    }

    console.log(partition_names)
    if (partition_names.length > 0) {
        formData.append('num_rag', `${partition_names.length}`);  // 文档数量
        // formData.append('num_rag', `-1`);  // 文档数量
        partition_names.forEach((partition_name, index) => {
            formData.append(`partition_${index}`, partition_name);  // 每个文件使用独立参数名
        })
    }
    else {
        formData.append('num_rag', '0')
    }
    formData.append('use_prompt', "1");
    console.log('current formadata', formData);
    const messageContent = JSON.stringify(
        updatedMessages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
        }))
    );
    // 添加 JSON 结构数据（需转换为字符串）
    let collection_name = 'demo_nec';

    // collection_name = moduleType ? getCollectName(moduleType) : collection_name;
    collection_name = moduleType ? moduleType : "general"
    let temperature = moduleType ? getTemperature(moduleType) : 0.1;
    if (usePrompt) {
        formData.append('use_prompt', "1");
    }
    else {
        formData.append('use_prompt', "0");
    }
    formData.append('session_id', sessionId);
    formData.append('temperature', temperature.toString());
    formData.append('collection_name', collection_name);
    formData.append('messages', messageContent);
    formData.append('module', moduleType || 'contract');

    // onProgress?.(1);
    console.log('Uploading ', 1);
    const response = await fetch(`${API_BASE_URL}/rag/qa_stream_url_local_rag`, {
        method: 'POST',
        body: formData,
        signal
    });
    // onProgress?.(50);
    // console.log('Uploading ', 50);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    if (!response.body) {
        throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let findThinking = false;
    let sendingDone = false;
    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            if (buffer) {
                try {
                    const data = buffer.replace('data: ', '');
                    if (data !== '[DONE]') {
                        const json = JSON.parse(data) as ChatResponse;
                        const delta = json.choices[0].delta.content;
                        if (delta) {
                            yield delta;
                        }
                    }
                } catch (e) {
                    console.debug('Error processing final buffer:', e);
                }
            }
            break;
        }

        buffer += decoder.decode(value, { stream: true });
        // const chunks = buffer.split('\n\n').slice(-1);
        console.log('buffer', buffer);
        const chunks = buffer.split('\n\n');

        for (let i = 0; i < chunks.length - 1; i++) {
            const chunk = chunks[i];
            if (!chunk.trim()) continue;
            if (!sendingDone) {
                sendingDone = true;
                onProgress?.(100);
            }
            // 解析reference标签
            if (chunk.startsWith('<reference>')) {
                try {
                    const refContent = chunk.replace(/<\/?reference>/g, '');
                    if (refContent.trim() === "{}") {
                        // yield '';
                        continue;
                    }

                    const references = JSON.parse(refContent);
                    // 将对象转换为数组并处理路径
                    // console.log(references)
                    if (Object.keys(references).length > 0) {
                        const output = Object.values(references)
                            .map((ref: any) => {
                                const path = String(ref?.title || 'Untitled');
                                const parts = path.split(/[\\/]/);
                                return parts[parts.length - 1];
                            })
                            .join('\n');
                        yield `<reference> ${refContent}`;
                    } else {
                        yield '';
                    }
                    continue;
                } catch (e) {
                    console.error('Error parsing reference:', e);
                    yield '';
                }
            }

            const data = chunk.replace('data: ', '');
            if (data === '[DONE]') continue;

            try {
                const json = JSON.parse(data) as ChatResponse;
                if (('reasoning_content' in json.choices[0].delta) && !findThinking) {
                    findThinking = true;
                    const delta = json.choices[0].delta.reasoning_content;
                    if (delta && !delta.includes("<think>")) {
                        yield '<think>' + delta;
                    }
                    else {
                        yield delta;
                    }
                    continue;
                }
                else if (findThinking && ('reasoning_content' in json.choices[0].delta)) {
                    const delta = json.choices[0].delta.reasoning_content;
                    if (delta) {
                        yield delta;
                    }
                    continue;
                }
                else if (findThinking && !('reasoning_content' in json.choices[0].delta)) {
                    findThinking = false;
                    yield '</think>';
                }
                const delta = json.choices[0].delta.content;
                if (delta) {
                    yield delta;
                }
            } catch (e) {
                console.debug('Error processing chunk:', e);
            }
        }
        buffer = chunks[chunks.length - 1];
    }
}

export const sendMessage = async (message: string): Promise<Message> => {
    const response = await fetch(`${API_BASE_URL}/rag/qa_stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            collection_name: "demo_nec",
            messages: [
                {
                    role: "user",
                    content: message
                }
            ]
        })
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return {
        id: Date.now().toString(),
        content: data.content,
        timestamp: new Date(),
        sender: 'bot'
    };
};



export async function deleteChatHistory(sessionId: string) {
    const formData = new FormData();

    console.log('current formadata', formData);

    formData.append('session_id_0', sessionId);
    formData.append('num_sessions', '1')

    const response = await fetch(`${API_BASE_URL}/rag/remove_chats`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    console.log(response)
}

export async function getPartitions(collection_name: string) {
    const response = await fetch(`${API_BASE_URL}/rag/get_partitions`, {
        method: 'GET',
        body: JSON.stringify({
            collection_name: collection_name
        })
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.partitions;
}