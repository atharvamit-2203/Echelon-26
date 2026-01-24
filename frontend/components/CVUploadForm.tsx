'use client';

import { useState } from 'react';

interface CVFormData {
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  experience: number;
  skills: string;
  education: string;
  location: string;
  currentRole: string;
  expectedSalary: string;
}

export default function CVUploadForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState<CVFormData>({
    name: '',
    email: '',
    phone: '',
    age: 0,
    gender: '',
    experience: 0,
    skills: '',
    education: '',
    location: '',
    currentRole: '',
    expectedSalary: ''
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });

      const response = await fetch('http://localhost:8000/api/cvs', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        alert('CV added successfully!');
        setFormData({
          name: '', email: '', phone: '', age: 0, gender: '', experience: 0,
          skills: '', education: '', location: '', currentRole: '', expectedSalary: ''
        });
        setShowForm(false);
        onSuccess();
      } else {
        alert('Error adding CV');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding CV');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'experience' ? parseInt(value) || 0 : value
    }));
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        + Add New CV
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Add New CV</h3>
        <button
          onClick={() => setShowForm(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
        />
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
        />
        
        <input
          type="tel"
          name="phone"
          placeholder="Phone (+91-XXXXXXXXXX)"
          value={formData.phone}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
        />
        
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age || ''}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
        />
        
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Non-binary">Non-binary</option>
        </select>
        
        <input
          type="number"
          name="experience"
          placeholder="Years of Experience"
          value={formData.experience || ''}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
        />
        
        <input
          type="text"
          name="skills"
          placeholder="Skills (comma separated)"
          value={formData.skills}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2 md:col-span-2"
        />
        
        <input
          type="text"
          name="education"
          placeholder="Education"
          value={formData.education}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
        />
        
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
        />
        
        <input
          type="text"
          name="currentRole"
          placeholder="Current Role"
          value={formData.currentRole}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
        />
        
        <input
          type="text"
          name="expectedSalary"
          placeholder="Expected Salary (e.g., 15 LPA)"
          value={formData.expectedSalary}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
        />
        
        <div className="md:col-span-2 flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add CV'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}