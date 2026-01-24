"""
Application configuration settings
"""

from datetime import datetime

class AppConfig:
    """Main application configuration"""
    
    # App metadata
    APP_TITLE = "Fair-Hire Sentinel"
    APP_ICON = "🔍"
    VERSION = "2.0"
    LAST_UPDATED = datetime.now().strftime("%b %d, %Y")
    
    # UI Configuration
    DEFAULT_TIME_WINDOW = "Last 30 Days"
    DEFAULT_JOB_ROLE = "All Roles"
    DEFAULT_BIAS_THRESHOLD = 0.25
    DEFAULT_SEMANTIC_THRESHOLD = 0.85
    
    # Color scheme
    PRIMARY_COLOR = "#4a6cf7"
    SECONDARY_COLOR = "#6c757d"
    SUCCESS_COLOR = "#28a745"
    WARNING_COLOR = "#ffc107"
    DANGER_COLOR = "#dc3545"
    INFO_COLOR = "#17a2b8"
    
    # Alert thresholds
    HIGH_BIAS_THRESHOLD = 0.35
    MEDIUM_BIAS_THRESHOLD = 0.20
    SEMANTIC_RESCUE_THRESHOLD = 0.85
    
    # Data configuration
    TIME_WINDOWS = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "Last 6 Months"]
    JOB_ROLES = [
        "All Roles",
        "Sales Manager",
        "Marketing Lead",
        "Data Analyst",
        "Software Engineer",
        "Product Manager",
        "HR Specialist"
    ]
    
    # Demographic categories
    AGE_GROUPS = ["<30", "30-45", ">45"]
    GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Other", "Prefer not to say"]
    
    # Keywords and terminology
    MONITORED_KEYWORDS = [
        "KPI", "OKR", "Metrics", "Dashboard", "Analytics",
        "CRM Strategy", "Client Engagement", "Relationship Mgmt",
        "Synergy", "Leverage", "Stakeholder", "Value-add",
        "Growth Hacking", "Agile", "Scrum", "Sprint"
    ]
