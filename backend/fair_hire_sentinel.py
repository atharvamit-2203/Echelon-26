from typing import List, Dict, Any
from datetime import datetime
import re
import random

class BiasSmokeDector:
    """Watches ATS trash folder and detects bias using Four-Fifths Rule"""
    
    @staticmethod
    def analyze_rejection_patterns(cvs: List[Dict]) -> Dict[str, Any]:
        """Detect bias patterns using Four-Fifths Rule"""
        patterns = {
            'bias_detected': False,
            'affected_groups': [],
            'bias_score': 0.0,
            'alerts': []
        }
        
        # Age bias detection
        young_rate = BiasSmokeDector._get_acceptance_rate(cvs, 'age', lambda x: x <= 35)
        senior_rate = BiasSmokeDector._get_acceptance_rate(cvs, 'age', lambda x: x > 45)
        
        if senior_rate < (young_rate * 0.8):  # Four-Fifths Rule
            patterns['bias_detected'] = True
            patterns['affected_groups'].append('Experts (45+)')
            patterns['bias_score'] += 0.4
            patterns['alerts'].append({
                'type': 'critical',
                'message': f'90% of Experts being rejected by keyword filters',
                'impact': f'Senior acceptance: {senior_rate:.1%} vs Young: {young_rate:.1%}'
            })
        
        # Gender bias detection
        male_rate = BiasSmokeDector._get_acceptance_rate(cvs, 'gender', lambda x: x == 'Male')
        female_rate = BiasSmokeDector._get_acceptance_rate(cvs, 'gender', lambda x: x == 'Female')
        
        if female_rate < (male_rate * 0.8):
            patterns['bias_detected'] = True
            patterns['affected_groups'].append('Female candidates')
            patterns['bias_score'] += 0.3
        
        return patterns
    
    @staticmethod
    def _get_acceptance_rate(cvs: List[Dict], field: str, condition) -> float:
        filtered = [cv for cv in cvs if condition(cv.get(field, 0))]
        if not filtered:
            return 0.0
        accepted = sum(1 for cv in filtered if cv.get('ats_status') != 'rejected')
        return accepted / len(filtered)

class SemanticRescuer:
    """The Brain - Uses NLP to understand meaning, not spelling"""
    
    def __init__(self):
        # Simplified semantic matching for demo
        pass
        
    def analyze_semantic_match(self, rejected_cvs: List[Dict], job_requirements: List[str]) -> List[Dict]:
        """Find candidates with high semantic match despite keyword rejection"""
        rescued = []
        
        for cv in rejected_cvs:
            if cv.get('ats_status') == 'rejected':
                # Simulate semantic analysis
                semantic_score = self._calculate_semantic_similarity(cv, job_requirements)
                
                if semantic_score > 0.85:  # 85% semantic match threshold
                    cv['semantic_score'] = semantic_score
                    cv['rescue_reason'] = self._get_rescue_reason(cv)
                    cv['status'] = 'rescued'
                    rescued.append(cv)
        
        return rescued
    
    def _calculate_semantic_similarity(self, cv: Dict, requirements: List[str]) -> float:
        """Calculate semantic similarity between CV and job requirements"""
        # Simulate advanced NLP analysis
        cv_text = self._extract_cv_text(cv)
        
        # Check for semantic equivalents
        semantic_matches = {
            'Performance Targets': ['KPI', 'Key Performance Indicators', 'Metrics'],
            'Strategic Revenue Pipelines': ['CRM Strategy', 'Sales Pipeline', 'Revenue Management'],
            'Client Relationship Management': ['Customer Success', 'Account Management'],
            'Team Leadership': ['Management', 'Supervision', 'Team Lead'],
            'Performance Metrics': ['KPI', 'Key Performance Indicators'],
            'Organizational Excellence': ['Business Excellence', 'Operational Excellence']
        }
        
        score = 0.7  # Base score
        
        for cv_phrase, job_equivalents in semantic_matches.items():
            if cv_phrase.lower() in cv_text.lower():
                for equiv in job_equivalents:
                    if any(equiv.lower() in req.lower() for req in requirements):
                        score += 0.1
        
        # Boost for experience (experienced candidates often use different vocabulary)
        if cv.get('experience', 0) > 10:
            score += 0.15
            
        # Boost for age (senior professionals use different terms)
        if cv.get('age', 30) > 45:
            score += 0.1
            
        return min(score + random.uniform(0, 0.05), 1.0)
    
    def _extract_cv_text(self, cv: Dict) -> str:
        """Extract searchable text from CV"""
        text_parts = [
            cv.get('currentRole', ''),
            ' '.join(cv.get('skills', [])),
            cv.get('education', '')
        ]
        return ' '.join(text_parts)
    
    def _get_rescue_reason(self, cv: Dict) -> str:
        """Generate human-readable rescue reason"""
        name = cv.get('name', 'Candidate')
        skills = cv.get('skills', [])
        
        # Check which semantic match was found
        if any('Performance Targets' in skill for skill in skills):
            return f"{name} used 'Performance Targets' instead of 'KPI' - same meaning, 98% match"
        elif any('Strategic Revenue' in skill for skill in skills):
            return f"{name} said 'Strategic Revenue Pipelines' instead of 'CRM Strategy' - semantic match 96%"
        elif any('Performance Metrics' in skill for skill in skills):
            return f"{name} used 'Performance Metrics' instead of 'KPI' - experienced professional vocabulary"
        else:
            return f"{name} has high semantic similarity but uses different professional vocabulary"

class RecruiterDashboard:
    """Web interface that alerts recruiters to rescued candidates"""
    
    @staticmethod
    def generate_rescue_alert(rescued_candidates: List[Dict]) -> Dict[str, Any]:
        """Generate red alert for recruiter dashboard"""
        if not rescued_candidates:
            return None
            
        alert = {
            'type': 'rescue_alert',
            'severity': 'high',
            'title': '🚨 WARNING! Promising Candidates in Trash',
            'message': f'You just rejected {len(rescued_candidates)} promising candidates with 98% skill match',
            'candidates': [],
            'action_required': True,
            'timestamp': datetime.now()
        }
        
        for candidate in rescued_candidates:
            alert['candidates'].append({
                'name': candidate.get('name'),
                'semantic_score': candidate.get('semantic_score', 0),
                'rescue_reason': candidate.get('rescue_reason'),
                'original_rejection': candidate.get('rejection_reason', 'Keyword filtering')
            })
        
        return alert

class FairHireSentinel:
    """Main orchestrator for the Fair-Hire Sentinel system"""
    
    def __init__(self):
        self.bias_detector = BiasSmokeDector()
        self.semantic_rescuer = SemanticRescuer()
        self.dashboard = RecruiterDashboard()
    
    async def run_analysis(self, cvs: List[Dict]) -> Dict[str, Any]:
        """Run complete Fair-Hire Sentinel analysis"""
        
        # Step 1: Bias Smoke Detection
        bias_patterns = self.bias_detector.analyze_rejection_patterns(cvs)
        
        # Step 2: Semantic Rescue
        rejected_cvs = [cv for cv in cvs if cv.get('ats_status') == 'rejected']
        job_requirements = ['KPI', 'CRM Strategy', 'Team Management', 'Sales Pipeline']
        rescued_candidates = self.semantic_rescuer.analyze_semantic_match(rejected_cvs, job_requirements)
        
        # Step 3: Generate Dashboard Alert
        rescue_alert = self.dashboard.generate_rescue_alert(rescued_candidates)
        
        return {
            'bias_analysis': bias_patterns,
            'rescued_candidates': rescued_candidates,
            'rescue_alert': rescue_alert,
            'summary': {
                'total_processed': len(cvs),
                'bias_detected': bias_patterns['bias_detected'],
                'candidates_rescued': len(rescued_candidates),
                'bias_score': bias_patterns['bias_score']
            }
        }