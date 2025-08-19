import type { Language } from './language';

export type { Language } from './language';

export type ModuleType = 'general' | 'tender' | 'consultancy' | 'contract';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  preferences: {
    language: Language;
    theme: 'light' | 'dark';
  };
  lastActive: Date;
}

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'bot';
  feedback?: 'positive' | 'negative';
  reasoning?: string;
  references?: Array<{
    title: string;
    content: string;
    collection_name?: string;
  }>;
  // attachments?: { name: string, type: string, data: string }[];
  attachments?: File[];
  filenames?: string[];
  uploadPercentage?: number;
}

export interface ChatTopic {
  id: string;
  title: string;
  lastMessage: Date;
  moduleType: ModuleType;
  messages: Message[];
}

export interface RAGDatabase {
  id: string;
  name: string;
  type: 'public' | 'private';
  status: 'active' | 'updating' | 'error';
  lastUpdated: Date;
  documentCount: number;
  totalSize: number;
  embeddingModel: string;
  owner: string;
  visibility: 'public' | 'private';
}

export interface RAGPartition {
  id: string;
  doc_names: string[];
  status: boolean;
  // 新增字段
  partition_name: string;
  rank: number;
}

export interface SystemStatus {
  activeUsers: number;
  congestionLevel: 'low' | 'medium' | 'high';
  lastUpdated: Date;
}

export interface Module {
  id: string;
  name: string;
  type: ModuleType;
  description: string;
  database: RAGDatabase;
  templates?: Array<{
    id: string;
    name: string;
    description: string;
    url: string;
  }>;
}

export interface EmbeddingModel {
  id: string;
  name: string;
  description: string;
  type: 'embedding';
  status: 'active' | 'inactive';
  dimensions: number;
  maxTokens: number;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'error';
  vectorized: boolean;
  knowledgeBaseId: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  embeddingModel: string;
  visibility: 'public' | 'private';
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  documentCount: number;
  totalSize: number;
}

export interface SearchResult {
  id: string;
  content: string;
  relevanceScore: number;
  documentId: string;
  documentName: string;
  snippet: string;
}

export interface FileData {
  id: string;
  name: string;
  publicationDate: Date;
  effectiveDate: Date;
  size: number;
  type: string;
  module: ModuleType;
}

export interface PresetTemplate {
  id: string;
  type: string;
  title: string;
  content: string;
}

export interface FileStatus {
  _id: string;
  filename: string;
  metadata: {
    num_chunk: number;
    num_vector: number;
    total_chunks: number;
    status: string;
  }
  length?: number;
}

export interface RAGFile {
  _id: string;
  filename: string;
  rank?: number;
}