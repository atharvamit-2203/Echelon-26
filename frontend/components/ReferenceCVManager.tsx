'use client';

import { useState, useEffect } from 'react';
import { Upload, Trash2, CheckCircle, XCircle, Link as LinkIcon, FileText } from 'lucide-react';

interface ReferenceCV {
  id: string;
  referenceId: string;
  jobTitle: string;
  fileName?: string;
  sourceUrl?: string;
  status: string;
  uploadedAt: any;
}

export default function ReferenceCVManager() {
  const [referenceCVs, setReferenceCVs] = useState<ReferenceCV[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchReferenceCVs();
  }, []);

  const fetchReferenceCVs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/reference-cvs/');
      const data = await response.json();
      setReferenceCVs(data.reference_cvs || []);
    } catch (error) {
      console.error('Error fetching reference CVs:', error);
    }
  };

  const handleUpload = async () => {
    if (uploadType === 'file' && !file) return;
    if (uploadType === 'url' && !url) return;
    if (!jobTitle) return;

    setUploading(true);
    try {
      if (uploadType === 'file') {
        const formData = new FormData();
        formData.append('file', file!);
        formData.append('jobTitle', jobTitle);

        await fetch('http://localhost:8000/api/upload-reference-cv', {
          method: 'POST',
          body: formData,
        });
      } else {
        const formData = new FormData();
        formData.append('url', url);
        formData.append('jobTitle', jobTitle);

        await fetch('http://localhost:8000/api/v1/reference-cvs/upload-url', {
          method: 'POST',
          body: formData,
        });
      }

      setShowUpload(false);
      setFile(null);
      setUrl('');
      setJobTitle('');
      fetchReferenceCVs();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reference CV?')) return;
    
    try {
      await fetch(`http://localhost:8000/api/v1/reference-cvs/${id}`, {
        method: 'DELETE',
      });
      fetchReferenceCVs();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/api/v1/reference-cvs/${id}/toggle`, {
        method: 'PATCH',
      });
      fetchReferenceCVs();
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Reference CVs</h3>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Upload className="h-4 w-4 inline mr-1" />
          Add Reference CV
        </button>
      </div>

      {showUpload && (
        <div className="mb-4 p-4 border rounded-lg bg-gray-50">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setUploadType('file')}
              className={`px-3 py-1 rounded text-sm ${uploadType === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              <FileText className="h-3 w-3 inline mr-1" />
              File
            </button>
            <button
              onClick={() => setUploadType('url')}
              className={`px-3 py-1 rounded text-sm ${uploadType === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              <LinkIcon className="h-3 w-3 inline mr-1" />
              URL
            </button>
          </div>

          <input
            type="text"
            placeholder="Job Title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded mb-2"
          />

          {uploadType === 'file' ? (
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border rounded mb-2"
            />
          ) : (
            <input
              type="url"
              placeholder="https://example.com/cv.pdf"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-2"
            />
          )}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {referenceCVs.map((cv) => (
          <div key={cv.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
            <div className="flex-1">
              <p className="font-medium">{cv.jobTitle}</p>
              <p className="text-sm text-gray-500">
                {cv.fileName || cv.sourceUrl || 'Reference CV'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggle(cv.id)}
                className={`p-2 rounded ${cv.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                title={cv.status === 'active' ? 'Active' : 'Inactive'}
              >
                {cv.status === 'active' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              </button>
              <button
                onClick={() => handleDelete(cv.id)}
                className="p-2 rounded bg-red-100 text-red-700 hover:bg-red-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {referenceCVs.length === 0 && (
          <p className="text-center text-gray-500 py-4">No reference CVs uploaded</p>
        )}
      </div>
    </div>
  );
}
