from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.db.connection import init_db
from app.api import payment, incident, support, aiops, data
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager"""
    # Startup
    logger.info("Starting PayLens API...")
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.warning(f"Database initialization failed (running without database): {e}")
        logger.info("PayLens API started successfully (without database)")
    
    yield
    
    # Shutdown
    logger.info("Shutting down PayLens API...")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered Payment AIOps platform for investigating payment failures",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(payment.router, prefix="/api/v1", tags=["Payment Investigation"])
app.include_router(incident.router, prefix="/api/v1", tags=["Incident Investigation"])
app.include_router(support.router, prefix="/api/v1", tags=["Support Assistant"])
app.include_router(aiops.router, prefix="/api/v1", tags=["AIOps"])
app.include_router(data.router, prefix="/api/v1", tags=["Data Management"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "PayLens API",
        "version": settings.APP_VERSION,
        "status": "operational"
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )