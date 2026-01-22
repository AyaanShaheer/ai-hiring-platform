import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Plus, Briefcase, MapPin, Calendar } from 'lucide-react';
import { jobService } from '../../services/jobService';
import type { Job } from '../../types';

const JobsListPage: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await jobService.getJobs();
                setJobs(data);
            } catch (error) {
                console.error('Failed to fetch jobs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <LoadingSpinner size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-dark-50 mb-2">Jobs</h1>
                        <p className="text-dark-400">Manage your job postings</p>
                    </div>
                    <Link to="/jobs/new">
                        <Button variant="primary" icon={<Plus className="w-5 h-5" />}>
                            Create Job
                        </Button>
                    </Link>
                </div>

                {/* Jobs Grid */}
                {jobs.length === 0 ? (
                    <Card>
                        <div className="text-center py-12">
                            <Briefcase className="w-16 h-16 mx-auto text-dark-600 mb-4" />
                            <h3 className="text-xl font-semibold text-dark-300 mb-2">No jobs yet</h3>
                            <p className="text-dark-500 mb-6">Create your first job posting to get started</p>
                            <Link to="/jobs/new">
                                <Button variant="primary" icon={<Plus className="w-5 h-5" />}>
                                    Create Job
                                </Button>
                            </Link>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <Card key={job.id} hover className="cursor-pointer">
                                <Link to={`/jobs/${job.id}`}>
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-dark-50 mb-1">{job.title}</h3>
                                                <p className="text-sm text-dark-400">{job.company}</p>
                                            </div>
                                            <Badge variant={job.is_active ? 'success' : 'default'}>
                                                {job.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-dark-400">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                <span>{job.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(job.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {job.required_skills && job.required_skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {job.required_skills.slice(0, 3).map((skill, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 text-xs rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                                {job.required_skills.length > 3 && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-dark-700 text-dark-400">
                                                        +{job.required_skills.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default JobsListPage;
