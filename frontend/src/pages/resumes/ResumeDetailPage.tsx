import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
    ArrowLeft,
    Mail,
    Phone,
    Briefcase,
    GraduationCap,
    Calendar,
    FileText,
    AlertTriangle,
    Trash2,
    Download,
    Shield,
    Zap,
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { resumeService } from '../../services/resumeService';
import { fraudService, type FraudAnalysis } from '../../services/fraudService';
import type { Resume } from '../../types';

const ResumeDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [resume, setResume] = useState<Resume | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [fraudAnalysis, setFraudAnalysis] = useState<FraudAnalysis | null>(null);
    const [analyzingFraud, setAnalyzingFraud] = useState(false);
    const [showFraudDetails, setShowFraudDetails] = useState(false);

    useEffect(() => {
        const fetchResume = async () => {
            try {
                console.log('Fetching resume with ID:', id);
                const data = await resumeService.getResume(Number(id));
                console.log('Resume data received:', data);

                // Convert any Set objects to arrays for React rendering
                const processedData = {
                    ...data,
                    skills: data.skills instanceof Set ? Array.from(data.skills) : data.skills,
                    education: data.education instanceof Set ? Array.from(data.education) :
                        Array.isArray(data.education) ? data.education :
                            data.education ? [data.education] : []
                };

                setResume(processedData as any);
            } catch (error) {
                console.error('Failed to fetch resume:', error);
                // Don't set resume to null, just show error in console
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchResume();
        } else {
            setLoading(false);
        }
    }, [id]);

    const handleDelete = async () => {
        if (!resume || !confirm('Are you sure you want to delete this resume?')) return;

        setDeleting(true);
        try {
            await resumeService.deleteResume(resume.id);
            navigate('/resumes');
        } catch (error) {
            console.error('Failed to delete resume:', error);
            setDeleting(false);
        }
    };

    const handleAnalyzeFraud = async () => {
        if (!resume) return;
        setAnalyzingFraud(true);
        try {
            const analysis = await fraudService.analyzeResumeFraud(resume.id, true);
            setFraudAnalysis(analysis);
            setShowFraudDetails(true);
        } catch (error) {
            console.error('Failed to analyze fraud:', error);
            alert('Failed to analyze fraud. Please try again.');
        } finally {
            setAnalyzingFraud(false);
        }
    };

    const getFraudRiskColor = (level: string) => {
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

    if (!resume) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <p className="text-dark-400">Resume not found</p>
                    <Button variant="primary" onClick={() => navigate('/resumes')} className="mt-4">
                        Back to Resumes
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate('/resumes')} icon={<ArrowLeft />}>
                        Back to Resumes
                    </Button>
                    <div className="flex items-center gap-3">
                        <Badge variant={resume.processing_status === 'completed' ? 'success' : 'warning'}>
                            {resume.processing_status}
                        </Badge>
                        {resume.fraud_score && resume.fraud_score > 0.7 && (
                            <Badge variant="danger" className="flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Potential Fraud
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Candidate Info */}
                <Card>
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {(resume.candidate_name || 'U')[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-dark-50 mb-2">
                                {resume.candidate_name || 'Unknown Candidate'}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-dark-400">
                                {resume.candidate_email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        <span>{resume.candidate_email}</span>
                                    </div>
                                )}
                                {resume.candidate_phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        <span>{resume.candidate_phone}</span>
                                    </div>
                                )}
                                {resume.experience_years !== undefined && (
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4" />
                                        <span>{resume.experience_years} years experience</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Skills */}
                {resume.skills && resume.skills.length > 0 && (
                    <Card>
                        <h2 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-primary-400" />
                            Skills
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {resume.skills.map((skill, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1.5 text-sm rounded-full bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-300 border border-primary-500/30"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Education */}
                {resume.education && (
                    <Card>
                        <h2 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-primary-400" />
                            Education
                        </h2>
                        <div className="space-y-3">
                            {Array.isArray(resume.education) ? (
                                resume.education.map((edu: any, idx: number) => (
                                    <div key={idx} className="p-3 bg-dark-800/50 rounded-lg">
                                        <p className="text-dark-100 font-medium">
                                            {typeof edu === 'string' ? edu : edu.degree || edu.institution || JSON.stringify(edu)}
                                        </p>
                                        {typeof edu === 'object' && edu.details && (
                                            <p className="text-sm text-dark-400 mt-1">{edu.details}</p>
                                        )}
                                    </div>
                                ))
                            ) : typeof resume.education === 'string' ? (
                                <div className="p-3 bg-dark-800/50 rounded-lg">
                                    <p className="text-dark-100 font-medium">{resume.education}</p>
                                </div>
                            ) : (
                                <div className="p-3 bg-dark-800/50 rounded-lg">
                                    <p className="text-dark-100 font-medium">
                                        {(resume.education as any).degree || (resume.education as any).institution || 'Education information available'}
                                    </p>
                                    {(resume.education as any).details && (
                                        <p className="text-sm text-dark-400 mt-1">{(resume.education as any).details}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {/* File Info */}
                <Card>
                    <h2 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary-400" />
                        File Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-dark-400">
                            <FileText className="w-4 h-4" />
                            <span>Filename: {resume.filename}</span>
                        </div>
                        <div className="flex items-center gap-2 text-dark-400">
                            <Calendar className="w-4 h-4" />
                            <span>Uploaded: {new Date(resume.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </Card>

                {/* Actions */}
                <Card>
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-dark-100">Actions</h2>
                        <div className="flex gap-3">
                            {resume.file_path && (
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2"
                                    onClick={() => window.open(`http://localhost:8000${resume.file_path}`, '_blank')}
                                >
                                    <Download className="w-4 h-4" />
                                    Download Original
                                </Button>
                            )}
                            <Button
                                variant="danger"
                                onClick={handleDelete}
                                loading={deleting}
                                className="flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Resume
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Fraud Detection Section */}
                <Card>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Shield className="w-6 h-6 text-primary-400" />
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-50">Fraud Detection</h2>
                                    <p className="text-sm text-slate-400">AI-powered resume authenticity analysis</p>
                                </div>
                            </div>
                            <Button
                                variant="primary"
                                onClick={handleAnalyzeFraud}
                                loading={analyzingFraud}
                                icon={<Zap className="w-4 h-4" />}
                            >
                                {fraudAnalysis ? 'Re-analyze' : 'Analyze for Fraud'}
                            </Button>
                        </div>

                        {fraudAnalysis && (
                            <div className="space-y-4">
                                {/* Risk Overview */}
                                <div className="flex items-center gap-4 p-4 bg-dark-800/50 rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-slate-400">Risk Level:</span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getFraudRiskColor(fraudAnalysis.risk_level)}`}>
                                                {fraudAnalysis.risk_level.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-400">Inflation Score:</span>
                                            <div className="flex-1 max-w-xs">
                                                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all ${fraudAnalysis.inflation_score >= 60 ? 'bg-red-500' :
                                                            fraudAnalysis.inflation_score >= 30 ? 'bg-yellow-500' : 'bg-green-500'
                                                            }`}
                                                        style={{ width: `${Math.min(fraudAnalysis.inflation_score, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-slate-300 font-medium">{fraudAnalysis.inflation_score.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                    {fraudAnalysis.fraud_flags.length > 0 && (
                                        <button
                                            onClick={() => setShowFraudDetails(!showFraudDetails)}
                                            className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
                                        >
                                            {showFraudDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            {showFraudDetails ? 'Hide' : 'Show'} Details
                                        </button>
                                    )}
                                </div>

                                {/* Detailed Analysis */}
                                {showFraudDetails && (
                                    <div className="space-y-4">
                                        {/* AI Verdict */}
                                        {fraudAnalysis.overall_verdict && (
                                            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                                <h3 className="font-semibold text-slate-100 mb-2">AI Assessment</h3>
                                                <p className="text-slate-200">{fraudAnalysis.overall_verdict}</p>
                                                {fraudAnalysis.reasoning && (
                                                    <p className="text-sm text-slate-400 mt-2">{fraudAnalysis.reasoning}</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Fraud Flags */}
                                        {fraudAnalysis.fraud_flags.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-50 mb-3 flex items-center gap-2">
                                                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                                                    Detected Concerns ({fraudAnalysis.flag_count})
                                                </h3>
                                                <div className="space-y-2">
                                                    {fraudAnalysis.fraud_flags.map((flag, idx) => (
                                                        <div key={idx} className="p-3 bg-dark-800/50 rounded-lg border border-yellow-500/20">
                                                            <div className="flex items-start gap-2">
                                                                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                                                <p className="text-slate-200">{flag}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Red Flags */}
                                        {fraudAnalysis.red_flags && fraudAnalysis.red_flags.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-50 mb-3 flex items-center gap-2">
                                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                                    Critical Issues
                                                </h3>
                                                <ul className="space-y-2">
                                                    {fraudAnalysis.red_flags.map((flag, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-red-400">
                                                            <span className="mt-1">⚠</span>
                                                            <span>{flag}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Verification Suggestions */}
                                        {fraudAnalysis.verification_suggestions && fraudAnalysis.verification_suggestions.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-50 mb-3 flex items-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5 text-primary-400" />
                                                    Verification Steps
                                                </h3>
                                                <ul className="space-y-2">
                                                    {fraudAnalysis.verification_suggestions.map((suggestion, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-slate-300">
                                                            <span className="text-primary-400 mt-1">→</span>
                                                            <span>{suggestion}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Recommendations */}
                                        {fraudAnalysis.recommendations && fraudAnalysis.recommendations.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-50 mb-3">Recommendations</h3>
                                                <ul className="space-y-2">
                                                    {fraudAnalysis.recommendations.map((rec, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-slate-300">
                                                            <span className="text-green-400 mt-1">•</span>
                                                            <span>{rec}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {fraudAnalysis.fraud_flags.length === 0 && (
                                    <div className="text-center py-8">
                                        <CheckCircle2 className="w-16 h-16 mx-auto text-green-400 mb-3" />
                                        <h3 className="text-lg font-semibold text-slate-50 mb-2">No Fraud Concerns</h3>
                                        <p className="text-slate-400">This resume appears to be authentic.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {!fraudAnalysis && (
                            <div className="text-center py-12">
                                <Shield className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                                <p className="text-slate-400 mb-2">No fraud analysis performed yet</p>
                                <p className="text-sm text-slate-500">Click "Analyze for Fraud" to check this resume for authenticity concerns</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default ResumeDetailPage;
