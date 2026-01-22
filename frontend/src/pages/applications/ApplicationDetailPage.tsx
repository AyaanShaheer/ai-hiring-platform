import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft, Briefcase, User, TrendingUp, Lightbulb, RefreshCw } from 'lucide-react';
import { applicationService } from '../../services/applicationService';
import type { Application } from '../../types';

const ApplicationDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);

    useEffect(() => {
        const fetchApplication = async () => {
            try {
                const data = await applicationService.getApplication(Number(id));
                setApplication(data);
            } catch (error) {
                console.error('Failed to fetch application:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchApplication();
    }, [id]);

    const handleRegenerateExplanation = async () => {
        if (!application) return;

        setRegenerating(true);
        try {
            const updated = await applicationService.regenerateExplanation(application.id);
            setApplication(updated);
        } catch (error) {
            console.error('Failed to regenerate explanation:', error);
        } finally {
            setRegenerating(false);
        }
    };

    const handleStatusUpdate = async (newStatus: 'pending' | 'shortlisted' | 'rejected' | 'interviewing' | 'hired') => {
        if (!application) return;

        try {
            const updated = await applicationService.updateApplication(application.id, { recruiter_status: newStatus });
            setApplication(updated);
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'hired': return 'success';
            case 'shortlisted':
            case 'interviewing': return 'info';
            case 'rejected': return 'danger';
            default: return 'default';
        }
    };

    const getRecommendationVariant = (recommendation: string) => {
        switch (recommendation) {
            case 'hire': return 'success';
            case 'interview': return 'info';
            case 'reject': return 'warning';
            default: return 'default';
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

    if (!application) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <p className="text-slate-400">Application not found</p>
                    <Button variant="primary" onClick={() => navigate('/applications')} className="mt-4">
                        Back to Applications
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate('/applications')} icon={<ArrowLeft />}>
                        Back to Applications
                    </Button>
                    <Badge variant={getStatusVariant(application.recruiter_status || 'pending')}>
                        {(application.recruiter_status || 'pending').toUpperCase()}
                    </Badge>
                </div>

                {/* Candidate & Job Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-50">Candidate</h3>
                                <p className="text-sm text-slate-400">Resume Details</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-slate-50 font-medium">
                                {application.candidate_name || application.resume?.candidate_name || 'Unknown Candidate'}
                            </p>
                            <p className="text-sm text-slate-400">{application.candidate_email || application.resume?.candidate_email}</p>
                            <p className="text-sm text-slate-400">
                                {application.resume?.experience_years} years experience
                            </p>
                            {application.resume?.skills && application.resume.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {application.resume.skills.map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 text-xs rounded-full bg-slate-700 text-slate-300"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                                <Briefcase className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-50">Job Position</h3>
                                <p className="text-sm text-slate-400">Matched Role</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-slate-50 font-medium">{application.job_title || application.job?.title || 'Unknown Job'}</p>
                            <p className="text-sm text-slate-400">{application.job?.company}</p>
                            <p className="text-sm text-slate-400">{application.job?.location}</p>
                        </div>
                    </Card>
                </div>

                {/* Match Scores */}
                <Card>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-cyan-500">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-50">Match Analysis</h3>
                            <p className="text-sm text-slate-400">AI-Powered Scoring</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                            <p className="text-4xl font-bold gradient-text">
                                {application.match_score?.toFixed(0) || 0}%
                            </p>
                            <p className="text-sm text-slate-400 mt-1">Overall Match</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-3xl font-bold text-slate-50">
                                {application.skill_match_score?.toFixed(0) || 0}%
                            </p>
                            <p className="text-sm text-slate-400 mt-1">Skills Match</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-3xl font-bold text-slate-50">
                                {application.experience_match_score?.toFixed(0) || 0}%
                            </p>
                            <p className="text-sm text-slate-400 mt-1">Experience</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-3xl font-bold text-slate-50">
                                {application.semantic_similarity_score?.toFixed(0) || 0}%
                            </p>
                            <p className="text-sm text-slate-400 mt-1">Semantic</p>
                        </div>
                    </div>

                    {application.ai_recommendation && (
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-slate-400">AI Recommendation:</span>
                            <Badge variant={getRecommendationVariant(application.ai_recommendation)} className="text-lg px-4 py-2">
                                {application.ai_recommendation.toUpperCase()}
                            </Badge>
                        </div>
                    )}
                </Card>

                {/* AI Explanation */}
                {application.explanation && (
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                                    <Lightbulb className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-50">AI Explanation</h3>
                                    <p className="text-sm text-slate-400">Generated Analysis</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRegenerateExplanation}
                                loading={regenerating}
                                icon={<RefreshCw className="w-4 h-4" />}
                            >
                                Regenerate
                            </Button>
                        </div>
                        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                            <p className="text-slate-300 whitespace-pre-line">{application.explanation}</p>
                        </div>
                    </Card>
                )}

                {/* Actions */}
                <Card>
                    <h3 className="text-lg font-semibold text-slate-50 mb-4">Update Status</h3>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant={application.recruiter_status === 'shortlisted' ? 'primary' : 'secondary'}
                            onClick={() => handleStatusUpdate('shortlisted')}
                        >
                            Shortlist
                        </Button>
                        <Button
                            variant={application.recruiter_status === 'interviewing' ? 'primary' : 'secondary'}
                            onClick={() => handleStatusUpdate('interviewing')}
                        >
                            Move to Interview
                        </Button>
                        <Button
                            variant={application.recruiter_status === 'hired' ? 'primary' : 'secondary'}
                            onClick={() => handleStatusUpdate('hired')}
                        >
                            Hire
                        </Button>
                        <Button
                            variant={application.recruiter_status === 'rejected' ? 'danger' : 'ghost'}
                            onClick={() => handleStatusUpdate('rejected')}
                        >
                            Reject
                        </Button>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default ApplicationDetailPage;
