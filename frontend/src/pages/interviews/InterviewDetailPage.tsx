import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { interviewService } from '../../services/interviewService';
import type { Interview } from '../../types';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Video,
    Phone,
    MapPin,
    Code,
    User,
    Briefcase,
    Link as LinkIcon,
    FileText,
    Star,
    Upload,
    Play,
    Brain,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ExternalLink,
    MessageSquare,
    Mic
} from 'lucide-react';

const InterviewDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [interview, setInterview] = useState<Interview | null>(null);
    const [loading, setLoading] = useState(true);
    const [transcript, setTranscript] = useState<string | null>(null);
    const [showTranscript, setShowTranscript] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [completeNotes, setCompleteNotes] = useState('');
    const [completeRating, setCompleteRating] = useState(3);

    useEffect(() => {
        if (id) {
            fetchInterview();
        }
    }, [id]);

    const fetchInterview = async () => {
        try {
            setLoading(true);
            const data = await interviewService.getInterview(Number(id));
            setInterview(data);
        } catch (error) {
            console.error('Error fetching interview:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTranscript = async () => {
        if (!interview) return;
        try {
            const data = await interviewService.getTranscript(interview.id);
            setTranscript(data.transcript);
            setShowTranscript(true);
        } catch (error) {
            console.error('Error fetching transcript:', error);
        }
    };

    const handleUploadRecording = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !interview) return;

        try {
            setUploading(true);
            const updatedInterview = await interviewService.uploadRecording(interview.id, file);
            setInterview(updatedInterview);
        } catch (error) {
            console.error('Error uploading recording:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!interview) return;
        try {
            setAnalyzing(true);
            const updatedInterview = await interviewService.analyzeInterview(interview.id);
            setInterview(updatedInterview);
        } catch (error) {
            console.error('Error analyzing interview:', error);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleComplete = async () => {
        if (!interview) return;
        try {
            const updatedInterview = await interviewService.completeInterview(
                interview.id,
                completeNotes || undefined,
                completeRating
            );
            setInterview(updatedInterview);
            setShowCompleteModal(false);
        } catch (error) {
            console.error('Error completing interview:', error);
        }
    };

    const handleCancel = async () => {
        if (!interview) return;
        if (!window.confirm('Are you sure you want to cancel this interview?')) return;

        try {
            const updatedInterview = await interviewService.cancelInterview(interview.id);
            setInterview(updatedInterview);
        } catch (error) {
            console.error('Error cancelling interview:', error);
        }
    };

    const getInterviewTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="w-5 h-5" />;
            case 'phone': return <Phone className="w-5 h-5" />;
            case 'in-person': return <MapPin className="w-5 h-5" />;
            case 'technical': return <Code className="w-5 h-5" />;
            default: return <Calendar className="w-5 h-5" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'scheduled':
                return <Badge variant="info" className="text-base px-4 py-1">Scheduled</Badge>;
            case 'completed':
                return <Badge variant="success" className="text-base px-4 py-1">Completed</Badge>;
            case 'cancelled':
                return <Badge variant="danger" className="text-base px-4 py-1">Cancelled</Badge>;
            case 'no-show':
                return <Badge variant="warning" className="text-base px-4 py-1">No Show</Badge>;
            default:
                return <Badge variant="default" className="text-base px-4 py-1">{status}</Badge>;
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            })
        };
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    if (!interview) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <AlertTriangle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
                    <h2 className="text-2xl font-bold text-dark-100 mb-2">Interview Not Found</h2>
                    <p className="text-dark-400 mb-6">The interview you're looking for doesn't exist.</p>
                    <Button onClick={() => navigate('/interviews')}>Back to Interviews</Button>
                </div>
            </DashboardLayout>
        );
    }

    const { date, time } = formatDateTime(interview.scheduled_at);
    const isPast = new Date(interview.scheduled_at) < new Date();
    const canComplete = interview.status === 'scheduled' && isPast;
    const canCancel = interview.status === 'scheduled';

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-2">
                    <button
                        onClick={() => navigate('/interviews')}
                        className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-dark-300" />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-dark-50">Interview Details</h1>
                            {getStatusBadge(interview.status)}
                        </div>
                        <p className="text-dark-400">
                            {interview.application?.resume?.candidate_name || 'Candidate'} • {interview.application?.job?.title || 'Position'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {canComplete && (
                            <Button onClick={() => setShowCompleteModal(true)} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Complete
                            </Button>
                        )}
                        {canCancel && (
                            <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2 text-red-400 border-red-500/50 hover:bg-red-500/10">
                                <XCircle className="w-4 h-4" />
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Interview Details Card */}
                        <Card>
                            <h2 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary-400" />
                                Interview Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-primary-500/20 rounded-lg">
                                            {getInterviewTypeIcon(interview.interview_type)}
                                        </div>
                                        <div>
                                            <p className="text-dark-400 text-sm">Interview Type</p>
                                            <p className="text-dark-100 font-medium capitalize">{interview.interview_type}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-500/20 rounded-lg">
                                            <Calendar className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-dark-400 text-sm">Date</p>
                                            <p className="text-dark-100 font-medium">{date}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-green-500/20 rounded-lg">
                                            <Clock className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-dark-400 text-sm">Time</p>
                                            <p className="text-dark-100 font-medium">{time}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {interview.meeting_link && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                                <LinkIcon className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-dark-400 text-sm">Meeting Link</p>
                                                <a
                                                    href={interview.meeting_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
                                                >
                                                    Join Meeting <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {interview.rating && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                                <Star className="w-5 h-5 text-yellow-400" />
                                            </div>
                                            <div>
                                                <p className="text-dark-400 text-sm">Rating</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-dark-100 font-medium text-lg">{interview.rating.toFixed(1)}</span>
                                                    <div className="flex">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <Star
                                                                key={star}
                                                                className={`w-4 h-4 ${star <= interview.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-dark-600'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {interview.notes && (
                                <div className="mt-6 pt-6 border-t border-dark-700">
                                    <h3 className="text-dark-200 font-medium mb-2 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Notes
                                    </h3>
                                    <p className="text-dark-300 bg-dark-800/50 rounded-lg p-4">{interview.notes}</p>
                                </div>
                            )}
                        </Card>

                        {/* Recording & Transcript */}
                        <Card>
                            <h2 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
                                <Mic className="w-5 h-5 text-primary-400" />
                                Recording & Transcript
                            </h2>

                            {interview.recording_path ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg border border-dark-700">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-500/20 rounded-lg">
                                                <Play className="w-5 h-5 text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-dark-100 font-medium">Recording Available</p>
                                                <p className="text-dark-400 text-sm">Audio file uploaded</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={fetchTranscript}
                                            >
                                                <FileText className="w-4 h-4 mr-2" />
                                                View Transcript
                                            </Button>
                                        </div>
                                    </div>

                                    {showTranscript && transcript && (
                                        <div className="bg-dark-800/50 rounded-lg p-4 border border-dark-700">
                                            <h3 className="text-dark-200 font-medium mb-3">Transcript</h3>
                                            <div className="max-h-64 overflow-y-auto text-dark-300 text-sm whitespace-pre-wrap">
                                                {transcript}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed border-dark-600 rounded-xl">
                                    <Upload className="w-12 h-12 mx-auto text-dark-500 mb-3" />
                                    <p className="text-dark-300 mb-2">No recording uploaded yet</p>
                                    <p className="text-dark-500 text-sm mb-4">Upload an audio/video file to enable transcript analysis</p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="audio/*,video/*"
                                        onChange={handleUploadRecording}
                                        className="hidden"
                                    />
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                    >
                                        {uploading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 mr-2" />
                                                Upload Recording
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </Card>

                        {/* AI Analysis */}
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-dark-100 flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-primary-400" />
                                    AI Analysis
                                </h2>
                                {interview.recording_path && !interview.ai_analysis && (
                                    <Button
                                        size="sm"
                                        onClick={handleAnalyze}
                                        disabled={analyzing}
                                    >
                                        {analyzing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Brain className="w-4 h-4 mr-2" />
                                                Run Analysis
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>

                            {interview.ai_analysis ? (
                                <div className="bg-gradient-to-br from-primary-600/10 to-primary-800/10 rounded-xl p-6 border border-primary-500/20">
                                    <div className="prose prose-invert max-w-none">
                                        <div className="text-dark-200 whitespace-pre-wrap">{interview.ai_analysis}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-dark-800/30 rounded-xl">
                                    <Brain className="w-12 h-12 mx-auto text-dark-600 mb-3" />
                                    <p className="text-dark-400 mb-1">No AI analysis available</p>
                                    <p className="text-dark-500 text-sm">
                                        {interview.recording_path
                                            ? 'Click "Run Analysis" to analyze the interview recording'
                                            : 'Upload a recording first to enable AI analysis'
                                        }
                                    </p>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Candidate Info */}
                        <Card>
                            <h2 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-primary-400" />
                                Candidate
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {(interview.application?.resume?.candidate_name || 'C')[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-dark-100 font-medium">
                                            {interview.application?.resume?.candidate_name || 'Unknown Candidate'}
                                        </p>
                                        <p className="text-dark-400 text-sm">
                                            {interview.application?.resume?.candidate_email || 'No email'}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => navigate(`/applications/${interview.application_id}`)}
                                >
                                    View Application
                                </Button>
                            </div>
                        </Card>

                        {/* Job Info */}
                        <Card>
                            <h2 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-primary-400" />
                                Position
                            </h2>
                            <div className="space-y-3">
                                <p className="text-dark-100 font-medium">
                                    {interview.application?.job?.title || 'Unknown Position'}
                                </p>
                                <p className="text-dark-400 text-sm">
                                    {interview.application?.job?.location || 'Location not specified'}
                                </p>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => navigate(`/jobs/${interview.application?.job?.id}`)}
                                >
                                    View Job
                                </Button>
                            </div>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <h2 className="text-lg font-semibold text-dark-100 mb-4">Quick Actions</h2>
                            <div className="space-y-2">
                                {interview.meeting_link && (
                                    <a
                                        href={interview.meeting_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-3 bg-primary-500/20 hover:bg-primary-500/30 rounded-lg text-primary-300 transition-colors"
                                    >
                                        <Video className="w-5 h-5" />
                                        Join Meeting
                                    </a>
                                )}
                                <button
                                    onClick={() => navigate(`/applications/${interview.application_id}`)}
                                    className="flex items-center gap-2 p-3 bg-dark-700/50 hover:bg-dark-700 rounded-lg text-dark-200 w-full transition-colors"
                                >
                                    <FileText className="w-5 h-5" />
                                    View Resume
                                </button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Complete Interview Modal */}
            {showCompleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-800 rounded-2xl p-6 w-full max-w-md border border-dark-600">
                        <h2 className="text-xl font-bold text-dark-100 mb-4">Complete Interview</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-dark-200 text-sm font-medium mb-2">Rating</label>
                                <div className="flex gap-2 justify-center">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => setCompleteRating(star)}
                                            className="p-1 transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${star <= completeRating ? 'text-yellow-400 fill-yellow-400' : 'text-dark-600'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-dark-200 text-sm font-medium mb-2">Notes (Optional)</label>
                                <textarea
                                    value={completeNotes}
                                    onChange={(e) => setCompleteNotes(e.target.value)}
                                    placeholder="Add any notes about the interview..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-500 focus:outline-none focus:border-primary-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowCompleteModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleComplete}
                            >
                                Complete Interview
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default InterviewDetailPage;
