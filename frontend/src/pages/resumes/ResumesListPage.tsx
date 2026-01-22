import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Plus, FileText, Mail, Phone, Briefcase, AlertTriangle } from 'lucide-react';
import { resumeService } from '../../services/resumeService';
import type { Resume } from '../../types';

const ResumesListPage: React.FC = () => {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const data = await resumeService.getResumes();
                setResumes(data);
            } catch (error) {
                console.error('Failed to fetch resumes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResumes();
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
                        <h1 className="text-3xl font-bold text-dark-50 mb-2">Resumes</h1>
                        <p className="text-dark-400">Browse and manage candidate resumes</p>
                    </div>
                    <Link to="/resumes/upload">
                        <Button variant="primary" icon={<Plus className="w-5 h-5" />}>
                            Upload Resume
                        </Button>
                    </Link>
                </div>

                {/* Resumes List */}
                {resumes.length === 0 ? (
                    <Card>
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 mx-auto text-dark-600 mb-4" />
                            <h3 className="text-xl font-semibold text-dark-300 mb-2">No resumes yet</h3>
                            <p className="text-dark-500 mb-6">Upload your first resume to get started</p>
                            <Link to="/resumes/upload">
                                <Button variant="primary" icon={<Plus className="w-5 h-5" />}>
                                    Upload Resume
                                </Button>
                            </Link>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {resumes.map((resume) => (
                            <Card key={resume.id} hover className="cursor-pointer">
                                <Link to={`/resumes/${resume.id}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-dark-50 mb-1 flex items-center gap-2">
                                                        {resume.candidate_name || 'Unknown Candidate'}
                                                        {resume.fraud_score && resume.fraud_score > 0.7 && (
                                                            <AlertTriangle className="w-4 h-4 text-warning-500" />
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-dark-400">{resume.filename}</p>
                                                </div>
                                                <Badge variant={resume.processing_status === 'completed' ? 'success' : 'warning'}>
                                                    {resume.processing_status}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-sm text-dark-400">
                                                {resume.candidate_email && (
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="w-4 h-4" />
                                                        <span>{resume.candidate_email}</span>
                                                    </div>
                                                )}
                                                {resume.candidate_phone && (
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="w-4 h-4" />
                                                        <span>{resume.candidate_phone}</span>
                                                    </div>
                                                )}
                                                {resume.experience_years !== undefined && (
                                                    <div className="flex items-center gap-1">
                                                        <Briefcase className="w-4 h-4" />
                                                        <span>{resume.experience_years} years exp</span>
                                                    </div>
                                                )}
                                            </div>

                                            {resume.skills && resume.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {resume.skills.slice(0, 5).map((skill, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 text-xs rounded-full bg-secondary-500/20 text-secondary-400 border border-secondary-500/30"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {resume.skills.length > 5 && (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-dark-700 text-dark-400">
                                                            +{resume.skills.length - 5} more
                                                        </span>
                                                    )}
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

export default ResumesListPage;
