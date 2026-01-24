"""
Alert notification component for real-time bias detection
"""

import streamlit as st
from config.settings import AppConfig

def render_alerts(alerts, bias_threshold):
    """
    Render real-time alert notifications
    
    Args:
        alerts: Dictionary containing alert data
        bias_threshold: Current bias detection threshold
    """
    
    st.markdown("### ⚠️ Real-time Alerts")
    
    if not alerts['bias_alerts'] and not alerts['rescue_alerts'] and not alerts['critical_alerts']:
        st.success("✅ No active alerts. All systems operating within normal parameters.")
        return
    
    # Critical Alerts (highest priority)
    if alerts['critical_alerts']:
        for alert in alerts['critical_alerts']:
            st.markdown(f"""
            <div class="alert-box danger-alert">
                <h4 style="margin-top: 0;">🚨 CRITICAL: {alert['title']}</h4>
                <p>{alert['message']}</p>
                <p><strong>Impact:</strong> {alert['impact']}</p>
                <p><em>Action Required: {alert['action']}</em></p>
            </div>
            """, unsafe_allow_html=True)
    
    # Bias Detection Alerts
    if alerts['bias_alerts']:
        for alert in alerts['bias_alerts']:
            severity_icon = "🔴" if alert['severity'] == 'high' else "🟡"
            st.markdown(f"""
            <div class="alert-box bias-alert">
                <h4 style="margin-top: 0;">{severity_icon} Bias Detected: {alert['keyword']}</h4>
                <p><strong>Issue:</strong> {alert['description']}</p>
                <ul>
                    <li>Age Disparity: {alert['age_disparity']:.1%} ({alert['affected_group_age']})</li>
                    <li>Gender Disparity: {alert['gender_disparity']:.1%} ({alert['affected_group_gender']})</li>
                </ul>
                <p><em>💡 Recommendation: {alert['recommendation']}</em></p>
            </div>
            """, unsafe_allow_html=True)
    
    # Rescue Opportunity Alerts
    if alerts['rescue_alerts']:
        for alert in alerts['rescue_alerts']:
            st.markdown(f"""
            <div class="alert-box rescue-alert">
                <h4 style="margin-top: 0;">🦸 Talent Rescue Opportunity</h4>
                <p><strong>{alert['count']}</strong> high-potential candidates were auto-rejected but show strong semantic matches (>{alert['threshold']:.0%} similarity).</p>
                <p><strong>Demographics:</strong> {alert['demographics']}</p>
                <p><strong>Potential Value:</strong> {alert['potential_value']}</p>
                <p><em>✅ Action: Review rescued candidates in the dedicated tab below.</em></p>
            </div>
            """, unsafe_allow_html=True)
    
    # Alert Summary
    total_alerts = len(alerts.get('bias_alerts', [])) + len(alerts.get('rescue_alerts', [])) + len(alerts.get('critical_alerts', []))
    
    if total_alerts > 0:
        st.info(f"📌 **Alert Summary:** {total_alerts} active alert(s) requiring attention. Threshold: {bias_threshold:.0%}")
