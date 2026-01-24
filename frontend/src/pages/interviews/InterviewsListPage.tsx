import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { interviewService } from '../../services/interviewService';
import type { Interview } from '../../types';
import {
    Calendar,
    Clock,
    Video,
    Phone,
    ChevronLeft,
    ChevronRight,
    Plus,
    Filter,
    Search,
    MapPin,
    Code,
    CheckCircle,
    XCircle,
    AlertCircle,
    CalendarDays
} from 'lucide-react';

const InterviewsListPage: React.FC = () => {
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        fetchInterviews();
        fetchUpcomingInterviews();
    }, [statusFilter, typeFilter]);

    const fetchInterviews = async () => {
        try {
            setLoading(true);
            const data = await interviewService.getInterviews(
                statusFilter || undefined,
                typeFilter || undefined
            );
            setInterviews(data);
        } catch (error) {
            console.error('Error fetching interviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUpcomingInterviews = async () => {
        try {
            const data = await interviewService.getUpcomingInterviews(7);
            setUpcomingInterviews(data);
        } catch (error) {
            console.error('Error fetching upcoming interviews:', error);
        }
    };

    const getInterviewTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="w-4 h-4" />;
            case 'phone': return <Phone className="w-4 h-4" />;
            case 'in-person': return <MapPin className="w-4 h-4" />;
            case 'technical': return <Code className="w-4 h-4" />;
            default: return <Calendar className="w-4 h-4" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'scheduled':
                return <Badge variant="info">Scheduled</Badge>;
            case 'completed':
                return <Badge variant="success">Completed</Badge>;
            case 'cancelled':
                return <Badge variant="danger">Cancelled</Badge>;
            case 'no-show':
                return <Badge variant="warning">No Show</Badge>;
            default:
                return <Badge variant="default">{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: (number | null)[] = [];
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    };

    const getInterviewsForDay = (day: number) => {
        return interviews.filter(interview => {
            const interviewDate = new Date(interview.scheduled_at);
            return interviewDate.getDate() === day &&
                interviewDate.getMonth() === currentMonth.getMonth() &&
                interviewDate.getFullYear() === currentMonth.getFullYear();
        });
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    // Statistics
    const stats = {
        total: interviews.length,
        scheduled: interviews.filter(i => i.status === 'scheduled').length,
        completed: interviews.filter(i => i.status === 'completed').length,
        cancelled: interviews.filter(i => i.status === 'cancelled').length
    };

    const filteredInterviews = interviews.filter(interview => {
        if (!searchQuery) return true;
        const candidateName = interview.application?.resume?.candidate_name || '';
        const jobTitle = interview.application?.job?.title || '';
        return candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-dark-50 mb-2">Interview Management</h1>
                        <p className="text-dark-400">Schedule, track, and analyze candidate interviews</p>
                    </div>
                    <Button onClick={() => navigate('/applications')} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Schedule Interview
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-primary-600/20 to-primary-800/20 border-primary-500/30">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary-500/20 rounded-xl">
                                <CalendarDays className="w-6 h-6 text-primary-400" />
                            </div>
                            <div>
                                <p className="text-dark-400 text-sm">Total Interviews</p>
                                <p className="text-2xl font-bold text-dark-50">{stats.total}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/20 rounded-xl">
                                <Clock className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-dark-400 text-sm">Scheduled</p>
                                <p className="text-2xl font-bold text-dark-50">{stats.scheduled}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/20 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <p className="text-dark-400 text-sm">Completed</p>
                                <p className="text-2xl font-bold text-dark-50">{stats.completed}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-red-600/20 to-red-800/20 border-red-500/30">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-500/20 rounded-xl">
                                <XCircle className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <p className="text-dark-400 text-sm">Cancelled</p>
                                <p className="text-2xl font-bold text-dark-50">{stats.cancelled}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Upcoming Interviews Sidebar */}
                    <Card className="lg:col-span-1">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-dark-100">Upcoming (7 Days)</h2>
                            <AlertCircle className="w-5 h-5 text-primary-400" />
                        </div>

                        {upcomingInterviews.length === 0 ? (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 mx-auto text-dark-600 mb-3" />
                                <p className="text-dark-400">No upcoming interviews</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingInterviews.slice(0, 5).map(interview => (
                                    <div
                                        key={interview.id}
                                        onClick={() => navigate(`/interviews/${interview.id}`)}
                                        className="p-3 bg-dark-800/50 rounded-lg border border-dark-700 hover:border-primary-500/50 cursor-pointer transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2 text-primary-400">
                                                {getInterviewTypeIcon(interview.interview_type)}
                                                <span className="text-sm capitalize">{interview.interview_type}</span>
                                            </div>
                                            {getStatusBadge(interview.status)}
                                        </div>
                                        <p className="text-dark-100 font-medium text-sm mb-1">
                                            {interview.application?.resume?.candidate_name || 'Candidate'}
                                        </p>
                                        <p className="text-dark-400 text-xs mb-2">
                                            {interview.application?.job?.title || 'Position'}
                                        </p>
                                        <div className="flex items-center gap-2 text-dark-300 text-xs">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatDate(interview.scheduled_at)}</span>
                                            <span>•</span>
                                            <span>{formatTime(interview.scheduled_at)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Calendar View */}
                    <Card className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-dark-100">
                                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={prevMonth}
                                    className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5 text-dark-300" />
                                </button>
                                <button
                                    onClick={nextMonth}
                                    className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5 text-dark-300" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-dark-400 text-xs font-medium py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {getCalendarDays().map((day, index) => {
                                const dayInterviews = day ? getInterviewsForDay(day) : [];
                                const isToday = day &&
                                    new Date().getDate() === day &&
                                    new Date().getMonth() === currentMonth.getMonth() &&
                                    new Date().getFullYear() === currentMonth.getFullYear();

                                return (
                                    <div
                                        key={index}
                                        className={`min-h-[80px] p-1 rounded-lg border transition-all ${day
                                            ? isToday
                                                ? 'border-primary-500 bg-primary-500/10'
                                                : 'border-dark-700 hover:border-dark-600'
                                            : 'border-transparent'
                                            }`}
                                    >
                                        {day && (
                                            <>
                                                <span className={`text-xs font-medium ${isToday ? 'text-primary-400' : 'text-dark-300'}`}>
                                                    {day}
                                                </span>
                                                <div className="mt-1 space-y-1">
                                                    {dayInterviews.slice(0, 2).map(interview => (
                                                        <div
                                                            key={interview.id}
                                                            onClick={() => navigate(`/interviews/${interview.id}`)}
                                                            className={`text-xs p-1 rounded cursor-pointer truncate ${interview.status === 'completed'
                                                                ? 'bg-green-500/20 text-green-300'
                                                                : interview.status === 'cancelled'
                                                                    ? 'bg-red-500/20 text-red-300'
                                                                    : 'bg-blue-500/20 text-blue-300'
                                                                }`}
                                                        >
                                                            {formatTime(interview.scheduled_at)}
                                                        </div>
                                                    ))}
                                                    {dayInterviews.length > 2 && (
                                                        <div className="text-xs text-dark-400 pl-1">
                                                            +{dayInterviews.length - 2} more
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                            <input
                                type="text"
                                placeholder="Search by candidate or job..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-500 focus:outline-none focus:border-primary-500"
                            />
                        </div>

                        <div className="flex gap-3">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="pl-9 pr-8 py-2.5 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-primary-500 appearance-none cursor-pointer"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="no-show">No Show</option>
                                </select>
                            </div>

                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-primary-500 appearance-none cursor-pointer"
                            >
                                <option value="">All Types</option>
                                <option value="video">Video</option>
                                <option value="phone">Phone</option>
                                <option value="in-person">In-Person</option>
                                <option value="technical">Technical</option>
                            </select>
                        </div>
                    </div>

                    {/* Interviews List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-dark-400">Loading interviews...</p>
                        </div>
                    ) : filteredInterviews.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 mx-auto text-dark-600 mb-4" />
                            <h3 className="text-xl font-semibold text-dark-300 mb-2">No Interviews Found</h3>
                            <p className="text-dark-500 mb-4">
                                {statusFilter || typeFilter ? 'Try adjusting your filters' : 'Schedule interviews from the Applications page'}
                            </p>
                            <Button onClick={() => navigate('/applications')}>
                                View Applications
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredInterviews.map(interview => (
                                <div
                                    key={interview.id}
                                    onClick={() => navigate(`/interviews/${interview.id}`)}
                                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-dark-800/50 rounded-xl border border-dark-700 hover:border-primary-500/50 cursor-pointer transition-all group"
                                >
                                    <div className="flex items-start gap-4 mb-3 md:mb-0">
                                        <div className={`p-3 rounded-xl ${interview.status === 'completed'
                                            ? 'bg-green-500/20'
                                            : interview.status === 'cancelled'
                                                ? 'bg-red-500/20'
                                                : 'bg-primary-500/20'
                                            }`}>
                                            {getInterviewTypeIcon(interview.interview_type)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-dark-100 group-hover:text-primary-400 transition-colors">
                                                    {interview.application?.resume?.candidate_name || 'Unknown Candidate'}
                                                </h3>
                                                {getStatusBadge(interview.status)}
                                            </div>
                                            <p className="text-dark-400 text-sm mb-1">
                                                {interview.application?.job?.title || 'Unknown Position'}
                                            </p>
                                            <div className="flex items-center gap-4 text-dark-500 text-xs">
                                                <span className="capitalize flex items-center gap-1">
                                                    {getInterviewTypeIcon(interview.interview_type)}
                                                    {interview.interview_type}
                                                </span>
                                                {interview.meeting_link && (
                                                    <span className="text-primary-400">Has Meeting Link</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 pl-11 md:pl-0">
                                        <div className="text-right">
                                            <p className="text-dark-100 font-medium">{formatDate(interview.scheduled_at)}</p>
                                            <p className="text-dark-400 text-sm">{formatTime(interview.scheduled_at)}</p>
                                        </div>
                                        {interview.rating && (
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-yellow-400">{interview.rating.toFixed(1)}</p>
                                                <p className="text-dark-500 text-xs">Rating</p>
                                            </div>
                                        )}
                                        <ChevronRight className="w-5 h-5 text-dark-600 group-hover:text-primary-400 transition-colors hidden md:block" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default InterviewsListPage;
