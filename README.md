# Lumina - AI-Powered Educational Assistant

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Python](https://img.shields.io/badge/Python-14354C?style=for-the-badge&logo=python&logoColor=white)
![LangChain](https://img.shields.io/badge/🦜️_LangChain-AI-blue?style=for-the-badge)

## Overview

Lumina is a cutting-edge educational AI assistant that leverages advanced language models and modern web technologies to provide an interactive learning experience. Built with a robust MERN stack (MongoDB, Express.js, React, Node.js) and enhanced with TypeScript for type safety, the application incorporates state-of-the-art AI capabilities through LangChain and OpenAI. Live at https://lumina-2.onrender.com .

## 🚀 Key Features

### 🤖 AI-Powered Chat Interface
- Real-time conversational AI using OpenAI's latest models
- Context-aware responses through LangChain's advanced prompt engineering
- Dynamic typing animation for a natural conversation feel
- Syntax highlighting for code snippets using `react-syntax-highlighter`

### 🎨 Modern UI/UX
- Stunning Matrix-style rain animation background
- Responsive Material-UI components with `@mui/material`
- Smooth animations powered by `framer-motion`
- Toast notifications using `react-hot-toast`
- Intuitive navigation with `react-router-dom`

### 🔒 Security & Authentication
- JWT-based authentication system
- Secure password hashing with bcrypt
- Protected routes and middleware
- HTTP-only cookies for enhanced security
- Input validation using `express-validator`

### 📚 Advanced RAG (Retrieval-Augmented Generation)
- Vector database integration with ChromaDB
- Efficient document retrieval system
- Multiple specialized knowledge bases:
  - Course logistics
  - Textbook content
  - Course notes
  - Course overview

## 🛠️ Technical Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: React Context API
- **Routing**: React Router v7
- **UI Components**: Material-UI v6
- **Animations**: Framer Motion
- **Development**: Vite for blazing-fast builds
- **Type Checking**: TypeScript with strict mode
- **Code Quality**: ESLint with React plugins

### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with cookie-parser
- **File Upload**: Multer
- **Logging**: Morgan
- **API Documentation**: Express-validator
- **CORS**: Enabled with customizable origins

### AI/ML Stack
- **LangChain**: Core framework for AI operations
- **Vector Store**: ChromaDB
- **Embeddings**: OpenAI
- **API Integration**: Azure OpenAI Client
- **Type Safety**: Type extensions for AI operations

### DevOps
- **Deployment**: Render and Vercel
- **Environment**: Dotenv for configuration
- **Version Control**: Git
- **CI/CD**: Automated builds and deployments
- **Monitoring**: Built-in error tracking

## 🌟 Advanced Implementation Details

### AI Architecture
- Implements RAG pattern for accurate, context-aware responses
- Multiple specialized ChromaDB instances for different knowledge domains
- Efficient document chunking and embedding strategies
- Advanced prompt engineering with LangChain

### Security Measures
- CORS protection with whitelisted origins
- Rate limiting on API endpoints
- Secure session management
- XSS protection
- Input sanitization

### Performance Optimizations
- Lazy loading of routes
- Optimized asset delivery
- Efficient database indexing
- Caching strategies
- Minimized bundle size

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd backend
   npm install
   pip install -r requirements.txt
   ```
3. Set up environment variables (see `.env.example`)
4. Start development servers:
   ```bash
   # Frontend
   npm run dev

   # Backend
   npm run dev
   ```

## 🔧 Environment Variables

Required environment variables include:
- `MONGODB_URL`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT signing
- `OPENAI_API_KEY`: OpenAI API key
- `AZURE_OPENAI_KEY`: Azure OpenAI key (if using Azure)
- `FRONTEND_URL`: Frontend application URL
- `PORT`: Backend server port

## 📈 Future Enhancements

- Real-time collaboration features
- Advanced analytics dashboard
- Integration with additional LLM providers
- Enhanced personalization capabilities
- Mobile application development

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the ISC License.
