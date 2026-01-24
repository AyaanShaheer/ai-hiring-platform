import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import { interviewService } from '../../services/interviewService';
import type { InterviewScheduleRequest } from '../../types';
import {
    X,
    Calendar,
    Video,
    Phone,
    MapPin,
    Code,
    Link as LinkIcon,
    MessageSquare
} from 'lucide-react';

interface ScheduleInterviewModalProps {
    applicationId: number;
    candidateName?: string;
    jobTitle?: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
    applicationId,
    candidateName = 'Candidate',
    jobTitle = 'Position',
    isOpen,
    onClose,
    onSuccess
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<InterviewScheduleRequest>({
        application_id: applicationId,
        scheduled_at: '',
        interview_type: 'video',
        meeting_link: '',
        notes: ''
    });

    const interviewTypes = [
        { value: 'video', label: 'Video Call', icon: <Video className="w-5 h-5" />, description: 'Zoom, Google Meet, etc.' },
        { value: 'phone', label: 'Phone', icon: <Phone className="w-5 h-5" />, description: 'Voice call' },
        { value: 'in-person', label: 'In-Person', icon: <MapPin className="w-5 h-5" />, description: 'On-site meeting' },
        { value: 'technical', label: 'Technical', icon: <Code className="w-5 h-5" />, description: 'Coding interview' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.scheduled_at) {
            setError('Please select a date and time');
            return;
        }

        try {
            setLoading(true);
            await interviewService.scheduleInterview({
                ...formData,
                application_id: applicationId
            });
            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to schedule interview');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof InterviewScheduleRequest, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 rounded-2xl w-full max-w-lg border border-dark-600 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-dark-700">
                    <div>
                        <h2 className="text-xl font-bold text-dark-100">Schedule Interview</h2>
                        <p className="text-dark-400 text-sm mt-1">{candidateName} • {jobTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-dark-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Interview Type */}
                    <div>
                        <label className="block text-dark-200 text-sm font-medium mb-3">
                            Interview Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {interviewTypes.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => handleInputChange('interview_type', type.value as any)}
                                    className={`p-4 rounded-xl border transition-all text-left ${formData.interview_type === type.value
                                        ? 'bg-primary-500/20 border-primary-500 text-primary-300'
                                        : 'bg-dark-700/50 border-dark-600 text-dark-300 hover:border-dark-500'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={formData.interview_type === type.value ? 'text-primary-400' : 'text-dark-400'}>
                                            {type.icon}
                                        </span>
                                        <span className="font-medium">{type.label}</span>
                                    </div>
                                    <p className="text-xs text-dark-500">{type.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div>
                        <label className="block text-dark-200 text-sm font-medium mb-2">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.scheduled_at}
                            onChange={(e) => handleInputChange('scheduled_at', e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                            className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-primary-500"
                            required
                        />
                    </div>

                    {/* Meeting Link */}
                    {(formData.interview_type === 'video' || formData.interview_type === 'technical') && (
                        <div>
                            <label className="block text-dark-200 text-sm font-medium mb-2">
                                <LinkIcon className="w-4 h-4 inline mr-2" />
                                Meeting Link (Optional)
                            </label>
                            <input
                                type="url"
                                value={formData.meeting_link}
                                onChange={(e) => handleInputChange('meeting_link', e.target.value)}
                                placeholder="https://zoom.us/j/..."
                                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-500 focus:outline-none focus:border-primary-500"
                            />
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-dark-200 text-sm font-medium mb-2">
                            <MessageSquare className="w-4 h-4 inline mr-2" />
                            Notes (Optional)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder="Add any preparation notes, agenda items, or special instructions..."
                            rows={3}
                            className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-500 focus:outline-none focus:border-primary-500 resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Scheduling...
                                </>
                            ) : (
                                <>
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Schedule Interview
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleInterviewModal;
