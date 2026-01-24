"""
Analytics - Deep Dive Analysis
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px

st.set_page_config(page_title="Analytics - Fair-Hire Sentinel", page_icon="📈", layout="wide")

st.markdown("# 📈 Analytics")
st.markdown("Deep dive into bias patterns and trends")

st.markdown("---")

# Time Range
col1, col2 = st.columns([1, 3])
with col1:
    st.selectbox("Analysis Period", ["Last 7 Days", "Last 30 Days", "Last Quarter", "Last Year"])

st.markdown("---")

# Key Insights
st.markdown("### 🔍 Key Insights")

col1, col2 = st.columns(2)

with col1:
    st.info("""
    **Top Finding:** Age bias detected in 4 out of 8 keyword filters
    
    Candidates over 45 are 30% more likely to be filtered out
    """)

with col2:
    st.success("""
    **Improvement:** Rescue rate increased by 15% this month
    
    127 qualified candidates recovered from rejection
    """)

st.markdown("---")

# Trend Analysis
st.markdown("### 📊 Bias Trend Over Time")

dates = pd.date_range(end=pd.Timestamp.now(), periods=30, freq='D')
bias_score = np.random.uniform(0.15, 0.35, 30)

df = pd.DataFrame({'Date': dates, 'Bias Score': bias_score})
fig = px.line(df, x='Date', y='Bias Score', markers=True)
fig.update_layout(height=350)

st.plotly_chart(fig, use_container_width=True)

st.markdown("---")

# Keyword Analysis
st.markdown("### 🔤 Keyword Impact Analysis")

keywords_df = pd.DataFrame({
    'Keyword': ['KPI', 'OKR', 'Synergy', 'Leverage', 'Growth Hacking'],
    'Usage Count': [342, 289, 156, 203, 178],
    'Bias Score': [0.42, 0.38, 0.31, 0.28, 0.25]
})

col1, col2 = st.columns(2)

with col1:
    fig1 = px.bar(keywords_df, x='Keyword', y='Usage Count', color='Bias Score', 
                  color_continuous_scale='RdYlGn_r')
    fig1.update_layout(height=300)
    st.plotly_chart(fig1, use_container_width=True)

with col2:
    fig2 = px.pie(keywords_df, names='Keyword', values='Usage Count')
    fig2.update_layout(height=300)
    st.plotly_chart(fig2, use_container_width=True)
