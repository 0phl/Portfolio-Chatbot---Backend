import dotenv from 'dotenv';
import { LangChainRAGService } from '../src/rag-langchain';
import { EnhancedDocumentMetadata, PDFProcessingOptions } from '../src/types';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

// Import portfolio content
const myPortfolioContent = require('../my-portfolio-content.js');

/**
 * Comprehensive multi-source content integration system
 * Combines portfolio content, PDF documents, and additional sources
 * into a unified, personality-aware knowledge base
 */
class IntegratedContentSeeder {
  private ragService: LangChainRAGService;
  private processedSources: Set<string> = new Set();

  constructor() {
    this.ragService = new LangChainRAGService();
  }

  /**
   * Main integration method - processes all content sources
   */
  async integrateAllSources(): Promise<void> {
    console.log('🚀 Starting comprehensive multi-source content integration...');
    console.log('📊 This will create a unified, personality-aware knowledge base');

    try {
      // Step 1: Process core portfolio content
      await this.processPortfolioContent();

      // Step 2: Process PDF documents
      await this.processPDFDocuments();

      // Step 3: Process any additional sources
      await this.processAdditionalSources();

      // Step 4: Validate integration
      await this.validateIntegration();

      console.log('\n🎉 Multi-source content integration completed successfully!');
      this.printIntegrationSummary();

    } catch (error) {
      console.error('❌ Error in multi-source integration:', error);
      throw error;
    }
  }

  /**
   * Process core portfolio content with enhanced metadata
   */
  private async processPortfolioContent(): Promise<void> {
    console.log('\n📄 Processing core portfolio content...');

    const enhancedContent: EnhancedDocumentMetadata[] = myPortfolioContent.map((item: any, index: number) => ({
      text: item.text,
      category: item.category,
      title: item.title,
      source: 'portfolio',
      priority: item.priority || this.inferPriority(item),
      context_type: item.context_type || this.inferContextType(item),
      parent_doc: 'portfolio-main',
      chunk_id: `portfolio-${index}`,
      semantic_tags: this.generateSemanticTags(item.text, item.category),
      personality_weight: this.calculatePersonalityWeight(item),
      documentType: 'custom' as const
    }));

    await this.ragService.addEnhancedDocuments(enhancedContent);
    this.processedSources.add('portfolio-content');
    
    console.log(`✅ Processed ${enhancedContent.length} portfolio content items`);
  }

  /**
   * Process PDF documents with enhanced metadata
   */
  private async processPDFDocuments(): Promise<void> {
    console.log('\n📑 Processing PDF documents...');

    const pdfDirectory = path.join(process.cwd(), 'pdfs');
    
    if (!fs.existsSync(pdfDirectory)) {
      console.log('⚠️  No PDF directory found, skipping PDF processing');
      return;
    }

    const pdfFiles = fs.readdirSync(pdfDirectory)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => path.join(pdfDirectory, file));

    if (pdfFiles.length === 0) {
      console.log('⚠️  No PDF files found, skipping PDF processing');
      return;
    }

    // Enhanced PDF processing options
    const pdfOptions: PDFProcessingOptions = {
      chunkSize: 800,
      chunkOverlap: 150,
      preservePageBreaks: true,
      includeMetadata: true
    };

    for (const pdfPath of pdfFiles) {
      const fileName = path.basename(pdfPath, '.pdf');
      console.log(`  📄 Processing: ${fileName}`);

      try {
        // Process PDF with enhanced metadata
        await this.processPDFWithEnhancedMetadata(pdfPath, fileName, pdfOptions);
        this.processedSources.add(`pdf-${fileName}`);
        console.log(`  ✅ Successfully processed: ${fileName}`);
      } catch (error) {
        console.error(`  ❌ Error processing ${fileName}:`, error);
      }
    }
  }

  /**
   * Process a single PDF with enhanced metadata
   */
  private async processPDFWithEnhancedMetadata(
    pdfPath: string, 
    fileName: string, 
    options: PDFProcessingOptions
  ): Promise<void> {
    // Use existing PDF processing but enhance the metadata
    await this.ragService.addPDFDocuments([pdfPath], {
      ...options,
      includeMetadata: true
    });

    // Note: The existing PDF processing in ragService handles the chunking
    // We could enhance this further by post-processing the chunks
  }

  /**
   * Process additional content sources (future expansion)
   */
  private async processAdditionalSources(): Promise<void> {
    console.log('\n🔗 Processing additional sources...');

    // Future sources could include:
    // - Social media profiles
    // - GitHub repositories
    // - Blog posts
    // - Project documentation
    // - Testimonials

    // For now, we'll add some contextual information
    const additionalContent: EnhancedDocumentMetadata[] = [
      {
        text: `Ronan Dela Cruz is a 22-year-old Information Technology student from the Philippines, currently in his final year at St. Dominic College of Asia. He communicates in a friendly, student-like manner and is passionate about modern web development technologies. He prefers to explain things simply and relate technical concepts to practical examples from his projects.`,
        category: 'context',
        title: 'Contextual Background Information',
        source: 'system',
        priority: 'high',
        context_type: 'foundational',
        parent_doc: 'system-context',
        semantic_tags: ['context', 'background', 'student', 'philippines'],
        personality_weight: 1.0,
        documentType: 'custom' as const
      },
      {
        text: `When responding to questions, Ronan's AI assistant should maintain his personality: helpful, clear, and student-friendly. Always try to connect answers to his actual projects and experiences. Use simple language and provide practical examples. If discussing technical topics, relate them to his work on PULSE, AroundU, or S&Z Hot Pot Haven projects.`,
        category: 'communication',
        title: 'Response Guidelines and Personality',
        source: 'system',
        priority: 'high',
        context_type: 'behavioral',
        parent_doc: 'system-context',
        semantic_tags: ['personality', 'communication', 'guidelines'],
        personality_weight: 1.0,
        documentType: 'custom' as const
      }
    ];

    await this.ragService.addEnhancedDocuments(additionalContent);
    this.processedSources.add('additional-context');
    
    console.log(`✅ Processed ${additionalContent.length} additional context items`);
  }

  /**
   * Validate the integration by testing retrieval
   */
  private async validateIntegration(): Promise<void> {
    console.log('\n🔍 Validating content integration...');

    const testQueries = [
      'What is your personality like?',
      'Tell me about your technical skills',
      'What projects have you worked on?',
      'What is your educational background?',
      'How do you approach problem solving?'
    ];

    let successCount = 0;

    for (const query of testQueries) {
      try {
        const results = await this.ragService.searchWithPersonality(query, 3);
        if (results.length > 0) {
          successCount++;
          console.log(`  ✅ "${query}" - ${results.length} relevant results found`);
        } else {
          console.log(`  ⚠️  "${query}" - No results found`);
        }
      } catch (error) {
        console.log(`  ❌ "${query}" - Error: ${error}`);
      }
    }

    const successRate = (successCount / testQueries.length) * 100;
    console.log(`\n📊 Integration validation: ${successRate.toFixed(1)}% success rate`);

    if (successRate < 80) {
      console.warn('⚠️  Integration validation below 80% - consider reviewing content structure');
    } else {
      console.log('✅ Integration validation passed - content is well integrated');
    }
  }

  /**
   * Print integration summary
   */
  private printIntegrationSummary(): void {
    console.log('\n📋 Integration Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    this.processedSources.forEach(source => {
      console.log(`✓ ${source}`);
    });

    console.log('\n🎯 Key Features Enabled:');
    console.log('✓ Personality-aware content ranking');
    console.log('✓ Multi-source content integration');
    console.log('✓ Enhanced metadata with semantic tags');
    console.log('✓ Context-type categorization');
    console.log('✓ Priority-based retrieval');
    console.log('✓ Comprehensive searchability');

    console.log('\n🚀 Next Steps:');
    console.log('1. Test your enhanced chatbot: npm run dev');
    console.log('2. Try various query types to test integration');
    console.log('3. Monitor response quality and adjust as needed');
    console.log('4. Consider adding more content sources over time');
  }

  /**
   * Infer priority based on content characteristics
   */
  private inferPriority(item: any): 'high' | 'medium' | 'low' {
    if (item.category === 'identity' || item.category === 'communication') return 'high';
    if (item.category === 'skills' || item.category === 'experience') return 'high';
    if (item.category === 'projects') return 'medium';
    return 'medium';
  }

  /**
   * Infer context type based on content characteristics
   */
  private inferContextType(item: any): string {
    const contextMap: { [key: string]: string } = {
      'identity': 'foundational',
      'communication': 'behavioral',
      'skills': 'technical',
      'experience': 'professional',
      'projects': 'project_detailed',
      'education': 'background',
      'personal': 'personal',
      'goals': 'professional',
      'contact': 'contact'
    };
    
    return contextMap[item.category] || 'general';
  }

  /**
   * Generate semantic tags based on content
   */
  private generateSemanticTags(text: string, category: string): string[] {
    const tags = [category];
    const lowerText = text.toLowerCase();

    // Technology tags
    const techTerms = ['react', 'typescript', 'javascript', 'firebase', 'flutter', 'php', 'mysql', 'node.js'];
    techTerms.forEach(term => {
      if (lowerText.includes(term)) tags.push(term);
    });

    // Personality tags
    const personalityTerms = ['student', 'learning', 'passionate', 'collaborative', 'helpful'];
    personalityTerms.forEach(term => {
      if (lowerText.includes(term)) tags.push(term);
    });

    return [...new Set(tags)];
  }

  /**
   * Calculate personality weight for content
   */
  private calculatePersonalityWeight(item: any): number {
    if (item.category === 'identity' || item.category === 'communication') return 1.0;
    if (item.category === 'personal') return 0.9;
    if (item.category === 'experience' || item.category === 'goals') return 0.7;
    return 0.5;
  }
}

/**
 * Main execution function
 */
async function runIntegratedSeeding() {
  try {
    // Validate environment
    if (!process.env.GOOGLE_AI_API_KEY || !process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX) {
      throw new Error('Required environment variables are missing');
    }

    const seeder = new IntegratedContentSeeder();
    await seeder.integrateAllSources();

  } catch (error) {
    console.error('❌ Integrated seeding failed:', error);
    process.exit(1);
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🚀 Integrated Multi-Source Content Seeding

Usage: npm run seed:integrated [options]

This script creates a comprehensive, unified knowledge base by integrating:
✓ Core portfolio content with enhanced metadata
✓ PDF documents (resume, about, etc.)
✓ Additional contextual information
✓ Personality-aware content processing

Options:
  --help, -h          Show this help message

Features:
✓ Multi-source content integration
✓ Personality-aware ranking
✓ Enhanced metadata processing
✓ Semantic tag generation
✓ Content validation
✓ Integration testing

Example:
  npm run seed:integrated
    `);
    process.exit(0);
  }

  runIntegratedSeeding();
}

export { IntegratedContentSeeder, runIntegratedSeeding };
