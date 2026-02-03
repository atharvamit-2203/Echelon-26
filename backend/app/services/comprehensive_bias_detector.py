"""
Comprehensive Bias Detection Service
Analyzes bias across ALL parameters
"""
from typing import Dict, List, Any
from collections import defaultdict
import statistics
from app.core.logging import logger


class ComprehensiveBiasDetector:
    """Detect bias across all candidate parameters"""
    
    # Thresholds for bias detection
    SHORTLIST_RATE_THRESHOLD = 0.20  # 20% disparity
    SCORE_DIFFERENCE_THRESHOLD = 10   # 10 point difference
    RESCUE_RATE_THRESHOLD = 0.15      # 15% disparity
    MIN_SAMPLE_SIZE = 3               # Minimum candidates per group
    
    def __init__(self):
        self.bias_data = {
            "by_gender": defaultdict(lambda: self._default_stats()),
            "by_age_group": defaultdict(lambda: self._default_stats()),
            "by_location": defaultdict(lambda: self._default_stats()),
            "by_education": defaultdict(lambda: self._default_stats()),
            "by_experience_level": defaultdict(lambda: self._default_stats()),
            "by_current_role": defaultdict(lambda: self._default_stats()),
            "by_domain": defaultdict(lambda: self._default_stats()),
            "by_skill_count": defaultdict(lambda: self._default_stats()),
        }
        self.all_candidates = []
    
    def _default_stats(self) -> Dict:
        """Default statistics structure"""
        return {
            "total": 0,
            "shortlisted": 0,
            "rejected": 0,
            "rescued": 0,
            "ats_scores": [],
            "semantic_scores": [],
            "candidates": []
        }
    
    def add_candidate_result(self, cv: Any, result: Dict):
        """Add a candidate's analysis result"""
        self.all_candidates.append({
            "cv": cv,
            "result": result
        })
        
        # Track by gender
        gender = cv.gender
        self._update_stats(self.bias_data["by_gender"][gender], cv, result)
        
        # Track by age group
        age_group = self._get_age_group(cv.age)
        self._update_stats(self.bias_data["by_age_group"][age_group], cv, result)
        
        # Track by location
        location = self._normalize_location(cv.location)
        self._update_stats(self.bias_data["by_location"][location], cv, result)
        
        # Track by education level
        education_level = self._get_education_level(cv.education)
        self._update_stats(self.bias_data["by_education"][education_level], cv, result)
        
        # Track by experience level
        exp_level = self._get_experience_level(cv.experience)
        self._update_stats(self.bias_data["by_experience_level"][exp_level], cv, result)
        
        # Track by current role (generalized)
        role_category = self._categorize_role(cv.currentRole)
        self._update_stats(self.bias_data["by_current_role"][role_category], cv, result)
        
        # Track by domain (if available)
        domain = getattr(cv, 'domain', 'Unknown')
        self._update_stats(self.bias_data["by_domain"][domain], cv, result)
        
        # Track by skill count
        skill_count_group = self._get_skill_count_group(len(cv.skills))
        self._update_stats(self.bias_data["by_skill_count"][skill_count_group], cv, result)
    
    def _update_stats(self, stats: Dict, cv: Any, result: Dict):
        """Update statistics for a group"""
        stats["total"] += 1
        stats["ats_scores"].append(result["atsScore"])
        stats["semantic_scores"].append(result["semanticScore"])
        stats["candidates"].append(cv.candidateId)
        
        if result["recommendation"] in ["shortlisted", "immediate_interview"]:
            stats["shortlisted"] += 1
        elif result["recommendation"] == "rejected":
            stats["rejected"] += 1
        
        if result.get("rescued", False):
            stats["rescued"] += 1
    
    def detect_all_biases(self) -> List[Dict]:
        """Detect biases across all parameters"""
        all_biases = []
        
        # Check each parameter category
        all_biases.extend(self._detect_gender_bias())
        all_biases.extend(self._detect_age_bias())
        all_biases.extend(self._detect_location_bias())
        all_biases.extend(self._detect_education_bias())
        all_biases.extend(self._detect_experience_bias())
        all_biases.extend(self._detect_role_bias())
        all_biases.extend(self._detect_domain_bias())
        all_biases.extend(self._detect_skill_count_bias())
        all_biases.extend(self._detect_score_bias())
        all_biases.extend(self._detect_rescue_bias())
        
        # Sort by severity
        all_biases.sort(key=lambda x: self._get_severity_score(x), reverse=True)
        
        return all_biases
    
    def _detect_gender_bias(self) -> List[Dict]:
        """Detect gender-based bias"""
        return self._detect_categorical_bias(
            self.bias_data["by_gender"],
            "Gender",
            "gender_bias"
        )
    
    def _detect_age_bias(self) -> List[Dict]:
        """Detect age-based bias"""
        return self._detect_categorical_bias(
            self.bias_data["by_age_group"],
            "Age Group",
            "age_bias"
        )
    
    def _detect_location_bias(self) -> List[Dict]:
        """Detect location-based bias"""
        return self._detect_categorical_bias(
            self.bias_data["by_location"],
            "Location",
            "location_bias"
        )
    
    def _detect_education_bias(self) -> List[Dict]:
        """Detect education-based bias"""
        return self._detect_categorical_bias(
            self.bias_data["by_education"],
            "Education Level",
            "education_bias"
        )
    
    def _detect_experience_bias(self) -> List[Dict]:
        """Detect experience-based bias"""
        return self._detect_categorical_bias(
            self.bias_data["by_experience_level"],
            "Experience Level",
            "experience_bias"
        )
    
    def _detect_role_bias(self) -> List[Dict]:
        """Detect role-based bias"""
        return self._detect_categorical_bias(
            self.bias_data["by_current_role"],
            "Current Role",
            "role_bias"
        )
    
    def _detect_domain_bias(self) -> List[Dict]:
        """Detect domain-based bias"""
        return self._detect_categorical_bias(
            self.bias_data["by_domain"],
            "Domain",
            "domain_bias"
        )
    
    def _detect_skill_count_bias(self) -> List[Dict]:
        """Detect bias based on number of skills"""
        return self._detect_categorical_bias(
            self.bias_data["by_skill_count"],
            "Skill Count",
            "skill_count_bias"
        )
    
    def _detect_categorical_bias(
        self,
        category_data: Dict,
        category_name: str,
        bias_type: str
    ) -> List[Dict]:
        """Generic categorical bias detection"""
        biases = []
        
        # Filter groups with sufficient sample size
        valid_groups = {
            k: v for k, v in category_data.items()
            if v["total"] >= self.MIN_SAMPLE_SIZE
        }
        
        if len(valid_groups) < 2:
            return biases
        
        # Calculate shortlist rates
        shortlist_rates = {}
        for group, stats in valid_groups.items():
            if stats["total"] > 0:
                shortlist_rates[group] = stats["shortlisted"] / stats["total"]
        
        if len(shortlist_rates) < 2:
            return biases
        
        # Find disparity
        max_group = max(shortlist_rates, key=shortlist_rates.get)
        min_group = min(shortlist_rates, key=shortlist_rates.get)
        disparity = shortlist_rates[max_group] - shortlist_rates[min_group]
        
        if disparity > self.SHORTLIST_RATE_THRESHOLD:
            biases.append({
                "type": bias_type,
                "category": category_name,
                "severity": self._calculate_severity(disparity),
                "disparity": disparity,
                "favored_group": max_group,
                "disadvantaged_group": min_group,
                "favored_rate": shortlist_rates[max_group],
                "disadvantaged_rate": shortlist_rates[min_group],
                "details": f"{category_name} bias detected: {max_group} has {disparity*100:.1f}% higher shortlist rate than {min_group}",
                "recommendation": f"Review {category_name.lower()}-based selection criteria to ensure fairness",
                "affected_candidates": valid_groups[min_group]["total"],
                "all_groups": {k: {"rate": v, "count": valid_groups[k]["total"]} 
                              for k, v in shortlist_rates.items()}
            })
        
        return biases
    
    def _detect_score_bias(self) -> List[Dict]:
        """Detect bias in scoring patterns"""
        biases = []
        
        # Check ATS vs Semantic score correlation by group
        for category_name, category_data in [
            ("Gender", self.bias_data["by_gender"]),
            ("Age Group", self.bias_data["by_age_group"]),
            ("Education", self.bias_data["by_education"])
        ]:
            valid_groups = {
                k: v for k, v in category_data.items()
                if v["total"] >= self.MIN_SAMPLE_SIZE
            }
            
            if len(valid_groups) < 2:
                continue
            
            # Calculate average scores
            avg_ats = {}
            avg_semantic = {}
            
            for group, stats in valid_groups.items():
                if stats["ats_scores"]:
                    avg_ats[group] = statistics.mean(stats["ats_scores"])
                    avg_semantic[group] = statistics.mean(stats["semantic_scores"])
            
            # Find score disparities
            if len(avg_ats) >= 2:
                max_ats_group = max(avg_ats, key=avg_ats.get)
                min_ats_group = min(avg_ats, key=avg_ats.get)
                ats_diff = avg_ats[max_ats_group] - avg_ats[min_ats_group]
                
                if ats_diff > self.SCORE_DIFFERENCE_THRESHOLD:
                    biases.append({
                        "type": "ats_scoring_bias",
                        "category": category_name,
                        "severity": "medium",
                        "disparity": ats_diff / 100,
                        "favored_group": max_ats_group,
                        "disadvantaged_group": min_ats_group,
                        "details": f"ATS scoring bias: {max_ats_group} scores {ats_diff:.1f} points higher than {min_ats_group}",
                        "recommendation": f"ATS keywords may favor {max_ats_group} candidates",
                        "avg_scores": avg_ats
                    })
        
        return biases
    
    def _detect_rescue_bias(self) -> List[Dict]:
        """Detect patterns in rescued candidates"""
        biases = []
        
        for category_name, category_data in [
            ("Gender", self.bias_data["by_gender"]),
            ("Age Group", self.bias_data["by_age_group"]),
            ("Location", self.bias_data["by_location"])
        ]:
            valid_groups = {
                k: v for k, v in category_data.items()
                if v["total"] >= self.MIN_SAMPLE_SIZE
            }
            
            if len(valid_groups) < 2:
                continue
            
            # Calculate rescue rates
            rescue_rates = {}
            for group, stats in valid_groups.items():
                if stats["total"] > 0:
                    rescue_rates[group] = stats["rescued"] / stats["total"]
            
            if len(rescue_rates) >= 2:
                max_group = max(rescue_rates, key=rescue_rates.get)
                min_group = min(rescue_rates, key=rescue_rates.get)
                disparity = rescue_rates[max_group] - rescue_rates[min_group]
                
                if disparity > self.RESCUE_RATE_THRESHOLD:
                    biases.append({
                        "type": "rescue_pattern_bias",
                        "category": category_name,
                        "severity": "high",
                        "disparity": disparity,
                        "favored_group": max_group,
                        "disadvantaged_group": min_group,
                        "details": f"{max_group} candidates are rescued {disparity*100:.1f}% more often, indicating ATS bias against this group",
                        "recommendation": f"ATS criteria may systematically disadvantage {max_group} candidates",
                        "rescue_rates": rescue_rates
                    })
        
        return biases
    
    # Helper methods
    def _get_age_group(self, age: int) -> str:
        if age < 25: return "18-24"
        elif age < 35: return "25-34"
        elif age < 45: return "35-44"
        elif age < 55: return "45-54"
        else: return "55+"
    
    def _normalize_location(self, location: str) -> str:
        """Normalize location to city/region"""
        # Extract city name (before comma)
        if ',' in location:
            return location.split(',')[0].strip()
        return location.strip()
    
    def _get_education_level(self, education: str) -> str:
        """Categorize education level"""
        education_lower = education.lower()
        if 'phd' in education_lower or 'doctorate' in education_lower:
            return "Doctoral"
        elif 'master' in education_lower or 'mba' in education_lower:
            return "Master's"
        elif 'bachelor' in education_lower:
            return "Bachelor's"
        elif 'associate' in education_lower:
            return "Associate"
        else:
            return "Other"
    
    def _get_experience_level(self, years: int) -> str:
        """Categorize experience level"""
        if years < 2: return "Entry (0-2 years)"
        elif years < 5: return "Junior (2-5 years)"
        elif years < 10: return "Mid (5-10 years)"
        elif years < 15: return "Senior (10-15 years)"
        else: return "Expert (15+ years)"
    
    def _categorize_role(self, role: str) -> str:
        """Categorize role into broader categories"""
        role_lower = role.lower()
        if any(word in role_lower for word in ['engineer', 'developer', 'programmer']):
            return "Engineering"
        elif any(word in role_lower for word in ['manager', 'director', 'lead', 'head']):
            return "Management"
        elif any(word in role_lower for word in ['designer', 'ux', 'ui']):
            return "Design"
        elif any(word in role_lower for word in ['analyst', 'scientist', 'data']):
            return "Analytics"
        elif any(word in role_lower for word in ['marketing', 'growth', 'seo']):
            return "Marketing"
        else:
            return "Other"
    
    def _get_skill_count_group(self, count: int) -> str:
        """Group by skill count"""
        if count < 5: return "1-4 skills"
        elif count < 10: return "5-9 skills"
        elif count < 15: return "10-14 skills"
        else: return "15+ skills"
    
    def _calculate_severity(self, disparity: float) -> str:
        """Calculate bias severity"""
        if disparity > 0.4:
            return "critical"
        elif disparity > 0.3:
            return "high"
        elif disparity > 0.2:
            return "medium"
        else:
            return "low"
    
    def _get_severity_score(self, bias: Dict) -> int:
        """Get numeric severity score for sorting"""
        severity_map = {
            "critical": 4,
            "high": 3,
            "medium": 2,
            "low": 1
        }
        return severity_map.get(bias.get("severity", "low"), 0)
    
    def get_summary(self) -> Dict:
        """Get comprehensive bias summary"""
        return {
            "total_candidates": len(self.all_candidates),
            "categories_analyzed": list(self.bias_data.keys()),
            "bias_data": {
                category: {
                    group: {
                        "total": stats["total"],
                        "shortlisted": stats["shortlisted"],
                        "rescued": stats["rescued"],
                        "avg_ats_score": statistics.mean(stats["ats_scores"]) if stats["ats_scores"] else 0,
                        "avg_semantic_score": statistics.mean(stats["semantic_scores"]) if stats["semantic_scores"] else 0,
                        "shortlist_rate": stats["shortlisted"] / stats["total"] if stats["total"] > 0 else 0
                    }
                    for group, stats in category_data.items()
                    if stats["total"] > 0
                }
                for category, category_data in self.bias_data.items()
            }
        }
