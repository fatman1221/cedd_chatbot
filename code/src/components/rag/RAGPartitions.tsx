import { Menu } from '@headlessui/react';
import type { RAGPartition } from '../../types';
import { useTranslation } from 'react-i18next';

interface RAGPartitionsProps {
    availablePartitions: RAGPartition[];
    handleSelectedPartitions: (value: RAGPartition[]) => void;
    handleUsePrompt: (value: boolean) => void;
    usePrompt: boolean;
    isGenerating: boolean;
}

export default function RAGPartitions({
    availablePartitions,
    handleSelectedPartitions,
    handleUsePrompt,
    usePrompt,
    isGenerating,
}: RAGPartitionsProps) {
    const { t } = useTranslation();

    const handleCheckboxChange = (partition: RAGPartition) => {

        const updated = availablePartitions.map(p =>
            p.id === partition.id ? { ...p, status: !p.status } : p
        );
        // // console.log("Partition", updated);
        // let updated = 
        handleSelectedPartitions(updated);
    };

    return (
        <div className="mt-2 w-full flex flex-row">

            <Menu as="div" className="relative flex-row w-[70%]">
                <Menu.Button className="flex w-full p-2 text-left bg-white border rounded-md shadow-sm" disabled={isGenerating}>
                    {t('select_rag_docs')} ({availablePartitions.length})
                </Menu.Button>
                <Menu.Items as="div" className="absolute z-10 w-full bottom-full mb-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto left-0 grid grid-cols-2 gap-2 p-2" >
                    {availablePartitions.sort((a, b) => a.rank - b.rank).map((partition, p_index) => (
                        // 修改Menu.Item配置
                        <Menu.Item key={partition.id}>
                            {({ active, close }) => (
                                <label
                                    htmlFor={`partition-checkbox-${partition.id}`}
                                    className={`flex items-center p-2 space-x-2 cursor-pointer ${active ? 'bg-blue-50' : ''} whitespace-nowrap`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleCheckboxChange({
                                            ...partition,
                                            status: !partition.status
                                        });
                                    }}>
                                    <input
                                        id={`partition-checkbox-${partition.id}`}
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300"
                                        checked={partition.status}
                                        disabled={isGenerating}
                                        onChange={(e) => {
                                            // 保留原有逻辑防止事件冒泡
                                            e.stopPropagation();
                                        }}
                                    />
                                    <span
                                        className="truncate max-w-[200px]"
                                        title={partition.partition_name}
                                    >
                                        {partition.partition_name.length > 20 ? `${p_index + 1}: ${partition.partition_name.substring(0, 20)}.` : `${p_index + 1}: ${partition.partition_name}`}
                                    </span>
                                </label>
                            )}
                        </Menu.Item>
                    ))}
                </Menu.Items>
            </Menu>
            <div className='pl-5 flex flex-1 items-end'>
                <button
                    // title='using designed prompt'
                    onClick={() => {
                        if (isGenerating) {
                            return;
                        }
                        handleUsePrompt(!usePrompt);
                    }}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-800 font-medium transition-colors"
                >
                    {usePrompt ? (
                        t('use_preset_prompt')
                    ) : (
                        t('not_use_preset_prompt')
                    )}
                </button>
            </div>
        </div>
    );
}
