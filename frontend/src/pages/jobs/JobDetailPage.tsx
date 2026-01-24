import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft, MapPin, Briefcase, DollarSign, Target, Zap, CheckCircle, AlertTriangle, Shield, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { jobService } from '../../services/jobService';
import { resumeService } from '../../services/resumeService';
import { applicationService } from '../../services/applicationService';
import { biasService, type BiasAnalysis } from '../../services/biasService';
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
    const [biasAnalysis, setBiasAnalysis] = useState<BiasAnalysis | null>(null);
    const [analyzingBias, setAnalyzingBias] = useState(false);
    const [showBiasDetails, setShowBiasDetails] = useState(false);

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

    const handleAnalyzeBias = async () => {
        if (!job) return;
        setAnalyzingBias(true);
        try {
            const analysis = await biasService.analyzeJobBias(job.id, true);
            setBiasAnalysis(analysis);
            setShowBiasDetails(true);
        } catch (error) {
            console.error('Failed to analyze bias:', error);
            alert('Failed to analyze bias. Please try again.');
        } finally {
            setAnalyzingBias(false);
        }
    };

    const getBiasRiskColor = (level: string) => {
        switch (level) {
            case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
            case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
            case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
            default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
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

                {/* Bias Detection Section */}
                <Card>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Shield className="w-6 h-6 text-primary-400" />
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-50">Bias Detection</h2>
                                    <p className="text-sm text-slate-400">AI-powered analysis for inclusive language</p>
                                </div>
                            </div>
                            <Button
                                variant="primary"
                                onClick={handleAnalyzeBias}
                                loading={analyzingBias}
                                icon={<Zap className="w-4 h-4" />}
                            >
                                {biasAnalysis ? 'Re-analyze' : 'Analyze for Bias'}
                            </Button>
                        </div>

                        {biasAnalysis && (
                            <div className="space-y-4">
                                {/* Risk Overview */}
                                <div className="flex items-center gap-4 p-4 bg-dark-800/50 rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-slate-400">Risk Level:</span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getBiasRiskColor(biasAnalysis.bias_risk_level)}`}>
                                                {biasAnalysis.bias_risk_level.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-400">Bias Score:</span>
                                            <div className="flex-1 max-w-xs">
                                                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all ${biasAnalysis.bias_score >= 60 ? 'bg-red-500' :
                                                                biasAnalysis.bias_score >= 30 ? 'bg-yellow-500' : 'bg-green-500'
                                                            }`}
                                                        style={{ width: `${Math.min(biasAnalysis.bias_score, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-slate-300 font-medium">{biasAnalysis.bias_score.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                    {biasAnalysis.flags.length > 0 && (
                                        <button
                                            onClick={() => setShowBiasDetails(!showBiasDetails)}
                                            className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
                                        >
                                            {showBiasDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            {showBiasDetails ? 'Hide' : 'Show'} Details
                                        </button>
                                    )}
                                </div>

                                {/* Detailed Analysis */}
                                {showBiasDetails && (
                                    <div className="space-y-4">
                                        {/* Summary */}
                                        {biasAnalysis.summary && (
                                            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                                <p className="text-slate-200">{biasAnalysis.summary}</p>
                                            </div>
                                        )}

                                        {/* Flags */}
                                        {biasAnalysis.flags.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-50 mb-3 flex items-center gap-2">
                                                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                                    Detected Issues ({biasAnalysis.flags.length})
                                                </h3>
                                                <div className="space-y-2">
                                                    {biasAnalysis.flags.map((flag, idx) => (
                                                        <div key={idx} className="p-3 bg-dark-800/50 rounded-lg border border-yellow-500/20">
                                                            <div className="flex items-start gap-2">
                                                                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                                                <div className="flex-1">
                                                                    <p className="text-slate-200 font-medium">{flag.text}</p>
                                                                    {flag.suggestion && (
                                                                        <p className="text-sm text-slate-400 mt-1">💡 {flag.suggestion}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* AI Recommendations */}
                                        {biasAnalysis.recommendations && biasAnalysis.recommendations.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-50 mb-3 flex items-center gap-2">
                                                    <Lightbulb className="w-5 h-5 text-primary-400" />
                                                    AI Recommendations
                                                </h3>
                                                <ul className="space-y-2">
                                                    {biasAnalysis.recommendations.map((rec, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-slate-300">
                                                            <span className="text-primary-400 mt-1">•</span>
                                                            <span>{rec}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Best Practices */}
                                        {biasAnalysis.best_practices && biasAnalysis.best_practices.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-50 mb-3 flex items-center gap-2">
                                                    <Shield className="w-5 h-5 text-green-400" />
                                                    Best Practices
                                                </h3>
                                                <ul className="space-y-2">
                                                    {biasAnalysis.best_practices.map((practice, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-slate-300">
                                                            <span className="text-green-400 mt-1">✓</span>
                                                            <span>{practice}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {biasAnalysis.flags.length === 0 && (
                                    <div className="text-center py-8">
                                        <Shield className="w-16 h-16 mx-auto text-green-400 mb-3" />
                                        <h3 className="text-lg font-semibold text-slate-50 mb-2">No Bias Detected</h3>
                                        <p className="text-slate-400">This job posting appears to use inclusive language.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {!biasAnalysis && (
                            <div className="text-center py-12">
                                <Shield className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                                <p className="text-slate-400 mb-2">No bias analysis performed yet</p>
                                <p className="text-sm text-slate-500">Click "Analyze for Bias" to check this job posting for biased language</p>
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
