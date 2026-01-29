import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ATSScoreCircle from '../../components/resume-builder/ATSScoreCircle';
import OptimizationPanel from '../../components/resume-builder/OptimizationPanel';
import { ArrowLeft, FileText, Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { resumeBuilderService } from '../../services/resumeBuilderService';
import type { Resume, ATSScoreResponse } from '../../types/resume';
import { getCountryFlag, formatResumeDate } from '../../utils/resumeHelpers';
import Badge from '../../components/ui/Badge';

const ResumeDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'preview';

    const [resume, setResume] = useState<Resume | null>(null);
    const [atsScore, setAtsScore] = useState<ATSScoreResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [atsLoading, setAtsLoading] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    useEffect(() => {
        if (id) {
            fetchResume();
        }
    }, [id]);

    useEffect(() => {
        if (activeTab === 'analytics' && id && !atsScore) {
            fetchATSScore();
        }
    }, [activeTab, id]);

    const fetchResume = async () => {
        try {
            setLoading(true);
            const data = await resumeBuilderService.getResume(parseInt(id!));
            setResume(data);
        } catch (err: any) {
            console.error('Failed to fetch resume:', err);
            alert(err.response?.data?.detail || 'Failed to load resume');
            navigate('/resume-builder');
        } finally {
            setLoading(false);
        }
    };

    const fetchATSScore = async () => {
        try {
            setAtsLoading(true);
            const score = await resumeBuilderService.getATSScore(parseInt(id!));
            setAtsScore(score);
        } catch (err: any) {
            console.error('Failed to fetch ATS score:', err);
        } finally {
            setAtsLoading(false);
        }
    };

    const handleRegeneratePDF = async () => {
        try {
            setRegenerating(true);
            await resumeBuilderService.regeneratePDF(parseInt(id!));
            alert('PDF regeneration started. Please check back in a few moments.');
        } catch (err: any) {
            console.error('Failed to regenerate PDF:', err);
            alert(err.response?.data?.detail || 'Failed to regenerate PDF');
        } finally {
            setRegenerating(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!resume?.pdf_url) {
            alert('PDF is still being generated. Please wait and refresh.');
            return;
        }

        // Normalize and ensure URL is absolute
        let pdfUrl = resume.pdf_url;

        // Replace backslashes with forward slashes (Windows path fix)
        pdfUrl = pdfUrl.replace(/\\/g, '/');

        // If URL doesn't start with http, make it absolute
        if (!pdfUrl.startsWith('http')) {
            // Ensure leading slash
            if (!pdfUrl.startsWith('/')) {
                pdfUrl = '/' + pdfUrl;
            }
            // Prepend backend base URL
            pdfUrl = `http://localhost:8000${pdfUrl}`;
        }

        console.log('Opening PDF URL:', pdfUrl);
        window.open(pdfUrl, '_blank');
    };

    const setTab = (tab: string) => {
        setSearchParams({ tab });
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
                <div className="text-center py-16">
                    <p className="text-dark-400">Resume not found</p>
                    <Button variant="primary" onClick={() => navigate('/resume-builder')} className="mt-4">
                        Back to Resumes
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <Button
                        variant="ghost"
                        icon={<ArrowLeft className="w-5 h-5" />}
                        onClick={() => navigate('/resume-builder')}
                        className="mb-4"
                    >
                        Back to Resumes
                    </Button>

                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">{getCountryFlag(resume.target_country)}</span>
                            <div>
                                <h1 className="text-3xl font-bold text-dark-50">{resume.target_job_title}</h1>
                                <p className="text-dark-400">{resume.personal_info.full_name}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary">v{resume.version}</Badge>
                                    <Badge variant="primary">{resume.target_industry}</Badge>
                                </div>
                            </div>
                        </div>

                        {resume.pdf_url && (
                            <Button
                                variant="primary"
                                icon={<Download className="w-5 h-5" />}
                                onClick={handleDownloadPDF}
                            >
                                Download PDF
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-white/10">
                    <div className="flex gap-4">
                        {['preview', 'edit', 'optimize', 'analytics'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setTab(tab)}
                                className={`px-4 py-2 font-medium text-sm capitalize transition-all ${activeTab === tab
                                    ? 'text-primary-400 border-b-2 border-primary-400'
                                    : 'text-dark-400 hover:text-dark-200'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'preview' && (
                    <div className="space-y-6">
                        <Card>
                            <h2 className="text-xl font-bold text-dark-50 mb-4">Personal Information</h2>
                            <div className="space-y-2 text-dark-300">
                                <p><strong className="text-dark-200">Name:</strong> {resume.personal_info.full_name}</p>
                                <p><strong className="text-dark-200">Email:</strong> {resume.personal_info.email}</p>
                                <p><strong className="text-dark-200">Phone:</strong> {resume.personal_info.phone}</p>
                                <p><strong className="text-dark-200">Location:</strong> {resume.personal_info.location.city}, {resume.personal_info.location.country}</p>
                                {resume.personal_info.linkedin && (
                                    <p><strong className="text-dark-200">LinkedIn:</strong> <a href={resume.personal_info.linkedin} target="_blank" className="text-primary-400 hover:underline">{resume.personal_info.linkedin}</a></p>
                                )}
                                {resume.personal_info.website && (
                                    <p><strong className="text-dark-200">Website:</strong> <a href={resume.personal_info.website} target="_blank" className="text-primary-400 hover:underline">{resume.personal_info.website}</a></p>
                                )}
                            </div>
                        </Card>

                        {resume.professional_summary && (
                            <Card>
                                <h2 className="text-xl font-bold text-dark-50 mb-4">Professional Summary</h2>
                                <p className="text-dark-300 leading-relaxed">{resume.professional_summary}</p>
                            </Card>
                        )}

                        <Card>
                            <h2 className="text-xl font-bold text-dark-50 mb-4">Work Experience</h2>
                            <div className="space-y-6">
                                {resume.work_experience.map((exp, index) => (
                                    <div key={index} className="border-l-2 border-primary-500 pl-4">
                                        <h3 className="text-lg font-bold text-dark-100">{exp.title}</h3>
                                        <p className="text-dark-300">{exp.company} • {exp.location}</p>
                                        <p className="text-sm text-dark-500 mb-2">
                                            {formatResumeDate(exp.start_date)} - {exp.is_current ? 'Present' : formatResumeDate(exp.end_date)}
                                        </p>
                                        {exp.description && (
                                            <p className="text-dark-400 mb-2">{exp.description}</p>
                                        )}
                                        {exp.responsibilities && exp.responsibilities.length > 0 && (
                                            <ul className="list-disc list-inside text-dark-300 space-y-1 mb-2">
                                                {exp.responsibilities.map((resp, i) => (
                                                    <li key={i}>{resp}</li>
                                                ))}
                                            </ul>
                                        )}
                                        {exp.achievements && exp.achievements.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-sm font-medium text-primary-400">Achievements:</p>
                                                <ul className="list-disc list-inside text-dark-300 space-y-1">
                                                    {exp.achievements.map((ach, i) => (
                                                        <li key={i}>{ach}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card>
                            <h2 className="text-xl font-bold text-dark-50 mb-4">Education</h2>
                            <div className="space-y-4">
                                {resume.education.map((edu, index) => (
                                    <div key={index}>
                                        <h3 className="text-lg font-bold text-dark-100">{edu.degree}</h3>
                                        <p className="text-dark-300">{edu.institution} • {edu.location}</p>
                                        <p className="text-sm text-dark-500">{edu.year}</p>
                                        {edu.gpa && <p className="text-sm text-dark-400">GPA: {edu.gpa}</p>}
                                        {edu.honors && <p className="text-sm text-primary-400">{edu.honors}</p>}
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card>
                            <h2 className="text-xl font-bold text-dark-50 mb-4">Skills</h2>
                            <div className="space-y-3">
                                {resume.skills.technical.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-dark-200 mb-2">Technical Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {resume.skills.technical.map((skill, i) => (
                                                <Badge key={i} variant="primary">{skill}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {resume.skills.soft.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-dark-200 mb-2">Soft Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {resume.skills.soft.map((skill, i) => (
                                                <Badge key={i} variant="secondary">{skill}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {resume.skills.tools.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-dark-200 mb-2">Tools & Software</p>
                                        <div className="flex flex-wrap gap-2">
                                            {resume.skills.tools.map((skill, i) => (
                                                <Badge key={i} variant="accent">{skill}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* PDF Actions */}
                        <Card>
                            <h2 className="text-xl font-bold text-dark-50 mb-4">PDF Document</h2>
                            {resume.pdf_url ? (
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="primary"
                                        icon={<FileText className="w-5 h-5" />}
                                        onClick={handleDownloadPDF}
                                    >
                                        View PDF
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        icon={<RefreshCw className="w-5 h-5" />}
                                        onClick={handleRegeneratePDF}
                                        disabled={regenerating}
                                    >
                                        {regenerating ? 'Regenerating...' : 'Regenerate PDF'}
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-dark-400 mb-3">PDF is being generated in the background...</p>
                                    <Button
                                        variant="secondary"
                                        icon={<RefreshCw className="w-5 h-5" />}
                                        onClick={fetchResume}
                                    >
                                        Refresh Status
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>
                )}

                {activeTab === 'edit' && (
                    <Card>
                        <p className="text-dark-400">
                            Edit functionality would use the same wizard form as creation, pre-filled with current data.
                            Click "Back to Resumes" to return to the list.
                        </p>
                    </Card>
                )}

                {activeTab === 'optimize' && (
                    <OptimizationPanel
                        resumeId={resume.id}
                        currentSummary={resume.professional_summary}
                        currentExperience={resume.work_experience}
                        currentSkills={resume.skills}
                        onOptimize={(type, data) => {
                            console.log('Optimize:', type, data);
                            // In real implementation, update the resume via API
                        }}
                    />
                )}

                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        {atsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : atsScore ? (
                            <>
                                <Card className="flex flex-col items-center py-8">
                                    <ATSScoreCircle score={atsScore.score} size="lg" />
                                </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card>
                                        <h2 className="text-xl font-bold text-dark-50 mb-4 flex items-center gap-2">
                                            <CheckCircle className="w-6 h-6 text-green-400" />
                                            Strengths
                                        </h2>
                                        <ul className="space-y-2">
                                            {atsScore.strengths.map((strength, i) => (
                                                <li key={i} className="flex items-start gap-2 text-dark-300">
                                                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                                    <span>{strength}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>

                                    <Card>
                                        <h2 className="text-xl font-bold text-dark-50 mb-4 flex items-center gap-2">
                                            <AlertCircle className="w-6 h-6 text-yellow-400" />
                                            Areas to Improve
                                        </h2>
                                        <ul className="space-y-2">
                                            {atsScore.weaknesses.map((weakness, i) => (
                                                <li key={i} className="flex items-start gap-2 text-dark-300">
                                                    <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                                    <span>{weakness}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                </div>

                                {atsScore.feedback.length > 0 && (
                                    <Card>
                                        <h2 className="text-xl font-bold text-dark-50 mb-4">Detailed Feedback</h2>
                                        <ul className="space-y-2">
                                            {atsScore.feedback.map((item, i) => (
                                                <li key={i} className="text-dark-300">• {item}</li>
                                            ))}
                                        </ul>
                                    </Card>
                                )}
                            </>
                        ) : (
                            <Card className="text-center py-12">
                                <p className="text-dark-400 mb-4">ATS score not yet calculated</p>
                                <Button variant="primary" onClick={fetchATSScore}>
                                    Calculate ATS Score
                                </Button>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ResumeDetailPage;
