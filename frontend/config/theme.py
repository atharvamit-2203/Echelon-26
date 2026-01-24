"""
Custom theme and styling for the application
"""

import streamlit as st
from config.settings import AppConfig

def apply_custom_theme():
    """Apply custom CSS styling to the Streamlit app"""
    
    st.markdown(f"""
    <style>
        /* Root variables */
        :root {{
            --primary: {AppConfig.PRIMARY_COLOR};
            --secondary: {AppConfig.SECONDARY_COLOR};
            --success: {AppConfig.SUCCESS_COLOR};
            --warning: {AppConfig.WARNING_COLOR};
            --danger: {AppConfig.DANGER_COLOR};
            --info: {AppConfig.INFO_COLOR};
        }}
        
        /* Main header styling */
        .main-header {{
            font-size: 2.8rem;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 0.3rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }}
        
        .main-subheader {{
            font-size: 1.2rem;
            color: var(--secondary);
            margin-bottom: 2rem;
            font-weight: 400;
        }}
        
        /* Metric cards */
        .metric-card {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: transform 0.2s;
            color: white;
        }}
        
        .metric-card:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }}
        
        .metric-card-warning {{
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }}
        
        .metric-card-success {{
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }}
        
        .metric-card-info {{
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }}
        
        /* Alert boxes */
        .alert-box {{
            padding: 1.2rem;
            border-radius: 10px;
            margin: 1rem 0;
            animation: slideIn 0.3s ease-out;
        }}
        
        @keyframes slideIn {{
            from {{
                opacity: 0;
                transform: translateX(-20px);
            }}
            to {{
                opacity: 1;
                transform: translateX(0);
            }}
        }}
        
        .bias-alert {{
            background-color: #fff3cd;
            border-left: 5px solid var(--warning);
            color: #856404;
        }}
        
        .rescue-alert {{
            background-color: #d1ecf1;
            border-left: 5px solid var(--info);
            color: #0c5460;
        }}
        
        .danger-alert {{
            background-color: #f8d7da;
            border-left: 5px solid var(--danger);
            color: #721c24;
        }}
        
        .success-alert {{
            background-color: #d4edda;
            border-left: 5px solid var(--success);
            color: #155724;
        }}
        
        /* Section headers */
        .section-header {{
            font-size: 1.8rem;
            font-weight: 600;
            color: var(--primary);
            margin-top: 2rem;
            margin-bottom: 1rem;
            border-bottom: 2px solid var(--primary);
            padding-bottom: 0.5rem;
        }}
        
        /* Candidate cards */
        .candidate-card {{
            background-color: #ffffff;
            border-radius: 10px;
            padding: 1.2rem;
            margin: 0.8rem 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-left: 4px solid var(--success);
        }}
        
        .candidate-card:hover {{
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }}
        
        /* Recommendation cards */
        .recommendation-card {{
            background-color: #f8f9fa;
            border-radius: 10px;
            padding: 1.2rem;
            margin: 1rem 0;
            border-left: 4px solid var(--info);
        }}
        
        .recommendation-priority-high {{
            border-left-color: var(--danger);
            background-color: #fff5f5;
        }}
        
        .recommendation-priority-medium {{
            border-left-color: var(--warning);
            background-color: #fffbf0;
        }}
        
        /* Keyword badges */
        .keyword-badge {{
            display: inline-block;
            background-color: var(--primary);
            color: white;
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            margin: 0.2rem;
            font-size: 0.85rem;
            font-weight: 500;
        }}
        
        .keyword-badge-warning {{
            background-color: var(--warning);
            color: #333;
        }}
        
        /* Score indicators */
        .score-high {{
            color: var(--success);
            font-weight: 700;
        }}
        
        .score-medium {{
            color: var(--warning);
            font-weight: 700;
        }}
        
        .score-low {{
            color: var(--danger);
            font-weight: 700;
        }}
        
        /* Sidebar styling */
        .sidebar .sidebar-content {{
            background-color: #f8f9fa;
        }}
        
        /* Table styling */
        .dataframe {{
            border-radius: 8px;
            overflow: hidden;
        }}
        
        /* Button styling */
        .stButton > button {{
            background-color: var(--primary);
            color: white;
            border-radius: 8px;
            padding: 0.5rem 2rem;
            border: none;
            font-weight: 600;
            transition: all 0.3s;
        }}
        
        .stButton > button:hover {{
            background-color: #3651c7;
            transform: scale(1.05);
        }}
        
        /* Progress bar */
        .stProgress > div > div > div > div {{
            background-color: var(--primary);
        }}
    </style>
    """, unsafe_allow_html=True)
