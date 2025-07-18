import dotenv from 'dotenv';
import { LangChainRAGService } from '../src/rag-langchain';

// Load environment variables
dotenv.config();

/**
 * Comprehensive setup validation script
 * Tests all aspects of the enhanced Pinecone database setup
 */
class SetupValidator {
  private ragService: LangChainRAGService;
  private validationResults: { [key: string]: boolean } = {};

  constructor() {
    this.ragService = new LangChainRAGService();
  }

  /**
   * Run complete validation suite
   */
  async validateCompleteSetup(): Promise<boolean> {
    console.log('🔍 Starting comprehensive setup validation...');
    console.log('═'.repeat(60));

    let allTestsPassed = true;

    // Test 1: Environment Configuration
    allTestsPassed = this.validateEnvironment() && allTestsPassed;

    // Test 2: Database Connectivity
    allTestsPassed = await this.validateDatabaseConnectivity() && allTestsPassed;

    // Test 3: Content Availability
    allTestsPassed = await this.validateContentAvailability() && allTestsPassed;

    // Test 4: Personality Awareness
    allTestsPassed = await this.validatePersonalityAwareness() && allTestsPassed;

    // Test 5: Multi-Source Integration
    allTestsPassed = await this.validateMultiSourceIntegration() && allTestsPassed;

    // Test 6: Response Quality
    allTestsPassed = await this.validateResponseQuality() && allTestsPassed;

    // Test 7: Performance
    allTestsPassed = await this.validatePerformance() && allTestsPassed;

    this.printValidationSummary(allTestsPassed);
    return allTestsPassed;
  }

  /**
   * Validate environment configuration
   */
  validateEnvironment(): boolean {
    console.log('\n🔧 Validating Environment Configuration...');
    
    const requiredVars = [
      'GOOGLE_AI_API_KEY',
      'PINECONE_API_KEY',
      'PINECONE_INDEX'
    ];

    let envValid = true;

    requiredVars.forEach(varName => {
      if (process.env[varName]) {
        console.log(`  ✅ ${varName}: Configured`);
      } else {
        console.log(`  ❌ ${varName}: Missing`);
        envValid = false;
      }
    });

    this.validationResults['environment'] = envValid;
    return envValid;
  }

  /**
   * Validate database connectivity
   */
  async validateDatabaseConnectivity(): Promise<boolean> {
    console.log('\n🔌 Validating Database Connectivity...');
    
    try {
      // Test embedding generation
      await this.ragService.generateEmbedding('test query');
      console.log('  ✅ Embedding generation: Working');

      // Test basic search
      const results = await this.ragService.searchSimilar('test', 1);
      console.log('  ✅ Database search: Working');

      this.validationResults['connectivity'] = true;
      return true;
    } catch (error) {
      console.log('  ❌ Database connectivity: Failed');
      console.log(`     Error: ${error}`);
      this.validationResults['connectivity'] = false;
      return false;
    }
  }

  /**
   * Validate content availability and structure
   */
  async validateContentAvailability(): Promise<boolean> {
    console.log('\n📄 Validating Content Availability...');
    
    const testQueries = [
      { query: 'identity personality', expectedCategory: 'identity' },
      { query: 'technical skills programming', expectedCategory: 'skills' },
      { query: 'projects experience work', expectedCategory: 'projects' },
      { query: 'education learning background', expectedCategory: 'education' }
    ];

    let contentValid = true;
    let foundCategories = new Set();

    for (const test of testQueries) {
      try {
        const results = await this.ragService.searchSimilar(test.query, 3);
        
        if (results.length > 0) {
          const categories = results.map(r => r.metadata.category).filter(Boolean);
          categories.forEach(cat => foundCategories.add(cat));
          
          console.log(`  ✅ "${test.query}": ${results.length} results found`);
        } else {
          console.log(`  ⚠️  "${test.query}": No results found`);
          contentValid = false;
        }
      } catch (error) {
        console.log(`  ❌ "${test.query}": Error - ${error}`);
        contentValid = false;
      }
    }

    console.log(`  📊 Found content categories: ${Array.from(foundCategories).join(', ')}`);
    
    this.validationResults['content'] = contentValid;
    return contentValid;
  }

  /**
   * Validate personality-aware features
   */
  async validatePersonalityAwareness(): Promise<boolean> {
    console.log('\n🧠 Validating Personality Awareness...');
    
    try {
      const personalityQueries = [
        'What is your personality like?',
        'How do you communicate?',
        'What is your approach to learning?'
      ];

      let personalityValid = true;

      for (const query of personalityQueries) {
        const results = await this.ragService.searchWithPersonality(query, 3);
        
        if (results.length > 0) {
          const hasPersonalityContent = results.some(r => 
            (r.metadata as any).personality_weight > 0.7 ||
            r.metadata.category === 'identity' ||
            r.metadata.category === 'communication'
          );
          
          if (hasPersonalityContent) {
            console.log(`  ✅ "${query}": Personality-relevant results found`);
          } else {
            console.log(`  ⚠️  "${query}": Results found but low personality relevance`);
            personalityValid = false;
          }
        } else {
          console.log(`  ❌ "${query}": No results found`);
          personalityValid = false;
        }
      }

      this.validationResults['personality'] = personalityValid;
      return personalityValid;
    } catch (error) {
      console.log('  ❌ Personality awareness validation failed:', error);
      this.validationResults['personality'] = false;
      return false;
    }
  }

  /**
   * Validate multi-source integration
   */
  async validateMultiSourceIntegration(): Promise<boolean> {
    console.log('\n🔗 Validating Multi-Source Integration...');
    
    try {
      const sourceQueries = [
        { query: 'portfolio projects', expectedSource: 'portfolio' },
        { query: 'resume experience', expectedSource: 'pdf' },
        { query: 'background context', expectedSource: 'system' }
      ];

      let integrationValid = true;
      let foundSources = new Set();

      for (const test of sourceQueries) {
        const results = await this.ragService.searchSimilar(test.query, 5);
        
        if (results.length > 0) {
          const sources = results.map(r => r.metadata.source).filter(Boolean);
          sources.forEach(source => foundSources.add(source));
          console.log(`  ✅ "${test.query}": Found sources - ${sources.join(', ')}`);
        } else {
          console.log(`  ⚠️  "${test.query}": No results found`);
          integrationValid = false;
        }
      }

      console.log(`  📊 Integrated sources: ${Array.from(foundSources).join(', ')}`);
      
      this.validationResults['integration'] = integrationValid;
      return integrationValid;
    } catch (error) {
      console.log('  ❌ Multi-source integration validation failed:', error);
      this.validationResults['integration'] = false;
      return false;
    }
  }

  /**
   * Validate response quality
   */
  async validateResponseQuality(): Promise<boolean> {
    console.log('\n⭐ Validating Response Quality...');
    
    try {
      const qualityTests = [
        'Tell me about your React experience',
        'What projects have you worked on?',
        'What are your career goals?',
        'How do you approach problem solving?'
      ];

      let qualityScore = 0;
      const totalTests = qualityTests.length;

      for (const query of qualityTests) {
        const response = await this.ragService.query(query, 'validation-session');
        
        if (response && response.length > 50) {
          // Check if response contains relevant keywords
          const lowerResponse = response.toLowerCase();
          const hasRelevantContent = 
            lowerResponse.includes('ronan') ||
            lowerResponse.includes('student') ||
            lowerResponse.includes('developer') ||
            lowerResponse.includes('project') ||
            lowerResponse.includes('experience');
          
          if (hasRelevantContent) {
            qualityScore++;
            console.log(`  ✅ "${query}": Quality response generated`);
          } else {
            console.log(`  ⚠️  "${query}": Response lacks relevant content`);
          }
        } else {
          console.log(`  ❌ "${query}": Poor or no response`);
        }
      }

      const qualityPercentage = (qualityScore / totalTests) * 100;
      console.log(`  📊 Response quality: ${qualityPercentage}%`);

      const qualityValid = qualityPercentage >= 75;
      this.validationResults['quality'] = qualityValid;
      return qualityValid;
    } catch (error) {
      console.log('  ❌ Response quality validation failed:', error);
      this.validationResults['quality'] = false;
      return false;
    }
  }

  /**
   * Validate performance
   */
  async validatePerformance(): Promise<boolean> {
    console.log('\n⚡ Validating Performance...');
    
    try {
      const testQuery = 'What are your technical skills?';
      const iterations = 3;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await this.ragService.query(testQuery, `perf-test-${i}`);
        const endTime = Date.now();
        times.push(endTime - startTime);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      console.log(`  📊 Average response time: ${avgTime.toFixed(0)}ms`);

      const performanceValid = avgTime < 5000; // 5 seconds threshold
      
      if (performanceValid) {
        console.log('  ✅ Performance: Acceptable');
      } else {
        console.log('  ⚠️  Performance: Slow (consider optimization)');
      }

      this.validationResults['performance'] = performanceValid;
      return performanceValid;
    } catch (error) {
      console.log('  ❌ Performance validation failed:', error);
      this.validationResults['performance'] = false;
      return false;
    }
  }

  /**
   * Print validation summary
   */
  printValidationSummary(allPassed: boolean): void {
    console.log('\n📋 Validation Summary');
    console.log('═'.repeat(60));

    Object.entries(this.validationResults).forEach(([test, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      const testName = test.charAt(0).toUpperCase() + test.slice(1);
      console.log(`${status} ${testName}`);
    });

    const passedCount = Object.values(this.validationResults).filter(Boolean).length;
    const totalCount = Object.keys(this.validationResults).length;
    const successRate = (passedCount / totalCount) * 100;

    console.log(`\n📊 Overall Success Rate: ${successRate.toFixed(1)}% (${passedCount}/${totalCount})`);

    if (allPassed) {
      console.log('\n🎉 All validations passed! Your enhanced Pinecone database is ready!');
      console.log('\n🚀 Next steps:');
      console.log('1. Start your chatbot: npm run dev');
      console.log('2. Test with various queries');
      console.log('3. Monitor performance with: npm run db:manage');
    } else {
      console.log('\n⚠️  Some validations failed. Please review the issues above.');
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check your environment variables');
      console.log('2. Ensure your Pinecone index is properly configured');
      console.log('3. Run the seeding process: npm run seed:integrated');
      console.log('4. Check the setup guide: docs/setup-guide.md');
    }
  }
}

/**
 * Run validation
 */
async function runValidation() {
  try {
    const validator = new SetupValidator();
    const success = await validator.validateCompleteSetup();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🔍 Setup Validation Tool

Usage: npm run validate

This script performs comprehensive validation of your enhanced Pinecone database setup:

✓ Environment configuration
✓ Database connectivity  
✓ Content availability
✓ Personality awareness
✓ Multi-source integration
✓ Response quality
✓ Performance testing

Run this after setting up your database to ensure everything is working correctly.
    `);
    process.exit(0);
  }
  
  runValidation();
}

export { SetupValidator };
