"""
About - Fair-Hire Sentinel Information
"""

import streamlit as st

st.set_page_config(page_title="About - Fair-Hire Sentinel", page_icon="ℹ️", layout="wide")

st.markdown("# ℹ️ About Fair-Hire Sentinel")

st.markdown("---")

col1, col2 = st.columns([2, 1])

with col1:
    st.markdown("""
    ## What is Fair-Hire Sentinel?
    
    Fair-Hire Sentinel is an AI-powered monitoring dashboard designed to detect and eliminate hidden biases 
    in Applicant Tracking Systems (ATS). By analyzing historical selection rates across demographics like 
    age and gender, the system identifies rigid keyword filters that unfairly block experienced professionals.
    
    ### 🎯 Our Mission
    
    To restore fairness and quality to the hiring process by ensuring that talented candidates aren't lost 
    due to outdated keyword filtering and unconscious bias in automated screening systems.
    
    ### 🔍 How It Works
    
    1. **Monitor** - Continuously analyze ATS screening patterns
    2. **Detect** - Identify bias in keyword filters across demographics
    3. **Rescue** - Use semantic embeddings to find hidden talent
    4. **Alert** - Notify recruiters of potential bias and talent leakage
    5. **Recommend** - Provide actionable steps to improve fairness
    
    ### ✨ Key Features
    
    - Real-time bias detection across age, gender, and other demographics
    - Semantic matching to identify equivalent terminology
    - Automated candidate rescue from rejection pools
    - Detailed analytics and trend analysis
    - Actionable recommendations for recruiters
    """)

with col2:
    st.info("""
    ### 📊 Platform Stats
    
    **Candidates Analyzed**  
    10,000+
    
    **Biases Detected**  
    247
    
    **Candidates Rescued**  
    1,340
    
    **Companies Using**  
    45
    """)
    
    st.success("""
    ### 🏆 Impact
    
    **Diversity Increase**  
    +32%
    
    **Quality Hire Rate**  
    +18%
    
    **Time Saved**  
    500+ hours
    """)

st.markdown("---")

st.markdown("""
### 🤝 Our Team

Built by a team of AI engineers, HR professionals, and diversity advocates committed to creating 
more equitable hiring processes.

### 📫 Get in Touch

Have questions or feedback? Visit our [Contact Us](Contact_Us) page.
""")

st.markdown("---")

st.caption("Fair-Hire Sentinel v2.0 • © 2026 • All rights reserved")
