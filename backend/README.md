# PayLens Backend

AI-powered Payment AIOps platform backend service for investigating payment failures, detecting systemic incidents, and performing evidence-based root cause analysis.

## Tech Stack

- **Framework**: FastAPI
- **Agent Orchestration**: LangGraph
- **Tool Layer**: LangChain
- **Models**: Ollama (Llama 3 / Qwen / Mistral)
- **Structured State**: Pydantic
- **Database**: PostgreSQL
- **Vector DB**: ChromaDB
- **Language**: Python 3.11+

## Installation

### Prerequisites

- Python 3.11 or higher
- PostgreSQL 13 or higher
- Ollama (for local LLM)
- ChromaDB

### Setup

1. **Clone the repository**
   ```bash
   cd paylens/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   # or if using poetry
   poetry install
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize database**
   ```bash
   # Run migrations
   alembic upgrade head
   
   # Or initialize with test data
   python -m scripts.seed_database
   ```

6. **Index runbooks in ChromaDB**
   ```bash
   python -m scripts.index_runbooks
   ```

7. **Start Ollama**
   ```bash
   # Pull the model
   ollama pull llama3
   
   # Start Ollama server
   ollama serve
   ```

8. **Run the application**
   ```bash
   # Development mode
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   
   # Production mode
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

## Project Structure

```
backend/
├── app/
│   ├── agents/           # LangGraph agents
│   ├── api/              # FastAPI endpoints
│   ├── core/             # Configuration and utilities
│   ├── db/               # Database connection and repositories
│   ├── models/           # Pydantic and SQLAlchemy models
│   ├── services/         # Business logic services
│   └── utils/            # Utility functions
├── tests/                # Test files
├── scripts/              # Utility scripts
├── alembic/              # Database migrations
├── pyproject.toml        # Python dependencies
└── README.md
```

## API Endpoints

### Payment Investigation
- `POST /api/v1/investigate/payment` - Investigate a single payment
- `GET /api/v1/investigate/payment/{payment_id}` - Get investigation results

### Incident Investigation
- `POST /api/v1/investigate/incident` - Investigate an incident
- `GET /api/v1/investigate/incident/{incident_id}` - Get incident details

### Support Assistant
- `POST /api/v1/support/query` - Process customer support query

### Data Management
- `GET /api/v1/transactions` - List transactions
- `GET /api/v1/logs` - List logs
- `GET /api/v1/metrics` - List metrics
- `GET /api/v1/incidents` - List incidents
- `POST /api/v1/runbooks/index` - Re-index runbooks

### AIOps
- `GET /api/v1/aiops/health` - System health check
- `GET /api/v1/aiops/metrics` - Get AIOps metrics
- `POST /api/v1/aiops/detect-anomalies` - Detect anomalies in metrics

## Development

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_agents.py
```

### Code Quality

```bash
# Format code
black app/

# Check linting
flake8 app/

# Type checking
mypy app/
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Generating Synthetic Data

```bash
# Generate synthetic data
python -m scripts.generate_synthetic_data

# Seed database with synthetic data
python -m scripts.seed_database
```

## Configuration

Key environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `OLLAMA_BASE_URL`: Ollama server URL
- `OLLAMA_MODEL`: Model to use (llama3, qwen, mistral)
- `CHROMADB_PERSIST_DIRECTORY`: ChromaDB storage location
- `HIGH_CONFIDENCE_THRESHOLD`: Threshold for automatic actions (default: 90)
- `MEDIUM_CONFIDENCE_THRESHOLD`: Threshold for support review (default: 70)

## Architecture

The backend uses a multi-agent architecture with LangGraph:

1. **Triage Agent**: Validates requests and identifies investigation type
2. **Evidence Agent**: Collects transaction data, logs, metrics, incidents
3. **Root Cause Agent**: Analyzes evidence to determine root cause
4. **Resolution Agent**: Recommends actions based on root cause
5. **Explanation Agent**: Generates internal and customer explanations

## Troubleshooting

### Common Issues

1. **ChromaDB connection error**: Ensure ChromaDB is running and accessible
2. **Ollama connection error**: Ensure Ollama server is running with `ollama serve`
3. **Database connection error**: Check DATABASE_URL and ensure PostgreSQL is running
4. **Import errors**: Ensure all dependencies are installed with `poetry install`

## License

MIT License - See LICENSE file for details