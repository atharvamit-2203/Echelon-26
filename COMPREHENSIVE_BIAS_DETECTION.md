# Comprehensive Bias Detection Guide

## 🎯 Overview

The system now analyzes bias across **ALL parameters**, not just gender and age. This provides a complete picture of potential discrimination in your hiring process.

---

## 📊 Parameters Analyzed

### 1. **Gender**
- Tracks: Male, Female, Non-binary
- Detects: Shortlist rate disparities
- Threshold: >20% difference
- Severity: High

### 2. **Age Group**
- Categories: 18-24, 25-34, 35-44, 45-54, 55+
- Detects: Age discrimination patterns
- Threshold: >25% difference
- Severity: High

### 3. **Location**
- Tracks: City/Region-based discrimination
- Detects: Geographic bias
- Examples: Remote vs On-site, Urban vs Rural
- Threshold: >20% difference
- Severity: Medium-High

### 4. **Education Level**
- Categories: Doctoral, Master's, Bachelor's, Associate, Other
- Detects: Over-qualification or under-qualification bias
- Threshold: >20% difference
- Severity: Medium

### 5. **Experience Level**
- Categories: 
  - Entry (0-2 years)
  - Junior (2-5 years)
  - Mid (5-10 years)
  - Senior (10-15 years)
  - Expert (15+ years)
- Detects: Experience-based discrimination
- Threshold: >20% difference
- Severity: High

### 6. **Current Role**
- Categories: Engineering, Management, Design, Analytics, Marketing, Other
- Detects: Role transition bias
- Example: Managers favored over individual contributors
- Threshold: >20% difference
- Severity: Medium

### 7. **Domain**
- Tracks: Software, Data, Design, Marketing, Management
- Detects: Industry/domain switching bias
- Threshold: >20% difference
- Severity: Medium

### 8. **Skill Count**
- Categories: 1-4, 5-9, 10-14, 15+ skills
- Detects: Bias against candidates with fewer/more skills
- Threshold: >20% difference
- Severity: Low-Medium

### 9. **ATS Scoring Patterns**
- Analyzes: Score disparities across demographics
- Detects: Systematic ATS bias
- Threshold: >10 point difference
- Severity: Medium-High

### 10. **Rescue Patterns**
- Analyzes: Which groups are rescued more often
- Indicates: ATS systematic bias against specific groups
- Threshold: >15% difference
- Severity: High

---

## 🚨 Bias Severity Levels

### Critical (Red)
- **Disparity**: >40%
- **Impact**: Severe discrimination
- **Action**: Immediate review required
- **Example**: 60% of Group A shortlisted vs 15% of Group B

### High (Orange)
- **Disparity**: 30-40%
- **Impact**: Significant bias
- **Action**: Urgent review needed
- **Example**: Age group 25-34 favored over 55+

### Medium (Yellow)
- **Disparity**: 20-30%
- **Impact**: Moderate bias
- **Action**: Review recommended
- **Example**: Location-based preference

### Low (Blue)
- **Disparity**: <20%
- **Impact**: Minor disparity
- **Action**: Monitor
- **Example**: Slight skill count preference

---

## 📈 API Endpoints

### 1. Comprehensive Analysis
```bash
GET /api/v1/bias/comprehensive
```

Returns all biases across all parameters with detailed statistics.

**Response:**
```json
{
  "total_candidates_analyzed": 50,
  "total_biases_detected": 8,
  "critical_biases": 2,
  "high_biases": 3,
  "medium_biases": 2,
  "low_biases": 1,
  "categories_with_bias": ["Gender", "Age Group", "Location", "Experience Level"],
  "bias_alerts": [...]
}
```

### 2. Category-Specific Analysis
```bash
GET /api/v1/bias/by-category/{category}
```

Get detailed analysis for a specific category.

**Example:**
```bash
GET /api/v1/bias/by-category/gender
GET /api/v1/bias/by-category/location
GET /api/v1/bias/by-category/education
```

### 3. Bias Summary
```bash
GET /api/v1/bias/summary
```

High-level overview of all biases.

---

## 🎨 UI Components

### Comprehensive Bias Analysis Dashboard

**Features:**
- Real-time bias detection
- Severity-based color coding
- Category filtering
- Detailed recommendations
- Affected candidate counts

**Usage:**
```typescript
import ComprehensiveBiasAnalysis from '@/components/ComprehensiveBiasAnalysis';

<ComprehensiveBiasAnalysis />
```

**Display:**
- Summary cards (Total, Critical, High, Medium)
- Category badges (clickable filters)
- Detailed bias alerts with:
  - Severity indicator
  - Favored vs Disadvantaged groups
  - Disparity percentage
  - Affected candidate count
  - Actionable recommendations

---

## 🔍 Bias Detection Logic

### Shortlist Rate Disparity
```python
shortlist_rate = shortlisted / total
disparity = max_rate - min_rate

if disparity > 0.20:  # 20% threshold
    flag_as_bias()
```

### ATS Score Bias
```python
avg_ats_score_by_group = mean(ats_scores)
score_diff = max_score - min_score

if score_diff > 10:  # 10 points threshold
    flag_as_ats_bias()
```

### Rescue Pattern Bias
```python
rescue_rate = rescued / total
disparity = max_rescue_rate - min_rescue_rate

if disparity > 0.15:  # 15% threshold
    flag_as_systematic_ats_bias()
```

---

## 💡 Example Bias Alerts

### Gender Bias
```json
{
  "type": "gender_bias",
  "category": "Gender",
  "severity": "high",
  "disparity": 0.35,
  "favored_group": "Male",
  "disadvantaged_group": "Female",
  "details": "Gender bias detected: Male has 35.0% higher shortlist rate than Female",
  "recommendation": "Review gender-based selection criteria to ensure fairness",
  "affected_candidates": 15
}
```

### Location Bias
```json
{
  "type": "location_bias",
  "category": "Location",
  "severity": "medium",
  "disparity": 0.25,
  "favored_group": "San Francisco",
  "disadvantaged_group": "Remote",
  "details": "Location bias detected: San Francisco has 25.0% higher shortlist rate than Remote",
  "recommendation": "Review location-based selection criteria to ensure fairness",
  "affected_candidates": 8
}
```

### Experience Bias
```json
{
  "type": "experience_bias",
  "category": "Experience Level",
  "severity": "high",
  "disparity": 0.40,
  "favored_group": "Mid (5-10 years)",
  "disadvantaged_group": "Entry (0-2 years)",
  "details": "Experience Level bias detected: Mid (5-10 years) has 40.0% higher shortlist rate than Entry (0-2 years)",
  "recommendation": "Review experience level-based selection criteria to ensure fairness",
  "affected_candidates": 12
}
```

---

## 🎯 Real-Time Notifications

Bias alerts are sent via WebSocket immediately when detected:

```typescript
{
  "type": "bias_alert",
  "timestamp": "2026-01-29T10:30:00Z",
  "severity": "high",
  "data": {
    "bias_type": "location_bias",
    "affected_group": "Remote",
    "impact": "high",
    "message": "⚠️ Bias detected in Location"
  }
}
```

---

## ✅ Best Practices

### 1. **Run Regular Analysis**
- Analyze after every batch of CVs
- Monitor trends over time
- Compare across different job postings

### 2. **Act on Alerts**
- Review critical biases immediately
- Adjust ATS keywords if needed
- Update job descriptions
- Train hiring team

### 3. **Document Changes**
- Track bias reduction efforts
- Measure improvement over time
- Report to stakeholders

### 4. **Continuous Monitoring**
- Set up automated alerts
- Weekly bias reports
- Dashboard monitoring

---

## 🚀 Integration Example

```typescript
// Fetch comprehensive bias analysis
const response = await axios.get('/api/v1/bias/comprehensive');

// Filter critical biases
const criticalBiases = response.data.bias_alerts.filter(
  bias => bias.severity === 'critical'
);

// Send alerts
criticalBiases.forEach(bias => {
  sendAlert({
    title: `Critical Bias Detected: ${bias.category}`,
    message: bias.details,
    action: bias.recommendation
  });
});
```

---

## 📊 Sample Output

```
Total Candidates: 50
Biases Detected: 8

Critical (2):
  ⚠️ Gender Bias: 40% disparity
  ⚠️ Age Bias: 45% disparity

High (3):
  ⚠️ Experience Bias: 35% disparity
  ⚠️ Location Bias: 32% disparity
  ⚠️ ATS Scoring Bias: 15 points difference

Medium (2):
  ⚠️ Education Bias: 25% disparity
  ⚠️ Role Bias: 22% disparity

Low (1):
  ⚠️ Skill Count Bias: 18% disparity
```

---

## 🎓 Understanding Results

### What is "Disparity"?
The percentage difference in shortlist rates between the most favored and least favored groups.

**Example:**
- Group A: 70% shortlisted
- Group B: 30% shortlisted
- Disparity: 40%

### What is "Affected Candidates"?
The number of candidates in the disadvantaged group who may have been unfairly rejected.

### What are "Rescue Patterns"?
When certain demographic groups are consistently rescued more often, it indicates the ATS is systematically biased against them.

---

**The system now provides complete, multi-dimensional bias detection!** 🎯
