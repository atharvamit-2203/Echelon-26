"""
Setup script to download and initialize ML models
Run this after installing requirements.txt
"""
import subprocess
import sys

def download_spacy_model():
    """Download spaCy English model"""
    try:
        print("Downloading spaCy English model...")
        subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"], check=True)
        print("✓ spaCy model downloaded successfully")
    except subprocess.CalledProcessError as e:
        print(f"Warning: Could not download spaCy model: {e}")
        print("You can manually download it later with: python -m spacy download en_core_web_sm")

def test_imports():
    """Test if all required libraries can be imported"""
    print("\nTesting ML library imports...")
    
    try:
        from sentence_transformers import SentenceTransformer
        print("✓ sentence-transformers")
    except ImportError as e:
        print(f"✗ sentence-transformers: {e}")
    
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        print("✓ scikit-learn")
    except ImportError as e:
        print(f"✗ scikit-learn: {e}")
    
    try:
        import spacy
        nlp = spacy.load("en_core_web_sm")
        print("✓ spacy with en_core_web_sm model")
    except:
        print("✗ spacy model not loaded (optional)")
    
    try:
        import numpy
        print("✓ numpy")
    except ImportError as e:
        print(f"✗ numpy: {e}")

def initialize_models():
    """Pre-download the sentence transformer model"""
    try:
        print("\nInitializing sentence transformer model (this may take a moment)...")
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('all-MiniLM-L6-v2')
        print("✓ Sentence transformer model ready")
        
        # Test it
        embeddings = model.encode(["test sentence"])
        print(f"✓ Model test successful (embedding shape: {embeddings.shape})")
    except Exception as e:
        print(f"Warning: Could not initialize sentence transformer: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("ML Models Setup for Fair Hire Sentinel")
    print("=" * 60)
    
    download_spacy_model()
    test_imports()
    initialize_models()
    
    print("\n" + "=" * 60)
    print("Setup complete! You can now run the Fair Hire Sentinel.")
    print("=" * 60)
