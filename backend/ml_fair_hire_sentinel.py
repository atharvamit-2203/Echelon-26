import os
import google.generativeai as genai
from datetime import datetime
from typing import List, Dict
import json

class FairHireSentinel:
    def __init__(self, api_key: str = None):
        # Configure Gemini API
        api_key = api_key or os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found. Please set it in environment variables.")
        
        genai.configure(api_key=api_key)
        # Use Gemini 2.0-flash for faster responses
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
    def calculate_semantic_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity between two texts using Gemini API"""
        try:
            prompt = f"""Analyze the semantic similarity between these two texts on a scale of 0.0 to 1.0.
Return ONLY a number between 0.0 and 1.0, nothing else.

Text 1: {text1}
Text 2: {text2}

Similarity score:"""
            
            response = self.model.generate_content(prompt)
            score_text = response.text.strip()
            # Extract number from response
            score = float(score_text)
            return max(0.0, min(1.0, score))  # Clamp between 0 and 1
        except Exception as e:
            print(f"Error calculating similarity: {e}")
            return 0.0
    
    def detect_keyword_bias(self, cv_text: str, required_keywords: List[str]) -> Dict:
        """Detect if CV is rejected due to keyword bias despite semantic similarity"""
        cv_text_lower = cv_text.lower()
        
        # Check exact keyword matches
        exact_matches = []
        missing_keywords = []
        
        for keyword in required_keywords:
            if keyword.lower() in cv_text_lower:
                exact_matches.append(keyword)
            else:
                missing_keywords.append(keyword)
        
        # Calculate semantic matches for missing keywords
        semantic_matches = []
        for missing_keyword in missing_keywords:
            similarity = self.calculate_semantic_similarity(missing_keyword, cv_text)
            if similarity > 0.6:  # High semantic similarity threshold
                semantic_matches.append({
                    'keyword': missing_keyword,
                    'similarity': similarity
                })
        
        # Determine if bias exists
        bias_detected = len(semantic_matches) > 0
        
        return {
            'exact_matches': exact_matches,
            'missing_keywords': missing_keywords,
            'semantic_matches': semantic_matches,
            'bias_detected': bias_detected,
            'bias_score': len(semantic_matches) / len(required_keywords) if required_keywords else 0,
            'overall_match_score': (len(exact_matches) + len(semantic_matches)) / len(required_keywords) if required_keywords else 0
        }
    
    def analyze_demographic_bias(self, candidates: List[Dict]) -> Dict:
        """Analyze for demographic bias patterns using Four-Fifths Rule"""
        if not candidates:
            return {'bias_detected': False, 'analysis': 'No candidates to analyze'}
        
        # Group by demographics
        age_groups = {'under_30': [], '30_45': [], 'over_45': []}
        gender_groups = {'male': [], 'female': [], 'other': []}
        
        for candidate in candidates:
            age = candidate.get('age', 0)
            if isinstance(age, str):
                try:
                    age = int(age)
                except:
                    age = 0
            
            # Age grouping
            if age < 30:
                age_groups['under_30'].append(candidate)
            elif age <= 45:
                age_groups['30_45'].append(candidate)
            else:
                age_groups['over_45'].append(candidate)
            
            # Gender grouping
            gender = candidate.get('gender', '').lower()
            if gender in ['male', 'm']:
                gender_groups['male'].append(candidate)
            elif gender in ['female', 'f']:
                gender_groups['female'].append(candidate)
            else:
                gender_groups['other'].append(candidate)
        
        # Calculate rejection rates
        bias_analysis = {
            'age_bias': self.calculate_four_fifths_rule(age_groups),
            'gender_bias': self.calculate_four_fifths_rule(gender_groups),
            'total_candidates': len(candidates)
        }
        
        # Overall bias detection
        bias_analysis['bias_detected'] = (
            bias_analysis['age_bias']['bias_detected'] or 
            bias_analysis['gender_bias']['bias_detected']
        )
        
        return bias_analysis
    
    def calculate_four_fifths_rule(self, groups: Dict[str, List]) -> Dict:
        """Apply Four-Fifths Rule to detect bias"""
        group_stats = {}
        rejection_rates = {}
        
        for group_name, candidates in groups.items():
            if not candidates:
                continue
                
            total = len(candidates)
            rejected = len([c for c in candidates if c.get('status') == 'rejected'])
            rejection_rate = rejected / total if total > 0 else 0
            
            group_stats[group_name] = {
                'total': total,
                'rejected': rejected,
                'rejection_rate': rejection_rate
            }
            rejection_rates[group_name] = rejection_rate
        
        # Find highest and lowest rejection rates
        if not rejection_rates:
            return {'bias_detected': False, 'groups': group_stats}
        
        min_rate = min(rejection_rates.values())
        max_rate = max(rejection_rates.values())
        
        # Four-Fifths Rule: if any group's rate is less than 80% of the highest rate
        bias_detected = False
        if max_rate > 0:
            four_fifths_threshold = max_rate * 0.8
            bias_detected = min_rate < four_fifths_threshold
        
        return {
            'bias_detected': bias_detected,
            'groups': group_stats,
            'min_rejection_rate': min_rate,
            'max_rejection_rate': max_rate,
            'four_fifths_threshold': max_rate * 0.8 if max_rate > 0 else 0
        }
    
    def generate_rescue_alerts(self, candidates: List[Dict], job_keywords: List[str]) -> List[Dict]:
        """Generate rescue alerts for qualified candidates who were wrongly rejected"""
        rescue_alerts = []
        
        for candidate in candidates:
            if candidate.get('status') != 'rejected':
                continue
            
            cv_text = candidate.get('text_content', '') or candidate.get('skills', [])
            if isinstance(cv_text, list):
                cv_text = ' '.join(cv_text)
            
            # Analyze for keyword bias
            bias_analysis = self.detect_keyword_bias(cv_text, job_keywords)
            
            if bias_analysis['bias_detected'] and bias_analysis['overall_match_score'] > 0.7:
                rescue_alert = {
                    'candidate_id': candidate.get('candidateId'),
                    'name': candidate.get('name', 'Unknown'),
                    'semantic_score': bias_analysis['overall_match_score'],
                    'rescue_reason': f"High semantic match ({bias_analysis['overall_match_score']:.1%}) despite keyword mismatch",
                    'original_rejection': candidate.get('rejection_reason', 'Keyword filtering'),
                    'semantic_matches': bias_analysis['semantic_matches'],
                    'priority': 'high' if bias_analysis['overall_match_score'] > 0.85 else 'medium'
                }
                rescue_alerts.append(rescue_alert)
        
        return rescue_alerts
    
    def run_full_analysis(self, candidates: List[Dict], job_keywords: List[str]) -> Dict:
        """Run complete Fair-Hire Sentinel analysis"""
        analysis_results = {
            'timestamp': datetime.now().isoformat(),
            'total_candidates': len(candidates),
            'job_keywords': job_keywords
        }
        
        # 1. Demographic bias analysis
        demographic_analysis = self.analyze_demographic_bias(candidates)
        analysis_results['demographic_bias'] = demographic_analysis
        
        # 2. Generate rescue alerts
        rescue_alerts = self.generate_rescue_alerts(candidates, job_keywords)
        analysis_results['rescue_alerts'] = rescue_alerts
        
        # 3. Overall statistics
        rejected_candidates = [c for c in candidates if c.get('status') == 'rejected']
        analysis_results['statistics'] = {
            'total_rejected': len(rejected_candidates),
            'candidates_rescued': len(rescue_alerts),
            'rescue_rate': len(rescue_alerts) / len(rejected_candidates) if rejected_candidates else 0,
            'bias_detected': demographic_analysis['bias_detected'] or len(rescue_alerts) > 0
        }
        
        return analysis_results