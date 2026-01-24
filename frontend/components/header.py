"""
Header component for the dashboard
"""

import streamlit as st

def render_header():
    """Render the main dashboard header"""
    
    st.markdown("""
        <div class="main-header">Fair-Hire Sentinel</div>
        <div class="main-subheader">
            Real-time AI-powered bias detection & talent rescue system for equitable hiring
        </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
