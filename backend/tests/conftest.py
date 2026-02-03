"""
Test configuration for pytest
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient(app)


@pytest.fixture
def mock_cv_data():
    """Mock CV data for testing"""
    return {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "age": 30,
        "gender": "Male",
        "experience": 5,
        "skills": ["Python", "FastAPI", "React"],
        "education": "Bachelor's in Computer Science",
        "location": "New York",
        "currentRole": "Software Engineer",
        "expectedSalary": "$100,000 - $120,000"
    }


@pytest.fixture
def auth_headers():
    """Authentication headers for testing"""
    return {"Authorization": "Bearer test_token"}
