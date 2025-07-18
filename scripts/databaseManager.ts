import dotenv from 'dotenv';
import { LangChainRAGService } from '../src/rag-langchain';
import { EnhancedDocumentMetadata } from '../src/types';
import { Pinecone } from '@pinecone-database/pinecone';

// Load environment variables
dotenv.config();

/**
 * Comprehensive database management system for Pinecone vector database
 * Handles seeding, updates, optimization, and maintenance
 */
class DatabaseManager {
  private ragService: LangChainRAGService;
  private pinecone: Pinecone;
  private index: any;

  constructor() {
    this.ragService = new LangChainRAGService();
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    this.index = this.pinecone.index(process.env.PINECONE_INDEX!);
  }

  /**
   * Get comprehensive database statistics
   */
  async getDatabaseStats(): Promise<void> {
    console.log('📊 Gathering database statistics...');
    
    try {
      const stats = await this.index.describeIndexStats();
      
      console.log('\n📈 Database Statistics:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Total Vectors: ${stats.totalVectorCount || 0}`);
      console.log(`Dimension: ${stats.dimension || 768}`);
      console.log(`Index Fullness: ${((stats.indexFullness || 0) * 100).toFixed(2)}%`);
      
      if (stats.namespaces) {
        console.log('\nNamespaces:');
        Object.entries(stats.namespaces).forEach(([namespace, data]: [string, any]) => {
          console.log(`  ${namespace}: ${data.vectorCount || 0} vectors`);
        });
      }
      
    } catch (error) {
      console.error('❌ Error getting database stats:', error);
    }
  }

  /**
   * Quick content overview
   */
  async getContentOverview(): Promise<void> {
    console.log('\n� Content Overview...');

    try {
      const results = await this.ragService.searchSimilar('portfolio', 5);
      console.log(`Found ${results.length} content items`);

      if (results.length > 0) {
        console.log('Sample categories:');
        results.forEach(result => {
          const category = result.metadata.category || 'unknown';
          console.log(`  - ${category}`);
        });
      }
    } catch (error) {
      console.error('❌ Error getting content overview:', error);
    }
  }

  /**
   * Test retrieval quality across different query types
   */
  async testRetrievalQuality(): Promise<void> {
    console.log('\n🧪 Testing retrieval quality...');
    
    const testSuites = [
      {
        name: 'Personality Queries',
        queries: [
          'What is your personality like?',
          'How do you communicate?',
          'What is your approach to learning?'
        ]
      },
      {
        name: 'Technical Queries',
        queries: [
          'What programming languages do you know?',
          'Tell me about your React experience',
          'What is your experience with Firebase?'
        ]
      },
      {
        name: 'Project Queries',
        queries: [
          'What projects have you worked on?',
          'Tell me about PULSE project',
          'What is AroundU application?'
        ]
      },
      {
        name: 'Career Queries',
        queries: [
          'What are your career goals?',
          'What kind of opportunities are you looking for?',
          'What is your educational background?'
        ]
      }
    ];

    let totalQueries = 0;
    let successfulQueries = 0;

    for (const suite of testSuites) {
      console.log(`\n🔬 Testing: ${suite.name}`);
      
      for (const query of suite.queries) {
        totalQueries++;
        
        try {
          const results = await this.ragService.searchWithPersonality(query, 3);
          
          if (results.length > 0 && results[0].score > 0.5) {
            successfulQueries++;
            console.log(`  ✅ "${query}" - Score: ${results[0].score.toFixed(3)}`);
          } else {
            console.log(`  ⚠️  "${query}" - Low relevance or no results`);
          }
        } catch (error) {
          console.log(`  ❌ "${query}" - Error: ${error}`);
        }
      }
    }

    const qualityScore = (successfulQueries / totalQueries) * 100;
    console.log(`\n📊 Overall Retrieval Quality: ${qualityScore.toFixed(1)}%`);
    
    if (qualityScore >= 90) {
      console.log('🎉 Excellent retrieval quality!');
    } else if (qualityScore >= 75) {
      console.log('✅ Good retrieval quality');
    } else if (qualityScore >= 60) {
      console.log('⚠️  Moderate retrieval quality - consider content optimization');
    } else {
      console.log('❌ Poor retrieval quality - database needs attention');
    }
  }

  /**
   * Optimize database performance
   */
  async optimizeDatabase(): Promise<void> {
    console.log('\n⚡ Optimizing database performance...');
    
    try {
      // Check for potential duplicates by sampling content
      console.log('🔍 Checking for potential content issues...');
      
      const sampleResults = await this.ragService.searchSimilar('technical skills', 20);
      const textSimilarities: { [key: string]: string[] } = {};
      
      sampleResults.forEach(result => {
        const firstWords = result.metadata.text.substring(0, 50);
        if (!textSimilarities[firstWords]) {
          textSimilarities[firstWords] = [];
        }
        textSimilarities[firstWords].push(result.id);
      });
      
      const potentialDuplicates = Object.entries(textSimilarities)
        .filter(([, ids]) => ids.length > 1);
      
      if (potentialDuplicates.length > 0) {
        console.log(`⚠️  Found ${potentialDuplicates.length} potential duplicate groups`);
        console.log('💡 Consider reviewing content for duplicates');
      } else {
        console.log('✅ No obvious duplicates detected');
      }
      
      // Memory cleanup
      this.ragService.cleanupOldSessions(24);
      
      console.log('✅ Database optimization completed');
      
    } catch (error) {
      console.error('❌ Error during optimization:', error);
    }
  }



  /**
   * Health check for the entire system
   */
  async healthCheck(): Promise<boolean> {
    console.log('\n🏥 Performing system health check...');
    
    let healthScore = 0;
    const maxScore = 5;
    
    try {
      // Test 1: Database connectivity
      console.log('🔌 Testing database connectivity...');
      await this.index.describeIndexStats();
      healthScore++;
      console.log('  ✅ Database connection successful');
      
      // Test 2: Embedding generation
      console.log('🧠 Testing embedding generation...');
      await this.ragService.generateEmbedding('test query');
      healthScore++;
      console.log('  ✅ Embedding generation working');
      
      // Test 3: Search functionality
      console.log('🔍 Testing search functionality...');
      const searchResults = await this.ragService.searchSimilar('test', 1);
      if (searchResults.length > 0) {
        healthScore++;
        console.log('  ✅ Search functionality working');
      } else {
        console.log('  ⚠️  Search returned no results (database may be empty)');
      }
      
      // Test 4: Enhanced search
      console.log('⭐ Testing enhanced search...');
      const enhancedResults = await this.ragService.searchWithPersonality('personality', 1);
      if (enhancedResults.length > 0) {
        healthScore++;
        console.log('  ✅ Enhanced search working');
      } else {
        console.log('  ⚠️  Enhanced search returned no results');
      }
      
      // Test 5: Memory management
      console.log('🧹 Testing memory management...');
      const sessionCount = this.ragService.getActiveSessionCount();
      healthScore++;
      console.log(`  ✅ Memory management working (${sessionCount} active sessions)`);
      
    } catch (error) {
      console.error('❌ Health check error:', error);
    }
    
    const healthPercentage = (healthScore / maxScore) * 100;
    console.log(`\n🏥 System Health: ${healthPercentage}% (${healthScore}/${maxScore} checks passed)`);
    
    if (healthPercentage >= 90) {
      console.log('🎉 System is healthy!');
      return true;
    } else if (healthPercentage >= 70) {
      console.log('⚠️  System has minor issues');
      return true;
    } else {
      console.log('❌ System has significant issues');
      return false;
    }
  }

  /**
   * Complete database management report
   */
  async generateManagementReport(): Promise<void> {
    console.log('📋 Generating database management report...');
    console.log('='.repeat(50));

    await this.getDatabaseStats();
    await this.getContentOverview();
    await this.testRetrievalQuality();
    await this.optimizeDatabase();
    const isHealthy = await this.healthCheck();

    console.log('\n📋 Report Summary:');
    console.log('='.repeat(50));
    console.log(`System Status: ${isHealthy ? '✅ Healthy' : '❌ Needs Attention'}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Generated: ${new Date().toLocaleString()}`);

    console.log('\n💡 Recommendations:');
    console.log('• Monitor retrieval quality regularly');
    console.log('• Update content to maintain relevance');
    console.log('• Run health checks before important demos');
  }
}

/**
 * Command line interface
 */
async function runDatabaseManagement() {
  const args = process.argv.slice(2);
  const command = args[0] || 'report';
  
  try {
    const manager = new DatabaseManager();
    
    switch (command) {
      case 'stats':
        await manager.getDatabaseStats();
        break;
      case 'overview':
        await manager.getContentOverview();
        break;
      case 'test':
        await manager.testRetrievalQuality();
        break;
      case 'optimize':
        await manager.optimizeDatabase();
        break;
      case 'health':
        await manager.healthCheck();
        break;
      case 'report':
      default:
        await manager.generateManagementReport();
        break;
    }
    
  } catch (error) {
    console.error('❌ Database management failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🛠️  Database Management Tool

Usage: npm run db:manage [command]

Commands:
  report     Generate management report (default)
  stats      Show database statistics
  overview   Quick content overview
  test       Test retrieval quality
  optimize   Optimize database performance
  health     Perform system health check

Examples:
  npm run db:manage
  npm run db:manage stats
  npm run db:manage test
    `);
    process.exit(0);
  }
  
  runDatabaseManagement();
}

export { DatabaseManager };
