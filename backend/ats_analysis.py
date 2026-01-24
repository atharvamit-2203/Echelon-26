import random
import time
from datetime import datetime
from typing import List, Dict, Any
from firebase_service import FirebaseService
from company_ats_criteria import CompanyATSCriteria
import asyncio

class ATSAnalysisService:
    
    @staticmethod
    def simulate_ats_screening(cvs: List[Dict]) -> Dict[str, Any]:
        """Simulate ATS screening using pre-assigned managers and jobs"""
        results = {
            'processed': 0,
            'accepted': 0,
            'rejected': 0,
            'bias_detected': False,
            'rescued_candidates': [],
            'rejection_patterns': {},
            'manager_results': {}
        }
        
        for cv in cvs:
            results['processed'] += 1
            
            # Use pre-assigned manager and job
            assigned_manager = cv.get('assigned_to', 'unknown')
            job_id = cv.get('job_applied', 'unknown')
            
            # Get company from manager email
            company = assigned_manager.split('@')[1].split('.')[0] if '@' in assigned_manager else 'unknown'
            company_map = {
                'tcs': 'Tata Consultancy Services',
                'infosys': 'Infosys', 
                'hdfcbank': 'HDFC Bank',
                'wipro': 'Wipro',
                'ril': 'Reliance Industries'
            }
            company_name = company_map.get(company, company)
            
            # Evaluate using company criteria
            evaluation = CompanyATSCriteria.evaluate_candidate_for_company(cv, company_name)
            cv['evaluation_score'] = evaluation['score']
            cv['evaluation_reasons'] = evaluation['reasons']
            cv['assigned_company'] = company_name
            
            # Use existing status or determine new one
            if cv.get('status') in ['rejected', 'shortlisted', 'rescued']:
                # Keep existing status
                if cv['status'] == 'rejected':
                    results['rejected'] += 1
                    cv['ats_status'] = 'rejected'
                else:
                    results['accepted'] += 1
                    cv['ats_status'] = 'accepted'
            else:
                # Determine new status based on evaluation
                threshold = 0.6
                if evaluation['score'] < threshold:
                    results['rejected'] += 1
                    cv['ats_status'] = 'rejected'
                    cv['rejection_reason'] = '; '.join(evaluation['reasons'][:2])
                else:
                    results['accepted'] += 1
                    cv['ats_status'] = 'accepted'
            
            # Track manager-specific results
            if assigned_manager not in results['manager_results']:
                results['manager_results'][assigned_manager] = {'total': 0, 'accepted': 0, 'rejected': 0}
            
            results['manager_results'][assigned_manager]['total'] += 1
            if cv['ats_status'] == 'accepted':
                results['manager_results'][assigned_manager]['accepted'] += 1
            else:
                results['manager_results'][assigned_manager]['rejected'] += 1
        
        return results
    
    @staticmethod
    def _calculate_rejection_probability(cv: Dict) -> float:
        """Calculate rejection probability based on biased criteria"""
        base_prob = 0.3
        
        # Age bias
        if cv.get('age', 30) > 45:
            base_prob += 0.4
        
        # Gender bias
        if cv.get('gender') == 'Female':
            base_prob += 0.2
        
        # Keyword bias
        skills = cv.get('skills', [])
        if not any(keyword in str(skills) for keyword in ['Java', 'Python', 'AWS']):
            base_prob += 0.3
            
        return min(base_prob, 0.9)
    
    @staticmethod
    def _get_rejection_reason(cv: Dict) -> str:
        """Generate rejection reason"""
        reasons = [
            'Skills mismatch',
            'Experience requirements not met',
            'Keyword filtering',
            'Automated screening criteria'
        ]
        return random.choice(reasons)
    
    @staticmethod
    def detect_bias_patterns(cvs: List[Dict]) -> Dict[str, Any]:
        """Detect bias patterns using Four-Fifths Rule across companies"""
        patterns = {
            'age_bias': False,
            'gender_bias': False,
            'keyword_bias': False,
            'company_bias': {},
            'bias_score': 0.0,
            'affected_groups': []
        }
        
        # Overall bias detection
        young_acceptance = ATSAnalysisService._calculate_acceptance_rate(cvs, 'age', lambda x: x <= 35)
        old_acceptance = ATSAnalysisService._calculate_acceptance_rate(cvs, 'age', lambda x: x > 45)
        
        if old_acceptance < (young_acceptance * 0.8):  # Four-Fifths Rule
            patterns['age_bias'] = True
            patterns['affected_groups'].append('Candidates over 45')
            patterns['bias_score'] += 0.3
        
        # Gender bias detection
        male_acceptance = ATSAnalysisService._calculate_acceptance_rate(cvs, 'gender', lambda x: x == 'Male')
        female_acceptance = ATSAnalysisService._calculate_acceptance_rate(cvs, 'gender', lambda x: x == 'Female')
        
        if female_acceptance < (male_acceptance * 0.8):
            patterns['gender_bias'] = True
            patterns['affected_groups'].append('Female candidates')
            patterns['bias_score'] += 0.25
        
        # Company-specific bias analysis
        companies = set(cv.get('assigned_company') for cv in cvs if cv.get('assigned_company'))
        for company in companies:
            company_cvs = [cv for cv in cvs if cv.get('assigned_company') == company]
            if len(company_cvs) < 3:  # Skip if too few samples
                continue
                
            company_young = ATSAnalysisService._calculate_acceptance_rate(company_cvs, 'age', lambda x: x <= 35)
            company_old = ATSAnalysisService._calculate_acceptance_rate(company_cvs, 'age', lambda x: x > 45)
            
            if company_old < (company_young * 0.8):
                patterns['company_bias'][company] = {
                    'type': 'age_discrimination',
                    'young_acceptance': company_young,
                    'old_acceptance': company_old,
                    'severity': 'high' if company_old < (company_young * 0.6) else 'medium'
                }
        
        return patterns
    
    @staticmethod
    def _calculate_acceptance_rate(cvs: List[Dict], field: str, condition) -> float:
        """Calculate acceptance rate for a specific condition"""
        filtered_cvs = [cv for cv in cvs if condition(cv.get(field))]
        if not filtered_cvs:
            return 0.0
        
        accepted = sum(1 for cv in filtered_cvs if cv.get('ats_status') == 'accepted')
        return accepted / len(filtered_cvs)
    
    @staticmethod
    def semantic_analysis(rejected_cvs: List[Dict]) -> List[Dict]:
        """Perform semantic analysis to find qualified rejected candidates"""
        rescued = []
        
        for cv in rejected_cvs:
            if cv.get('ats_status') == 'rejected':
                # Simulate semantic similarity scoring
                semantic_score = ATSAnalysisService._calculate_semantic_score(cv)
                
                if semantic_score > 0.85:  # High similarity threshold
                    cv['semantic_score'] = semantic_score
                    cv['status'] = 'rescued'
                    cv['rescue_reason'] = 'High semantic similarity detected'
                    rescued.append(cv)
        
        return rescued
    
    @staticmethod
    def _calculate_semantic_score(cv: Dict) -> float:
        """Calculate semantic similarity score"""
        base_score = 0.7
        
        # Boost score for experience
        experience = cv.get('experience', 0)
        if experience > 5:
            base_score += 0.1
        
        # Boost for relevant skills (semantic matching)
        skills = cv.get('skills', [])
        relevant_skills = ['Management', 'Leadership', 'Strategy', 'Analysis']
        if any(skill in str(skills) for skill in relevant_skills):
            base_score += 0.15
        
        return min(base_score + random.uniform(0, 0.2), 1.0)
    
    @staticmethod
    async def run_batch_analysis() -> Dict[str, Any]:
        """Run complete batch analysis process"""
        print("Starting batch analysis...")
        
        # Step 0: Get existing job postings (no need to create)
        print("Using existing job postings...")
        
        # Get CVs from Firebase
        cvs = FirebaseService.get_cvs()
        if not cvs:
            return {"error": "No CVs found for analysis"}
        
        # Step 1: ATS Screening
        print("Running ATS screening...")
        ats_results = ATSAnalysisService.simulate_ats_screening(cvs)
        await asyncio.sleep(2)  # Simulate processing time
        
        # Step 2: Bias Detection
        print("Detecting bias patterns...")
        bias_patterns = ATSAnalysisService.detect_bias_patterns(cvs)
        await asyncio.sleep(1)
        
        # Step 3: Semantic Analysis & Rescue
        print("Running semantic analysis...")
        rejected_cvs = [cv for cv in cvs if cv.get('ats_status') == 'rejected']
        rescued_candidates = ATSAnalysisService.semantic_analysis(rejected_cvs)
        await asyncio.sleep(2)
        
        # Step 4: Update Firebase with results
        print("Updating database...")
        ATSAnalysisService._update_analysis_results(ats_results, bias_patterns, rescued_candidates)
        
        return {
            'status': 'completed',
            'ats_results': ats_results,
            'bias_patterns': bias_patterns,
            'rescued_count': len(rescued_candidates),
            'timestamp': datetime.now().isoformat()
        }
    
    @staticmethod
    def _update_analysis_results(ats_results: Dict, bias_patterns: Dict, rescued: List[Dict]):
        """Update Firebase with analysis results"""
        
        # Update metrics
        FirebaseService.db.collection('metrics').document('dashboard').update({
            'totalCandidates': {'value': ats_results['processed'], 'delta': '+12'},
            'atsRejections': {'value': ats_results['rejected'], 'delta': f"{ats_results['rejected']/ats_results['processed']*100:.0f}%", 'trend': 'down'},
            'rescuedCandidates': {'value': len(rescued), 'delta': f"+{len(rescued)}"},
            'activeBiasAlerts': {'value': len(bias_patterns['affected_groups']), 'delta': '⚠️'},
            'lastUpdated': datetime.now()
        })
        
        # Add new alerts if bias detected
        if bias_patterns['bias_score'] > 0.2:
            alert = {
                'type': 'critical',
                'title': '🚨 Significant Bias Detected',
                'description': f'Bias score: {bias_patterns["bias_score"]:.2f}. Multiple discrimination patterns found.',
                'affected': ', '.join(bias_patterns['affected_groups']),
                'recommendation': 'Immediate review of screening criteria required',
                'timestamp': datetime.now(),
                'active': True
            }
            FirebaseService.db.collection('alerts').add(alert)
        
        # Update rescued candidates
        for candidate in rescued:
            candidate['rescuedAt'] = datetime.now()
            FirebaseService.db.collection('rescued_candidates').add(candidate)