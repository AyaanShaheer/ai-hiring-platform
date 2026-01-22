import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Briefcase, ArrowLeft } from 'lucide-react';
import { jobService } from '../../services/jobService';

const CreateJobPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        job_type: 'full-time',
        experience_level: 'mid',
        min_experience_years: 0,
        max_experience_years: 10,
        salary_min: 0,
        salary_max: 0,
        description: '',
        required_skills: '',
        preferred_skills: '',
        benefits: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name.includes('experience_years') || name.includes('salary') ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const jobData = {
                ...formData,
                requirements: formData.description, // Use description as requirements for now
                required_skills: formData.required_skills.split(',').map(s => s.trim()).filter(Boolean),
                preferred_skills: formData.preferred_skills.split(',').map(s => s.trim()).filter(Boolean),
                benefits: formData.benefits.split(',').map(s => s.trim()).filter(Boolean),
            };

            await jobService.createJob(jobData);
            navigate('/jobs');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to create job. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/jobs')} icon={<ArrowLeft className="w-5 h-5" />}>
                        Back
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-slate-50 mb-2">Create Job Posting</h1>
                        <p className="text-slate-400">Fill in the details to create a new job posting</p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400">
                        {error}
                    </div>
                )}

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h2 className="text-xl font-semibold text-slate-50 mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-cyan-400" />
                                Basic Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    name="title"
                                    label="Job Title"
                                    placeholder="e.g., Senior Full Stack Developer"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    name="company"
                                    label="Company Name"
                                    placeholder="e.g., Tech Corp"
                                    value={formData.company}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    name="location"
                                    label="Location"
                                    placeholder="e.g., San Francisco, CA"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                />
                                <div>
                                    <label className="block text-sm font-medium text-slate-200 mb-2">
                                        Job Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="job_type"
                                        value={formData.job_type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 backdrop-blur-lg border border-white/10 text-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        required
                                    >
                                        <option value="full-time">Full Time</option>
                                        <option value="part-time">Part Time</option>
                                        <option value="contract">Contract</option>
                                        <option value="internship">Internship</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Experience & Salary */}
                        <div>
                            <h2 className="text-xl font-semibold text-slate-50 mb-4">Experience & Compensation</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-200 mb-2">Experience Level</label>
                                    <select
                                        name="experience_level"
                                        value={formData.experience_level}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 backdrop-blur-lg border border-white/10 text-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <option value="entry">Entry Level</option>
                                        <option value="mid">Mid Level</option>
                                        <option value="senior">Senior Level</option>
                                        <option value="lead">Lead</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        type="number"
                                        name="min_experience_years"
                                        label="Min Years"
                                        value={formData.min_experience_years}
                                        onChange={handleChange}
                                        min={0}
                                    />
                                    <Input
                                        type="number"
                                        name="max_experience_years"
                                        label="Max Years"
                                        value={formData.max_experience_years}
                                        onChange={handleChange}
                                        min={0}
                                    />
                                </div>
                                <Input
                                    type="number"
                                    name="salary_min"
                                    label="Min Salary (Annual)"
                                    placeholder="e.g., 80000"
                                    value={formData.salary_min}
                                    onChange={handleChange}
                                    min={0}
                                />
                                <Input
                                    type="number"
                                    name="salary_max"
                                    label="Max Salary (Annual)"
                                    placeholder="e.g., 120000"
                                    value={formData.salary_max}
                                    onChange={handleChange}
                                    min={0}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-2">
                                Job Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={6}
                                className="w-full px-4 py-2.5 rounded-lg bg-white/5 backdrop-blur-lg border border-white/10 text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder="Describe the role, responsibilities, and what you're looking for..."
                                required
                            />
                        </div>

                        {/* Skills */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Input
                                    name="required_skills"
                                    label="Required Skills"
                                    placeholder="React, TypeScript, Node.js (comma separated)"
                                    value={formData.required_skills}
                                    onChange={handleChange}
                                    helperText="Separate skills with commas"
                                />
                            </div>
                            <div>
                                <Input
                                    name="preferred_skills"
                                    label="Preferred Skills"
                                    placeholder="GraphQL, AWS, Docker (comma separated)"
                                    value={formData.preferred_skills}
                                    onChange={handleChange}
                                    helperText="Separate skills with commas"
                                />
                            </div>
                        </div>

                        {/* Benefits */}
                        <div>
                            <Input
                                name="benefits"
                                label="Benefits"
                                placeholder="Health Insurance, 401k, Remote Work (comma separated)"
                                value={formData.benefits}
                                onChange={handleChange}
                                helperText="Separate benefits with commas"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <Button type="submit" variant="primary" loading={loading} className="flex-1">
                                Create Job
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => navigate('/jobs')}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default CreateJobPage;
