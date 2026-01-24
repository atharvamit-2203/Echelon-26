"""
Metrics overview component displaying key dashboard statistics
"""

import streamlit as st
from config.settings import AppConfig

def render_metrics_overview(metrics):
    """
    Render the key metrics overview section
    
    Args:
        metrics: Dictionary containing metric values
    """
    
    st.markdown("### 📈 Key Metrics")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown('<div class="metric-card metric-card-info">', unsafe_allow_html=True)
        st.metric(
            "Total Candidates",
            f"{metrics['total_candidates']:,}",
            delta=f"+{metrics.get('candidates_delta', 0)}" if metrics.get('candidates_delta', 0) > 0 else None
        )
        st.markdown('</div>', unsafe_allow_html=True)
    
    with col2:
        st.markdown('<div class="metric-card metric-card-warning">', unsafe_allow_html=True)
        rejection_rate = (metrics['rejected_count'] / metrics['total_candidates'] * 100) if metrics['total_candidates'] > 0 else 0
        st.metric(
            "ATS Rejections",
            f"{metrics['rejected_count']:,}",
            delta=f"{rejection_rate:.1f}% rejection rate",
            delta_color="inverse"
        )
        st.markdown('</div>', unsafe_allow_html=True)
    
    with col3:
        st.markdown('<div class="metric-card metric-card-success">', unsafe_allow_html=True)
        st.metric(
            "High-Potential Rescued",
            f"{metrics['high_potential_rescued']:,}",
            delta=f"+{metrics.get('rescued_delta', 0)}" if metrics.get('rescued_delta', 0) > 0 else None
        )
        st.markdown('</div>', unsafe_allow_html=True)
    
    with col4:
        alert_color = "metric-card-warning" if metrics['active_bias_alerts'] > 0 else "metric-card-success"
        st.markdown(f'<div class="metric-card {alert_color}">', unsafe_allow_html=True)
        st.metric(
            "Active Bias Alerts",
            metrics['active_bias_alerts'],
            delta="⚠️ Requires attention" if metrics['active_bias_alerts'] > 0 else "✅ All clear"
        )
        st.markdown('</div>', unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Additional metrics in expandable section
    with st.expander("📊 Detailed Metrics"):
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Avg Semantic Score", f"{metrics.get('avg_semantic_score', 0):.2%}")
            st.metric("Keywords Monitored", metrics.get('keywords_monitored', 0))
        
        with col2:
            st.metric("Rescued This Week", metrics.get('rescued_weekly', 0))
            st.metric("Bias Incidents Resolved", metrics.get('incidents_resolved', 0))
        
        with col3:
            st.metric("Talent Leakage Prevention", f"{metrics.get('leakage_prevented', 0):.1f}%")
            st.metric("System Accuracy", f"{metrics.get('system_accuracy', 0):.1f}%")
