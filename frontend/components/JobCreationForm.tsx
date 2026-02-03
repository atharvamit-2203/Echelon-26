"""
Job Creation Form Component
"""
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';

export default function JobCreationForm() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        department: '',
        location: '',
        jobType: 'full-time',
        minExperience: 0,
        maxExperience: null
    });

    const [keywords, setKeywords] = useState<string[]>([]);
    const [keywordInput, setKeywordInput] = useState('');

    const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
    const [requiredSkillInput, setRequiredSkillInput] = useState('');

    const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
    const [preferredSkillInput, setPreferredSkillInput] = useState('');

    const addKeyword = () => {
        if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
            setKeywords([...keywords, keywordInput.trim()]);
            setKeywordInput('');
        }
    };

    const removeKeyword = (keyword: string) => {
        setKeywords(keywords.filter(k => k !== keyword));
    };

    const addRequiredSkill = () => {
        if (requiredSkillInput.trim() && !requiredSkills.includes(requiredSkillInput.trim())) {
            setRequiredSkills([...requiredSkills, requiredSkillInput.trim()]);
            setRequiredSkillInput('');
        }
    };

    const removeRequiredSkill = (skill: string) => {
        setRequiredSkills(requiredSkills.filter(s => s !== skill));
    };

    const addPreferredSkill = () => {
        if (preferredSkillInput.trim() && !preferredSkills.includes(preferredSkillInput.trim())) {
            setPreferredSkills([...preferredSkills, preferredSkillInput.trim()]);
            setPreferredSkillInput('');
        }
    };

    const removePreferredSkill = (skill: string) => {
        setPreferredSkills(preferredSkills.filter(s => s !== skill));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const jobData = {
            ...formData,
            criteria: {
                keywords,
                required_skills: requiredSkills,
                preferred_skills: preferredSkills,
                min_experience: formData.minExperience,
                max_experience: formData.maxExperience,
                education_requirements: []
            }
        };

        try {
            const response = await fetch('http://localhost:8000/api/v1/jobs/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jobData)
            });

            if (response.ok) {
                alert('Job created successfully!');
                // Reset form
            } else {
                alert('Failed to create job');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to create job');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Job Posting</CardTitle>
                <CardDescription>
                    Define job requirements and evaluation criteria
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Job Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Job Description *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="department">Department *</Label>
                                <Input
                                    id="department"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="location">Location *</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Keywords */}
                    <div>
                        <Label>Evaluation Keywords</Label>
                        <div className="flex gap-2 mt-2">
                            <Input
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                placeholder="Add keyword..."
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                            />
                            <Button type="button" onClick={addKeyword}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {keywords.map(keyword => (
                                <span
                                    key={keyword}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                                >
                                    {keyword}
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => removeKeyword(keyword)}
                                    />
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Required Skills */}
                    <div>
                        <Label>Required Skills</Label>
                        <div className="flex gap-2 mt-2">
                            <Input
                                value={requiredSkillInput}
                                onChange={(e) => setRequiredSkillInput(e.target.value)}
                                placeholder="Add required skill..."
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequiredSkill())}
                            />
                            <Button type="button" onClick={addRequiredSkill}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {requiredSkills.map(skill => (
                                <span
                                    key={skill}
                                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center gap-2"
                                >
                                    {skill}
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => removeRequiredSkill(skill)}
                                    />
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Preferred Skills */}
                    <div>
                        <Label>Preferred Skills</Label>
                        <div className="flex gap-2 mt-2">
                            <Input
                                value={preferredSkillInput}
                                onChange={(e) => setPreferredSkillInput(e.target.value)}
                                placeholder="Add preferred skill..."
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPreferredSkill())}
                            />
                            <Button type="button" onClick={addPreferredSkill}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {preferredSkills.map(skill => (
                                <span
                                    key={skill}
                                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2"
                                >
                                    {skill}
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => removePreferredSkill(skill)}
                                    />
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Experience */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="minExperience">Minimum Experience (years)</Label>
                            <Input
                                id="minExperience"
                                type="number"
                                value={formData.minExperience}
                                onChange={(e) => setFormData({ ...formData, minExperience: parseInt(e.target.value) })}
                            />
                        </div>

                        <div>
                            <Label htmlFor="maxExperience">Maximum Experience (years)</Label>
                            <Input
                                id="maxExperience"
                                type="number"
                                value={formData.maxExperience || ''}
                                onChange={(e) => setFormData({ ...formData, maxExperience: e.target.value ? parseInt(e.target.value) : null })}
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full">
                        Create Job Posting
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
