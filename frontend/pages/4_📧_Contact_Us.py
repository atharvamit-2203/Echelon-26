"""
Contact Us - Get in Touch
"""

import streamlit as st

st.set_page_config(page_title="Contact Us - Fair-Hire Sentinel", page_icon="📧", layout="wide")

st.markdown("# 📧 Contact Us")
st.markdown("We'd love to hear from you!")

st.markdown("---")

col1, col2 = st.columns([2, 1])

with col1:
    st.markdown("### Send us a message")
    
    with st.form("contact_form"):
        name = st.text_input("Name *")
        email = st.text_input("Email *")
        company = st.text_input("Company")
        
        subject = st.selectbox(
            "Subject *",
            ["General Inquiry", "Technical Support", "Partnership Opportunity", "Feature Request", "Bug Report"]
        )
        
        message = st.text_area("Message *", height=150)
        
        submitted = st.form_submit_button("Send Message")
        
        if submitted:
            if name and email and message:
                st.success("✅ Thank you! Your message has been sent. We'll get back to you within 24 hours.")
            else:
                st.error("⚠️ Please fill in all required fields (*)")

with col2:
    st.markdown("### 📍 Get in Touch")
    
    st.markdown("""
    **Email**  
    support@fairhire-sentinel.com
    
    **Phone**  
    +1 (555) 123-4567
    
    **Address**  
    123 Tech Street  
    San Francisco, CA 94102  
    United States
    
    **Business Hours**  
    Monday - Friday  
    9:00 AM - 6:00 PM PST
    """)
    
    st.markdown("---")
    
    st.markdown("### 🔗 Connect With Us")
    
    col_a, col_b, col_c = st.columns(3)
    col_a.button("LinkedIn", use_container_width=True)
    col_b.button("Twitter", use_container_width=True)
    col_c.button("GitHub", use_container_width=True)

st.markdown("---")

# FAQ Section
st.markdown("### ❓ Frequently Asked Questions")

with st.expander("How does Fair-Hire Sentinel work?"):
    st.write("Fair-Hire Sentinel uses AI and semantic analysis to monitor ATS systems for bias patterns in real-time.")

with st.expander("Is my data secure?"):
    st.write("Yes, we use enterprise-grade encryption and comply with GDPR, CCPA, and other data protection regulations.")

with st.expander("Can I integrate this with my existing ATS?"):
    st.write("Yes! We offer integrations with major ATS platforms including Workday, Greenhouse, Lever, and more.")

with st.expander("How much does it cost?"):
    st.write("We offer flexible pricing plans based on company size and needs. Contact us for a custom quote.")

st.markdown("---")

st.caption("Fair-Hire Sentinel • support@fairhire-sentinel.com")
