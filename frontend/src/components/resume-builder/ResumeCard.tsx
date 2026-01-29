import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Edit, FileText, Trash2, ExternalLink } from 'lucide-react';
import type { Resume } from '../../types/resume';
import { getCountryFlag, getATSScoreColor } from '../../utils/resumeHelpers';
import { format } from 'date-fns';

interface ResumeCardProps {
    resume: Resume;
    onDelete: (id: number) => void;
}

const ResumeCard: React.FC<ResumeCardProps> = ({ resume, onDelete }) => {
    const navigate = useNavigate();

    const handleEdit = () => {
        navigate(`/resume-builder/${resume.id}?tab=edit`);
    };

    const handleViewPDF = () => {
        if (!resume.pdf_url) {
            alert('PDF is still being generated.');
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

    return (
        <Card className="hover:border-primary-500/30 transition-all duration-300">
            <div className="space-y-4">
                {/* Header with Flag and Title */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{getCountryFlag(resume.target_country)}</span>
                        <div>
                            <h3 className="text-lg font-bold text-dark-50 line-clamp-1">
                                {resume.target_job_title}
                            </h3>
                            <p className="text-sm text-dark-400">{resume.personal_info.full_name}</p>
                        </div>
                    </div>
                </div>

                {/* Version and ATS Score */}
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">v{resume.version}</Badge>
                    {resume.ats_score !== undefined && resume.ats_score !== null && (
                        <Badge className={getATSScoreColor(resume.ats_score)}>
                            ATS: {resume.ats_score}%
                        </Badge>
                    )}
                    {resume.template && (
                        <Badge variant="primary" className="text-xs">
                            {resume.template.name}
                        </Badge>
                    )}
                </div>

                {/* Industry and Date */}
                <div className="text-xs text-dark-500 space-y-1">
                    <p>Industry: {resume.target_industry}</p>
                    <p>Created: {format(new Date(resume.created_at), 'MMM dd, yyyy')}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit className="w-4 h-4" />}
                        onClick={handleEdit}
                    >
                        Edit
                    </Button>
                    {resume.pdf_url ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={<ExternalLink className="w-4 h-4" />}
                            onClick={handleViewPDF}
                        >
                            PDF
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={<FileText className="w-4 h-4" />}
                            disabled
                        >
                            PDF Pending
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => onDelete(resume.id)}
                        className="ml-auto text-red-400 hover:text-red-300"
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default ResumeCard;
