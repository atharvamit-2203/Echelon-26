"""
Tests for CV API endpoints
"""
import pytest
from fastapi import status


def test_create_cv(client, mock_cv_data):
    """Test creating a new CV"""
    response = client.post("/api/v1/cvs/", json=mock_cv_data)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == mock_cv_data["name"]
    assert data["email"] == mock_cv_data["email"]
    assert "candidateId" in data


def test_get_cvs(client):
    """Test getting all CVs"""
    response = client.get("/api/v1/cvs/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)


def test_get_cv_not_found(client):
    """Test getting a non-existent CV"""
    response = client.get("/api/v1/cvs/INVALID_ID")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_update_cv(client, mock_cv_data):
    """Test updating a CV"""
    # First create a CV
    create_response = client.post("/api/v1/cvs/", json=mock_cv_data)
    candidate_id = create_response.json()["candidateId"]
    
    # Update it
    update_data = {"status": "shortlisted"}
    response = client.put(f"/api/v1/cvs/{candidate_id}", json=update_data)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "shortlisted"


def test_delete_cv(client, mock_cv_data):
    """Test deleting a CV"""
    # First create a CV
    create_response = client.post("/api/v1/cvs/", json=mock_cv_data)
    candidate_id = create_response.json()["candidateId"]
    
    # Delete it
    response = client.delete(f"/api/v1/cvs/{candidate_id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify it's deleted
    get_response = client.get(f"/api/v1/cvs/{candidate_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND


def test_get_statistics(client):
    """Test getting CV statistics"""
    response = client.get("/api/v1/cvs/statistics/summary")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "total" in data
    assert "by_status" in data
