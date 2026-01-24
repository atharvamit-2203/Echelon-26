"""
Sidebar component with filters and controls
"""

import streamlit as st
from config.settings import AppConfig
from utils.session_state import reset_filters
from datetime import datetime

def render_sidebar():
    """Render the sidebar with filters and controls"""
    
    # Logo/Header
    st.sidebar.markdown(f"""
        <div style="text-align: center; padding: 1rem 0;">
            <h1 style="color: {AppConfig.PRIMARY_COLOR}; font-size: 1.8rem; margin: 0;">
                {AppConfig.APP_ICON} Fair-Hire Sentinel
            </h1>
            <p style="color: {AppConfig.SECONDARY_COLOR}; font-size: 0.9rem; margin-top: 0.5rem;">
                Bias Detection Dashboard
            </p>
        </div>
    """, unsafe_allow_html=True)
    
    st.sidebar.markdown("---")
    
    # Dashboard Controls
    st.sidebar.header("🎛️ Dashboard Controls")
    
    # Time window selection
    time_window = st.sidebar.selectbox(
        "Time Window",
        AppConfig.TIME_WINDOWS,
        index=AppConfig.TIME_WINDOWS.index(AppConfig.DEFAULT_TIME_WINDOW),
        help="Select the time period for analysis"
    )
    
    # Job role filter
    job_role = st.sidebar.selectbox(
        "Job Role",
        AppConfig.JOB_ROLES,
        help="Filter candidates by job role"
    )
    
    st.sidebar.markdown("---")
    
    # Threshold Controls
    st.sidebar.header("⚙️ Detection Settings")
    
    bias_threshold = st.sidebar.slider(
        "Bias Alert Threshold",
        min_value=0.0,
        max_value=1.0,
        value=AppConfig.DEFAULT_BIAS_THRESHOLD,
        step=0.05,
        help="Minimum difference in rejection rates to trigger bias alert",
        format="%.2f"
    )
    
    semantic_threshold = st.sidebar.slider(
        "Semantic Match Threshold",
        min_value=0.5,
        max_value=1.0,
        value=AppConfig.DEFAULT_SEMANTIC_THRESHOLD,
        step=0.05,
        help="Minimum semantic similarity score to rescue candidates",
        format="%.2f"
    )
    
    st.sidebar.markdown("---")
    
    # View Options
    st.sidebar.header("👁️ View Options")
    
    show_rescued_only = st.sidebar.checkbox(
        "Show Rescued Candidates Only",
        value=False,
        help="Display only candidates rescued from ATS rejection"
    )
    
    selected_demographics = st.sidebar.multiselect(
        "Demographic Analysis",
        ["Age", "Gender", "Ethnicity", "Education"],
        default=["Age", "Gender"],
        help="Select demographics to analyze for bias"
    )
    
    st.sidebar.markdown("---")
    
    # Notification Settings
    st.sidebar.header("🔔 Notifications")
    
    alert_notifications = st.sidebar.checkbox(
        "Enable Alert Notifications",
        value=True,
        help="Show real-time alerts for bias detection"
    )
    
    auto_refresh = st.sidebar.checkbox(
        "Auto-refresh (Every 5 min)",
        value=False,
        help="Automatically refresh dashboard data"
    )
    
    st.sidebar.markdown("---")
    
    # Action Buttons
    col1, col2 = st.sidebar.columns(2)
    
    with col1:
        if st.button("🔄 Refresh", use_container_width=True):
            st.session_state.last_refresh = datetime.now()
            st.rerun()
    
    with col2:
        if st.button("↺ Reset", use_container_width=True):
            reset_filters()
    
    # Export Options
    st.sidebar.markdown("---")
    st.sidebar.header("📥 Export")
    
    col1, col2 = st.sidebar.columns(2)
    with col1:
        st.button("📊 Export CSV", use_container_width=True)
    with col2:
        st.button("📄 Export PDF", use_container_width=True)
    
    # Info section
    st.sidebar.markdown("---")
    st.sidebar.info(f"""
        **Last Updated:** {st.session_state.last_refresh.strftime('%H:%M:%S')}
        
        **Status:** 🟢 Active Monitoring
    """)
    
    # Return filter values
    return {
        'time_window': time_window,
        'job_role': job_role,
        'bias_threshold': bias_threshold,
        'semantic_threshold': semantic_threshold,
        'show_rescued_only': show_rescued_only,
        'selected_demographics': selected_demographics,
        'alert_notifications': alert_notifications,
        'auto_refresh': auto_refresh
    }
