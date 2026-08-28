# PayLens - AI Payment AIOps Platform

![PayLens](https://img.shields.io/badge/PayLens-AI%20Payment%20AIOps-blue)
![Version](https://img.shields.io/badge/version-0.1.0-green)
![License](https://img.shields.io/badge/license-MIT-orange)

PayLens is an AI-powered Payment AIOps platform that investigates payment failures, detects systemic incidents, performs evidence-based root cause analysis, recommends remediation actions, and generates support/customer-friendly explanations.

## 🚀 Features

- **Payment Investigation**: AI-powered root cause analysis for individual payment failures
- **Incident Investigation**: Systemic issue detection and correlation across payment infrastructure
- **Support Assistant**: Customer-friendly explanations and support automation
- **AIOps Dashboard**: Real-time monitoring, anomaly detection, and performance metrics
- **Multi-Agent Architecture**: LangGraph-powered agents for intelligent investigation workflows
- **RAG Integration**: ChromaDB-based runbook retrieval for evidence-based recommendations
- **Confidence Framework**: Automated decision-making with human-in-the-loop escalation

## 🏗️ Architecture

PayLens combines several advanced technologies:

- **Agentic AI**: LangGraph for multi-agent orchestration
- **Tool Calling**: LangChain for external service integration
- **RAG**: ChromaDB for runbook and SOP retrieval
- **Structured State**: Pydantic for type-safe state management
- **AIOps**: Traditional ML anomaly detection with human oversight
- **Human-in-the-Loop**: Escalation paths for low-confidence decisions

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   LangGraph Agents                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Triage   │ │Evidence  │ │Root Cause│ │Resolution│      │
│  │ Agent    │ │ Agent    │ │ Agent    │ │ Agent    │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │PostgreSQL│ │ChromaDB  │ │  Ollama  │ │  Metrics │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI
- **Agent Orchestration**: LangGraph
- **Tool Layer**: LangChain
- **Models**: Ollama (Llama 3 / Qwen / Mistral)
- **Structured State**: Pydantic
- **Database**: PostgreSQL
- **Vector DB**: ChromaDB

### DevOps
- **Containerization**: Docker & Docker Compose
- **Testing**: Playwright
- **Language**: Python 3.11+, Node.js 18+

## 📋 Prerequisites

- Docker & Docker Compose
- Python 3.11+ (for local development)
- Node.js 18+ (for local development)
- 8GB RAM minimum (16GB recommended)
- 20GB disk space

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd paylens
   ```

2. **Start all services**
   ```bash
   make setup
   ```

   This will:
   - Build all Docker containers
   - Start PostgreSQL, ChromaDB, Ollama, Backend, and Frontend
   - Seed the database with synthetic data
   - Index runbooks in ChromaDB

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start services**
   ```bash
   # Start PostgreSQL, ChromaDB, Ollama
   make up-dev
   
   # Generate synthetic data
   python -m scripts.generate_synthetic_data
   
   # Seed database
   python -m scripts.seed_database
   
   # Index runbooks
   python -m scripts.index_runbooks
   
   # Start backend
   uvicorn app.main:app --reload
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start frontend**
   ```bash
   npm run dev
   ```

## 📖 Usage

### Payment Investigation

1. Navigate to the "Payment Investigation" tab
2. Enter a payment ID (e.g., `PAY_12345`)
3. Click "Investigate"
4. View the root cause analysis, evidence, and recommendations

### Incident Investigation

1. Navigate to the "Incident Dashboard" tab
2. Enter an incident ID (e.g., `INC123`)
3. Click "Investigate"
4. View systemic analysis and related incidents

### Support Assistant

1. Navigate to the "Support Assistant" tab
2. Type your customer query
3. Send the message
4. Receive AI-powered customer-friendly explanations

### AIOps Dashboard

1. Navigate to the "AIOps Dashboard" tab
2. View real-time system health
3. Monitor key metrics and anomalies
4. Review recent activity

## 🧪 Testing

### Run All Tests
```bash
cd tests
npm test
```

### Run Tests in UI Mode
```bash
cd tests
npm run test:ui
```

### Run Specific Test Suite
```bash
cd tests
npx playwright test tests/api/payment.spec.ts
```

## 📚 API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation (Swagger UI).

### Key Endpoints

- `POST /api/v1/investigate/payment` - Investigate payment failure
- `POST /api/v1/investigate/incident` - Investigate incident
- `POST /api/v1/support/query` - Process support query
- `GET /api/v1/aiops/health` - System health check
- `GET /api/v1/aiops/metrics` - AIOps metrics

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example`):

- `DATABASE_URL`: PostgreSQL connection string
- `OLLAMA_BASE_URL`: Ollama server URL
- `OLLAMA_MODEL`: Model to use (llama3, qwen, mistral)
- `CHROMADB_PERSIST_DIRECTORY`: ChromaDB storage location
- `HIGH_CONFIDENCE_THRESHOLD`: Threshold for automatic actions (default: 90)
- `MEDIUM_CONFIDENCE_THRESHOLD`: Threshold for support review (default: 70)

### Confidence Framework

- **> 90%**: Automatic recommendation and action
- **70-90%**: Support review required
- **< 70%**: Human escalation required

## 📁 Project Structure

```
paylens/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── agents/      # LangGraph agents
│   │   ├── api/         # API endpoints
│   │   ├── core/        # Configuration
│   │   ├── db/          # Database layer
│   │   ├── models/      # Pydantic models
│   │   └── services/    # Business logic
│   ├── scripts/         # Utility scripts
│   └── tests/           # Backend tests
├── frontend/            # Next.js frontend
│   ├── src/
│   │   ├── app/         # Next.js app directory
│   │   ├── components/  # React components
│   │   └── services/    # API client
│   └── tests/           # Frontend tests
├── tests/               # Playwright tests
│   ├── tests/
│   │   ├── api/         # API tests
│   │   └── ui/          # UI tests
│   └── fixtures/        # Test data
├── data/                # Data files
│   ├── runbooks/        # Markdown runbooks
│   └── synthetic/       # Generated test data
├── docs/                # Documentation
├── docker-compose.yml   # Docker orchestration
└── Makefile            # Convenient commands
```

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- LangGraph & LangChain for the agent framework
- Ollama for local LLM capabilities
- ChromaDB for vector database functionality
- The open-source community

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for intelligent payment operations**