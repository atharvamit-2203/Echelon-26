"""
Fair-Hire Sentinel - Home Page
AI-powered monitoring dashboard for detecting ATS biases and rescuing hidden talent
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime

# ----------------------------
# Page Configuration
# ----------------------------
st.set_page_config(
    page_title="Fair-Hire Sentinel",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ----------------------------
# Custom Styling
# ----------------------------
st.markdown("""
<style>
    .main-header {
        font-size: 2.8rem;
        font-weight: 700;
        color: #4a6cf7;
        margin-bottom: 0.3rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }
    
    .main-subheader {
        font-size: 1.2rem;
        color: #6c757d;
        margin-bottom: 2rem;
    }
    
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 1.5rem;
        color: white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .alert-box {
        padding: 1.2rem;
        border-radius: 10px;
        margin: 1rem 0;
    }
    
    .bias-alert {
        background-color: #fff3cd;
        border-left: 5px solid #ffc107;
        color: #856404;
    }
    
    .rescue-alert {
        background-color: #d1ecf1;
        border-left: 5px solid #17a2b8;
        color: #0c5460;
    }
</style>
""", unsafe_allow_html=True)

# ----------------------------
# Mock Data Generator
# ----------------------------
@st.cache_data
def generate_dashboard_data():
    """Generate mock data for the dashboard"""
    np.random.seed(42)
    
    # Candidates
    total_candidates = 250
    candidates = pd.DataFrame({
        'candidate_id': range(1, total_candidates + 1),
        'age_group': np.random.choice(['<30', '30-45', '>45'], total_candidates, p=[0.3, 0.4, 0.3]),
        'gender': np.random.choice(['Male', 'Female', 'Non-binary'], total_candidates, p=[0.45, 0.5, 0.05]),
        'keywords_used': np.random.choice(['KPI', 'OKR', 'CRM Strategy', 'Client Engagement'], total_candidates),
        'rejected_by_ats': np.random.choice([True, False], total_candidates, p=[0.35, 0.65]),
        'semantic_score': np.random.uniform(0.65, 0.98, total_candidates)
    })
    
    # Bias metrics by keyword
    bias_data = pd.DataFrame({
        'keyword': ['KPI', 'OKR', 'CRM Strategy', 'Synergy'],
        'rejection_rate_age_<30': [0.22, 0.25, 0.28, 0.30],
        'rejection_rate_age_30-45': [0.30, 0.32, 0.35, 0.38],
        'rejection_rate_age_>45': [0.52, 0.55, 0.58, 0.62],
        'rejection_rate_male': [0.28, 0.30, 0.32, 0.35],
        'rejection_rate_female': [0.42, 0.45, 0.48, 0.50],
        'rejection_rate_nonbinary': [0.38, 0.40, 0.42, 0.45]
    })
    
    # Rescued candidates
    rescued = candidates[
        (candidates['rejected_by_ats']) & 
        (candidates['semantic_score'] > 0.85) &
        ((candidates['age_group'] == '>45') | (candidates['gender'] == 'Female'))
    ].head(12)
    
    return candidates, bias_data, rescued

# ----------------------------
# Sidebar
# ----------------------------
st.sidebar.markdown("""
    <div style="text-align: center; padding: 1rem 0;">
        <h1 style="color: #4a6cf7; font-size: 1.8rem;">🔍 Fair-Hire Sentinel</h1>
        <p style="color: #6c757d; font-size: 0.9rem;">Bias Detection Dashboard</p>
    </div>
""", unsafe_allow_html=True)

st.sidebar.markdown("---")
st.sidebar.header("🎛️ Controls")

time_window = st.sidebar.selectbox(
    "Time Window",
    ["Last 7 Days", "Last 30 Days", "Last 90 Days"],
    index=1
)

job_role = st.sidebar.selectbox(
    "Job Role",
    ["All Roles", "Sales Manager", "Marketing Lead", "Data Analyst", "Software Engineer"]
)

bias_threshold = st.sidebar.slider(
    "Bias Alert Threshold",
    min_value=0.0,
    max_value=0.5,
    value=0.25,
    step=0.05,
    format="%.2f"
)

st.sidebar.markdown("---")

if st.sidebar.button("🔄 Refresh Data", use_container_width=True):
    st.cache_data.clear()
    st.rerun()

st.sidebar.info(f"""
    **Last Updated:** {datetime.now().strftime('%H:%M:%S')}
    
    **Status:** 🟢 Active
""")

# ----------------------------
# Main Dashboard
# ----------------------------

# Header
st.markdown('<div class="main-header">Fair-Hire Sentinel</div>', unsafe_allow_html=True)
st.markdown('<div class="main-subheader">Real-time AI-powered bias detection & talent rescue system</div>', unsafe_allow_html=True)

# Navigation info
st.info("👈 Use the sidebar to navigate between pages: Dashboard, Analytics, About, and Contact Us")

st.markdown("---")

# Load data
candidates, bias_data, rescued_candidates = generate_dashboard_data()

# Key Metrics
st.markdown("### 📈 Key Metrics")

col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric("Total Candidates", f"{len(candidates):,}")

with col2:
    rejected = candidates['rejected_by_ats'].sum()
    rejection_rate = (rejected / len(candidates) * 100)
    st.metric("ATS Rejections", rejected, delta=f"{rejection_rate:.1f}%", delta_color="inverse")

with col3:
    rescued_count = len(rescued_candidates)
    st.metric("Rescued Candidates", rescued_count, delta="+5 this week")

with col4:
    bias_alerts = len(bias_data[
        (bias_data['rejection_rate_age_>45'] - bias_data['rejection_rate_age_<30']) > bias_threshold
    ])
    st.metric("Active Bias Alerts", bias_alerts, delta="⚠️" if bias_alerts > 0 else "✅")

st.markdown("---")

# Real-time Alerts
st.markdown("### ⚠️ Real-time Alerts")

if bias_alerts > 0:
    st.markdown(f"""
    <div class="alert-box bias-alert">
        <h4 style="margin-top: 0;">🟡 Bias Detected in Keyword Filters</h4>
        <p><strong>{bias_alerts}</strong> keyword(s) show rejection rate disparities exceeding {bias_threshold:.0%} threshold.</p>
        <p><strong>Most Affected:</strong> Candidates over 45 years old</p>
        <p><em>💡 Recommendation: Review "KPI" and "OKR" filters to include semantic equivalents</em></p>
    </div>
    """, unsafe_allow_html=True)

if len(rescued_candidates) > 0:
    st.markdown(f"""
    <div class="alert-box rescue-alert">
        <h4 style="margin-top: 0;">🦸 Talent Rescue Opportunity</h4>
        <p><strong>{len(rescued_candidates)}</strong> high-potential candidates auto-rejected but have >85% semantic match.</p>
        <p><strong>Demographics:</strong> Primarily experienced professionals (45+) and female candidates</p>
        <p><em>✅ Action: Review rescued candidates below</em></p>
    </div>
    """, unsafe_allow_html=True)

st.markdown("---")

# Visualization
st.markdown("### 📊 Bias Analysis Overview")

tab1, tab2 = st.tabs(["Age Group Analysis", "Gender Analysis"])

with tab1:
    fig_age = go.Figure()
    
    fig_age.add_trace(go.Bar(
        x=bias_data['keyword'],
        y=bias_data['rejection_rate_age_<30'],
        name='Under 30',
        marker_color='#636efa',
        text=bias_data['rejection_rate_age_<30'].apply(lambda x: f'{x:.0%}'),
        textposition='outside'
    ))
    
    fig_age.add_trace(go.Bar(
        x=bias_data['keyword'],
        y=bias_data['rejection_rate_age_30-45'],
        name='30-45',
        marker_color='#00cc96',
        text=bias_data['rejection_rate_age_30-45'].apply(lambda x: f'{x:.0%}'),
        textposition='outside'
    ))
    
    fig_age.add_trace(go.Bar(
        x=bias_data['keyword'],
        y=bias_data['rejection_rate_age_>45'],
        name='Over 45',
        marker_color='#ef553b',
        text=bias_data['rejection_rate_age_>45'].apply(lambda x: f'{x:.0%}'),
        textposition='outside'
    ))
    
    fig_age.update_layout(
        barmode='group',
        title="Rejection Rates by Age Group",
        xaxis_title="Keywords",
        yaxis_title="Rejection Rate",
        yaxis_tickformat='.0%',
        height=500
    )
    
    st.plotly_chart(fig_age, use_container_width=True)

with tab2:
    fig_gender = go.Figure()
    
    fig_gender.add_trace(go.Bar(
        x=bias_data['keyword'],
        y=bias_data['rejection_rate_male'],
        name='Male',
        marker_color='#00cc96',
        text=bias_data['rejection_rate_male'].apply(lambda x: f'{x:.0%}'),
        textposition='outside'
    ))
    
    fig_gender.add_trace(go.Bar(
        x=bias_data['keyword'],
        y=bias_data['rejection_rate_female'],
        name='Female',
        marker_color='#ab63fa',
        text=bias_data['rejection_rate_female'].apply(lambda x: f'{x:.0%}'),
        textposition='outside'
    ))
    
    fig_gender.update_layout(
        barmode='group',
        title="Rejection Rates by Gender",
        xaxis_title="Keywords",
        yaxis_title="Rejection Rate",
        yaxis_tickformat='.0%',
        height=500
    )
    
    st.plotly_chart(fig_gender, use_container_width=True)

st.markdown("---")

# Rescued Candidates Preview
st.markdown("### 🦸 Rescued High-Potential Candidates")

if not rescued_candidates.empty:
    st.dataframe(
        rescued_candidates[['candidate_id', 'age_group', 'gender', 'keywords_used', 'semantic_score']]
        .style.format({'semantic_score': '{:.0%}'}),
        use_container_width=True,
        hide_index=True
    )
else:
    st.info("No rescued candidates in the current time window.")

st.markdown("---")

# Quick Recommendations
st.markdown("### 💡 Quick Recommendations")

col1, col2 = st.columns(2)

with col1:
    st.markdown("""
    **Immediate Actions:**
    - ✅ Expand "KPI" filter to include: "Metrics", "Performance Indicators", "Success Measures"
    - ✅ Review 12 rescued candidates with >85% semantic match
    - ✅ Adjust age-sensitive keyword filters
    """)

with col2:
    st.markdown("""
    **System Improvements:**
    - 🔧 Enable semantic matching for all keyword filters
    - 🔧 Add experience-weight balancing
    - 🔧 Schedule bias audit for next quarter
    """)

# Footer
st.markdown("---")
st.caption("Fair-Hire Sentinel v2.0 • AI-powered bias detection for equitable hiring • Updated Jan 24, 2026")
