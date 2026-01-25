import os
from pathlib import Path
from datetime import datetime
import json
import re
try:
    import pytesseract
    from PIL import Image
    from pdf2image import convert_from_path
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False

try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
    NLP_AVAILABLE = True
except:
    nlp = None
    NLP_AVAILABLE = False
    print("Warning: spaCy not loaded. Using basic CV parsing.")

class CVFileProcessor:
    def __init__(self, cv_folder_path=None):
        # Use absolute path to sample_cvs folder by default
        if cv_folder_path is None:
            # Get the path of this file (cv_file_processor.py)
            current_file_dir = os.path.dirname(os.path.abspath(__file__))
            # Go up one level to Echelon root, then into sample_cvs
            cv_folder_path = os.path.join(os.path.dirname(current_file_dir), "sample_cvs")
        
        self.cv_folder_path = cv_folder_path
        self.supported_formats = ['.txt', '.pdf', '.docx', '.doc', '.jpg', '.jpeg', '.png']
        print(f"✓ CV Processor initialized - looking for CVs in: {self.cv_folder_path}")
    
    def extract_text_from_txt(self, file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            print(f"Error reading TXT {file_path}: {e}")
            return ""
    
    def extract_text_from_pdf_ocr(self, file_path):
        """Extract text from PDF using OCR for image-based PDFs"""
        if not OCR_AVAILABLE:
            return "[OCR not available - install pytesseract and pdf2image]"
        
        try:
            # Convert PDF to images
            pages = convert_from_path(file_path)
            text = ""
            
            for page in pages:
                # Use OCR to extract text from each page
                page_text = pytesseract.image_to_string(page)
                text += page_text + "\n"
            
            return text
        except Exception as e:
            print(f"Error with OCR extraction from {file_path}: {e}")
            return "[OCR extraction failed]"
    
    def extract_text_from_image(self, file_path):
        """Extract text from image files using OCR"""
        if not OCR_AVAILABLE:
            return "[OCR not available - install pytesseract]"
        
        try:
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
            return text
        except Exception as e:
            print(f"Error reading image {file_path}: {e}")
            return ""
    
    def extract_text_from_file(self, file_path):
        file_ext = Path(file_path).suffix.lower()
        
        if file_ext == '.txt':
            return self.extract_text_from_txt(file_path)
        elif file_ext == '.pdf':
            # Try regular PDF extraction first, then OCR if needed
            try:
                import PyPDF2
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    text = ""
                    for page in pdf_reader.pages:
                        text += page.extract_text()
                    
                    # If no text extracted, try OCR
                    if len(text.strip()) < 50:
                        print(f"PDF appears to be image-based, trying OCR...")
                        text = self.extract_text_from_pdf_ocr(file_path)
                    
                    return text
            except Exception as e:
                print(f"PDF extraction failed, trying OCR: {e}")
                return self.extract_text_from_pdf_ocr(file_path)
        
        elif file_ext in ['.docx', '.doc']:
            try:
                import docx
                doc = docx.Document(file_path)
                text = ""
                for paragraph in doc.paragraphs:
                    text += paragraph.text + "\n"
                return text
            except Exception as e:
                print(f"Error reading DOCX {file_path}: {e}")
                return "[DOCX extraction failed]"
        
        elif file_ext in ['.jpg', '.jpeg', '.png']:
            return self.extract_text_from_image(file_path)
        
        return "[Unsupported file format]"
    
    def scan_cv_folder(self):
        cv_files = []
        if not os.path.exists(self.cv_folder_path):
            return cv_files
        
        for filename in os.listdir(self.cv_folder_path):
            if filename.startswith('.') or filename == 'README.md':
                continue
                
            file_path = os.path.join(self.cv_folder_path, filename)
            file_ext = Path(filename).suffix.lower()
            
            if file_ext in self.supported_formats and os.path.isfile(file_path):
                text_content = self.extract_text_from_file(file_path)
                cv_files.append({
                    'filename': filename,
                    'file_path': file_path,
                    'file_type': file_ext,
                    'text_content': text_content,
                    'file_size': os.path.getsize(file_path),
                    'processed_at': datetime.now().isoformat()
                })
        return cv_files
    
    def get_cv_count_by_format(self):
        cv_files = self.scan_cv_folder()
        format_count = {}
        for cv in cv_files:
            file_type = cv['file_type']
            format_count[file_type] = format_count.get(file_type, 0) + 1
        return format_count
    
    def extract_candidate_info_from_text(self, text_content, filename):
        """Extract candidate name and position from CV text"""
        lines = text_content.split('\n')
        name = 'Unknown Candidate'
        position = 'Position not specified'
        
        # Try to extract from filename first (format: Name_Position.txt)
        if filename:
            parts = filename.replace('.txt', '').replace('_', ' ').split()
            if len(parts) >= 2:
                # Extract name (first 2-3 words usually)
                name_parts = []
                position_parts = []
                
                for part in parts:
                    # Common position keywords
                    if part.lower() in ['senior', 'junior', 'associate', 'lead', 'engineer', 'developer', 
                                        'manager', 'scientist', 'analyst', 'architect', 'intern', 'swe',
                                        'dev', 'devops', 'frontend', 'backend', 'full', 'stack', 'ml',
                                        'data', 'cloud', 'security', 'qa', 'mobile', 'blockchain', 'ux', 'ui']:
                        position_parts.append(part)
                    elif len(name_parts) < 3:  # Usually first 2-3 words are name
                        name_parts.append(part)
                
                if name_parts:
                    name = ' '.join(name_parts)
                if position_parts:
                    position = ' '.join(position_parts)
        
        # Try to extract from first few lines of CV
        if lines:
            first_line = lines[0].strip()
            if first_line and len(first_line) < 50 and first_line[0].isupper():
                name = first_line
            
            # Look for position in first 5 lines
            for line in lines[1:5]:
                line = line.strip()
                if line and len(line) < 100:
                    lower_line = line.lower()
                    if any(keyword in lower_line for keyword in ['engineer', 'developer', 'manager', 
                                                                   'scientist', 'analyst', 'architect',
                                                                   'designer', 'specialist']):
                        position = line
                        break
        
        return name, position
    
    def extract_cv_data_with_ml(self, text_content, filename):
        """Use ML models (spaCy NER) and regex patterns to extract candidate information"""
        try:
            name, position = self.extract_candidate_info_from_text(text_content, filename)
            
            # Extract using spaCy NER if available
            email = self._extract_email(text_content)
            phone = self._extract_phone(text_content)
            age = self._extract_age(text_content)
            gender = self._extract_gender(text_content)
            experience = self._extract_experience(text_content)
            location = self._extract_location(text_content, nlp if NLP_AVAILABLE else None)
            education = self._extract_education(text_content)
            skills = self._extract_skills(text_content)
            
            # If name not found from filename, try NER
            if name == 'Unknown Candidate' and NLP_AVAILABLE:
                doc = nlp(text_content[:500])  # First 500 chars usually have name
                for ent in doc.ents:
                    if ent.label_ == 'PERSON':
                        name = ent.text
                        break
            
            # Generate email if not found
            if not email:
                email = f"{name.lower().replace(' ', '.')}.{age}@email.com"
            
            # Generate phone if not found
            if not phone:
                phone = '+91-9876543210'
            
            # Estimate salary based on experience
            base_salary = 5 if experience < 2 else (10 + experience * 1.5)
            expected_salary = f"{int(base_salary)}L" if base_salary < 20 else f"{int(base_salary)} LPA"
            
            cv_data = {
                'name': name,
                'email': email,
                'phone': phone,
                'age': age,
                'gender': gender,
                'experience': experience,
                'currentRole': position,
                'education': education,
                'location': location,
                'expectedSalary': expected_salary,
                'skills': skills
            }
            
            print(f"✓ ML extracted: {name} - {position} ({experience} yrs exp)")
            return cv_data
            
        except Exception as e:
            print(f"ML extraction error: {e}")
            return self._extract_cv_data_basic(text_content, filename)
    
    def _extract_email(self, text):
        """Extract email using regex"""
        pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        match = re.search(pattern, text)
        return match.group(0) if match else None
    
    def _extract_phone(self, text):
        """Extract phone number using regex"""
        patterns = [
            r'\+?\d{1,3}[-\s]?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}',
            r'\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}',
            r'\+91[-\s]?\d{10}'
        ]
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(0)
        return None
    
    def _extract_age(self, text):
        """Extract age from CV text"""
        text_lower = text.lower()
        patterns = [
            r'age[:\s]+?(\d{2})',
            r'(\d{2})\s+years?\s+old',
            r'born[:\s]+?.*?(19|20)\d{2}',  # Birth year
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text_lower)
            if match:
                if pattern.endswith('d{2})'):
                    return int(match.group(1))
                elif '19|20' in pattern:
                    birth_year = int(match.group(0)[-4:])
                    return 2026 - birth_year
        
        # Estimate based on experience
        exp = self._extract_experience(text)
        return 22 + exp  # Fresh grad at 22, add experience years
    
    def _extract_gender(self, text):
        """Extract gender from CV text"""
        text_lower = text.lower()
        if re.search(r'\b(male|mr\.|mr\s)\b', text_lower) and not re.search(r'\bfemale\b', text_lower):
            return 'Male'
        elif re.search(r'\b(female|ms\.|ms\s|mrs\.)\b', text_lower):
            return 'Female'
        return 'Other'
    
    def _extract_experience(self, text):
        """Extract years of experience"""
        text_lower = text.lower()
        patterns = [
            r'(\d+)\+?\s+years?\s+(?:of\s+)?experience',
            r'experience[:\s]+?(\d+)\+?\s+years?',
            r'(\d+)\s+yrs?\s+exp',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text_lower)
            if match:
                return int(match.group(1))
        
        # Count work experiences by looking for date ranges
        date_ranges = re.findall(r'(20\d{2})\s*[-–—to]+\s*(20\d{2}|present|current)', text_lower)
        if date_ranges:
            total_exp = 0
            for start, end in date_ranges:
                start_year = int(start)
                end_year = 2026 if end in ['present', 'current'] else int(end)
                total_exp += (end_year - start_year)
            return min(total_exp, 30)  # Cap at 30 years
        
        return 3  # Default
    
    def _extract_location(self, text, nlp_model):
        """Extract location using NER and regex"""
        if nlp_model:
            doc = nlp_model(text[:1000])
            for ent in doc.ents:
                if ent.label_ == 'GPE':  # Geo-political entity
                    return ent.text
        
        # Fallback: look for common location patterns
        locations = ['bangalore', 'mumbai', 'delhi', 'hyderabad', 'pune', 'chennai', 
                     'kolkata', 'india', 'usa', 'uk', 'singapore', 'dubai']
        text_lower = text.lower()
        for loc in locations:
            if loc in text_lower:
                return loc.title()
        
        return 'India'
    
    def _extract_education(self, text):
        """Extract education qualifications"""
        text_lower = text.lower()
        
        degrees = [
            ('phd', 'Ph.D.'),
            ('doctorate', 'Ph.D.'),
            ('masters|m\\.s\\.|m\\.sc|mba|mtech|m\\.tech', 'Master\'s Degree'),
            ('bachelor|b\\.s\\.|b\\.sc|b\\.tech|b\\.e\\.|btech|bca', 'Bachelor\'s Degree'),
            ('diploma', 'Diploma'),
        ]
        
        for pattern, degree in degrees:
            if re.search(pattern, text_lower):
                # Try to find the field
                fields = ['computer science', 'engineering', 'business', 'commerce', 
                         'science', 'arts', 'management', 'technology']
                for field in fields:
                    if field in text_lower:
                        return f"{degree} in {field.title()}"
                return degree
        
        return "Bachelor's Degree"
    
    def _extract_skills(self, text):
        """Extract skills using keyword matching"""
        text_lower = text.lower()
        
        all_skills = [
            # Programming languages
            'Python', 'Java', 'JavaScript', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
            'PHP', 'TypeScript', 'R', 'Scala', 'Perl', 'Shell', 'Bash',
            
            # Frameworks & Libraries
            'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Flask', 'Spring', 'Express',
            'TensorFlow', 'PyTorch', 'Keras', 'FastAPI', 'Next.js', 'Laravel',
            
            # Databases
            'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Cassandra', 'Oracle',
            'DynamoDB', 'Elasticsearch', 'Neo4j',
            
            # Cloud & DevOps
            'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'Terraform',
            'Ansible', 'Git', 'GitHub', 'GitLab', 'Linux', 'Nginx',
            
            # Data & ML
            'Machine Learning', 'Deep Learning', 'Data Analysis', 'Data Science', 'NLP',
            'Computer Vision', 'Pandas', 'NumPy', 'Scikit-learn', 'Jupyter',
            
            # Tools & Methodologies
            'Agile', 'Scrum', 'Jira', 'REST API', 'GraphQL', 'Microservices', 'Testing',
            'Selenium', 'API Development', 'UI/UX', 'Figma', 'Adobe XD',
            
            # Soft skills
            'Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Project Management'
        ]
        
        found_skills = []
        for skill in all_skills:
            if skill.lower() in text_lower:
                found_skills.append(skill)
        
        return found_skills[:15]  # Limit to top 15 skills
    
    def _extract_cv_data_basic(self, text_content, filename):
        """Fallback basic extraction when AI is not available"""
        import re
        
        name, position = self.extract_candidate_info_from_text(text_content, filename)
        
        text_lower = text_content.lower()
        
        # Extract age
        age = 30
        age_patterns = [r'age[:\s]+(\d{2})', r'(\d{2})\s+years?\s+old']
        for pattern in age_patterns:
            match = re.search(pattern, text_lower)
            if match:
                age = int(match.group(1))
                break
        
        # Extract experience
        experience = 5
        exp_patterns = [r'(\d+)\+?\s+years?\s+(?:of\s+)?experience']
        for pattern in exp_patterns:
            match = re.search(pattern, text_lower)
            if match:
                experience = int(match.group(1))
                break
        
        # Extract skills
        common_skills = ['python', 'java', 'javascript', 'react', 'node.js', 'aws', 'docker', 
                        'kubernetes', 'sql', 'mongodb', 'git', 'agile', 'api', 'rest']
        skills = [skill for skill in common_skills if skill in text_lower]
        
        return {
            'name': name,
            'email': f"{name.lower().replace(' ', '.')}@email.com",
            'phone': '+91-9876543210',
            'age': age,
            'gender': 'Other',
            'experience': experience,
            'currentRole': position,
            'education': "Bachelor's Degree",
            'location': 'India',
            'expectedSalary': f'{10 + experience}L',
            'skills': skills
        }
    
    def process_cvs_for_analysis(self):
        cv_files = self.scan_cv_folder()
        processed_cvs = []
        
        print(f"🤖 Processing {len(cv_files)} CVs with ML-based extraction (spaCy NER + regex)...")
        
        for i, cv in enumerate(cv_files):
            # Use ML models to extract all candidate information
            cv_data = self.extract_cv_data_with_ml(cv['text_content'], cv['filename'])
            
            # Assign realistic status based on age and experience to simulate bias
            age = cv_data.get('age', 30)
            experience = cv_data.get('experience', 5)
            
            # Use deterministic hash based on name for consistent results
            import hashlib
            name_hash = int(hashlib.md5(cv_data.get('name', str(i)).encode()).hexdigest(), 16)
            random_val = (name_hash % 100) / 100.0  # Deterministic 0-1 value
            
            # Simulate bias: older candidates with high experience are more likely to be rejected
            # This creates detectable bias patterns for the ML model
            if age > 45 and experience > 10:
                # 70% chance of rejection for candidates over 45 with 10+ years exp
                status = 'rejected' if random_val < 0.7 else 'shortlisted'
            elif age > 50:
                # 80% chance of rejection for candidates over 50
                status = 'rejected' if random_val < 0.8 else 'shortlisted'
            elif experience < 3:
                # 40% rejection for very junior candidates
                status = 'rejected' if random_val < 0.4 else 'shortlisted'
            else:
                # 30% rejection for others (normal rate)
                status = 'rejected' if random_val < 0.3 else 'shortlisted'
            
            # Add metadata
            cv_analysis_data = {
                'candidateId': f'FILE_{i+1:03d}',
                'name': cv_data.get('name', 'Unknown'),
                'email': cv_data.get('email', 'unknown@email.com'),
                'phone': cv_data.get('phone', f"+91-98765432{10+i:02d}"),
                'age': age,
                'gender': cv_data.get('gender', 'Other'),
                'experience': experience,
                'currentRole': cv_data.get('currentRole', 'Not specified'),
                'education': cv_data.get('education', "Bachelor's Degree"),
                'location': cv_data.get('location', 'India'),
                'expectedSalary': cv_data.get('expectedSalary', '15L'),
                'skills': cv_data.get('skills', []),
                'filename': cv['filename'],
                'file_type': cv['file_type'],
                'content': cv['text_content'],
                'text_content': cv['text_content'],
                'status': status,
                'uploadedAt': datetime.now(),
                'source': 'file_upload'
            }
            processed_cvs.append(cv_analysis_data)
        
        print(f"✓ Processed {len(processed_cvs)} CVs successfully using ML models")
        return processed_cvs
