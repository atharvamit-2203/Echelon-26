import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta

# ----------------------------
# Mock Data Generation (Replace with real API/backend)
# ----------------------------
def generate_mock_data():
    # Candidate data
    np.random.seed(42)
    candidates = pd.DataFrame({
        'candidate_id': range(1, 101),
        'age_group': np.random.choice(['<30', '30-45', '>45'], 100, p=[0.3, 0.4, 0.3]),
        'gender': np.random.choice(['Male', 'Female', 'Non-binary'], 100, p=[0.45, 0.5, 0.05]),
        'keywords_used': [
            np.random.choice(['KPI', 'OKR', 'Metrics'], p=[0.6, 0.3, 0.1]) if i % 2 == 0 
            else np.random.choice(['CRM Strategy', 'Client Engagement', 'Relationship Mgmt'], p=[0.7, 0.2, 0.1])
            for i in range(100)
        ],
        'rejected_by_ats': np.random.choice([True, False], 100, p=[0.4, 0.6]),
        'semantic_score': np.random.uniform(0.7, 0.99, 100)  # Higher = better semantic match
    })
    
    # Bias metrics
    bias_metrics = {
        'keyword': ['KPI', 'CRM Strategy'],
        'rejection_rate_overall': [0.38, 0.42],
        'rejection_rate_age_<30': [0.25, 0.30],
        'rejection_rate_age_>45': [0.55, 0.60],
        'rejection_rate_female': [0.45, 0.50],
        'rejection_rate_male': [0.30, 0.35]
    }
    bias_df = pd.DataFrame(bias_metrics)
    
    # Rescued candidates
    rescued = candidates[
        (candidates['rejected_by_ats']) & 
        (candidates['semantic_score'] > 0.85) &
        ((candidates['age_group'] == '>45') | (candidates['gender'] == 'Female'))
    ].head(5)
    
    return candidates, bias_df, rescued

# ----------------------------
# Streamlit App Configuration
# ----------------------------
st.set_page_config(
    page_title="Fair-Hire Sentinel",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for branding
st.markdown("""
<style>
    :root {
        --primary: #4a6cf7;
        --secondary: #6c757d;
        --success: #28a745;
        --warning: #ffc107;
        --danger: #dc3545;
    }
    .main-header {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--primary);
        margin-bottom: 0.5rem;
    }
    .metric-card {
        background-color: #f8f9fa;
        border-radius: 10px;
        padding: 1rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .alert-box {
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
    }
    .bias-alert {
        background-color: #fff3cd;
        border-left: 4px solid var(--warning);
    }
    .rescue-alert {
        background-color: #d1ecf1;
        border-left: 4px solid var(--success);
    }
</style>
""", unsafe_allow_html=True)

# ----------------------------
# Sidebar Controls
# ----------------------------
st.sidebar.image("https://placehold.co/150x50/4a6cf7/white?text=Fair-Hire+Sentinel", use_column_width=True)
st.sidebar.title("Dashboard Controls")
time_window = st.sidebar.selectbox("Time Window", ["Last 7 Days", "Last 30 Days", "Last 90 Days"])
job_role = st.sidebar.selectbox("Job Role", ["All Roles", "Sales Manager", "Marketing Lead", "Data Analyst"])
threshold = st.sidebar.slider("Bias Alert Threshold", 0.0, 1.0, 0.25, 0.05)

# ----------------------------
# Main Dashboard
# ----------------------------
st.markdown('<div class="main-header">Fair-Hire Sentinel</div>', unsafe_allow_html=True)
st.subheader("Real-time Bias Monitoring & Talent Rescue System")

# Generate mock data
candidates, bias_df, rescued_candidates = generate_mock_data()

# ----------------------------
# Key Metrics Row
# ----------------------------
col1, col2, col3, col4 = st.columns(4)
with col1:
    st.markdown('<div class="metric-card">', unsafe_allow_html=True)
    st.metric("Total Candidates", len(candidates))
    st.markdown('</div>', unsafe_allow_html=True)
    
with col2:
    rejected_count = candidates['rejected_by_ats'].sum()
    st.markdown('<div class="metric-card">', unsafe_allow_html=True)
    st.metric("ATS Rejections", rejected_count)
    st.markdown('</div>', unsafe_allow_html=True)
    
with col3:
    high_potential = len(candidates[candidates['semantic_score'] > 0.85])
    st.markdown('<div class="metric-card">', unsafe_allow_html=True)
    st.metric("High-Potential Candidates", high_potential)
    st.markdown('</div>', unsafe_allow_html=True)
    
with col4:
    bias_alerts = len(bias_df[(bias_df['rejection_rate_age_>45'] - bias_df['rejection_rate_age_<30']) > threshold])
    st.markdown('<div class="metric-card">', unsafe_allow_html=True)
    st.metric("Active Bias Alerts", bias_alerts)
    st.markdown('</div>', unsafe_allow_html=True)

# ----------------------------
# Real-time Alerts Section
# ----------------------------
st.markdown("### ⚠️ Real-time Alerts")
if bias_alerts > 0:
    st.markdown(f"""
    <div class="alert-box bias-alert">
        <strong>Bias Detected!</strong> Keyword filters show {threshold*100}%+ higher rejection rates for candidates over 45 vs. under 30.
        <br><em>Recommendation: Review "KPI" and "CRM Strategy" filters immediately.</em>
    </div>
    """, unsafe_allow_html=True)

if not rescued_candidates.empty:
    st.markdown(f"""
    <div class="alert-box rescue-alert">
        <strong>Talent Rescue Opportunity!</strong> {len(rescued_candidates)} high-potential candidates were auto-rejected but match role requirements semantically.
        <br><em>Action: Review rescued candidates below.</em>
    </div>
    """, unsafe_allow_html=True)

# ----------------------------
# Demographic Disparity Analysis
# ----------------------------
st.markdown("### 📊 Demographic Disparity Analysis")
disparity_tab1, disparity_tab2 = st.tabs(["Age Groups", "Gender"])

with disparity_tab1:
    fig_age = go.Figure()
    fig_age.add_trace(go.Bar(
        x=bias_df['keyword'],
        y=bias_df['rejection_rate_age_<30'],
        name='Under 30',
        marker_color='#636efa'
    ))
    fig_age.add_trace(go.Bar(
        x=bias_df['keyword'],
        y=bias_df['rejection_rate_age_>45'],
        name='Over 45',
        marker_color='#ef553b'
    ))
    fig_age.update_layout(
        barmode='group',
        title="Rejection Rate by Age Group & Keyword",
        yaxis_title="Rejection Rate",
        legend_title="Age Group"
    )
    st.plotly_chart(fig_age, use_container_width=True)

with disparity_tab2:
    fig_gender = go.Figure()
    fig_gender.add_trace(go.Bar(
        x=bias_df['keyword'],
        y=bias_df['rejection_rate_female'],
        name='Female',
        marker_color='#ab63fa'
    ))
    fig_gender.add_trace(go.Bar(
        x=bias_df['keyword'],
        y=bias_df['rejection_rate_male'],
        name='Male',
        marker_color='#00cc96'
    ))
    fig_gender.update_layout(
        barmode='group',
        title="Rejection Rate by Gender & Keyword",
        yaxis_title="Rejection Rate",
        legend_title="Gender"
    )
    st.plotly_chart(fig_gender, use_container_width=True)

# ----------------------------
# Rescued Candidates Table
# ----------------------------
st.markdown("### 🦸 Rescued High-Potential Candidates")
if not rescued_candidates.empty:
    st.dataframe(
        rescued_candidates[['candidate_id', 'age_group', 'gender', 'keywords_used', 'semantic_score']].style.format({
            'semantic_score': '{:.2%}'
        }),
        use_container_width=True
    )
else:
    st.info("No rescued candidates in current time window. Great job optimizing your filters!")

# ----------------------------
# Action Recommendations
# ----------------------------
st.markdown("### 💡 Actionable Recommendations")
st.markdown("""
1. **Expand Keyword Filters**: Replace rigid terms like "KPI" with semantic equivalents:  
   `["Key Performance Indicators", "Success Metrics", "Performance Targets"]`
   
2. **Adjust Age-Sensitive Filters**: Add weight to experience indicators (e.g., "10+ years") to balance against modern jargon.

3. **Enable Semantic Matching**: Activate our NLP engine to auto-suggest alternatives when rejection rates exceed thresholds.

4. **Review Rescued Candidates**: Prioritize profiles with semantic scores >85% that were auto-rejected.
""")

# Footer
st.markdown("---")
st.caption("Fair-Hire Sentinel v1.2 • AI-powered bias detection for equitable hiring • Updated Jan 24, 2026")