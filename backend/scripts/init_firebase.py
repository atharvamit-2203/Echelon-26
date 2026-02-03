"""
Firebase initialization script for Echelon

What this does
- Connects to Firebase using service account credentials
- Ensures required Firestore collections exist by creating seed docs if missing
- Optionally seeds minimal sample data for development
- Creates a Storage bucket folder structure placeholders (no-op for most SDKs but verifies access)

Requirements
- Python packages: firebase-admin
  pip install firebase-admin

Configuration
- Set environment variables or .env file (recommended to reuse backend/.env):
    GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json
    FIREBASE_PROJECT_ID=your-project-id
    FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
    FIREBASE_DB_LOCATION=(optional, e.g., us-central)

Usage
  python backend/scripts/init_firebase.py --seed
  python backend/scripts/init_firebase.py  # only structure, no sample data

Collections created
- jobs: job postings and ATS criteria
- candidates: parsed CVs and metadata
- analyses: analysis runs and results
- notifications: user/system notifications
- users: minimal user profile placeholder (if your auth layer mirrors Firestore)

Firestore has no tables/DDL. Creating a document in a collection implicitly creates it.
"""
from __future__ import annotations
import argparse
import os
import sys
from datetime import datetime
from typing import Any, Dict

try:
    from dotenv import load_dotenv  # optional
except Exception:
    load_dotenv = None  # type: ignore

import firebase_admin
from firebase_admin import credentials, firestore, storage


def load_env() -> None:
    # Load .env if present
    if load_dotenv:
        # Try project root .env or backend/.env
        for env_path in (".env", os.path.join("backend", ".env")):
            if os.path.exists(env_path):
                load_dotenv(env_path)
                break


def init_firebase_app() -> None:
    # Initialize Firebase Admin SDK once
    if not firebase_admin._apps:
        cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        project_id = os.getenv("FIREBASE_PROJECT_ID")
        bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET")

        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {
                "projectId": project_id,
                "storageBucket": bucket_name,
            })
        else:
            # Fallback to Application Default Credentials (ADC)
            # Ensure environment is configured for ADC if no service account path is given
            firebase_admin.initialize_app(options={
                "projectId": project_id,
                "storageBucket": bucket_name,
            })


def ensure_collection_seed(db: firestore.Client, collection: str, doc_id: str, data: Dict[str, Any]) -> None:
    doc_ref = db.collection(collection).document(doc_id)
    if not doc_ref.get().exists:
        doc_ref.set(data)
        print(f"Created {collection}/{doc_id}")
    else:
        print(f"Exists {collection}/{doc_id}")


def seed_structure(db: firestore.Client) -> None:
    now = datetime.utcnow().isoformat() + "Z"

    # Minimal placeholder documents for structure
    ensure_collection_seed(db, "jobs", "_meta", {
        "_created": now,
        "_note": "Collection metadata placeholder. Safe to delete in production.",
        "indexes_hint": ["status", "createdAt", "title"],
    })

    ensure_collection_seed(db, "candidates", "_meta", {
        "_created": now,
        "_note": "Collection metadata placeholder. Safe to delete in production.",
        "indexes_hint": ["email", "status", "createdAt"],
    })

    ensure_collection_seed(db, "analyses", "_meta", {
        "_created": now,
        "_note": "Collection metadata placeholder. Safe to delete in production.",
        "indexes_hint": ["jobId", "candidateId", "createdAt", "type"],
    })

    ensure_collection_seed(db, "notifications", "_meta", {
        "_created": now,
        "_note": "Collection metadata placeholder. Safe to delete in production.",
        "indexes_hint": ["userId", "read", "createdAt"],
    })

    ensure_collection_seed(db, "users", "_meta", {
        "_created": now,
        "_note": "Collection metadata placeholder. Safe to delete in production.",
        "indexes_hint": ["email", "role", "createdAt"],
    })


def seed_sample_data(db: firestore.Client) -> None:
    now = datetime.utcnow().isoformat() + "Z"

    # Sample job
    job_ref = db.collection("jobs").document()
    job_id = job_ref.id
    job = {
        "title": "Software Engineer",
        "status": "open",
        "createdAt": now,
        "location": "Remote",
        "atsCriteria": {
            "requiredSkills": ["Python", "APIs", "Cloud"],
            "yearsExperience": 2,
        },
    }
    job_ref.set(job)

    # Sample candidate
    cand_ref = db.collection("candidates").document()
    candidate_id = cand_ref.id
    candidate = {
        "name": "Sample Candidate",
        "email": "candidate@example.com",
        "status": "new",
        "createdAt": now,
        "cvStoragePath": None,
        "parsed": False,
    }
    cand_ref.set(candidate)

    # Sample analysis
    analysis_ref = db.collection("analyses").document()
    analysis = {
        "jobId": job_id,
        "candidateId": candidate_id,
        "type": "ats_precheck",
        "createdAt": now,
        "result": {
            "score": 0,
            "notes": "Pending processing",
        },
    }
    analysis_ref.set(analysis)

    # Sample notification
    notif_ref = db.collection("notifications").document()
    notif = {
        "userId": "admin",
        "message": "Initial seed completed",
        "read": False,
        "createdAt": now,
    }
    notif_ref.set(notif)

    # Sample user
    user_ref = db.collection("users").document("admin")
    user = {
        "email": "admin@example.com",
        "role": "admin",
        "createdAt": now,
    }
    user_ref.set(user)

    print("Seeded sample data: jobs, candidates, analyses, notifications, users")


def verify_storage() -> None:
    bucket_name = storage.bucket().name
    bucket = storage.bucket()
    # Try listing limited number of blobs to verify access
    _ = list(bucket.list_blobs(max_results=1))
    # Create folder placeholders by uploading zero-byte objects (optional)
    placeholders = [
        "uploads/",  # CV uploads
        "exports/",
        "logs/",
    ]
    for key in placeholders:
        if key.endswith("/"):
            key_obj = key + ".keep"
        else:
            key_obj = key
        blob = bucket.blob(key_obj)
        if not blob.exists():
            blob.upload_from_string(b"", content_type="text/plain")
            print(f"Created storage placeholder: gs://{bucket_name}/{key_obj}")
        else:
            print(f"Exists storage placeholder: gs://{bucket_name}/{key_obj}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Initialize Firebase Firestore and Storage for Echelon")
    parser.add_argument("--seed", action="store_true", help="Insert sample data for development")
    args = parser.parse_args()

    load_env()
    init_firebase_app()

    db = firestore.client()

    print("Ensuring Firestore collection structure...")
    seed_structure(db)

    if args.seed:
        print("Seeding sample data...")
        seed_sample_data(db)

    print("Verifying Storage access and creating placeholders...")
    verify_storage()

    print("Initialization complete.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Initialization failed: {exc}")
        sys.exit(1)
