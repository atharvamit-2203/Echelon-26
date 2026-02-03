# Dynamic & Interlinked System Guide

## 🔄 Real-Time Features Implemented

### 1. **WebSocket Notifications**
Real-time push notifications for all important events:

#### Notification Types:
- **analysis_started** - When batch analysis begins
- **analysis_progress** - Live progress updates every 5 CVs
- **analysis_complete** - Final results with summary
- **bias_alert** - Immediate bias detection warnings
- **candidate_rescued** - Individual rescue notifications
- **cv_uploaded** - New CV upload confirmations

#### How It Works:
```
Frontend ←→ WebSocket ←→ Backend
   ↓           ↓            ↓
Toast    Live Updates   Analysis
```

---

### 2. **Dynamic Data Flow**

#### Analysis → Bias Detection → Notifications
```
1. User starts analysis
   ↓
2. Backend analyzes CVs one by one
   ↓
3. Progress sent via WebSocket (every 5 CVs)
   ↓
4. Bias detection runs in real-time
   ↓
5. Bias alerts sent immediately when detected
   ↓
6. Completion notification with summary
   ↓
7. Bias Analysis tab auto-refreshes
```

#### Interlinked Components:
- **Analysis Panel** → Triggers analysis
- **WebSocket** → Sends real-time updates
- **Notification Toast** → Shows alerts
- **Bias Analysis Tab** → Auto-refreshes on completion
- **Dashboard Stats** → Updates automatically
- **Rescued Candidates** → Populates in real-time

---

### 3. **Varied CV Generation**

#### CV Generator Features:
- **5 Domains**: Software, Data, Design, Marketing, Management
- **Diverse Demographics**:
  - 48 first names from multiple cultures
  - 46 last names from various backgrounds
  - Age range: 22-55 years
  - Gender: Male, Female, Non-binary
  - 20+ global locations

#### Skill Variety:
- **Software**: 27 different skills
- **Data Science**: 21 skills
- **Design**: 17 skills
- **Marketing**: 17 skills
- **Management**: 16 skills

#### Realistic Attributes:
- Experience: 0-30 years (age-appropriate)
- Education: 11 different levels
- Salaries: Based on experience + randomization
- Cross-domain skills (30% chance)

---

## 🚀 Usage Guide

### Step 1: Generate Varied CVs

```bash
# Generate 50 diverse CVs
curl -X POST "http://localhost:8000/api/v1/seed/generate-cvs?count=50"

# Generate CVs for specific domains
curl -X POST "http://localhost:8000/api/v1/seed/generate-cvs?count=30&domains=software&domains=data"

# Generate CVs tailored to a job
curl -X POST "http://localhost:8000/api/v1/seed/generate-for-job" \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Looking for a Senior React Developer with 5+ years experience",
    "count": 30
  }'
```

### Step 2: Connect to WebSocket

The frontend automatically connects to `ws://localhost:8000/api/v1/ws`

You'll see:
- ✅ Connection status in browser console
- 🔔 Browser notifications (if permitted)
- 📱 Toast notifications in top-right corner

### Step 3: Run Analysis

1. Go to **Analysis Tab**
2. Enter job description
3. Click **Start Analysis**
4. Watch real-time updates:
   - Progress bar updates live
   - Rescued candidates appear instantly
   - Bias alerts show immediately

### Step 4: Check Bias Analysis

1. Go to **Bias Analysis Tab**
2. Data auto-loads after analysis
3. See:
   - Gender distribution charts
   - Age group analysis
   - Shortlist rate disparities
   - Recent bias alerts

---

## 📊 Real-Time Flow Example

### Scenario: Analyzing 50 CVs

```
00:00 - User clicks "Start Analysis"
00:01 - 🔔 "Started analyzing 50 CVs"
00:05 - 📊 Progress: 5/50 (10%) - Rescued: 1
00:10 - 📊 Progress: 10/50 (20%) - Rescued: 3
00:12 - 🎯 "Rescued: Jane Doe (ATS: 45%, Semantic: 87%)"
00:15 - 📊 Progress: 15/50 (30%) - Rescued: 5
00:18 - ⚠️ "Bias detected in gender distribution"
00:20 - 📊 Progress: 20/50 (40%) - Rescued: 7
...
01:00 - ✅ "Analysis complete! Rescued 15 candidates"
01:01 - Bias Analysis tab auto-refreshes
01:02 - Dashboard stats update
```

---

## 🎯 Dynamic Features

### 1. **Auto-Refresh on Events**
- Dashboard stats refresh when analysis completes
- Bias Analysis refreshes automatically
- Rescued Candidates list updates in real-time

### 2. **Browser Notifications**
Important alerts trigger browser notifications:
- Bias alerts
- Candidate rescues
- Analysis completion

### 3. **Progress Tracking**
- Live progress bar
- Current/Total count
- Rescued count updates
- Percentage completion

### 4. **Contextual Alerts**
- Yellow for bias warnings
- Green for rescues
- Blue for progress
- Red for errors

---

## 🔧 Configuration

### Backend WebSocket
```python
# app/services/websocket_service.py
manager = ConnectionManager()

# Send notifications
await notification_service.notify_bias_detected({
    "type": "gender_bias",
    "group": "gender",
    "impact": "high"
})
```

### Frontend WebSocket Hook
```typescript
// hooks/useWebSocket.ts
const { notifications, latestNotification, isConnected } = useWebSocket();

// Use in components
{latestNotification?.type === 'bias_alert' && (
  <Alert>{latestNotification.data.message}</Alert>
)}
```

---

## 📈 Bias Detection Logic

### Automatic Detection:
1. **Gender Bias**: >20% shortlist rate disparity
2. **Age Bias**: >25% shortlist rate disparity
3. **ATS Bias**: Low ATS scores but high rescue rate

### Real-Time Alerts:
```
Analysis running...
  ↓
Gender stats tracked per CV
  ↓
After each CV, check for bias
  ↓
If bias detected → Immediate alert
  ↓
Continue analysis
  ↓
Final bias report
```

---

## ✅ Everything is Now:

- ✅ **Dynamic** - Real-time updates throughout
- ✅ **Interlinked** - All components communicate
- ✅ **Varied** - Diverse, realistic CVs
- ✅ **Responsive** - Instant notifications
- ✅ **Automated** - Auto-refresh and updates
- ✅ **Production-Ready** - Scalable architecture

**The system is fully dynamic and interlinked!** 🚀
