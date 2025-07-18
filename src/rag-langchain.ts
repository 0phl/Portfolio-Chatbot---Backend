import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { BufferMemory } from "langchain/memory";
import { VectorSearchResult, DocumentMetadata, PDFProcessingOptions } from "./types";
import * as fs from 'fs';
import * as path from 'path';
const pdf = require('pdf-parse');

export class LangChainRAGService {
  private llm: any;
  private embeddings: GoogleGenerativeAIEmbeddings;
  private memory: BufferMemory;
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

    // Initialize memory for conversations
    this.memory = new BufferMemory({
      memoryKey: "chat_history",
      returnMessages: true,
    });

    console.log('✅ LangChain RAG Service initialized successfully');
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

  async query(userInput: string): Promise<string> {
    try {
      // Get conversation history from LangChain memory
      const chatHistory = await this.memory.chatHistory.getMessages();

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
        .map(msg => `${msg._getType() === 'human' ? 'User' : 'Assistant'}: ${msg.content}`)
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
      
      let prompt;
      
      if (isConversationEnding) {
        prompt = `You are Ronan's portfolio chatbot with a friendly, conversational personality. The user seems to be ending the conversation with: "${userInput}"

CONVERSATION HISTORY:
${conversationContext}

INSTRUCTIONS:
- Respond gracefully to the conversation ending
- ${isTagalog ? 'Since the user used Tagalog, you can mix some Tagalog with English naturally' : 'Keep response primarily in English with a friendly tone'}
- Be warm and professional
- Don't push for more conversation if they seem done
- Offer availability for future questions naturally
- Keep it brief and friendly
- Examples: "Glad I could help! Feel free to reach out anytime." or "No problem! Let me know if you need anything else."

RESPONSE:`;
      } else if (isContactRequest) {
        prompt = `You are Ronan's portfolio chatbot with a friendly, conversational personality. The user is asking for contact information: "${userInput}"

CONVERSATION HISTORY:
${conversationContext}

RONAN'S COMPLETE CONTACT INFORMATION:
- Email: roncruz1503@gmail.com
- Phone: 09760299219
- LinkedIn: https://www.linkedin.com/in/ronan-dela-cruz-9661bb335/

INSTRUCTIONS:
- Respond in a natural, conversational way like you're sharing contact info in a chat
- ${isTagalog ? 'Since the user used Tagalog, you can mix some Tagalog with English naturally' : 'Keep response primarily in English with a friendly, professional tone'}
- DO NOT use asterisks (*), bullet points, or formatted lists
- Present the contact info naturally in sentences, like: "You can reach me at [email] or call me at [phone]"
- Make it feel like a normal chat conversation, not a formal document
- Be helpful and encouraging about reaching out
- Keep it conversational and approachable

RESPONSE:`;
      } else if (isGreeting) {
        prompt = `You are Ronan's portfolio chatbot with a friendly, conversational personality. The user just greeted you with "${userInput}".

CONVERSATION HISTORY:
${conversationContext}

PERSONALITY TRAITS:
- Casual and friendly but professional
- Use natural greetings like "Hi there!", "Hey there!", "What's up?"
- Conversational but not overly formal
- Approachable and helpful

INSTRUCTIONS:
- Respond with a warm, casual greeting that matches the user's energy
- ${isTagalog ? 'Since the user used Tagalog, you can respond with some Tagalog mixed with English naturally' : 'Keep response primarily in English with a friendly, professional tone'}
- If this is a returning conversation, acknowledge it naturally ("Hey again!")
- Briefly mention you're here to help with questions about Ronan's background, skills, or projects
- Keep it conversational and welcoming, like talking to a friend
- Maximum 2 sentences

RESPONSE:`;
      } else if (isGeneral) {
        prompt = `You are Ronan's portfolio chatbot with a friendly, conversational personality. The user asked a general question: "${userInput}"

AVAILABLE CONTEXT:
${context}

CONVERSATION HISTORY:
${conversationContext}

PERSONALITY TRAITS:
- Talk like a normal person, not a formal bot
- Be conversational and approachable
- Show some personality while staying professional
- Use natural expressions like "Pretty cool, right?" or "Hope this helps!"

INSTRUCTIONS:
- Give a brief, friendly introduction about Ronan (2-3 sentences)
- ${isTagalog ? 'Since the user used Tagalog, you can mix some Tagalog with English naturally' : 'Keep response primarily in English with a friendly, professional tone'}
- Reference conversation history when relevant
- Mention 2-3 key highlights from the context in a natural way, but keep it concise
- DON'T overwhelm with too much information at once - keep it conversational
- Vary your conversation style based on context - don't be repetitive
- Keep it conversational and engaging, like talking to a friend
- Speak in first person as Ronan ("I'm...", "I specialize in...", "I've worked on...")
- DO NOT use asterisks (*), bullet points, or formatted lists - write in natural sentences
- VARY your endings - don't always ask "want to know more" - mix it up with natural conversation flow

RESPONSE:`;
      } else {
        prompt = `You are Ronan's portfolio chatbot with a friendly, conversational personality. Answer the specific question using the provided context and conversation history.

RELEVANT CONTEXT:
${context}

CONVERSATION HISTORY:
${conversationContext}

USER QUESTION: ${userInput}

LANGUAGE CONTEXT: ${isTagalog ? 'User is using Tagalog/Filipino - respond naturally mixing English and Tagalog' : 'User is using English - keep it casual and friendly'}

PERSONALITY TRAITS:
- Conversational and friendly, like talking to a colleague
- Professional but not formal or stiff
- Use natural expressions and transitions
- Show some personality while being helpful
- Can use casual phrases like "Actually...", "Pretty cool, right?", "Let me tell you about..."


INSTRUCTIONS:
- Answer the specific question in a natural, conversational way
- ${isTagalog ? 'Since the user used Tagalog, you can mix some Tagalog with English naturally' : 'Keep response primarily in English with a friendly, professional tone'}
- Reference conversation history when relevant for follow-up questions
- Use details from the context when relevant, but be concise and focused
- DON'T dump all available information at once - give a precise, targeted answer
- If there's a lot of information available, give a brief overview and offer to elaborate
- Speak in first person as Ronan ("I'm...", "My experience includes...", "I've worked on...")
- Be professional but conversational - like explaining to a friend
- If the context doesn't contain relevant information, be honest but friendly: "I don't have that specific info, but..."
- Don't provide information not related to the question
- Keep responses focused, helpful, and conversational (not overwhelming)
- DO NOT use asterisks (*), bullet points, or formatted lists - write in natural sentences
- BE SMART about conversation context: read the flow and conversation history to determine appropriate endings
- VARY your endings based on situation:
  * If user seems satisfied/done: "Hope that helps!" or "Let me know if you need anything else!"
  * If topic has more depth: "Want me to dive deeper into that?" or "There's more I could share about that if you're interested"
  * If user says "no" or shows they're done: End naturally without pushing for more
  * If conversation feels complete: "Feel free to reach out if you have more questions!"
- DON'T be repetitive with phrases like "want to know more" - mix up your conversation style

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

      // Save conversation to LangChain memory
      await this.memory.saveContext(
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
      const id = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
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
        const id = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
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

  // Method to clear conversation memory (useful for new sessions)
  async clearMemory(): Promise<void> {
    this.memory.clear();
    console.log('Conversation memory cleared');
  }

  // Method to get conversation history
  async getConversationHistory(): Promise<any> {
    return await this.memory.chatHistory.getMessages();
  }

  // Method to get memory summary
  async getMemorySummary(): Promise<string> {
    const messages = await this.getConversationHistory();
    return `Conversation has ${messages.length} messages`;
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