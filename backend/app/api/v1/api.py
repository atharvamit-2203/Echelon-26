"""
API Router - Version 1
"""
from fastapi import APIRouter
from app.api.v1.endpoints import cvs, analysis, reports, jobs, upload, websocket, seed, bias

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(cvs.router)
api_router.include_router(analysis.router)
api_router.include_router(reports.router)
api_router.include_router(jobs.router)
api_router.include_router(upload.router)
api_router.include_router(websocket.router)
api_router.include_router(seed.router)
api_router.include_router(bias.router)

