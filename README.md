# Portfolio Chatbot API

A RAG (Retrieval-Augmented Generation) powered chatbot API for portfolio websites using Google Gemini LLM, Pinecone vector database, and the LangChain framework.

## Features

### 🧠 Enhanced RAG System
- 🤖 **Personality-Aware Responses**: Maintains consistent communication style and personality
- 🎯 **Context-Type Categorization**: Foundational, technical, personal, and behavioral content types
- ⭐ **Priority-Based Ranking**: High/medium/low priority content weighting
- 🏷️ **Semantic Tagging**: Auto-generated searchable keywords and concepts
- 🔍 **Multi-Vector Search**: Combines semantic similarity with personality relevance

### 📚 Advanced Content Management
- 📄 **Multi-Source Integration**: Portfolio content, PDF documents, and contextual information
- 🔧 **Enhanced Metadata**: Comprehensive document metadata with personality weights
- 📊 **Content Analytics**: Distribution analysis and quality monitoring
- 🔄 **Intelligent Updates**: Smart content versioning and duplicate handling

### 🚀 Performance & Scalability
- ⚡ **Optimized Retrieval**: Fast, accurate search with personality-aware ranking
- 📈 **Performance Monitoring**: Built-in analytics and optimization tools
- 🧹 **Memory Management**: Efficient session handling and cleanup
- 📊 **Database Management**: Comprehensive tools for maintenance and optimization

### 🔒 **Comprehensive Security Suite**
- 🛡️ Input validation and sanitization
- 🚦 Rate limiting and DoS protection
- 🌐 Enhanced CORS security
- 📊 Security monitoring and logging
- 🚫 Automatic IP blocking for malicious behavior

### 🛠️ Development Tools
- 📊 Built-in testing and validation capabilities
- 📄 Advanced PDF document processing and indexing
- 🔧 Flexible content chunking strategies
- 📋 Comprehensive setup and management scripts

## Prerequisites

Before running this application, make sure you have:

- Node.js (v16 or higher)
- npm or yarn
- Google AI API key (Gemini)
- Pinecone account and API key

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Google AI API Key for Gemini LLM
GOOGLE_AI_API_KEY=your_gemini_api_key_here

# Pinecone Vector Database Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=your_pinecone_index_name_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Security Configuration (Optional)
MAX_MESSAGE_LENGTH=1000
MAX_REQUESTS_PER_MINUTE=10
MAX_REQUESTS_PER_HOUR=100
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### 3. Set Up Pinecone Vector Database

1. Create a [Pinecone account](https://www.pinecone.io/)
2. Create a new index with:
   - **Dimensions**: 768 (for Gemini embeddings)
   - **Metric**: cosine
   - **Name**: Choose a name and update `PINECONE_INDEX` in `.env`

### 4. Get Google AI API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Create a new API key
3. Add it to your `.env` file

### 5. Set Up Your Enhanced Vector Database

#### Option A: Complete Integrated Setup (Recommended)
Create a comprehensive, personality-aware database with all content sources:

```bash
npm run seed:integrated
```

This will:
- ✅ Process your enhanced portfolio content with personality awareness
- ✅ Integrate PDF documents (resume, about, etc.)
- ✅ Add contextual information for better responses
- ✅ Apply semantic tagging and priority weighting
- ✅ Validate the integration with test queries

#### Option B: Enhanced Content Only
Seed with enhanced portfolio content:

```bash
npm run seed:enhanced
```

#### Option C: Traditional Seeding
Use the original seeding method:

```bash
npm run seed
```

### 6. Validate Your Setup
Ensure everything is working correctly:

```bash
npm run validate
```

This comprehensive validation will test:
- Environment configuration
- Database connectivity
- Content availability
- Personality awareness
- Multi-source integration
- Response quality
- Performance

### 7. Add PDF Documents (Optional)

Add PDF documents to enhance your chatbot's knowledge base:

```bash
# Add PDFs to the pdfs/ directory, then seed them
npm run seed:pdf

# Or seed specific PDF files
npm run seed:pdf resume.pdf portfolio.pdf

# Use different chunking strategies
npm run seed:pdf -- --small-chunks  # Better for Q&A
npm run seed:pdf -- --large-chunks  # Better for context
```

### 8. Database Management

Monitor and maintain your database:

```bash
# Generate comprehensive management report
npm run db:manage

# Quick database statistics
npm run db:stats

# Test retrieval quality
npm run db:test

# Optimize database performance
npm run db:optimize
```

📄 **See [PDF-SETUP-GUIDE.md](./PDF-SETUP-GUIDE.md) for detailed PDF integration instructions.**

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## Security Testing

Test the security features of your API:

```bash
# Run comprehensive security tests
npm run test:security
```

## API Endpoints

### Health Check
```
GET /health
```

### Chat Endpoint
```
POST /api/chat
Content-Type: application/json

{
  "message": "Tell me about your experience"
}
```

### Add Document
```
POST /api/add-document
Content-Type: application/json

{
  "text": "Document content here",
  "category": "experience",
  "title": "Document Title",
  "source": "portfolio"
}
```

### Search Documents
```
POST /api/search
Content-Type: application/json

{
  "query": "search query",
  "topK": 5
}
```

## Project Structure

```
portfolio-chatbot-api/
├── src/
│   ├── index.ts         # Express server and routes
│   ├── rag.ts           # RAG service implementation
│   └── types.ts         # TypeScript type definitions
├── scripts/
│   └── seedVectorStore.ts # Database seeding script
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Deployment

### Render Deployment

1. Create a new Web Service on [Render](https://render.com/)
2. Connect your GitHub repository
3. Configure the service:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add environment variables in Render dashboard
5. Deploy!

### Environment Variables for Production

```env
GOOGLE_AI_API_KEY=your_production_gemini_key
PINECONE_API_KEY=your_production_pinecone_key
PINECONE_INDEX=your_production_index_name
PORT=10000
NODE_ENV=production
FRONTEND_URL=https://your-portfolio-domain.github.io
```

## Usage with Frontend

Update your frontend chatbot to use this API:

```typescript
const response = await fetch('https://your-api-url.onrender.com/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ message: userInput }),
});

const data = await response.json();
console.log(data.response); // AI-generated response
```

## Customizing Content

To add your own portfolio content:

1. Edit `scripts/seedVectorStore.ts`
2. Replace the `samplePortfolioData` array with your content
3. Run `npm run seed` to populate the database

### Content Structure

```typescript
{
  text: "Your content here...",
  category: "experience|skills|education|projects|personal|about",
  title: "Content Title",
  source: "portfolio"
}
```

## Monitoring and Maintenance

- Monitor API usage and costs in Google AI Studio and Pinecone dashboards
- Regularly update content in the vector database
- Review and optimize prompts for better responses
- Monitor error logs and performance metrics

## Security

This API includes comprehensive security measures:

- **Input Validation**: Prevents prompt injection, XSS, and malicious inputs
- **Rate Limiting**: Protects against DoS attacks and API abuse
- **CORS Protection**: Restricts access to authorized domains only
- **Security Monitoring**: Logs and tracks suspicious activities
- **IP Blocking**: Automatically blocks malicious IP addresses

For detailed security information, see [SECURITY.md](./SECURITY.md).

## Troubleshooting

### Common Issues

1. **API Key Errors**: Verify all environment variables are set correctly
2. **Pinecone Connection**: Check index name and API key
3. **Rate Limiting**: Adjust limits in environment variables if needed
4. **CORS Issues**: Update `ALLOWED_ORIGINS` in environment variables
5. **Security Blocks**: Check `logs/security-combined.log` for blocked requests

### Debug Mode

Enable detailed logging by setting:

```env
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
