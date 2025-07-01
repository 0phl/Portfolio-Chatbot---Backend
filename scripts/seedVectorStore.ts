import dotenv from 'dotenv';
import { LangChainRAGService } from '../src/rag-langchain';
import { DocumentMetadata } from '../src/types';

// Load environment variables
dotenv.config();

const samplePortfolioData: DocumentMetadata[] = [
  {
    text: "I am a passionate software developer with expertise in full-stack web development. I specialize in React, TypeScript, Node.js, and modern web technologies. I enjoy creating user-friendly applications and solving complex technical challenges.",
    category: "about",
    title: "Professional Summary",
    source: "portfolio"
  },
  {
    text: "My technical skills include JavaScript, TypeScript, React, Next.js, Node.js, Express.js, Python, HTML5, CSS3, Tailwind CSS, MongoDB, PostgreSQL, Git, Docker, and AWS. I am constantly learning new technologies to stay current with industry trends.",
    category: "skills",
    title: "Technical Skills",
    source: "portfolio"
  },
  {
    text: "I have experience working on various projects including e-commerce platforms, content management systems, and data visualization dashboards. I focus on creating scalable, maintainable code and delivering exceptional user experiences.",
    category: "experience",
    title: "Project Experience",
    source: "portfolio"
  },
  {
    text: "I hold a degree in Computer Science and have completed various online courses and certifications in web development, cloud computing, and software engineering best practices.",
    category: "education",
    title: "Education Background",
    source: "portfolio"
  },
  {
    text: "In my free time, I enjoy contributing to open-source projects, writing technical blog posts, and exploring new programming languages and frameworks. I also like photography, hiking, and playing chess.",
    category: "personal",
    title: "Hobbies and Interests",
    source: "portfolio"
  },
  {
    text: "I am currently looking for opportunities to work with innovative teams on challenging projects. I am particularly interested in roles that involve modern web technologies, AI integration, and creating impactful user experiences.",
    category: "goals",
    title: "Career Goals",
    source: "portfolio"
  }
];

async function seedVectorStore() {
  try {
    console.log('🌱 Starting vector store seeding...');
    
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

    console.log(`📄 Adding ${samplePortfolioData.length} documents to vector database...`);
    
    await ragService.addMultipleDocuments(samplePortfolioData);
    
    console.log('✅ Vector store seeded successfully!');
    
    // Test the seeded data
    console.log('\n🔍 Testing retrieval with sample queries...');
    
    const testQueries = [
      "What are your technical skills?",
      "Tell me about your experience",
      "What are your hobbies?"
    ];

    for (const query of testQueries) {
      console.log(`\nQuery: "${query}"`);
      const results = await ragService.searchSimilar(query, 2);
      results.forEach((result, index) => {
        console.log(`  ${index + 1}. Score: ${result.score.toFixed(3)} - ${result.metadata.title}`);
        console.log(`     Category: ${result.metadata.category}`);
        console.log(`     Text: ${result.metadata.text.substring(0, 100)}...`);
      });
    }
    
    console.log('\n🎉 Seeding and testing completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding vector store:', error);
    process.exit(1);
  }
}

// Custom data seeding function
async function seedCustomData(customData: DocumentMetadata[]) {
  try {
    console.log('🌱 Starting custom data seeding...');
    
    const ragService = new LangChainRAGService();
    console.log('✅ RAG Service initialized');

    console.log(`📄 Adding ${customData.length} custom documents...`);
    
    await ragService.addMultipleDocuments(customData);
    
    console.log('✅ Custom data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding custom data:', error);
    process.exit(1);
  }
}

// Run the seeding
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npm run seed [options]

Options:
  --help, -h     Show this help message
  --sample       Seed with sample portfolio data (default)
  --custom       Seed with custom data (modify the script first)

Examples:
  npm run seed
  npm run seed --sample
  npm run seed --custom
    `);
    process.exit(0);
  }

  if (args.includes('--custom')) {
    // Modify this array with your custom data
    const customData: DocumentMetadata[] = [
      // Add your custom portfolio data here
      // Example:
      // {
      //   text: "Your custom content here...",
      //   category: "custom",
      //   title: "Custom Title",
      //   source: "custom"
      // }
    ];
    
    if (customData.length === 0) {
      console.log('⚠️  No custom data provided. Please modify the customData array in the script.');
      process.exit(1);
    }
    
    seedCustomData(customData);
  } else {
    seedVectorStore();
  }
}

export { seedVectorStore, seedCustomData };