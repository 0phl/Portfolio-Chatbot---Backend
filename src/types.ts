export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata: DocumentMetadata;
}

export interface EmbeddingResponse {
  embedding: number[];
}

export interface DocumentMetadata {
  text: string;
  category?: string;
  title?: string;
  source?: string;
  fileName?: string;
  pageNumber?: number;
  chunkIndex?: number;
  documentType?: 'text' | 'pdf' | 'webpage' | 'custom';
  uploadDate?: string;
  fileSize?: number;
}

export interface EnhancedDocumentMetadata extends DocumentMetadata {
  priority?: 'high' | 'medium' | 'low';
  context_type?: 'foundational' | 'technical' | 'professional' | 'project_detailed' | 'background' | 'personal' | 'behavioral' | 'contact';
  chunk_id?: string;
  parent_doc?: string;
  created_at?: string;
  updated_at?: string;
  word_count?: number;
  semantic_tags?: string[];
  personality_weight?: number;
}

export interface PDFProcessingOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  preservePageBreaks?: boolean;
  includeMetadata?: boolean;
}

export interface SecurityConfig {
  maxMessageLength: number;
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  slowDownThreshold: number;
  allowedOrigins: string[];
  suspiciousPatterns: RegExp[];
}

export interface SecurityEvent {
  type: 'rate_limit' | 'suspicious_input' | 'blocked_request' | 'validation_error';
  ip: string;
  userAgent?: string;
  message?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}