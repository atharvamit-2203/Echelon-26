"""
Reference CV Management API endpoints
"""
from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from typing import List, Optional
from firebase_service import FirebaseService
from datetime import datetime

router = APIRouter(prefix="/reference-cvs", tags=["Reference CVs"])


@router.get("/", summary="Get all reference CVs")
async def get_reference_cvs():
    """Get all reference CVs (active and inactive)"""
    try:
        refs = FirebaseService.db.collection('reference_cvs').order_by('uploadedAt', direction='DESCENDING').stream()
        reference_cvs = []
        for ref in refs:
            ref_data = ref.to_dict()
            ref_data['id'] = ref.id
            reference_cvs.append(ref_data)
        return {"reference_cvs": reference_cvs}
    except Exception as e:
        return {"error": str(e), "reference_cvs": []}


@router.delete("/{ref_id}", summary="Delete reference CV")
async def delete_reference_cv(ref_id: str):
    """Delete a reference CV"""
    try:
        FirebaseService.db.collection('reference_cvs').document(ref_id).delete()
        return {"message": "Reference CV deleted successfully"}
    except Exception as e:
        return {"error": str(e)}


@router.patch("/{ref_id}/toggle", summary="Toggle reference CV active status")
async def toggle_reference_cv(ref_id: str):
    """Activate or deactivate a reference CV (supports multiple active CVs)"""
    try:
        ref_doc = FirebaseService.db.collection('reference_cvs').document(ref_id).get()
        if not ref_doc.exists:
            return {"error": "Reference CV not found"}
        
        current_status = ref_doc.to_dict().get('status', 'inactive')
        new_status = 'inactive' if current_status == 'active' else 'active'
        
        # Allow multiple active reference CVs - no auto-deactivation
        
        FirebaseService.db.collection('reference_cvs').document(ref_id).update({'status': new_status})
        return {"message": f"Reference CV {new_status}", "status": new_status}
    except Exception as e:
        return {"error": str(e)}


@router.post("/upload-url", summary="Add reference CV from URL")
async def add_reference_cv_from_url(
    url: str = Form(...),
    job_title: str = Form(...)
):
    """Add a reference CV from a URL"""
    try:
        import requests
        
        # Download content from URL
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return {"error": "Failed to download from URL"}
        
        ref_id = f"REF{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Allow multiple active reference CVs - no auto-deactivation
        
        # Save reference CV data
        ref_data = {
            "referenceId": ref_id,
            "jobTitle": job_title,
            "sourceUrl": url,
            "extractedText": response.text[:5000],  # Store first 5000 chars
            "uploadedAt": datetime.now(),
            "status": "active"
        }
        
        FirebaseService.db.collection('reference_cvs').document(ref_id).set(ref_data)
        
        return {
            "message": "Reference CV added from URL successfully",
            "referenceId": ref_id,
            "jobTitle": job_title
        }
    except Exception as e:
        return {"error": str(e)}
