import os
import google.generativeai as genai
from datetime import datetime
from typing import List, Dict
import json

class FairHireSentinel:
    # Define multiple job families with their key skills
    JOB_FAMILIES = {
        'Software Engineering': {
            'keywords': ['Python', 'Java', 'JavaScript', 'C++', 'React', 'Node.js', 'Git', 'API', 'Database', 'SQL', 'AWS', 'Docker'],
            'category': 'Technical'
        },
        'Data Science & ML': {
            'keywords': ['Python', 'Machine Learning', 'Data Analysis', 'SQL', 'TensorFlow', 'PyTorch', 'Statistics', 'Pandas', 'NumPy', 'Jupyter'],
            'category': 'Technical'
        },
        'DevOps & Cloud': {
            'keywords': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'Terraform', 'Linux', 'Shell Scripting'],
            'category': 'Technical'
        },
        'Product Management': {
            'keywords': ['Product Strategy', 'Roadmap', 'Agile', 'Scrum', 'User Research', 'Analytics', 'Stakeholder Management', 'Jira'],
            'category': 'Business'
        },
        'Sales & Business Development': {
            'keywords': ['CRM', 'Sales Strategy', 'Client Engagement', 'Revenue Growth', 'Business Development', 'Salesforce', 'Lead Generation'],
            'category': 'Business'
        },
        'Marketing & Growth': {
            'keywords': ['Digital Marketing', 'SEO', 'Content Strategy', 'Social Media', 'Analytics', 'Campaign Management', 'Brand Strategy'],
            'category': 'Business'
        },
        'UX/UI Design': {
            'keywords': ['UI Design', 'UX Research', 'Figma', 'Adobe XD', 'Wireframing', 'Prototyping', 'User Testing', 'Design Systems'],
            'category': 'Design'
        },
        'QA & Testing': {
            'keywords': ['Manual Testing', 'Automation Testing', 'Selenium', 'Test Cases', 'Bug Tracking', 'QA Process', 'API Testing'],
            'category': 'Technical'
        },
        'HR & Recruiting': {
            'keywords': ['Recruitment', 'Talent Acquisition', 'Employee Engagement', 'HR Policy', 'Onboarding', 'Performance Management'],
            'category': 'Operations'
        },
        'Finance & Accounting': {
            'keywords': ['Financial Analysis', 'Accounting', 'Budgeting', 'Excel', 'QuickBooks', 'Auditing', 'Tax Compliance', 'Financial Reporting'],
            'category': 'Finance'
        }
    }
    
    def __init__(self, api_key: str = None):
        # Configure Gemini API
        api_key = api_key or os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found. Please set it in environment variables.")
        
        genai.configure(api_key=api_key)
        # Use Gemini 2.0-flash for faster responses
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
    def extract_required_skills(self, job_title: str) -> List[str]:
        """Extract required skills and keywords for a job position using AI"""
        try:
            # Determine if this is a technical role
            tech_keywords = ['engineer', 'developer', 'data', 'software', 'tech', 'programmer', 'analyst', 'scientist', 'devops', 'architect']
            is_tech_role = any(keyword in job_title.lower() for keyword in tech_keywords)
            
            if is_tech_role:
                prompt = f"""You are an expert technical recruiter for a tech company.

Analyze this job title/position: "{job_title}"

Return a JSON array of 10-15 TECHNICAL skills, programming languages, frameworks, tools, and qualifications required for this role.

Focus on:
- Programming languages (Python, Java, JavaScript, etc.)
- Technical frameworks and libraries
- Cloud platforms (AWS, Azure, GCP)
- Development tools and methodologies
- Domain-specific technical skills
- Relevant certifications
- Also include 2-3 essential soft skills

Format: ["skill1", "skill2", "skill3", ...]

Return ONLY the JSON array, no explanation.

Required skills:"""
            else:
                prompt = f"""You are an expert HR recruiter.

Analyze this job title/position: "{job_title}"

Return a JSON array of 10-12 essential skills, qualifications, and competencies required for this role.

Include both hard skills and soft skills relevant to the position.

Format: ["skill1", "skill2", "skill3", ...]

Return ONLY the JSON array, no explanation.

Required skills:"""
            
            response = self.model.generate_content(prompt)
            skills_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if '```' in skills_text:
                skills_text = skills_text.split('```')[1]
                if skills_text.startswith('json'):
                    skills_text = skills_text[4:]
            
            # Parse JSON array
            skills = json.loads(skills_text.strip())
            return skills if isinstance(skills, list) else []
        except Exception as e:
            print(f"Error extracting skills: {e}")
            # Return default tech skills for tech roles
            if is_tech_role:
                return ['Python', 'JavaScript', 'Git', 'Problem Solving', 'Communication', 'Teamwork', 'Cloud Computing', 'API Development']
            return ['Communication', 'Problem Solving', 'Teamwork', 'Leadership']
    
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
    
    def analyze_cv_against_job_families(self, cv_text: str) -> Dict:
        """Analyze CV against all job families and return best matches"""
        results = {}
        
        for job_family, details in self.JOB_FAMILIES.items():
            keywords = details['keywords']
            bias_analysis = self.detect_keyword_bias(cv_text, keywords)
            
            results[job_family] = {
                'match_score': bias_analysis['overall_match_score'],
                'matched_keywords': len(bias_analysis['exact_matches']),
                'total_keywords': len(keywords),
                'semantic_matches': len(bias_analysis.get('semantic_matches', [])),
                'category': details['category'],
                'exact_matches': bias_analysis['exact_matches'],
                'missing_keywords': bias_analysis['missing_keywords']
            }
        
        # Sort by match score
        sorted_matches = sorted(results.items(), key=lambda x: x[1]['match_score'], reverse=True)
        
        return {
            'best_match': sorted_matches[0] if sorted_matches else None,
            'top_3_matches': sorted_matches[:3] if len(sorted_matches) >= 3 else sorted_matches,
            'all_matches': dict(sorted_matches)
        }
    
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
        """Analyze for demographic bias patterns using Four-Fifths Rule and peer comparison"""
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
        
        # NEW: Peer comparison - find similar candidates with different outcomes
        peer_bias_cases = self.compare_similar_candidates(candidates)
        bias_analysis['peer_comparison'] = peer_bias_cases
        
        # Overall bias detection
        bias_analysis['bias_detected'] = (
            bias_analysis['age_bias']['bias_detected'] or 
            bias_analysis['gender_bias']['bias_detected'] or
            len(peer_bias_cases) > 0
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
    
    def compare_similar_candidates(self, candidates: List[Dict]) -> List[Dict]:
        """Compare candidates with similar qualifications to detect disparate treatment
        
        This detects when two candidates with similar:
        - Job family matches
        - ATS scores
        - Experience levels
        - Semantic match scores
        
        But different demographics receive different outcomes (one accepted, one rejected)
        """
        bias_cases = []
        
        if len(candidates) < 2:
            return bias_cases
        
        # Compare each candidate with others
        for i, candidate_a in enumerate(candidates):
            for candidate_b in candidates[i+1:]:
                # Get key metrics
                score_a = candidate_a.get('ats_score', 0) or candidate_a.get('match_rate', 0) * 100
                score_b = candidate_b.get('ats_score', 0) or candidate_b.get('match_rate', 0) * 100
                
                semantic_a = candidate_a.get('semantic_analysis', {}).get('overall_match_score', 0) * 100
                semantic_b = candidate_b.get('semantic_analysis', {}).get('overall_match_score', 0) * 100
                
                exp_a = candidate_a.get('experience', 0)
                exp_b = candidate_b.get('experience', 0)
                
                job_family_a = candidate_a.get('best_job_family', '')
                job_family_b = candidate_b.get('best_job_family', '')
                
                status_a = candidate_a.get('status', '')
                status_b = candidate_b.get('status', '')
                
                # Check if candidates are similar (within 15% score difference and same job family)
                score_diff = abs(score_a - score_b)
                exp_diff = abs(exp_a - exp_b)
                
                are_similar = (
                    score_diff <= 15 and  # Similar ATS scores
                    exp_diff <= 3 and     # Similar experience
                    job_family_a == job_family_b and  # Same job family match
                    job_family_a != ''    # Both have job family
                )
                
                # Check if they have different outcomes
                one_accepted = (status_a in ['immediate_interview', 'shortlisted'] and 
                              status_b in ['rejected', 'rescued'])
                one_rejected = (status_b in ['immediate_interview', 'shortlisted'] and 
                              status_a in ['rejected', 'rescued'])
                
                different_outcomes = one_accepted or one_rejected
                
                # Check for demographic differences
                age_a = candidate_a.get('age', 0)
                age_b = candidate_b.get('age', 0)
                gender_a = candidate_a.get('gender', '').lower()
                gender_b = candidate_b.get('gender', '').lower()
                
                demographic_difference = (
                    (age_a > 45 and age_b <= 45) or 
                    (age_a <= 45 and age_b > 45) or
                    (gender_a != gender_b and gender_a and gender_b)
                )
                
                # Flag if similar candidates with different demographics have different outcomes
                if are_similar and different_outcomes and demographic_difference:
                    bias_cases.append({
                        'candidate_1': {
                            'name': candidate_a.get('name', 'Unknown'),
                            'ats_score': round(score_a, 1),
                            'semantic_score': round(semantic_a, 1),
                            'experience': exp_a,
                            'age': age_a,
                            'gender': gender_a,
                            'status': status_a,
                            'job_family': job_family_a
                        },
                        'candidate_2': {
                            'name': candidate_b.get('name', 'Unknown'),
                            'ats_score': round(score_b, 1),
                            'semantic_score': round(semantic_b, 1),
                            'experience': exp_b,
                            'age': age_b,
                            'gender': gender_b,
                            'status': status_b,
                            'job_family': job_family_b
                        },
                        'bias_type': 'disparate_treatment',
                        'description': f"Similar qualifications ({score_diff:.0f}% score difference) but different outcomes",
                        'severity': 'high' if score_diff < 5 else 'medium'
                    })
        
        return bias_cases
    
    def run_full_analysis(self, candidates: List[Dict], job_keywords: List[str]) -> Dict:
        """Run complete Fair-Hire Sentinel analysis with two-stage screening"""
        results = {
            'immediate_interviews': [],
            'rescue_alerts': [],
            'rejected': [],
            'bias_analysis': {},
            'statistics': {},
            'job_family_analysis': []
        }
        
        # If no specific keywords provided, use multi-job family analysis
        use_multi_job = job_keywords is None or len(job_keywords) == 0
        
        # Stage 1: Immediate selection for strong keyword matches
        for candidate in candidates:
            cv_text = self._get_cv_text(candidate)
            cv_text_lower = cv_text.lower()
            
            # Multi-job family analysis
            if use_multi_job:
                family_results = self.analyze_cv_against_job_families(cv_text)
                best_match = family_results['best_match']
                
                if best_match:
                    job_family, match_data = best_match
                    candidate['best_job_family'] = job_family
                    candidate['job_family_match_score'] = match_data['match_score']
                    candidate['job_category'] = match_data['category']
                    candidate['top_3_job_matches'] = [
                        {'family': fam, 'score': data['match_score'], 'category': data['category']}
                        for fam, data in family_results['top_3_matches']
                    ]
                    
                    # Use best matching job family's keywords
                    job_keywords = self.JOB_FAMILIES[job_family]['keywords']
                    match_rate = match_data['match_score']
                    matched_keywords = match_data['matched_keywords']
                else:
                    match_rate = 0
                    matched_keywords = 0
            else:
                # Check keyword match rate for specific job
                matched_keywords = sum(1 for kw in job_keywords if kw.lower() in cv_text_lower)
                match_rate = matched_keywords / len(job_keywords) if job_keywords else 0
            
            # Immediate interview if 70%+ keywords match
            if match_rate >= 0.7:
                candidate['status'] = 'immediate_interview'
                candidate['match_rate'] = match_rate
                candidate['matched_keywords'] = matched_keywords
                candidate['ats_score'] = match_rate * 100
                results['immediate_interviews'].append(candidate)
            else:
                # Stage 2: Advanced semantic analysis for non-matches
                bias_analysis = self.detect_keyword_bias(cv_text, job_keywords)
                candidate['semantic_analysis'] = bias_analysis
                candidate['match_rate'] = match_rate
                
                # Rescue if high semantic match despite low keyword match
                if bias_analysis['bias_detected'] and bias_analysis['overall_match_score'] > 0.65:
                    candidate['status'] = 'rescued'
                    results['rescue_alerts'].append({
                        'candidate_id': candidate.get('candidateId'),
                        'name': candidate.get('name', 'Unknown'),
                        'semantic_score': bias_analysis['overall_match_score'],
                        'ats_score': match_rate * 100,
                        'rescue_reason': f"High semantic match ({bias_analysis['overall_match_score']:.1%}) despite only {match_rate:.0%} keyword match",
                        'matched_keywords': matched_keywords,
                        'total_keywords': len(job_keywords),
                        'semantic_matches': bias_analysis.get('semantic_matches', []),
                        'rescued': True,
                        'experience': candidate.get('experience', 0),
                        'education': candidate.get('education', ''),
                        'actual_potential': bias_analysis['overall_match_score'] * 100,
                        'coding_score': min(85, int(bias_analysis['overall_match_score'] * 100)),
                        'drift_score': int((0.7 - match_rate) * 100)
                    })
                else:
                    candidate['status'] = 'rejected'
                    candidate['rejection_reason'] = f"Low match: {match_rate:.0%} keywords, {bias_analysis['overall_match_score']:.0%} semantic"
                    candidate['ats_score'] = match_rate * 100
                    results['rejected'].append(candidate)
        
        # Run demographic bias analysis
        results['bias_analysis'] = self.analyze_demographic_bias(candidates)
        
        # Statistics
        results['statistics'] = {
            'total_candidates': len(candidates),
            'immediate_interviews': len(results['immediate_interviews']),
            'candidates_rescued': len(results['rescue_alerts']),
            'rejected': len(results['rejected']),
            'rescue_rate': len(results['rescue_alerts']) / len(candidates) if candidates else 0
        }
        
        return results
    
    def _get_cv_text(self, candidate: Dict) -> str:
        """Extract text content from candidate data"""
        cv_text = candidate.get('content', '') or candidate.get('text_content', '') or candidate.get('skills', [])
        if isinstance(cv_text, list):
            cv_text = ' '.join(str(s) for s in cv_text)
        # Also include name, education, role for better matching
        additional_info = f"{candidate.get('name', '')} {candidate.get('education', '')} {candidate.get('currentRole', '')}"
        return f"{cv_text} {additional_info}"
    
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