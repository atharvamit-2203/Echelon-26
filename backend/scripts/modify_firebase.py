"""
Modify existing Firebase Firestore collections for Echelon.

This script updates the following collections based on your current database:
- alerts: upsert a canonical "skill_bias_static" alert (from screenshot) and ensure a _meta doc
- analysis_results: ensure structure via _meta placeholder
- cvs: ensure structure via _meta placeholder
- job_criteria: upsert a sensible default criteria document
- metrics: upsert a global metrics document with rolling counters placeholders

It will not delete anything. All writes are merge operations (set(..., merge=True))
so existing fields are preserved unless explicitly overwritten.

Requirements
- pip install firebase-admin python-dotenv

Environment
- GOOGLE_APPLICATION_CREDENTIALS=absolute_path_to/serviceAccountKey.json
- FIREBASE_PROJECT_ID=your-project-id
- FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com (not required here, but okay to keep)

Usage
- Modify everything:
    python backend/scripts/modify_firebase.py
- Only alerts and metrics:
    python backend/scripts/modify_firebase.py --only alerts metrics

"""
from __future__ import annotations
import argparse
import os
from datetime import datetime
from typing import Any, Dict, List

try:
    from dotenv import load_dotenv  # optional
except Exception:
    load_dotenv = None  # type: ignore

import firebase_admin
from firebase_admin import credentials, firestore


# ----------------------------- bootstrap ---------------------------------

def load_env() -> None:
    if load_dotenv:
        # Search current dir, parent dir (if in scripts/), and backend/ subdir
        for env_path in (".env", os.path.join("..", ".env"), os.path.join("backend", ".env")):
            if os.path.exists(env_path):
                load_dotenv(env_path)
                print(f"Loaded environment from {os.path.abspath(env_path)}")
                break
        else:
            print("Warning: No .env file found in expected locations.")


def init_firebase_app() -> None:
    if not firebase_admin._apps:
        cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        project_id = os.getenv("FIREBASE_PROJECT_ID")
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {"projectId": project_id})
        else:
            firebase_admin.initialize_app(options={"projectId": project_id})


def now_utc_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


# ----------------------------- operations ---------------------------------

def upsert_alert_skill_bias_static(db: firestore.Client) -> None:
    """Upsert the alert document from the provided screenshot.

    Collection: alerts
    Document ID: skill_bias_static
    """
    alerts = db.collection("alerts")
    doc_id = "skill_bias_static"
    payload: Dict[str, Any] = {
        "id": doc_id,
        "active": True,
        "affected_count": 6,
        "biased_skills": ["c++", "scala"],
        "description": (
            'Candidates with skills like "C++, Scala" show 66% rejection rate. '
            "ATS may be penalizing valuable experience-based skills."
        ),
        "recommendations": [
            'Add semantic equivalents for "c++" in ATS keyword matching',
            "Review if experience-level terminology is being unfairly weighted",
        ],
        "updatedAt": now_utc_iso(),
        "type": "skill_bias",  # helpful for filtering
        "source": "static",     # marks this as static/curated alert
    }
    alerts.document(doc_id).set(payload, merge=True)
    print(f"Upserted alerts/{doc_id}")

    # Ensure meta document exists
    alerts.document("_meta").set({
        "schemaVersion": "1.0",
        "indexes_hint": ["active", "updatedAt", "type"],
        "updatedAt": now_utc_iso(),
    }, merge=True)
    print("Ensured alerts/_meta")


def ensure_analysis_results_meta(db: firestore.Client) -> None:
    db.collection("analysis_results").document("_meta").set({
        "schemaVersion": "1.0",
        "exampleFields": ["jobId", "candidateId", "createdAt", "scores", "explanations"],
        "updatedAt": now_utc_iso(),
    }, merge=True)
    print("Ensured analysis_results/_meta")


def ensure_cvs_meta(db: firestore.Client) -> None:
    db.collection("cvs").document("_meta").set({
        "schemaVersion": "1.0",
        "exampleFields": ["owner", "email", "createdAt", "storagePath", "parsed"],
        "updatedAt": now_utc_iso(),
    }, merge=True)
    print("Ensured cvs/_meta")


def upsert_default_job_criteria(db: firestore.Client) -> None:
    """Create/update a sensible default job criteria document.

    This can be adapted by your backend when creating real job postings.
    """
    doc_id = "default_criteria"
    payload: Dict[str, Any] = {
        "id": doc_id,
        "version": 1,
        "createdAt": now_utc_iso(),
        "updatedAt": now_utc_iso(),
        "required_skills": ["python", "apis"],
        "nice_to_have": ["cloud", "docker"],
        "min_years_experience": 2,
        "fairness": {
            "debias_keywords": True,
            "blocklisted_terms": ["rockstar", "ninja"],
            "weighting": {
                "skills": 0.5,
                "experience": 0.3,
                "education": 0.2,
            },
        },
    }
    db.collection("job_criteria").document(doc_id).set(payload, merge=True)
    print(f"Upserted job_criteria/{doc_id}")


def upsert_metrics_global(db: firestore.Client) -> None:
    """Ensure a global metrics document with rolling counters placeholders."""
    doc_id = "global"
    metrics: Dict[str, Any] = {
        "id": doc_id,
        "updatedAt": now_utc_iso(),
        "cvs_total": firestore.Increment(0),  # will exist or be created as 0
        "analyses_total": firestore.Increment(0),
        "alerts_active_count": firestore.Increment(0),
        "recent": {
            "last_cv_uploaded": None,
            "last_analysis_run": None,
        },
    }
    # First ensure the doc exists with zeros if missing
    db.collection("metrics").document(doc_id).set({
        "id": doc_id,
        "updatedAt": now_utc_iso(),
        "cvs_total": 0,
        "analyses_total": 0,
        "alerts_active_count": 0,
        "recent": {
            "last_cv_uploaded": None,
            "last_analysis_run": None,
        },
    }, merge=True)
    # Then bump by 0 to create numeric fields safely for future atomic increments
    db.collection("metrics").document(doc_id).set(metrics, merge=True)
    print(f"Ensured/initialized metrics/{doc_id}")


# ----------------------------- CLI ---------------------------------

def run(selected: List[str]) -> None:
    load_env()
    init_firebase_app()
    db = firestore.client()

    ops = {
        "alerts": upsert_alert_skill_bias_static,
        "analysis_results": ensure_analysis_results_meta,
        "cvs": ensure_cvs_meta,
        "job_criteria": upsert_default_job_criteria,
        "metrics": upsert_metrics_global,
    }

    if not selected or "all" in selected:
        sequence = [
            "alerts",
            "analysis_results",
            "cvs",
            "job_criteria",
            "metrics",
        ]
    else:
        # validate selection
        invalid = [x for x in selected if x not in ops]
        if invalid:
            raise SystemExit(f"Unknown targets: {invalid}. Valid: {list(ops.keys())} or 'all'")
        sequence = selected

    for key in sequence:
        print(f"Applying: {key}")
        ops[key](db)

    print("Modifications complete.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Modify existing Firestore collections for Echelon")
    parser.add_argument("--only", nargs="*", help="Subset to apply: alerts analysis_results cvs job_criteria metrics or 'all'")
    args = parser.parse_args()

    run(args.only or [])
