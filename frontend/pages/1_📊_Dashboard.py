"""
Dashboard - Detailed Monitoring View
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from datetime import datetime

st.set_page_config(page_title="Dashboard - Fair-Hire Sentinel", page_icon="📊", layout="wide")

st.markdown("# 📊 Monitoring Dashboard")
st.markdown("Real-time monitoring of ATS screening processes")

st.markdown("---")

# Filters
col1, col2, col3 = st.columns(3)
with col1:
    st.selectbox("Department", ["All", "Sales", "Engineering", "Marketing"])
with col2:
    st.selectbox("Status", ["All", "Active", "Flagged", "Resolved"])
with col3:
    st.date_input("Date Range", datetime.now())

st.markdown("---")

# Live Stats
col1, col2, col3, col4 = st.columns(4)
col1.metric("Candidates Screened Today", "47", "+12")
col2.metric("Bias Alerts", "3", "-1")
col3.metric("Rescue Rate", "8.5%", "+2.3%")
col4.metric("System Health", "98%", "")

st.markdown("---")

# Activity Feed
st.markdown("### 📋 Recent Activity")

activities = pd.DataFrame({
    'Time': ['10:45 AM', '10:32 AM', '10:15 AM', '9:58 AM'],
    'Event': ['Bias Alert', 'Candidate Rescued', 'Screening Complete', 'Bias Alert'],
    'Details': ['Age bias detected in "KPI" filter', 'Sarah Chen (ID: 1847) rescued', 'Batch #234 processed', 'Gender bias in "Leadership" keyword']
})

st.dataframe(activities, use_container_width=True, hide_index=True)

st.markdown("---")

# Live Chart
st.markdown("### 📈 Live Screening Activity")

hours = [f"{h}:00" for h in range(9, 17)]
screened = np.random.randint(5, 20, len(hours))
rescued = np.random.randint(0, 5, len(hours))

fig = go.Figure()
fig.add_trace(go.Bar(name='Screened', x=hours, y=screened, marker_color='#4a6cf7'))
fig.add_trace(go.Bar(name='Rescued', x=hours, y=rescued, marker_color='#28a745'))
fig.update_layout(barmode='group', height=350)

st.plotly_chart(fig, use_container_width=True)
