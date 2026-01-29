import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import ResumeCard from '../../components/resume-builder/ResumeCard';
import { Plus, FileText, AlertCircle } from 'lucide-react';
import { resumeBuilderService } from '../../services/resumeBuilderService';
import type { Resume } from '../../types/resume';

const ResumeBuilderPage: React.FC = () => {
    const navigate = useNavigate();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({
        open: false,
        id: null,
    });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await resumeBuilderService.getResumes();
            setResumes(response.items || []);
        } catch (err: any) {
            console.error('Failed to fetch resumes:', err);
            setError(err.response?.data?.detail || 'Failed to load resumes');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        navigate('/resume-builder/templates');
    };

    const handleDeleteClick = (id: number) => {
        setDeleteModal({ open: true, id });
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;

        try {
            setDeleting(true);
            await resumeBuilderService.deleteResume(deleteModal.id);
            setResumes(prev => prev.filter(r => r.id !== deleteModal.id));
            setDeleteModal({ open: false, id: null });
        } catch (err: any) {
            console.error('Failed to delete resume:', err);
            alert(err.response?.data?.detail || 'Failed to delete resume');
        } finally {
            setDeleting(false);
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
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-dark-50 mb-2">Resume Builder</h1>
                        <p className="text-dark-400">
                            Create professional, ATS-friendly resumes with AI optimization
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        icon={<Plus className="w-5 h-5" />}
                        onClick={handleCreateNew}
                    >
                        Create New Resume
                    </Button>
                </div>

                {/* Error State */}
                {error && (
                    <Card className="border-red-500/50 bg-red-500/10">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <div>
                                <p className="text-red-400 font-medium">{error}</p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={fetchResumes}
                                    className="mt-2"
                                >
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Empty State */}
                {!error && resumes.length === 0 && (
                    <Card className="text-center py-16">
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full flex items-center justify-center">
                                <FileText className="w-12 h-12 text-primary-400" />
                            </div>
                            <h3 className="text-xl font-bold text-dark-50">No Resumes Yet</h3>
                            <p className="text-dark-400">
                                Start building your professional resume with our AI-powered builder.
                                Choose from multiple templates and optimize for ATS compatibility.
                            </p>
                            <Button
                                variant="primary"
                                icon={<Plus className="w-5 h-5" />}
                                onClick={handleCreateNew}
                            >
                                Create Your First Resume
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Resume Grid */}
                {!error && resumes.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resumes.map(resume => (
                            <ResumeCard
                                key={resume.id}
                                resume={resume}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={deleteModal.open}
                    onClose={() => setDeleteModal({ open: false, id: null })}
                    title="Delete Resume"
                >
                    <div className="space-y-4">
                        <p className="text-dark-300">
                            Are you sure you want to delete this resume? This action cannot be undone.
                        </p>
                        <div className="flex items-center gap-3 justify-end">
                            <Button
                                variant="ghost"
                                onClick={() => setDeleteModal({ open: false, id: null })}
                                disabled={deleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </DashboardLayout>
    );
};

export default ResumeBuilderPage;
