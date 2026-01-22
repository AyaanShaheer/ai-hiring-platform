import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Upload, FileText, ArrowLeft, CheckCircle } from 'lucide-react';
import { resumeService } from '../../services/resumeService';

const UploadResumePage: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleFileSelect = (selectedFile: File) => {
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

        if (!validTypes.includes(selectedFile.type)) {
            setError('Please upload a PDF or Word document');
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setFile(selectedFile);
        setError('');
        setSuccess(false);
    };

    const handleUpload = async () => {
        if (!file) return;

        setError('');
        setUploading(true);

        try {
            await resumeService.uploadResume(file);
            setSuccess(true);
            setTimeout(() => {
                navigate('/resumes');
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to upload resume. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/resumes')} icon={<ArrowLeft className="w-5 h-5" />}>
                        Back
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-slate-50 mb-2">Upload Resume</h1>
                        <p className="text-slate-400">Upload a candidate resume for AI-powered parsing and analysis</p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Resume uploaded successfully! Redirecting...
                    </div>
                )}

                <Card>
                    <div className="space-y-6">
                        {/* Upload Area */}
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`
                relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
                ${dragActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-600 hover:border-cyan-500/50'}
              `}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                            />

                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    {file ? (
                                        <FileText className="w-20 h-20 text-cyan-400" />
                                    ) : (
                                        <Upload className="w-20 h-20 text-slate-500" />
                                    )}
                                </div>

                                {file ? (
                                    <div>
                                        <p className="text-lg font-semibold text-slate-50">{file.name}</p>
                                        <p className="text-sm text-slate-400">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setFile(null)}
                                            className="mt-2"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-lg font-semibold text-slate-50 mb-2">
                                            Drag and drop your resume here
                                        </p>
                                        <p className="text-sm text-slate-400 mb-4">or</p>
                                        <Button
                                            variant="secondary"
                                            onClick={() => fileInputRef.current?.click()}
                                            icon={<Upload className="w-5 h-5" />}
                                        >
                                            Browse Files
                                        </Button>
                                        <p className="text-xs text-slate-500 mt-4">
                                            Supported formats: PDF, DOC, DOCX (Max 5MB)
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* What Happens Next */}
                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-cyan-400 mb-2">What happens after upload?</h3>
                            <ul className="text-sm text-slate-300 space-y-1">
                                <li>• AI-powered parsing extracts key information</li>
                                <li>• Skills, experience, and education are automatically identified</li>
                                <li>• Resume is analyzed for fraud detection</li>
                                <li>• Candidate profile is created for job matching</li>
                            </ul>
                        </div>

                        {/* Upload Button */}
                        {file && (
                            <Button
                                variant="primary"
                                onClick={handleUpload}
                                loading={uploading}
                                disabled={!file || uploading}
                                className="w-full"
                                icon={<Upload className="w-5 h-5" />}
                            >
                                {uploading ? 'Uploading & Processing...' : 'Upload Resume'}
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default UploadResumePage;
