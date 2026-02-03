"""
Middleware for request logging, CORS, and security
"""
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.logging import logger
from app.core.config import settings
import time
import uuid


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all requests"""
    
    async def dispatch(self, request: Request, call_next):
        # Skip WebSocket connections
        if request.url.path.endswith("/ws") or "websocket" in request.headers.get("upgrade", "").lower():
            return await call_next(request)
        
        # Generate request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Log request
        start_time = time.time()
        logger.info(
            f"Request started",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "client": request.client.host if request.client else None
            }
        )
        
        # Process request
        response = await call_next(request)
        
        # Log response
        process_time = time.time() - start_time
        logger.info(
            f"Request completed",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "process_time": f"{process_time:.3f}s"
            }
        )
        
        # Add headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = f"{process_time:.3f}"
        
        return response


def setup_middleware(app):
    """Setup all middleware for the application"""
    
    # CORS middleware - allow all origins for WebSocket compatibility
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow all origins for WebSocket
        allow_credentials=False,  # Disable credentials for WebSocket
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Gzip compression (disabled for WebSocket testing)
    # app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    # Request logging (disabled for WebSocket compatibility)
    # app.add_middleware(RequestLoggingMiddleware)
