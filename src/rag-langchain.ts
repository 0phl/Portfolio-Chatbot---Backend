import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { BufferMemory } from "langchain/memory";
import { VectorSearchResult, DocumentMetadata, PDFProcessingOptions, EnhancedDocumentMetadata } from "./types";
import * as fs from 'fs';
import * as path from 'path';
import pdf from 'pdf-parse';

export class LangChainRAGService {
  private llm: any;
  private embeddings: GoogleGenerativeAIEmbeddings;
  private sessionMemories: Map<string, BufferMemory>; // Session-based memory storage
  private pinecone: Pinecone;
  private index: any;

  constructor() {
    // Initialize LLM using direct Google AI SDK for compatibility
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
    this.llm = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite-preview-06-17",
      generationConfig: {
        temperature: 0.9,
        topP: 0.9,
        topK: 50,
        maxOutputTokens: 400,
      }
    });

    // Initialize embeddings
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_AI_API_KEY!,
      model: "text-embedding-004",
    });

    // Initialize Pinecone (using direct client for compatibility)
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    this.index = this.pinecone.index(process.env.PINECONE_INDEX!);

    // Initialize session-based memory storage
    this.sessionMemories = new Map<string, BufferMemory>();

    console.log('✅ LangChain RAG Service initialized successfully');
  }

  // Get or create memory for a specific session
  private getSessionMemory(sessionId: string): BufferMemory {
    if (!this.sessionMemories.has(sessionId)) {
      const memory = new BufferMemory({
        memoryKey: "chat_history",
        returnMessages: true,
      });
      this.sessionMemories.set(sessionId, memory);
      console.log(`🧠 Created new memory for session: ${sessionId}`);
    }
    return this.sessionMemories.get(sessionId)!;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const embeddings = await this.embeddings.embedQuery(text);
      return embeddings;
    } catch (error) {
      console.error('❌ ERROR generating embedding with LangChain:');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  async query(userInput: string, sessionId: string = 'default'): Promise<string> {
    try {
      // Get session-specific memory
      const sessionMemory = this.getSessionMemory(sessionId);

      // Get conversation history from session-specific memory
      const chatHistory = await sessionMemory.chatHistory.getMessages();

      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(userInput);

      // Search vector store using direct Pinecone client
      const searchResults = await this.index.query({
        vector: queryEmbedding,
        topK: 3,
        includeMetadata: true,
      });

      // Extract context from search results
      const context = searchResults.matches
        .filter((match: any) => match.score > 0.3)
        .map((match: any) => match.metadata?.text || '')
        .join('\n\n');

      // Build conversation context from LangChain memory
      const conversationContext = chatHistory
        .slice(-6) // Last 6 messages for context
        .map(msg => `${msg.constructor.name === 'HumanMessage' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      // Determine response type
      const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|what's up|how are you|yo|sup|howdy|hiya|wassup|what's good|kumusta|kamusta|musta|oy|hoy)$/i.test(userInput.trim());
      const isGeneral = userInput.toLowerCase().includes('tell me about') || userInput.toLowerCase().includes('who are you');
      
      // Detect contact information requests
      const contactPatterns = /\b(contact|email|phone|number|call|reach|linkedin|get in touch|reach out|contact me|contact you|contact him|contact ronan|email address|phone number|mobile|cell|social|profiles?|connect)\b/i;
      const isContactRequest = contactPatterns.test(userInput);
      
      // Detect conversation ending signals
      const endingPatterns = /^(thanks?|thank you|ok|okay|alright|cool|good|nice|no|nope|im good|i'm good|thats all|that's all|bye|goodbye|see you|ttyl|talk to you later)$/i;
      const isConversationEnding = endingPatterns.test(userInput.trim());
      
      // Detect if user is using Tagalog/Filipino
      const tagalogPatterns = /\b(ano|anong|paano|saan|sino|kailan|bakit|marunong|alam|pwede|mga|ka|mo|ko|ako|ikaw|siya|tayo|kayo|sila|lang|naman|din|rin|ba|po|oo|hindi|di|wala|meron|may|sa|ng|na|at|o|pero|kasi|kaya|kung|kapag|para|dahil|habang|tulad|tapos|sige|galing|wow|grabe|talaga|sobra|medyo|konti|dami|lahat|walang|maging|gagawin|ginawa|magawa|nakakagawa)\b/i;
      const isTagalog = tagalogPatterns.test(userInput);
      
      let prompt: string;

      if (isConversationEnding) {
        prompt = `They're wrapping up the conversation with: "${userInput}"

CONVERSATION HISTORY:
${conversationContext}

Respond naturally like you would when someone's saying goodbye:
- ${isTagalog ? 'They used Tagalog, so respond naturally - "Sige! Take care!" or "No worries! Hit me up anytime"' : 'Keep it casual and friendly like you\'re ending a chat with a friend'}
- Don't be pushy or try to keep them talking if they're clearly done
- Just acknowledge and be friendly about it
- Keep it short - like how you'd actually say goodbye
- Sound genuine, not like a customer service script

RESPONSE:`;
      } else if (isContactRequest) {
        prompt = `You're helping someone get in touch with Ronan. They asked: "${userInput}"

CONVERSATION HISTORY:
${conversationContext}

CONTACT INFO:
- Email: roncruz1503@gmail.com
- Phone: 09760299219
- LinkedIn: https://www.linkedin.com/in/ronan-dela-cruz-9661bb335/

Keep it natural and helpful:
- ${isTagalog ? 'Mix some Tagalog naturally since they used it - "Sure! Here\'s how you can reach out..." or "Eto yung contact info niya..."' : 'Sound like you\'re helping a friend connect with someone'}
- Don't dump all contact info unless they asked for everything
- Be conversational, not robotic - "You can reach him at..." instead of "The contact information is..."
- Write like you're texting a friend who asked for someone's number
- Keep it short and friendly - no formal language

RESPONSE:`;
      } else if (isGreeting) {
        prompt = `Someone just said "${userInput}" to you. Respond naturally like a friendly person would.

CONVERSATION HISTORY:
${conversationContext}

How to respond:
- ${isTagalog ? 'They used Tagalog, so mix it naturally - "Hey! Kumusta?" or "Hi there! What\'s up?"' : 'Match their energy - if they said "hey" be casual, if "good morning" be a bit more polite'}
- If you've chatted before, acknowledge it casually - "Hey again!" or "Back for more questions?"
- Mention you can help with Ronan stuff, but don't sound like a sales pitch
- Keep it short - like how you'd actually greet someone
- Sound genuinely friendly, not customer service fake

RESPONSE:`;
      } else if (isGeneral) {
        prompt = `Someone asked about Ronan: "${userInput}"

AVAILABLE CONTEXT:
${context}

CONVERSATION HISTORY:
${conversationContext}

Talk like you're introducing a friend:
- ${isTagalog ? 'They used Tagalog, so mix it naturally - "So si Ronan, he\'s..." or "Basically, I\'m into..."' : 'Keep it casual and friendly like you\'re telling someone about a classmate or colleague'}
- Give them the gist of who Ronan is without sounding like a resume
- Use "I" since you're speaking as Ronan - "I'm into..." "I've been working on..."
- Be conversational - "Actually, I'm pretty into..." instead of "My interests include..."
- Don't list everything at once - give highlights and let the conversation flow
- End naturally - not every response needs "want to know more?"
- Keep it short and genuine - like you're actually talking to someone

RESPONSE:`;
      } else {
        prompt = `Someone asked: "${userInput}"

RELEVANT CONTEXT:
${context}

CONVERSATION HISTORY:
${conversationContext}

${isTagalog ? 'They used Tagalog/Filipino - mix English and Tagalog naturally like you would in real conversation' : 'Keep it casual and friendly like you\'re chatting with someone'}

Answer like a real person would:
- Just answer their question directly - don't overthink it
- Use "I" since you're Ronan - "I worked on..." "I'm into..." "I've been..."
- Be conversational - "So basically..." "Actually..." "Yeah, I've been working on..."
- If you don't know something, just say so - "Hmm, I don't have that info" or "Not sure about that one"
- Keep it focused on what they asked - don't dump everything you know
- End naturally based on the vibe:
  * If they seem done: "Hope that helps!" or just end naturally
  * If there's more to share: "There's more to it if you're curious" or "Want me to go deeper?"
  * If conversation feels complete: just end without pushing
- Sound like you're actually talking to someone, not writing a report
- Use simple words and natural flow - like you're explaining to a friend over coffee

RESPONSE:`;
      }

      // Generate response using Google AI SDK with rate limit handling
      let responseText: string;
      try {
        const result = await this.llm.generateContent(prompt);
        const response = await result.response;
        responseText = response.text();
      } catch (error: any) {
        if (error.message?.includes('429') || error.message?.includes('quota')) {
          // Rate limit exceeded - provide a fallback response
          console.warn('Google AI quota exceeded, using fallback response');
          
          if (context) {
            responseText = `Based on the available information: ${context.split('\n\n')[0].substring(0, 200)}...
            
I'm currently experiencing high usage and cannot generate a full AI response. However, I found relevant information about your query in my knowledge base. Please try again in a few moments for a more detailed AI-generated response.`;
          } else {
            responseText = "I'm currently experiencing high usage and cannot process your request right now. Please try again in a few moments, or check if your question relates to my portfolio, skills, or projects.";
          }
        } else {
          throw error; // Re-throw if it's not a rate limit error
        }
      }

      // Save conversation to session-specific memory
      await sessionMemory.saveContext(
        { input: userInput },
        { output: responseText }
      );

      return responseText;
    } catch (error: any) {
      // Log error without excessive detail
      console.error('RAG query failed:', error.message);
      throw new Error(`Failed to process query: ${error.message}`);
    }
  }

  async addDocument(text: string, metadata: DocumentMetadata = { text }): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(text);
      const id = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

      await this.index.upsert([{
        id,
        values: embedding,
        metadata: { ...metadata, text },
      }]);
      
      console.log(`Document added with ID: ${id} via LangChain`);
    } catch (error) {
      console.error('Error adding document with LangChain:', error);
      throw new Error('Failed to add document');
    }
  }

  async addMultipleDocuments(documents: DocumentMetadata[]): Promise<void> {
    try {
      const vectors = [];
      
      for (const doc of documents) {
        const embedding = await this.generateEmbedding(doc.text);
        const id = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

        vectors.push({
          id,
          values: embedding,
          metadata: doc,
        });
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      await this.index.upsert(vectors);
      console.log(`Added ${vectors.length} documents to vector database via LangChain`);
    } catch (error) {
      console.error('Error adding multiple documents with LangChain:', error);
      throw new Error('Failed to add documents');
    }
  }

  async searchSimilar(query: string, topK: number = 5): Promise<VectorSearchResult[]> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      
      const searchResults = await this.index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
      });

      return searchResults.matches.map((match: any) => ({
        id: match.id,
        score: match.score,
        metadata: {
          text: match.metadata?.text || '',
          category: match.metadata?.category,
          title: match.metadata?.title,
          source: match.metadata?.source,
          fileName: match.metadata?.fileName,
          pageNumber: match.metadata?.pageNumber,
          chunkIndex: match.metadata?.chunkIndex,
          documentType: match.metadata?.documentType,
          uploadDate: match.metadata?.uploadDate,
          fileSize: match.metadata?.fileSize,
        },
      }));
    } catch (error) {
      console.error('Error searching similar documents with LangChain:', error);
      throw new Error('Failed to search documents');
    }
  }

  // Method to clear conversation memory for a specific session
  async clearMemory(sessionId: string = 'default'): Promise<void> {
    if (this.sessionMemories.has(sessionId)) {
      const sessionMemory = this.sessionMemories.get(sessionId)!;
      sessionMemory.clear();
      console.log(`Conversation memory cleared for session: ${sessionId}`);
    }
  }

  // Method to completely remove a session's memory
  async removeSession(sessionId: string): Promise<void> {
    if (this.sessionMemories.has(sessionId)) {
      this.sessionMemories.delete(sessionId);
      console.log(`Session memory removed: ${sessionId}`);
    }
  }

  // Method to get conversation history for a specific session
  async getConversationHistory(sessionId: string = 'default'): Promise<any> {
    const sessionMemory = this.getSessionMemory(sessionId);
    return await sessionMemory.chatHistory.getMessages();
  }

  // Method to get memory summary for a specific session
  async getMemorySummary(sessionId: string = 'default'): Promise<string> {
    const messages = await this.getConversationHistory(sessionId);
    return `Session ${sessionId} has ${messages.length} messages`;
  }

  // Method to get active session count
  getActiveSessionCount(): number {
    return this.sessionMemories.size;
  }

  // Enhanced method for adding documents with comprehensive metadata
  async addEnhancedDocument(text: string, metadata: EnhancedDocumentMetadata): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(text);
      const timestamp = new Date().toISOString();

      // Generate unique ID with meaningful prefix
      const categoryPrefix = metadata.category?.substring(0, 3) || 'doc';
      const id = `${categoryPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

      // Enhance metadata with computed fields
      const enhancedMetadata: EnhancedDocumentMetadata = {
        ...metadata,
        chunk_id: id,
        created_at: timestamp,
        updated_at: timestamp,
        word_count: text.split(/\s+/).length,
        personality_weight: this.calculatePersonalityWeight(metadata),
        semantic_tags: this.extractSemanticTags(text, metadata)
      };

      await this.index.upsert([{
        id,
        values: embedding,
        metadata: enhancedMetadata
      }]);

      console.log(`✅ Enhanced document added: ${metadata.title} (${enhancedMetadata.word_count} words)`);
    } catch (error) {
      console.error('❌ Error adding enhanced document:', error);
      throw error;
    }
  }

  // Enhanced method for batch adding documents with optimization
  async addEnhancedDocuments(documents: EnhancedDocumentMetadata[]): Promise<void> {
    try {
      console.log(`📄 Processing ${documents.length} enhanced documents...`);

      const vectors = [];
      const timestamp = new Date().toISOString();

      for (const doc of documents) {
        const embedding = await this.generateEmbedding(doc.text);
        const categoryPrefix = doc.category?.substring(0, 3) || 'doc';
        const id = `${categoryPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

        // Enhance metadata with computed fields
        const enhancedMetadata: EnhancedDocumentMetadata = {
          ...doc,
          chunk_id: id,
          created_at: timestamp,
          updated_at: timestamp,
          word_count: doc.text.split(/\s+/).length,
          personality_weight: this.calculatePersonalityWeight(doc),
          semantic_tags: this.extractSemanticTags(doc.text, doc)
        };

        vectors.push({
          id,
          values: embedding,
          metadata: enhancedMetadata
        });

        console.log(`  ✓ Processed: ${doc.title} (${enhancedMetadata.word_count} words, priority: ${doc.priority})`);
      }

      // Batch upsert for efficiency
      await this.index.upsert(vectors);
      console.log(`✅ Successfully added ${documents.length} enhanced documents to vector database`);
    } catch (error) {
      console.error('❌ Error adding enhanced documents:', error);
      throw error;
    }
  }

  // Calculate personality weight based on content type and category
  private calculatePersonalityWeight(metadata: EnhancedDocumentMetadata): number {
    let weight = 0.5; // Default weight

    // Boost personality-relevant content
    if (metadata.context_type === 'foundational' || metadata.context_type === 'behavioral') {
      weight = 1.0;
    } else if (metadata.context_type === 'personal') {
      weight = 0.9;
    } else if (metadata.category === 'identity' || metadata.category === 'communication') {
      weight = 0.95;
    } else if (metadata.priority === 'high') {
      weight = 0.8;
    } else if (metadata.context_type === 'technical') {
      weight = 0.6;
    }

    return Math.min(weight, 1.0);
  }

  // Extract semantic tags for better searchability
  private extractSemanticTags(text: string, metadata: EnhancedDocumentMetadata): string[] {
    const tags: string[] = [];

    // Add category and context type as tags
    if (metadata.category) tags.push(metadata.category);
    if (metadata.context_type) tags.push(metadata.context_type);

    // Extract technology-related tags
    const techKeywords = [
      'react', 'typescript', 'javascript', 'node.js', 'firebase', 'flutter',
      'php', 'mysql', 'tailwind', 'css', 'html', 'python', 'java', 'dart',
      'api', 'database', 'mobile', 'web', 'frontend', 'backend', 'fullstack'
    ];

    const lowerText = text.toLowerCase();
    techKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        tags.push(keyword);
      }
    });

    // Add personality-related tags
    const personalityKeywords = [
      'student', 'learning', 'collaborative', 'helpful', 'friendly',
      'passionate', 'enthusiastic', 'problem-solving', 'creative'
    ];

    personalityKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        tags.push(keyword);
      }
    });

    return [...new Set(tags)]; // Remove duplicates
  }

  // Enhanced search with personality-aware ranking
  async searchWithPersonality(query: string, topK: number = 5): Promise<VectorSearchResult[]> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);

      // Search with higher topK to allow for personality filtering
      const searchResults = await this.index.query({
        vector: queryEmbedding,
        topK: topK * 2,
        includeMetadata: true,
      });

      // Apply personality-aware ranking
      const rankedResults = searchResults.matches
        .filter((match: any) => match.score > 0.3)
        .map((match: any) => ({
          id: match.id,
          score: this.calculatePersonalityAdjustedScore(match.score, match.metadata),
          metadata: match.metadata as EnhancedDocumentMetadata
        }))
        .sort((a: VectorSearchResult, b: VectorSearchResult) => b.score - a.score)
        .slice(0, topK);

      return rankedResults;
    } catch (error) {
      console.error('❌ Error in personality-aware search:', error);
      throw error;
    }
  }

  // Calculate personality-adjusted score
  private calculatePersonalityAdjustedScore(originalScore: number, metadata: any): number {
    const personalityWeight = metadata.personality_weight || 0.5;
    const priorityBoost = metadata.priority === 'high' ? 0.1 : metadata.priority === 'medium' ? 0.05 : 0;

    return originalScore + (personalityWeight * 0.1) + priorityBoost;
  }

  // Method to cleanup old sessions (call periodically to prevent memory leaks)
  cleanupOldSessions(maxAgeHours: number = 24): void {
    let cleanedCount = 0;

    // Note: This is a simple cleanup. In production, you'd want to track session timestamps
    // For now, we'll just limit the total number of sessions
    if (this.sessionMemories.size > 100) {
      const sessionsToRemove = Array.from(this.sessionMemories.keys()).slice(0, 50);
      sessionsToRemove.forEach(sessionId => {
        this.sessionMemories.delete(sessionId);
        cleanedCount++;
      });
      console.log(`Cleaned up ${cleanedCount} old sessions`);
    }
  }

  // PDF Processing Methods

  /**
   * Extract text from a PDF file
   */
  private async extractTextFromPDF(pdfPath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(pdfPath);
      const pdfData = await pdf(dataBuffer);
      return pdfData.text;
    } catch (error) {
      console.error(`Error extracting text from PDF ${pdfPath}:`, error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  /**
   * Split text into chunks for better embedding
   */
  private splitTextIntoChunks(text: string, options: PDFProcessingOptions = {}): string[] {
    const {
      chunkSize = 1000,
      chunkOverlap = 200,
      preservePageBreaks = false
    } = options;

    // Clean the text
    let cleanText = text
      .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n\n')  // Normalize line breaks
      .trim();

    if (preservePageBreaks) {
      // Split by page breaks and then chunk each page
      const pages = cleanText.split(/\f|\n{3,}/);
      const chunks: string[] = [];
      
      pages.forEach((page, pageIndex) => {
        const pageChunks = this.chunkText(page.trim(), chunkSize, chunkOverlap);
        chunks.push(...pageChunks.map(chunk => `[Page ${pageIndex + 1}] ${chunk}`));
      });
      
      return chunks;
    } else {
      return this.chunkText(cleanText, chunkSize, chunkOverlap);
    }
  }

  /**
   * Simple text chunking with overlap
   */
  private chunkText(text: string, chunkSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      let end = start + chunkSize;
      
      // Try to break at sentence or paragraph boundaries
      if (end < text.length) {
        const sentenceEnd = text.lastIndexOf('.', end);
        const paragraphEnd = text.lastIndexOf('\n\n', end);
        const breakPoint = Math.max(sentenceEnd, paragraphEnd);
        
        if (breakPoint > start + chunkSize * 0.5) {
          end = breakPoint + 1;
        }
      }

      chunks.push(text.slice(start, end).trim());
      start = end - overlap;
    }

    return chunks.filter(chunk => chunk.length > 50); // Filter out very small chunks
  }

  /**
   * Process a single PDF file and return document metadata array
   */
  async processPDFFile(
    pdfPath: string,
    options: PDFProcessingOptions = {}
  ): Promise<DocumentMetadata[]> {
    try {
      console.log(`📄 Processing PDF: ${pdfPath}`);
      
      // Validate file exists
      if (!fs.existsSync(pdfPath)) {
        throw new Error(`PDF file not found: ${pdfPath}`);
      }

      // Get file stats
      const stats = fs.statSync(pdfPath);
      const fileName = path.basename(pdfPath);
      const uploadDate = new Date().toISOString();

      // Extract text from PDF
      const pdfText = await this.extractTextFromPDF(pdfPath);
      
      if (!pdfText || pdfText.trim().length === 0) {
        throw new Error(`No text found in PDF: ${fileName}`);
      }

      console.log(`✅ Extracted ${pdfText.length} characters from ${fileName}`);

      // Split into chunks
      const chunks = this.splitTextIntoChunks(pdfText, options);
      console.log(`📝 Created ${chunks.length} chunks from ${fileName}`);

      // Create document metadata for each chunk
      const documents: DocumentMetadata[] = chunks.map((chunk, index) => ({
        text: chunk,
        category: 'documents',
        title: `${fileName} - Chunk ${index + 1}`,
        source: 'pdf',
        fileName,
        chunkIndex: index,
        documentType: 'pdf' as const,
        uploadDate,
        fileSize: stats.size,
        pageNumber: this.extractPageNumber(chunk)
      }));

      return documents;
    } catch (error) {
      console.error(`❌ Error processing PDF ${pdfPath}:`, error);
      throw error;
    }
  }

  /**
   * Extract page number from chunk text if available
   */
  private extractPageNumber(chunk: string): number | undefined {
    const pageMatch = chunk.match(/^\[Page (\d+)\]/);
    return pageMatch ? parseInt(pageMatch[1]) : undefined;
  }

  /**
   * Process multiple PDF files and add them to the vector database
   */
  async addPDFDocuments(
    pdfPaths: string[],
    options: PDFProcessingOptions = {}
  ): Promise<void> {
    try {
      console.log(`🌱 Processing ${pdfPaths.length} PDF files...`);
      
      const allDocuments: DocumentMetadata[] = [];

      for (const pdfPath of pdfPaths) {
        const documents = await this.processPDFFile(pdfPath, options);
        allDocuments.push(...documents);
        
        // Add small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(`📄 Total documents created: ${allDocuments.length}`);
      
      // Add all documents to vector database
      await this.addMultipleDocuments(allDocuments);
      
      console.log(`✅ Successfully added ${allDocuments.length} PDF-derived documents to vector database`);
    } catch (error) {
      console.error('❌ Error adding PDF documents:', error);
      throw error;
    }
  }

  /**
   * Process PDFs from a directory
   */
  async addPDFsFromDirectory(
    directoryPath: string,
    options: PDFProcessingOptions = {}
  ): Promise<void> {
    try {
      if (!fs.existsSync(directoryPath)) {
        throw new Error(`Directory not found: ${directoryPath}`);
      }

      const files = fs.readdirSync(directoryPath);
      const pdfFiles = files
        .filter(file => file.toLowerCase().endsWith('.pdf'))
        .map(file => path.join(directoryPath, file));

      if (pdfFiles.length === 0) {
        console.log(`⚠️ No PDF files found in ${directoryPath}`);
        return;
      }

      console.log(`📁 Found ${pdfFiles.length} PDF files in ${directoryPath}`);
      await this.addPDFDocuments(pdfFiles, options);
    } catch (error) {
      console.error('❌ Error processing PDF directory:', error);
      throw error;
    }
  }
}