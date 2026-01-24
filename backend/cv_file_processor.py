import os
from pathlib import Path
from datetime import datetime
try:
    import pytesseract
    from PIL import Image
    from pdf2image import convert_from_path
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False

class CVFileProcessor:
    def __init__(self, cv_folder_path="../sample_cvs"):
        self.cv_folder_path = cv_folder_path
        self.supported_formats = ['.txt', '.pdf', '.docx', '.doc', '.jpg', '.jpeg', '.png']
    
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
    
    def process_cvs_for_analysis(self):
        cv_files = self.scan_cv_folder()
        processed_cvs = []
        
        for i, cv in enumerate(cv_files):
            cv_analysis_data = {
                'candidateId': f'FILE_{i+1:03d}',
                'filename': cv['filename'],
                'file_type': cv['file_type'],
                'text_content': cv['text_content'],
                'status': 'pending_analysis',
                'uploadedAt': datetime.now(),
                'source': 'file_upload'
            }
            processed_cvs.append(cv_analysis_data)
        return processed_cvs