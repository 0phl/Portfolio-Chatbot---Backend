# Portfolio Chatbot API

A RAG (Retrieval-Augmented Generation) powered chatbot API for portfolio websites using Google Gemini LLM and Pinecone vector database.

## Features

- 🤖 Intelligent chatbot responses using RAG architecture
- 🔍 Semantic search through portfolio content
- 📚 Vector database for efficient content retrieval
- 🚀 Fast and scalable Express.js API
- 🔒 Secure environment variable management
- 📊 Built-in testing and seeding capabilities
- 📄 PDF document processing and indexing
- 🔧 Flexible content chunking strategies

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

### 5. Seed the Vector Database

Populate the database with sample portfolio data:

```bash
npm run seed
```

Or seed with custom data:

```bash
npm run seed:custom
```

### 6. Add PDF Documents (Optional)

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

## Troubleshooting

### Common Issues

1. **API Key Errors**: Verify all environment variables are set correctly
2. **Pinecone Connection**: Check index name and API key
3. **Rate Limiting**: Implement delays between requests if needed
4. **CORS Issues**: Update `FRONTEND_URL` in environment variables

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

This project is licensed under the ISC License.