import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft, MapPin, Briefcase, DollarSign, Target, Zap, CheckCircle } from 'lucide-react';
import { jobService } from '../../services/jobService';
import { resumeService } from '../../services/resumeService';
import { applicationService } from '../../services/applicationService';
import type { Job, Resume } from '../../types';

const JobDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [job, setJob] = useState<Job | null>(null);
    const [availableResumes, setAvailableResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [matchModalOpen, setMatchModalOpen] = useState(false);
    const [selectedResumes, setSelectedResumes] = useState<number[]>([]);
    const [matching, setMatching] = useState(false);
    const [matchSuccess, setMatchSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobData, resumesData] = await Promise.all([
                    jobService.getJob(Number(id)),
                    resumeService.getResumes(),
                ]);
                setJob(jobData);
                // Filter only completed resumes
                setAvailableResumes(resumesData.filter(r => r.processing_status === 'completed'));
            } catch (error) {
                console.error('Failed to fetch job details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleMatchCandidates = async () => {
        if (!job || selectedResumes.length === 0) return;

        setMatching(true);
        try {
            // Create matches for selected resumes
            await Promise.all(
                selectedResumes.map(resumeId =>
                    applicationService.createMatch({ job_id: job.id, resume_id: resumeId })
                )
            );
            setMatchSuccess(true);
            setTimeout(() => {
                setMatchModalOpen(false);
                navigate('/applications');
            }, 2000);
        } catch (error) {
            console.error('Failed to match candidates:', error);
            alert('Failed to match candidates. Please try again.');
        } finally {
            setMatching(false);
        }
    };

    const toggleResumeSelection = (resumeId: number) => {
        setSelectedResumes(prev =>
            prev.includes(resumeId)
                ? prev.filter(id => id !== resumeId)
                : [...prev, resumeId]
        );
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

    if (!job) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <p className="text-slate-400">Job not found</p>
                    <Link to="/jobs">
                        <Button variant="primary" className="mt-4">
                            Back to Jobs
                        </Button>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate('/jobs')} icon={<ArrowLeft />}>
                        Back to Jobs
                    </Button>
                    <div className="flex gap-3">
                        <Button
                            variant="primary"
                            onClick={() => setMatchModalOpen(true)}
                            icon={<Target className="w-5 h-5" />}
                        >
                            Match Candidates
                        </Button>
                    </div>
                </div>

                {/* Job Details */}
                <Card>
                    <div className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-slate-50 mb-2">{job.title}</h1>
                                <p className="text-xl text-slate-300">{job.company}</p>
                            </div>
                            <Badge variant={job.is_active ? 'success' : 'default'}>
                                {job.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2 text-slate-400">
                                <MapPin className="w-5 h-5" />
                                <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <Briefcase className="w-5 h-5" />
                                <span>{job.experience_years_min || 0}-{job.experience_years_max || 10} years</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <DollarSign className="w-5 h-5" />
                                <span>Salary Range Available</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-50 mb-2">Description</h3>
                            <p className="text-slate-300 whitespace-pre-line">{job.description}</p>
                        </div>

                        {job.requirements && (
                            <div>
                                <h3 className="text-lg font-semibold text-slate-50 mb-2">Requirements</h3>
                                <p className="text-slate-300 whitespace-pre-line">{job.requirements}</p>
                            </div>
                        )}

                        {job.required_skills && job.required_skills.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-slate-50 mb-3">Required Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {job.required_skills.map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-sm font-medium"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Match Candidates Modal */}
                <Modal
                    isOpen={matchModalOpen}
                    onClose={() => setMatchModalOpen(false)}
                    title="Match Candidates to Job"
                    size="lg"
                >
                    {matchSuccess ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-50 mb-2">Matching Complete!</h3>
                            <p className="text-slate-400">
                                Successfully matched {selectedResumes.length} candidate(s). Redirecting to applications...
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-slate-400">
                                Select candidates to match with this job. AI will analyze each candidate and generate match scores.
                            </p>

                            {availableResumes.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-slate-400 mb-4">No processed resumes available</p>
                                    <Link to="/resumes/upload">
                                        <Button variant="primary">Upload Resumes</Button>
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-2">
                                        {availableResumes.map((resume) => (
                                            <div
                                                key={resume.id}
                                                onClick={() => toggleResumeSelection(resume.id)}
                                                className={`
                          p-4 rounded-lg border cursor-pointer transition-all
                          ${selectedResumes.includes(resume.id)
                                                        ? 'bg-cyan-500/20 border-cyan-500/50'
                                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                                    }
                        `}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-slate-50">
                                                            {resume.candidate_name || 'Unknown Candidate'}
                                                        </h4>
                                                        <p className="text-sm text-slate-400">{resume.candidate_email}</p>
                                                        {resume.skills && resume.skills.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {resume.skills.slice(0, 3).map((skill, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-300"
                                                                    >
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                                {resume.skills.length > 3 && (
                                                                    <span className="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-400">
                                                                        +{resume.skills.length - 3}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {selectedResumes.includes(resume.id) && (
                                                        <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                        <p className="text-sm text-slate-400">
                                            {selectedResumes.length} candidate(s) selected
                                        </p>
                                        <div className="flex gap-3">
                                            <Button variant="ghost" onClick={() => setMatchModalOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="primary"
                                                onClick={handleMatchCandidates}
                                                disabled={selectedResumes.length === 0 || matching}
                                                loading={matching}
                                                icon={<Zap className="w-5 h-5" />}
                                            >
                                                {matching ? 'Matching...' : `Match ${selectedResumes.length} Candidate(s)`}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </Modal>
            </div>
        </DashboardLayout>
    );
};

export default JobDetailPage;
