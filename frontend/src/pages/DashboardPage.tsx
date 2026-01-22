import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Briefcase, FileText, Users, TrendingUp, Plus, Calendar } from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import type { DashboardMetrics } from '../types';

const DashboardPage: React.FC = () => {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data: any = await analyticsService.getDashboardMetrics();
                // Backend returns nested structure, extract overview fields
                const overview = data.overview || data;
                setMetrics({
                    total_jobs: overview.total_jobs || 0,
                    active_jobs: overview.active_jobs || 0,
                    total_resumes: overview.total_resumes || 0,
                    total_applications: overview.total_applications || 0,
                    average_match_score: overview.avg_match_score || 0, // Backend returns % already
                    total_interviews: 0,
                    upcoming_interviews: 0
                } as DashboardMetrics);
            } catch (error) {
                console.error('Failed to fetch metrics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
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

    const statCards = [
        {
            title: 'Total Jobs',
            value: metrics?.total_jobs || 0,
            subtitle: `${metrics?.active_jobs || 0} active`,
            icon: Briefcase,
            color: 'from-primary-500 to-secondary-500',
        },
        {
            title: 'Resumes',
            value: metrics?.total_resumes || 0,
            subtitle: 'Processed',
            icon: FileText,
            color: 'from-secondary-500 to-accent-500',
        },
        {
            title: 'Applications',
            value: metrics?.total_applications || 0,
            subtitle: 'Total matches',
            icon: Users,
            color: 'from-accent-500 to-primary-500',
        },
        {
            title: 'Avg Match Score',
            value: `${(metrics?.average_match_score || 0).toFixed(0)}%`,
            subtitle: 'Quality score',
            icon: TrendingUp,
            color: 'from-success-500 to-primary-500',
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-dark-50 mb-2">Dashboard</h1>
                        <p className="text-dark-400">Welcome back! Here's your hiring overview.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/jobs/new">
                            <Button variant="primary" icon={<Plus className="w-5 h-5" />}>
                                Create Job
                            </Button>
                        </Link>
                        <Link to="/resumes/upload">
                            <Button variant="secondary" icon={<Plus className="w-5 h-5" />}>
                                Upload Resume
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, index) => (
                        <Card key={index} className="relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-16 -mt-16`} />
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <stat.icon className="w-8 h-8 text-primary-400" />
                                </div>
                                <h3 className="text-3xl font-bold text-dark-50 mb-1">{stat.value}</h3>
                                <p className="text-sm text-dark-400">{stat.title}</p>
                                <p className="text-xs text-dark-500 mt-1">{stat.subtitle}</p>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <h2 className="text-xl font-bold text-dark-50 mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link to="/jobs">
                                <button className="w-full text-left px-4 py-3 rounded-lg glass-hover flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <Briefcase className="w-5 h-5 text-primary-400" />
                                        <span className="text-dark-200 group-hover:text-dark-50">View All Jobs</span>
                                    </div>
                                    <span className="text-dark-500">→</span>
                                </button>
                            </Link>
                            <Link to="/resumes">
                                <button className="w-full text-left px-4 py-3 rounded-lg glass-hover flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-secondary-400" />
                                        <span className="text-dark-200 group-hover:text-dark-50">Browse Resumes</span>
                                    </div>
                                    <span className="text-dark-500">→</span>
                                </button>
                            </Link>
                            <Link to="/applications">
                                <button className="w-full text-left px-4 py-3 rounded-lg glass-hover flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-accent-400" />
                                        <span className="text-dark-200 group-hover:text-dark-50">View Applications</span>
                                    </div>
                                    <span className="text-dark-500">→</span>
                                </button>
                            </Link>
                            <Link to="/analytics">
                                <button className="w-full text-left px-4 py-3 rounded-lg glass-hover flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="w-5 h-5 text-success-400" />
                                        <span className="text-dark-200 group-hover:text-dark-50">View Analytics</span>
                                    </div>
                                    <span className="text-dark-500">→</span>
                                </button>
                            </Link>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-dark-50">Upcoming Interviews</h2>
                            <Link to="/interviews">
                                <Button variant="ghost" size="sm">View All</Button>
                            </Link>
                        </div>
                        <div className="flex items-center justify-center h-48 text-dark-500">
                            <div className="text-center">
                                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No upcoming interviews</p>
                                <Link to="/interviews/schedule">
                                    <Button variant="ghost" size="sm" className="mt-3">
                                        Schedule Interview
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;
