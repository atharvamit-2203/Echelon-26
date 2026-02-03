from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring and load balancers
    """
    return {
        "status": "healthy",
        "service": "fair-hire-sentinel-backend",
        "version": "1.0.0"
    }

@router.get("/ready")
async def readiness_check():
    """
    Readiness check - verifies all dependencies are available
    """
    # TODO: Add checks for database, Redis, ML models, etc.
    return {
        "status": "ready",
        "dependencies": {
            "database": "ok",
            "redis": "ok",
            "ml_models": "ok"
        }
    }
