"""Test script to verify CV loading from sample_cvs folder"""

import sys
sys.path.append('backend')

from backend.firebase_service import FirebaseService

print("Testing CV loading...")
print("-" * 50)

# Test loading from files
cv_files = FirebaseService.get_cvs_from_files()
print(f"\n✓ Found {len(cv_files)} CVs from sample_cvs folder")

if cv_files:
    print(f"\nFirst 5 CVs:")
    for i, cv in enumerate(cv_files[:5], 1):
        print(f"  {i}. {cv.get('name', 'Unknown')} - Age: {cv.get('age', 'N/A')}, Experience: {cv.get('experience', 'N/A')}y, Status: {cv.get('status', 'N/A')}")
    
    # Count by status
    rejected = len([cv for cv in cv_files if cv.get('status') == 'rejected'])
    accepted = len([cv for cv in cv_files if cv.get('status') in ['shortlisted', 'under_review']])
    
    print(f"\n✓ Status breakdown:")
    print(f"  - Rejected: {rejected}")
    print(f"  - Accepted/Under Review: {accepted}")
    print(f"  - Rejection rate: {(rejected/len(cv_files)*100):.1f}%")
else:
    print("\n✗ No CVs loaded from sample_cvs folder!")

print("\n" + "-" * 50)
print("Test complete!")
