'use client';

import { useState } from 'react';
import { Upload, Plus, X, Briefcase, Target, FileCheck, Sparkles } from 'lucide-react';

export default function RecruiterUploadPanel() {
  const [activeTab, setActiveTab] = useState('upload');
  const [keywords, setKeywords] = useState(['Communication', 'Leadership', 'Problem Solving']);
  const [newKeyword, setNewKeyword] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [referenceCV, setReferenceCV] = useState(null);
  const [referenceJobTitle, setReferenceJobTitle] = useState('');
  const [referenceUploading, setReferenceUploading] = useState(false);
  const [extractingSkills, setExtractingSkills] = useState(false);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch('http://localhost:8000/api/upload-cv-file', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          setUploadedFiles(prev => [...prev, { name: file.name, status: 'uploaded', size: (file.size / 1024).toFixed(2) + ' KB' }]);
        }
      } catch (error) {
        console.error('Upload error:', error);
        setUploadedFiles(prev => [...prev, { name: file.name, status: 'error' }]);
      }
    }
  };

  const handleReferenceCVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!referenceJobTitle.trim()) {
      alert('Please enter a reference job title before uploading the reference CV.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobTitle', referenceJobTitle.trim());
    
    setReferenceUploading(true);
    try {
      const response = await fetch('http://localhost:8000/api/upload-reference-cv', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        setReferenceCV({
          name: file.name,
          size: (file.size / 1024).toFixed(2) + ' KB',
          jobTitle: referenceJobTitle.trim()
        });
        alert('Reference CV uploaded successfully. It will be used in analysis for candidate comparison.');
      } else {
        const data = await response.json().catch(() => ({}));
        alert(`Failed to upload reference CV: ${data.error || response.status}`);
      }
    } catch (error) {
      console.error('Reference CV upload error:', error);
      alert('Failed to upload reference CV');
    } finally {
      setReferenceUploading(false);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const extractSkillsFromAI = async () => {
    if (!jobTitle.trim()) {
      alert('Please enter a job title first');
      return;
    }
    
    setExtractingSkills(true);
    try {
      const response = await fetch('http://localhost:8000/api/extract-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle })
      });
      
      const data = await response.json();
      
      if (response.ok && data.skills) {
        setKeywords(data.skills);
        alert(`AI extracted ${data.skills.length} skills for ${jobTitle}!`);
      } else {
        alert('Error extracting skills: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error extracting skills:', error);
      alert('Failed to extract skills. Please try again.');
    } finally {
      setExtractingSkills(false);
    }
  };

  const saveJobCriteria = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/job-criteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, keywords })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('✅ Job criteria saved successfully! This will be used for CV screening.');
        if (data.keywords) {
          setKeywords(data.keywords);
        }
        // Trigger a page refresh to show the new criteria banner
        window.location.reload();
      }
    } catch (error) {
      console.error('Error saving criteria:', error);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-purple-400" />
          ATS Configuration
        </h2>
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              activeTab === 'upload' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Upload CVs
          </button>
          <button
            onClick={() => setActiveTab('criteria')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              activeTab === 'criteria' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Job Criteria
          </button>
        </div>
      </div>

      {activeTab === 'upload' && (
        <div className="space-y-6">
          {/* Reference CV Upload */}
          <div className="bg-gradient-to-br from-purple-900/25 to-fuchsia-900/20 border border-purple-500/40 rounded-xl p-6 shadow-lg shadow-purple-900/20">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <FileCheck className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Reference CV for Benchmarking</h3>
                <p className="text-sm text-gray-400">
                  Upload one ideal profile with target role. Analysis uses it to derive role context for candidate comparison.
                </p>
              </div>
            </div>

            <label className="block text-xs font-semibold uppercase tracking-wide text-purple-300 mb-2">
              Reference Job Title
            </label>
            <input
              type="text"
              value={referenceJobTitle}
              onChange={(e) => setReferenceJobTitle(e.target.value)}
              placeholder="e.g., Senior Sales Manager"
              className="w-full mb-4 bg-gray-900/70 border border-purple-500/30 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
            />
            
            {referenceCV ? (
              <div className="flex items-center justify-between bg-purple-900/30 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600/30 rounded">
                    <FileCheck className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{referenceCV.name}</p>
                    <p className="text-xs text-gray-400">{referenceCV.size} • {referenceCV.jobTitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setReferenceCV(null)}
                  className="p-2 hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-red-400" />
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleReferenceCVUpload}
                  className="hidden"
                  id="reference-cv-upload"
                />
                <label
                  htmlFor="reference-cv-upload"
                  className={`flex items-center justify-center gap-2 w-full px-4 py-3 text-white rounded-lg transition-colors font-medium ${
                    referenceUploading
                      ? 'bg-gray-700 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 cursor-pointer'
                  }`}
                >
                  {referenceUploading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload Reference CV
                    </>
                  )}
                </label>
              </div>
            )}
          </div>

          {/* Regular CV Upload */}
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-cyan-500 transition-colors bg-gray-800/30">
            <div className="inline-block p-4 bg-gray-700/50 rounded-full mb-4">
              <Upload className="w-10 h-10 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Upload Candidate CVs</h3>
            <p className="text-gray-400 mb-6">Drag and drop files or click to browse</p>
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="cv-upload"
            />
            <label
              htmlFor="cv-upload"
              className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg cursor-pointer inline-flex items-center gap-2 transition-colors font-semibold"
            >
              <Plus className="w-5 h-5" />
              Choose Files
            </label>
            <p className="text-xs text-gray-500 mt-4">Supports PDF, Word, and Text files</p>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <span className="text-cyan-400">●</span> Recently Uploaded ({uploadedFiles.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-cyan-500/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${file.status === 'uploaded' ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                        <FileCheck className={`w-5 h-5 ${file.status === 'uploaded' ? 'text-green-400' : 'text-red-400'}`} />
                      </div>
                      <div>
                        <p className="text-gray-300 font-medium">{file.name}</p>
                        {file.size && <p className="text-xs text-gray-500">{file.size}</p>}
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      file.status === 'uploaded' 
                        ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                        : 'bg-red-900/30 text-red-400 border border-red-500/30'
                    }`}>
                      {file.status === 'uploaded' ? '✓ Uploaded' : '✗ Error'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'criteria' && (
        <div className="space-y-6">
          {/* Job Title Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              Job Title/Position
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Sales Manager, Data Scientist, Full Stack Developer..."
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
              <button
                onClick={extractSkillsFromAI}
                disabled={!jobTitle.trim() || extractingSkills}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2 whitespace-nowrap font-semibold shadow-lg"
              >
                {extractingSkills ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    AI Extract Skills
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Click AI Extract to auto-generate skills based on job title
            </p>
          </div>

          {/* Keywords Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Required Skills & Keywords
            </label>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                placeholder="Add skill/keyword..."
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
              />
              <button
                onClick={addKeyword}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-semibold flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </div>
            
            {/* Keywords Display */}
            {keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-2 bg-gradient-to-r from-cyan-900/40 to-purple-900/40 border border-cyan-500/30 rounded-full px-4 py-2 hover:border-cyan-400/50 transition-all"
                  >
                    <span className="text-white font-medium">{keyword}</span>
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="p-0.5 hover:bg-red-500/20 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">
                <Target className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500">No keywords added yet</p>
                <p className="text-xs text-gray-600 mt-1">Add keywords manually or use AI Extract</p>
              </div>
            )}
          </div>

          {/* ATS Process Info */}
          <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-5">
            <h4 className="font-semibold text-cyan-400 flex items-center gap-2 mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              ATS Screening Process:
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>CVs are automatically screened against these keywords using ML</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>Fair-Hire Sentinel monitors for bias in rejections</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>Qualified candidates with semantic matches get rescued</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span className="text-purple-300">
                  Reference CV context: {referenceCV ? `${referenceCV.name} (${referenceCV.jobTitle})` : 'Not uploaded yet'}
                </span>
              </li>
            </ul>
          </div>

          {/* Save Button */}
          <button
            onClick={saveJobCriteria}
            disabled={!jobTitle.trim() || keywords.length === 0}
            className="w-full px-6 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all shadow-lg text-lg flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Job Criteria
          </button>
        </div>
      )}
    </div>
  );
}
