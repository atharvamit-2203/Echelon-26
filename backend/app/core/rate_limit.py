"""
Rate limiting middleware
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, FastAPI

# Initialize limiter
limiter = Limiter(key_func=get_remote_address)


def setup_rate_limiting(app: FastAPI):
    """Setup rate limiting for the application"""
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Rate limit decorators for different endpoints
def rate_limit_strict(request: Request):
    """Strict rate limit: 10 requests per minute"""
    return limiter.limit("10/minute")(request)


def rate_limit_moderate(request: Request):
    """Moderate rate limit: 30 requests per minute"""
    return limiter.limit("30/minute")(request)


def rate_limit_relaxed(request: Request):
    """Relaxed rate limit: 100 requests per minute"""
    return limiter.limit("100/minute")(request)
