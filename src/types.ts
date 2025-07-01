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

export interface PDFProcessingOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  preservePageBreaks?: boolean;
  includeMetadata?: boolean;
}