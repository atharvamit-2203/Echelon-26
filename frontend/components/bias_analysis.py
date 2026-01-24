"""
Bias analysis visualization component
"""

import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
from config.settings import AppConfig

def render_bias_analysis(bias_data, demographic_stats, bias_threshold):
    """
    Render comprehensive bias analysis visualizations
    
    Args:
        bias_data: DataFrame containing bias metrics by keyword
        demographic_stats: Dictionary containing demographic statistics
        bias_threshold: Current bias detection threshold
    """
    
    st.markdown("### 📊 Demographic Disparity Analysis")
    
    # Overview metrics
    col1, col2, col3 = st.columns(3)
    
    with col1:
        max_disparity = demographic_stats.get('max_age_disparity', 0)
        color = "danger" if max_disparity > AppConfig.HIGH_BIAS_THRESHOLD else "warning" if max_disparity > AppConfig.MEDIUM_BIAS_THRESHOLD else "success"
        st.metric(
            "Max Age Disparity",
            f"{max_disparity:.1%}",
            delta=f"{'⚠️ High' if max_disparity > bias_threshold else '✅ Normal'}"
        )
    
    with col2:
        max_gender_disparity = demographic_stats.get('max_gender_disparity', 0)
        st.metric(
            "Max Gender Disparity",
            f"{max_gender_disparity:.1%}",
            delta=f"{'⚠️ High' if max_gender_disparity > bias_threshold else '✅ Normal'}"
        )
    
    with col3:
        st.metric(
            "Biased Keywords",
            demographic_stats.get('biased_keywords_count', 0),
            delta=f"Out of {len(AppConfig.MONITORED_KEYWORDS)} monitored"
        )
    
    st.markdown("---")
    
    # Tabbed visualizations
    tab1, tab2, tab3, tab4 = st.tabs([
        "Age Group Analysis",
        "Gender Analysis",
        "Keyword Impact",
        "Trend Analysis"
    ])
    
    with tab1:
        render_age_analysis(bias_data, bias_threshold)
    
    with tab2:
        render_gender_analysis(bias_data, bias_threshold)
    
    with tab3:
        render_keyword_impact(bias_data, bias_threshold)
    
    with tab4:
        render_trend_analysis(demographic_stats)

def render_age_analysis(bias_data, bias_threshold):
    """Render age group bias analysis"""
    
    st.markdown("#### Age Group Rejection Rates by Keyword")
    
    # Create grouped bar chart
    fig = go.Figure()
    
    fig.add_trace(go.Bar(
        x=bias_data['keyword'],
        y=bias_data['rejection_rate_age_<30'],
        name='Under 30',
        marker_color='#636efa',
        text=bias_data['rejection_rate_age_<30'].apply(lambda x: f'{x:.1%}'),
        textposition='outside'
    ))
    
    fig.add_trace(go.Bar(
        x=bias_data['keyword'],
        y=bias_data['rejection_rate_age_30-45'],
        name='30-45',
        marker_color='#00cc96',
        text=bias_data['rejection_rate_age_30-45'].apply(lambda x: f'{x:.1%}'),
        textposition='outside'
    ))
    
    fig.add_trace(go.Bar(
        x=bias_data['keyword'],
        y=bias_data['rejection_rate_age_>45'],
        name='Over 45',
        marker_color='#ef553b',
        text=bias_data['rejection_rate_age_>45'].apply(lambda x: f'{x:.1%}'),
        textposition='outside'
    ))
    
    # Add threshold line
    fig.add_hline(
        y=bias_threshold,
        line_dash="dash",
        line_color="red",
        annotation_text=f"Bias Threshold ({bias_threshold:.0%})",
        annotation_position="right"
    )
    
    fig.update_layout(
        barmode='group',
        title="Rejection Rates Across Age Groups",
        xaxis_title="Keywords",
        yaxis_title="Rejection Rate",
        yaxis_tickformat='.0%',
        legend_title="Age Group",
        height=500,
        hovermode='x unified'
    )
    
    st.plotly_chart(fig, use_container_width=True)
    
    # Age disparity heatmap
    st.markdown("#### Age Disparity Heatmap")
    
    disparity_data = []
    for _, row in bias_data.iterrows():
        disparity_data.append({
            'Keyword': row['keyword'],
            'Under 30 vs Over 45': abs(row['rejection_rate_age_<30'] - row['rejection_rate_age_>45']),
            '30-45 vs Over 45': abs(row['rejection_rate_age_30-45'] - row['rejection_rate_age_>45'])
        })
    
    import pandas as pd
    disparity_df = pd.DataFrame(disparity_data)
    
    fig_heatmap = px.imshow(
        disparity_df.set_index('Keyword').T,
        labels=dict(x="Keywords", y="Comparison", color="Disparity"),
        color_continuous_scale='Reds',
        text_auto='.1%',
        aspect="auto"
    )
    
    fig_heatmap.update_layout(height=300)
    st.plotly_chart(fig_heatmap, use_container_width=True)

def render_gender_analysis(bias_data, bias_threshold):
    """Render gender bias analysis"""
    
    st.markdown("#### Gender Rejection Rates by Keyword")
    
    fig = go.Figure()
    
    fig.add_trace(go.Bar(
        x=bias_data['keyword'],
        y=bias_data['rejection_rate_male'],
        name='Male',
        marker_color='#00cc96',
        text=bias_data['rejection_rate_male'].apply(lambda x: f'{x:.1%}'),
        textposition='outside'
    ))
    
    fig.add_trace(go.Bar(
        x=bias_data['keyword'],
        y=bias_data['rejection_rate_female'],
        name='Female',
        marker_color='#ab63fa',
        text=bias_data['rejection_rate_female'].apply(lambda x: f'{x:.1%}'),
        textposition='outside'
    ))
    
    fig.add_trace(go.Bar(
        x=bias_data['keyword'],
        y=bias_data['rejection_rate_nonbinary'],
        name='Non-binary',
        marker_color='#ffa15a',
        text=bias_data['rejection_rate_nonbinary'].apply(lambda x: f'{x:.1%}'),
        textposition='outside'
    ))
    
    fig.add_hline(
        y=bias_threshold,
        line_dash="dash",
        line_color="red",
        annotation_text=f"Bias Threshold ({bias_threshold:.0%})"
    )
    
    fig.update_layout(
        barmode='group',
        title="Rejection Rates Across Gender Categories",
        xaxis_title="Keywords",
        yaxis_title="Rejection Rate",
        yaxis_tickformat='.0%',
        legend_title="Gender",
        height=500,
        hovermode='x unified'
    )
    
    st.plotly_chart(fig, use_container_width=True)

def render_keyword_impact(bias_data, bias_threshold):
    """Render keyword impact analysis"""
    
    st.markdown("#### Keyword Impact Score")
    st.caption("Impact score = Average disparity across all demographics")
    
    # Calculate impact scores
    bias_data['impact_score'] = (
        abs(bias_data['rejection_rate_age_<30'] - bias_data['rejection_rate_age_>45']) +
        abs(bias_data['rejection_rate_male'] - bias_data['rejection_rate_female'])
    ) / 2
    
    # Sort by impact score
    bias_data_sorted = bias_data.sort_values('impact_score', ascending=True)
    
    fig = go.Figure(go.Bar(
        x=bias_data_sorted['impact_score'],
        y=bias_data_sorted['keyword'],
        orientation='h',
        marker=dict(
            color=bias_data_sorted['impact_score'],
            colorscale='RdYlGn_r',
            showscale=True,
            colorbar=dict(title="Impact Score")
        ),
        text=bias_data_sorted['impact_score'].apply(lambda x: f'{x:.1%}'),
        textposition='outside'
    ))
    
    fig.add_vline(
        x=bias_threshold,
        line_dash="dash",
        line_color="red",
        annotation_text=f"Threshold ({bias_threshold:.0%})"
    )
    
    fig.update_layout(
        title="Keywords Ranked by Bias Impact",
        xaxis_title="Impact Score",
        yaxis_title="Keyword",
        xaxis_tickformat='.0%',
        height=400
    )
    
    st.plotly_chart(fig, use_container_width=True)
    
    # Top problematic keywords
    st.markdown("#### 🔴 Most Problematic Keywords")
    top_biased = bias_data_sorted.tail(5)
    
    for _, row in top_biased.iterrows():
        with st.container():
            st.markdown(f"""
            <div class="keyword-badge keyword-badge-warning">{row['keyword']}</div>
            <span class="score-high">Impact: {row['impact_score']:.1%}</span>
            """, unsafe_allow_html=True)

def render_trend_analysis(demographic_stats):
    """Render bias trends over time"""
    
    st.markdown("#### Bias Trends Over Time")
    
    # Mock trend data (replace with real time-series data)
    import pandas as pd
    import numpy as np
    
    dates = pd.date_range(end=pd.Timestamp.now(), periods=30, freq='D')
    trend_data = pd.DataFrame({
        'Date': dates,
        'Age Disparity': np.random.uniform(0.15, 0.35, 30),
        'Gender Disparity': np.random.uniform(0.10, 0.30, 30),
        'Overall Bias Score': np.random.uniform(0.12, 0.32, 30)
    })
    
    fig = go.Figure()
    
    fig.add_trace(go.Scatter(
        x=trend_data['Date'],
        y=trend_data['Age Disparity'],
        mode='lines+markers',
        name='Age Disparity',
        line=dict(color='#ef553b', width=2)
    ))
    
    fig.add_trace(go.Scatter(
        x=trend_data['Date'],
        y=trend_data['Gender Disparity'],
        mode='lines+markers',
        name='Gender Disparity',
        line=dict(color='#ab63fa', width=2)
    ))
    
    fig.add_trace(go.Scatter(
        x=trend_data['Date'],
        y=trend_data['Overall Bias Score'],
        mode='lines+markers',
        name='Overall Bias',
        line=dict(color='#ffa15a', width=2)
    ))
    
    fig.update_layout(
        title="30-Day Bias Trend Analysis",
        xaxis_title="Date",
        yaxis_title="Disparity Score",
        yaxis_tickformat='.0%',
        height=400,
        hovermode='x unified'
    )
    
    st.plotly_chart(fig, use_container_width=True)
    
    # Trend insights
    col1, col2 = st.columns(2)
    
    with col1:
        st.metric("7-Day Trend", "↓ 12%", delta="-12% (Improving)")
    
    with col2:
        st.metric("30-Day Avg Bias", f"{demographic_stats.get('avg_bias_30d', 0.23):.1%}")
