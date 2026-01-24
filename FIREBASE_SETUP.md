# Firebase Setup Instructions

## 1. Get Firebase Configuration

1. Go to your Firebase Console: https://console.firebase.google.com/project/echelon-99796
2. Click on "Project Settings" (gear icon)
3. Scroll down to "Your apps" section
4. Click "Add app" and select "Web" (</>) 
5. Register your app with name "Fair-Hire Sentinel"
6. Copy the configuration object

## 2. Update Frontend Configuration

Replace the placeholder values in `frontend/config/firebase.ts` with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "echelon-99796.firebaseapp.com", 
  projectId: "echelon-99796",
  storageBucket: "echelon-99796.firebasestorage.app",
  messagingSenderId: "846552054372",
  appId: "your-actual-app-id"
};
```

## 3. Setup Backend Service Account

1. In Firebase Console, go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Place it in `backend/` folder as `service-account-key.json`
5. Update the path in `backend/firebase_service.py`

## 4. Enable Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for now
4. Select your preferred location

## 5. Populate Data

Run the FastAPI server and call the populate endpoint:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Then visit: http://localhost:8000/api/populate-data

## 6. Security Rules (Optional)

Update Firestore rules for production:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2024, 12, 31);
    }
  }
}
```