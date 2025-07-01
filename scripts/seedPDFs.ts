import dotenv from 'dotenv';
import { LangChainRAGService } from '../src/rag-langchain';
import { PDFProcessingOptions } from '../src/types';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

// Configuration for PDF processing
const PDF_CONFIG: PDFProcessingOptions = {
  chunkSize: 1000,           // Optimal size for embeddings
  chunkOverlap: 200,         // Overlap to maintain context
  preservePageBreaks: true,  // Keep page structure
  includeMetadata: true      // Include file metadata
};

async function seedPDFDocuments() {
  try {
    console.log('🔍 Starting PDF document seeding...');
    
    // Validate environment variables
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY is required');
    }
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY is required');
    }
    if (!process.env.PINECONE_INDEX) {
      throw new Error('PINECONE_INDEX is required');
    }

    const ragService = new LangChainRAGService();
    console.log('✅ RAG Service initialized');

    // Get PDF files from command line arguments or use default directory
    const args = process.argv.slice(2);
    const pdfPaths: string[] = [];

    if (args.length > 0 && !args[0].startsWith('--')) {
      // Individual PDF files specified
      for (const arg of args) {
        if (arg.startsWith('--')) break;
        
        const fullPath = path.resolve(arg);
        if (fs.existsSync(fullPath) && fullPath.toLowerCase().endsWith('.pdf')) {
          pdfPaths.push(fullPath);
          console.log(`📄 Found PDF: ${path.basename(fullPath)}`);
        } else {
          console.warn(`⚠️ Skipping invalid PDF path: ${arg}`);
        }
      }
    } else {
      // Look for PDFs in common directories
      const searchDirectories = [
        './pdfs',
        './documents',
        './content',
        './'
      ];

      for (const dir of searchDirectories) {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          const pdfs = files
            .filter(file => file.toLowerCase().endsWith('.pdf'))
            .map(file => path.join(dir, file));
          
          if (pdfs.length > 0) {
            pdfPaths.push(...pdfs);
            console.log(`📁 Found ${pdfs.length} PDFs in ${dir}/`);
          }
        }
      }
    }

    if (pdfPaths.length === 0) {
      console.log(`
⚠️ No PDF files found!

Usage options:
1. Create a 'pdfs' folder and place your PDF files there
2. Specify PDF file paths directly:
   npm run seed:pdf path/to/file1.pdf path/to/file2.pdf
3. Use command options:
   npm run seed:pdf -- --help

Searched directories: ./pdfs, ./documents, ./content, ./
      `);
      return;
    }

    console.log(`\n🌱 Processing ${pdfPaths.length} PDF files with configuration:`);
    console.log(`   Chunk size: ${PDF_CONFIG.chunkSize} characters`);
    console.log(`   Chunk overlap: ${PDF_CONFIG.chunkOverlap} characters`);
    console.log(`   Preserve page breaks: ${PDF_CONFIG.preservePageBreaks}`);

    // Process PDFs
    await ragService.addPDFDocuments(pdfPaths, PDF_CONFIG);
    
    console.log('✅ PDF documents seeded successfully!');
    
    // Test the seeded data
    console.log('\n🔍 Testing retrieval with sample queries...');
    
    const testQueries = [
      "What information is in the documents?",
      "Tell me about the content",
      "What topics are covered?"
    ];

    for (const query of testQueries) {
      console.log(`\nQuery: "${query}"`);
      try {
        const results = await ragService.searchSimilar(query, 2);
        if (results.length > 0) {
          results.forEach((result, index) => {
            console.log(`  ${index + 1}. Score: ${result.score.toFixed(3)} - ${result.metadata.title}`);
            console.log(`     Source: ${result.metadata.fileName || 'Unknown'}`);
            console.log(`     Text: ${result.metadata.text.substring(0, 100)}...`);
          });
        } else {
          console.log('  No results found');
        }
      } catch (error) {
        console.log(`  Error searching: ${error.message}`);
      }
    }
    
    console.log('\n🎉 PDF seeding and testing completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding PDF documents:', error);
    process.exit(1);
  }
}

// Custom PDF processing function with specific options
async function seedCustomPDFs(pdfPaths: string[], customConfig?: Partial<PDFProcessingOptions>) {
  try {
    console.log('🌱 Starting custom PDF seeding...');
    
    const ragService = new LangChainRAGService();
    console.log('✅ RAG Service initialized');

    const config = { ...PDF_CONFIG, ...customConfig };
    console.log(`📄 Processing ${pdfPaths.length} PDFs with custom configuration...`);
    
    await ragService.addPDFDocuments(pdfPaths, config);
    
    console.log('✅ Custom PDF seeding completed!');
  } catch (error) {
    console.error('❌ Error in custom PDF seeding:', error);
    process.exit(1);
  }
}

// Handle command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📄 PDF Seeding Script for Portfolio Chatbot

Usage: npm run seed:pdf [options] [pdf-files...]

Options:
  --help, -h          Show this help message
  --small-chunks      Use smaller chunks (500 chars, 100 overlap)
  --large-chunks      Use larger chunks (1500 chars, 300 overlap)
  --no-page-breaks    Don't preserve page structure
  --directory <dir>   Process all PDFs in specified directory

Examples:
  npm run seed:pdf
  npm run seed:pdf document1.pdf document2.pdf
  npm run seed:pdf -- --small-chunks
  npm run seed:pdf -- --directory ./my-pdfs
  npm run seed:pdf resume.pdf --large-chunks

Default behavior:
- Searches for PDFs in ./pdfs, ./documents, ./content, ./
- Uses 1000 character chunks with 200 character overlap
- Preserves page structure for better context
    `);
    process.exit(0);
  }

  // Parse configuration options
  let customConfig: Partial<PDFProcessingOptions> = {};
  
  if (args.includes('--small-chunks')) {
    customConfig = { chunkSize: 500, chunkOverlap: 100 };
    console.log('📝 Using small chunks configuration');
  }
  
  if (args.includes('--large-chunks')) {
    customConfig = { chunkSize: 1500, chunkOverlap: 300 };
    console.log('📝 Using large chunks configuration');
  }
  
  if (args.includes('--no-page-breaks')) {
    customConfig.preservePageBreaks = false;
    console.log('📄 Page breaks will not be preserved');
  }

  // Handle directory processing
  const dirIndex = args.indexOf('--directory');
  if (dirIndex !== -1 && args[dirIndex + 1]) {
    const directory = args[dirIndex + 1];
    const ragService = new LangChainRAGService();
    ragService.addPDFsFromDirectory(directory, { ...PDF_CONFIG, ...customConfig })
      .then(() => console.log('✅ Directory processing completed'))
      .catch(error => {
        console.error('❌ Directory processing failed:', error);
        process.exit(1);
      });
  } else if (Object.keys(customConfig).length > 0) {
    // Custom configuration with file arguments
    const pdfFiles = args.filter(arg => !arg.startsWith('--') && arg.endsWith('.pdf'));
    if (pdfFiles.length > 0) {
      seedCustomPDFs(pdfFiles, customConfig);
    } else {
      seedPDFDocuments();
    }
  } else {
    // Default processing
    seedPDFDocuments();
  }
}

export { seedPDFDocuments, seedCustomPDFs };