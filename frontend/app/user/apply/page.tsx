'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, ArrowLeft, FileText, Briefcase, User, Mail, Phone, MapPin, GraduationCap, Briefcase as BriefcaseIcon, DollarSign, Calendar, Users } from 'lucide-react';

export default function UserApply() {
  const [formData, setFormData] = useState({
    jobTitle: '',
    file: null as File | null,
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'Male',
    experience: '',
    skills: '',
    education: '',
    location: '',
    currentRole: '',
    expectedSalary: '',
  });
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData({ ...formData, file: e.dataTransfer.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file || !formData.jobTitle) return;

    setUploading(true);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const submitFormData = new FormData();
    submitFormData.append('file', formData.file);
    submitFormData.append('jobTitle', formData.jobTitle);
    submitFormData.append('userId', user.email);
    submitFormData.append('name', formData.name);
    submitFormData.append('email', formData.email);
    submitFormData.append('phone', formData.phone);
    submitFormData.append('age', formData.age);
    submitFormData.append('gender', formData.gender);
    submitFormData.append('experience', formData.experience);
    submitFormData.append('skills', formData.skills);
    submitFormData.append('education', formData.education);
    submitFormData.append('location', formData.location);
    submitFormData.append('currentRole', formData.currentRole);
    submitFormData.append('expectedSalary', formData.expectedSalary);

    try {
      const response = await fetch('/api/user/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitFormData,
      });

      const data = await response.json();
      
      if (data.success) {
        router.push('/user');
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Fair-Hire</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-8 px-6">
        <button
          onClick={() => router.push('/user')}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>

        <div className="bg-white shadow-lg rounded-2xl border border-gray-100 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Application</h1>
            <p className="text-gray-600">Fill in your details and upload your resume to apply</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" /> Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" /> Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" /> Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="+1234567890"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" /> Age *
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="25"
                  min="18"
                  max="100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" /> Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <BriefcaseIcon className="inline h-4 w-4 mr-1" /> Experience (years) *
                </label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="5"
                  min="0"
                  max="50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" /> Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="New York, USA"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <GraduationCap className="inline h-4 w-4 mr-1" /> Education *
                </label>
                <input
                  type="text"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Bachelor's in Computer Science"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Briefcase className="inline h-4 w-4 mr-1" /> Job Title *
              </label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g. Software Engineer, Product Manager"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <BriefcaseIcon className="inline h-4 w-4 mr-1" /> Current Role *
              </label>
              <input
                type="text"
                value={formData.currentRole}
                onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Senior Developer"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Skills (comma-separated) *
              </label>
              <textarea
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="JavaScript, React, Node.js, Python"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" /> Expected Salary *
              </label>
              <input
                type="text"
                value={formData.expectedSalary}
                onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="$80,000 - $100,000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Resume / CV *
              </label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : formData.file
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {formData.file ? (
                  <div className="space-y-3">
                    <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{formData.file.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <label className="cursor-pointer inline-block">
                      <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        Change file
                      </span>
                      <input
                        type="file"
                        className="sr-only"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <label className="cursor-pointer">
                        <span className="text-base font-semibold text-gray-900">
                          Drop your file here or{' '}
                          <span className="text-blue-600 hover:text-blue-700">browse</span>
                        </span>
                        <input
                          type="file"
                          className="sr-only"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileChange}
                          required
                        />
                      </label>
                      <p className="mt-2 text-sm text-gray-500">
                        PDF, DOC, DOCX, or TXT (Max 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => router.push('/user')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !formData.file || !formData.jobTitle}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg transition-all"
              >
                {uploading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}