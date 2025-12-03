# 🤖 AI Customer Support Agent with LangGraph

An intelligent customer support automation system built with LangGraph that routes, classifies, and responds to customer emails using AI-powered decision making.

## 📋 Overview

This agent automatically processes customer support emails through an intelligent workflow that:
- Classifies email intent and urgency using LLM
- Routes to appropriate handlers (bug tracking, documentation search, human review)
- Generates contextual responses
- Requires human approval for high-urgency issues
- Maintains conversation state and history

## 🏗️ Current Architecture

```
START → readEmail → classifyIntent → [Dynamic Routing]
                                      ↓
                    ┌─────────────────┼─────────────────┐
                    ↓                 ↓                 ↓
            bugTracking    searchDocumentation    humanReview
                    ↓                 ↓                 ↓
                    └────→ draftResponse ←──────────────┘
                                      ↓
                              humanReview (if urgent)
                                      ↓
                                 sendReply → END
```

### Key Components:

- **State Management**: Zod-based state schema with type safety
- **LLM Integration**: Groq (llama-3.3-70b-versatile) for classification and response generation
- **Dynamic Routing**: Command objects for intelligent flow control
- **Persistence**: MemorySaver for conversation thread management
- **Human-in-the-Loop**: Interrupt mechanism for review workflows

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Groq API key

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Add your GROQ_API_KEY to .env

# Run the agent
pnpm dev
```

### Environment Variables

```env
GROQ_API_KEY=your_groq_api_key_here
```

## 📁 Project Structure

```
├── index.ts          # Main graph configuration and execution
├── nodes.ts          # Node implementations (readEmail, classifyIntent, etc.)
├── state.ts          # State schema definitions with Zod
├── package.json      # Dependencies and scripts
└── .env             # Environment configuration
```

## 🎯 Implementation Roadmap

### ⭐ Phase 1: Core Production Features 

#### 1.1 Email Integration
- [ ] Implement Gmail API integration
  - [ ] OAuth2 authentication flow
  - [ ] Read emails from inbox
  - [ ] Send replies via Gmail
  - [ ] Mark emails as processed
- [ ] Add IMAP/SMTP support as alternative
- [ ] Create email polling service (check every 60 seconds)
- [ ] Handle email threads and reply-to headers

#### 1.2 Real Knowledge Base (RAG)
- [ ] Set up vector database (ChromaDB or Pinecone)
- [ ] Create document ingestion pipeline
  - [ ] Support PDF, Markdown, HTML formats
  - [ ] Implement text chunking strategy
  - [ ] Generate embeddings (OpenAI or local)
- [ ] Replace mock `searchDocumentation` with vector search
- [ ] Add relevance scoring for retrieved documents
- [ ] Implement semantic search with top-k results

#### 1.3 Human Review Dashboard
- [ ] Create Next.js frontend application
- [ ] Build review queue UI
  - [ ] Display pending reviews
  - [ ] Show original email + draft response
  - [ ] Approve/Edit/Reject actions
- [ ] Implement WebSocket for real-time updates
- [ ] Create API endpoints for review actions
- [ ] Add ticket status tracking (pending, approved, sent)

#### 1.4 Data Persistence
- [ ] Set up PostgreSQL database
- [ ] Create schema for:
  - [ ] Emails/tickets
  - [ ] Classifications
  - [ ] Responses
  - [ ] Review history
  - [ ] User accounts
- [ ] Migrate from MemorySaver to Postgres checkpointer
- [ ] Add database migrations (Drizzle or Prisma)

### 🔥 Phase 2: Enhanced Features 

#### 2.1 CRM/Customer Data Integration
- [ ] Stripe integration
  - [ ] Fetch subscription status
  - [ ] Pull payment history
  - [ ] Check customer tier
- [ ] Custom customer database
  - [ ] Store support history
  - [ ] Track ticket count
  - [ ] Save preferences
- [ ] Enrich state with customer context in responses

#### 2.2 Analytics & Monitoring
- [ ] Build analytics dashboard
  - [ ] Response time metrics
  - [ ] Resolution rate by intent
  - [ ] Customer satisfaction tracking
  - [ ] LLM cost per ticket
- [ ] Add logging (Winston or Pino)
- [ ] Implement error tracking (Sentry)
- [ ] Create performance monitoring
- [ ] Set up alerts for SLA breaches

#### 2.3 Multi-Tenant Support
- [ ] Add organization/workspace model
- [ ] Implement user authentication (Clerk or Auth.js)
- [ ] Create role-based access control (Admin, Agent, Viewer)
- [ ] Isolate data per organization
- [ ] Add API keys for programmatic access

#### 2.4 Improved Classification
- [ ] Add sentiment analysis
- [ ] Implement language detection
- [ ] Create custom intent categories (user-configurable)
- [ ] Build confidence scoring
- [ ] Add fallback human routing for low confidence

### 🚀 Phase 3: Advanced Capabilities 

#### 3.1 Multi-Channel Support
- [ ] Slack integration
  - [ ] Bot for support channels
  - [ ] Thread management
  - [ ] Slash commands
- [ ] Discord webhook support
- [ ] WhatsApp Business API
- [ ] Live chat widget (React component)
- [ ] Twitter/X DM automation

#### 3.2 Action Execution
- [ ] Implement safe action framework
- [ ] Add actions:
  - [ ] Issue refunds (with approval)
  - [ ] Cancel/modify subscriptions
  - [ ] Reset user passwords
  - [ ] Generate discount codes
  - [ ] Update account information
- [ ] Create action approval workflows
- [ ] Add action audit logs

#### 3.3 Advanced Workflows
- [ ] Multi-step conversations
- [ ] Follow-up email scheduling
- [ ] Automatic escalation rules
- [ ] Business hours routing
- [ ] A/B testing for responses
- [ ] Custom prompt templates per intent

#### 3.4 Security & Compliance
- [ ] PII detection and masking
- [ ] GDPR data deletion endpoints
- [ ] SOC 2 compliance checklist
- [ ] Rate limiting (per user/org)
- [ ] Input sanitization
- [ ] Audit logging for all actions

### 🎨 Phase 4: Polish & Scale 

#### 4.1 Developer Experience
- [ ] Create comprehensive API documentation
- [ ] Build SDK for integrations
- [ ] Add webhook system for custom events
- [ ] Implement plugin architecture
- [ ] Create CLI tool for deployment

#### 4.2 Enterprise Features
- [ ] White-label customization
- [ ] SSO/SAML support
- [ ] Custom domain support
- [ ] Advanced analytics exports
- [ ] SLA customization per customer

#### 4.3 Performance Optimization
- [ ] Implement response caching
- [ ] Add batch processing for emails
- [ ] Optimize LLM prompt tokens
- [ ] Create embedding cache
- [ ] Add Redis for session management

#### 4.4 Testing & Quality
- [ ] Unit tests for all nodes
- [ ] Integration tests for workflows
- [ ] E2E tests for critical paths
- [ ] Load testing (100+ concurrent emails)
- [ ] Create test fixtures and mocks

## 🎯 Target Users

1. **SaaS Companies (10-100 employees)** - Handle 100-1000 tickets/month
2. **E-commerce Businesses** - 24/7 order status and returns support
3. **Developer Tools** - Technical documentation-based support
4. **Service Businesses** - Local business automation

## 💰 Potential Monetization

- **Free Tier**: 50 tickets/month, email only
- **Starter ($99/mo)**: 500 tickets, multi-channel, basic analytics
- **Pro ($299/mo)**: 2,000 tickets, CRM integrations, custom prompts
- **Enterprise (Custom)**: Unlimited, white-label, SSO, dedicated support

## 🛠️ Tech Stack

- **Framework**: LangGraph for workflow orchestration
- **LLM**: Groq (llama-3.3-70b-versatile)
- **Language**: TypeScript
- **Runtime**: Node.js
- **State**: Zod for type-safe schemas
- **Future**: Next.js frontend, PostgreSQL, ChromaDB/Pinecone

## 📚 Resources

- [LangGraph Documentation](https://langchain-ai.github.io/langgraphjs/)
- [Groq API](https://groq.com/)
- [Zod Documentation](https://zod.dev/)

## 🤝 Contributing

This is a learning project. Feel free to fork and experiment!

## 📝 License

MIT

---

**Current Status**: ✅ Core workflow implemented | 🚧 Production features in progress

Last Updated: December 2025
