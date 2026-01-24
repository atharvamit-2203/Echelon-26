"""
Session state management for the application
"""

import streamlit as st
from config.settings import AppConfig

def initialize_session_state():
    """Initialize session state variables if they don't exist"""
    
    # Filter settings
    if 'time_window' not in st.session_state:
        st.session_state.time_window = AppConfig.DEFAULT_TIME_WINDOW
    
    if 'job_role' not in st.session_state:
        st.session_state.job_role = AppConfig.DEFAULT_JOB_ROLE
    
    if 'bias_threshold' not in st.session_state:
        st.session_state.bias_threshold = AppConfig.DEFAULT_BIAS_THRESHOLD
    
    if 'semantic_threshold' not in st.session_state:
        st.session_state.semantic_threshold = AppConfig.DEFAULT_SEMANTIC_THRESHOLD
    
    # View preferences
    if 'show_rescued_only' not in st.session_state:
        st.session_state.show_rescued_only = False
    
    if 'selected_demographics' not in st.session_state:
        st.session_state.selected_demographics = ['age', 'gender']
    
    # Alert preferences
    if 'alert_notifications' not in st.session_state:
        st.session_state.alert_notifications = True
    
    if 'auto_refresh' not in st.session_state:
        st.session_state.auto_refresh = False
    
    # Data cache timestamp
    if 'last_refresh' not in st.session_state:
        from datetime import datetime
        st.session_state.last_refresh = datetime.now()

def reset_filters():
    """Reset all filters to default values"""
    st.session_state.time_window = AppConfig.DEFAULT_TIME_WINDOW
    st.session_state.job_role = AppConfig.DEFAULT_JOB_ROLE
    st.session_state.bias_threshold = AppConfig.DEFAULT_BIAS_THRESHOLD
    st.session_state.semantic_threshold = AppConfig.DEFAULT_SEMANTIC_THRESHOLD
    st.rerun()
