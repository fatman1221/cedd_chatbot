import type { Message, ModuleType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ThermometerSnowflakeIcon } from 'lucide-react';

const API_BASE_URL = 'http://61.135.204.117:25104/cedd';  // 完整代理路径


export const uploadFile = async (files: File[], module: ModuleType): Promise<void> => {
    const formData = new FormData();
    formData.append(`num_document`, files.length.toString())
    files.forEach((file, index) => {
        formData.append(`document_${index}`, file);
    });
    formData.append(`module_name`, module)

    const response = await fetch(`${API_BASE_URL}/rag/upload_files_to_mongo`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
};


export const getModuleDetails = async (module: ModuleType): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/rag/get_module_info?module_name=${encodeURIComponent(module)}`, {
        method: 'GET'
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.details;
};


// export const removeModuleDocument = async (filename: string, module: string): Promise<void> => {
//     const formData = new FormData();
//     formData.append(`filename`, filename)
//     formData.append(`collection_name`, module)
//     const response = await fetch(`${API_BASE_URL}/rag/remove_module_document`, {
//         method: 'POST',
//         body: formData,
//         headers: {
//             'Authorization': `${token}`,
//         },
//     });

//     if (!response.ok) {
//         throw new Error('Network response was not ok');
//     }
//     const data = await response.json();
//     return data.details;
// };


// export const chunkDocument = async (file_id: string, module: string): Promise<void> => {
//     const { token, isAdmin } = useAuth();
//     const formData = new FormData();
//     formData.append(`file_id`, file_id)
//     formData.append(`module_name`, module)
//     const response = await fetch(`${API_BASE_URL}/rag/process_one_document`, {
//         method: 'POST',
//         body: formData,
//         headers: {
//             'Authorization': `${token}`,
//         },
//     });
//     if (!response.ok) {
//         throw new Error('Network response was not ok');
//     }
//     const data = await response.json();
//     return data.details;
// };

export interface RawFile {
    pdf_data: string;
    message: string;
    filename: string;
}

export const getOriginFile = async (file_id: string, module: string): Promise<RawFile> => {
    const response = await fetch(`${API_BASE_URL}/rag/get_raw_file?module_name=${encodeURIComponent(module)}&id=${file_id}`, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'GET'
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
};


export async function getfile(collection_name: string, chunk_uid: string) {
    // 创建查询参数
    const params = new URLSearchParams();
    params.append('collection_name', collection_name);
    params.append('chunk_uid', chunk_uid);

    // 通过查询字符串传递参数
    const response = await fetch(`${API_BASE_URL}/rag/get_chunk_file?${params.toString()}`, {
        method: 'GET'
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.pdf_data;
}