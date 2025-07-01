import dotenv from 'dotenv';
import { LangChainRAGService } from '../src/rag-langchain';

// Load environment variables
dotenv.config();

// Import your custom content
const myPortfolioContent = require('../my-portfolio-content.js');

async function clearAndUpdateVectorStore() {
  try {
    console.log('🧹 Clearing and updating vector store with your personal content...');
    
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

    // Note: Pinecone doesn't have a simple "clear all" function
    // We'll add new content with unique IDs that will override sample data over time
    console.log(`📄 Adding ${myPortfolioContent.length} pieces of your personal content...`);
    
    await ragService.addMultipleDocuments(myPortfolioContent);
    
    console.log('✅ Your personal content has been added to the vector database!');
    
    // Test the updated data
    console.log('\n🔍 Testing retrieval with your content...');
    
    const testQueries = [
      "What are your technical skills?",
      "Tell me about your work experience",
      "What projects have you worked on?",
      "What are your career goals?"
    ];

    for (const query of testQueries) {
      console.log(`\nQuery: "${query}"`);
      const results = await ragService.searchSimilar(query, 3);
      results.forEach((result, index) => {
        console.log(`  ${index + 1}. Score: ${result.score.toFixed(3)} - ${result.metadata.title}`);
        console.log(`     Category: ${result.metadata.category}`);
        console.log(`     Preview: ${result.metadata.text.substring(0, 100)}...`);
      });
    }
    
    console.log('\n🎉 Your personal portfolio content is now live in the RAG system!');
    console.log('\n💡 Next steps:');
    console.log('1. Edit my-portfolio-content.js with your actual information');
    console.log('2. Run this script again: npm run update-content');
    console.log('3. Test your chatbot: npm run dev, then .\simple-test.ps1');
    
  } catch (error) {
    console.error('❌ Error updating vector store:', error);
    process.exit(1);
  }
}

// Run the update
if (require.main === module) {
  clearAndUpdateVectorStore();
}

export { clearAndUpdateVectorStore };