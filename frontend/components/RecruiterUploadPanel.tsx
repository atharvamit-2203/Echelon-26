'use client';

import { useState } from 'react';
import { Upload, Plus, X, Briefcase, Target } from 'lucide-react';

export default function RecruiterUploadPanel() {
  const [activeTab, setActiveTab] = useState('upload');
  const [keywords, setKeywords] = useState(['Communication', 'Leadership', 'Problem Solving']);
  const [newKeyword, setNewKeyword] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);

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
          setUploadedFiles(prev => [...prev, { name: file.name, status: 'uploaded' }]);
        }
      } catch (error) {
        console.error('Upload error:', error);
        setUploadedFiles(prev => [...prev, { name: file.name, status: 'error' }]);
      }
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

  const saveJobCriteria = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/job-criteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, keywords })
      });
      
      if (response.ok) {
        alert('Job criteria saved successfully!');
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
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Upload CV Files</h3>
            <p className="text-gray-400 mb-4">Drag and drop files or click to browse</p>
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
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer inline-block transition-colors"
            >
              Choose Files
            </label>
            <p className="text-xs text-gray-500 mt-2">Supports PDF, Word, and Text files</p>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-white">Recently Uploaded:</h4>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-800 rounded p-3">
                  <span className="text-gray-300">{file.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    file.status === 'uploaded' 
                      ? 'bg-green-900/30 text-green-400' 
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {file.status === 'uploaded' ? 'Uploaded' : 'Error'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'criteria' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Job Title/Position
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Sales Manager, Data Scientist..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Required Skills & Keywords
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                placeholder="Add skill/keyword..."
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={addKeyword}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {keywords.map(keyword => (
                <span
                  key={keyword}
                  className="bg-purple-900/30 border border-purple-700 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="text-purple-400 hover:text-purple-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <button
              onClick={saveJobCriteria}
              disabled={!jobTitle || keywords.length === 0}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4" />
              Save Job Criteria
            </button>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">⚡ ATS Screening Process:</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• CVs are automatically screened against these keywords</li>
              <li>• Fair-Hire Sentinel monitors for bias in rejections</li>
              <li>• Qualified candidates with semantic matches get rescued</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}