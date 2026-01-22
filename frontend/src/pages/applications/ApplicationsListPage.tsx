import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Users, TrendingUp, Briefcase } from 'lucide-react';
import { applicationService } from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import type { Application } from '../../types';

const ApplicationsListPage: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                // Fetch all jobs first, then get applications for each job
                const jobs = await jobService.getJobs(true);
                const allApplications: Application[] = [];

                // Fetch applications for each job
                for (const job of jobs) {
                    try {
                        const jobApps = await applicationService.getJobMatches(job.id, 0);
                        allApplications.push(...jobApps);
                    } catch (err) {
                        console.error(`Failed to fetch applications for job ${job.id}:`, err);
                    }
                }

                setApplications(allApplications);
            } catch (error) {
                console.error('Failed to fetch applications:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'hired':
                return 'success';
            case 'shortlisted':
            case 'interviewing':
                return 'info';
            case 'rejected':
                return 'danger';
            default:
                return 'default';
        }
    };

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
                <div>
                    <h1 className="text-3xl font-bold text-dark-50 mb-2">Applications</h1>
                    <p className="text-dark-400">View and manage candidate applications</p>
                </div>

                {/* Applications List */}
                {applications.length === 0 ? (
                    <Card>
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 mx-auto text-dark-600 mb-4" />
                            <h3 className="text-xl font-semibold text-dark-300 mb-2">No applications yet</h3>
                            <p className="text-dark-500">Applications will appear here when you match candidates to jobs</p>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {applications.map((application) => (
                            <Card key={application.id} hover className="cursor-pointer">
                                <Link to={`/applications/${application.id}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-dark-50 mb-1">
                                                        {application.candidate_name || application.resume?.candidate_name || 'Unknown Candidate'}
                                                    </h3>
                                                    <p className="text-sm text-dark-400 flex items-center gap-2">
                                                        <Briefcase className="w-4 h-4" />
                                                        {application.job_title || application.job?.title || 'Unknown Job'}
                                                    </p>
                                                </div>
                                                <Badge variant={getStatusVariant(application.recruiter_status)}>
                                                    {application.recruiter_status}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="w-5 h-5 text-primary-400" />
                                                    <div>
                                                        <p className="text-2xl font-bold text-dark-50">
                                                            {application.match_score?.toFixed(0) || 0}%
                                                        </p>
                                                        <p className="text-xs text-dark-500">Overall Match</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4 text-sm">
                                                    <div>
                                                        <p className="text-dark-400">Skills</p>
                                                        <p className="font-semibold text-dark-200">
                                                            {application.skill_match_score?.toFixed(0) || 0}%
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-dark-400">Experience</p>
                                                        <p className="font-semibold text-dark-200">
                                                            {application.experience_match_score?.toFixed(0) || 0}%
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-dark-400">Semantic</p>
                                                        <p className="font-semibold text-dark-200">
                                                            {application.semantic_similarity_score?.toFixed(0) || 0}%
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {application.ai_recommendation && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-dark-400">AI Recommendation:</span>
                                                    <Badge variant={
                                                        application.ai_recommendation === 'hire' ? 'success' :
                                                            application.ai_recommendation === 'interview' ? 'info' : 'warning'
                                                    }>
                                                        {application.ai_recommendation.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
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

export default ApplicationsListPage;
