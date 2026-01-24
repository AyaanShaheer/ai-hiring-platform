import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { analyticsService } from '../../services/analyticsService';
import type { SkillsAnalytics, TrendData } from '../../types';
import {
    BarChart3,
    TrendingUp,
    Users,
    Briefcase,
    FileText,
    Download,
    Brain,
    RefreshCw,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    Target,
    PieChart
} from 'lucide-react';

const AnalyticsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [skills, setSkills] = useState<SkillsAnalytics[]>([]);
    const [trends, setTrends] = useState<TrendData[]>([]);
    const [comparison, setComparison] = useState<any>(null);
    const [insights, setInsights] = useState<any>(null);
    const [exporting, setExporting] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'trends' | 'insights'>('overview');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching analytics data...');
            const [skillsData, trendsData, comparisonData, insightsData] = await Promise.all([
                analyticsService.getSkillsAnalytics().catch((e) => { console.error('Skills error:', e); return []; }),
                analyticsService.getTrends(30).catch((e) => { console.error('Trends error:', e); return []; }),
                analyticsService.getComparison().catch((e) => { console.error('Comparison error:', e); return null; }),
                analyticsService.getAIInsights().catch((e) => { console.error('Insights error:', e); return null; })
            ]);
            console.log('Analytics data fetched:', { skillsData, trendsData, comparisonData, insightsData });
            setSkills(Array.isArray(skillsData) ? skillsData : []);
            setTrends(Array.isArray(trendsData) ? trendsData : []);
            setComparison(comparisonData);
            setInsights(insightsData);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setError(error instanceof Error ? error.message : 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type: 'jobs' | 'resumes' | 'applications') => {
        setExporting(type);
        try {
            const blob = await analyticsService.exportData(type);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}_export.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error:', error);
        } finally {
            setExporting(null);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'skills', label: 'Skills Gap', icon: <Target className="w-4 h-4" /> },
        { id: 'trends', label: 'Trends', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'insights', label: 'AI Insights', icon: <Brain className="w-4 h-4" /> }
    ];

    const getMaxValue = (data: SkillsAnalytics[], field: 'demand_count' | 'supply_count') => {
        return Math.max(...data.map(s => s[field]), 1);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-dark-50 mb-2">Analytics Dashboard</h1>
                        <p className="text-dark-400">Insights, trends, and AI-powered analysis</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={fetchAnalytics}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <div className="relative group">
                            <Button variant="primary" className="flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Export Data
                            </Button>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-dark-800 border border-dark-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                <button
                                    onClick={() => handleExport('jobs')}
                                    disabled={exporting !== null}
                                    className="w-full px-4 py-2 text-left text-dark-200 hover:bg-dark-700 transition-colors rounded-t-lg flex items-center gap-2"
                                >
                                    <Briefcase className="w-4 h-4" />
                                    {exporting === 'jobs' ? 'Exporting...' : 'Export Jobs'}
                                </button>
                                <button
                                    onClick={() => handleExport('resumes')}
                                    disabled={exporting !== null}
                                    className="w-full px-4 py-2 text-left text-dark-200 hover:bg-dark-700 transition-colors flex items-center gap-2"
                                >
                                    <FileText className="w-4 h-4" />
                                    {exporting === 'resumes' ? 'Exporting...' : 'Export Resumes'}
                                </button>
                                <button
                                    onClick={() => handleExport('applications')}
                                    disabled={exporting !== null}
                                    className="w-full px-4 py-2 text-left text-dark-200 hover:bg-dark-700 transition-colors rounded-b-lg flex items-center gap-2"
                                >
                                    <Users className="w-4 h-4" />
                                    {exporting === 'applications' ? 'Exporting...' : 'Export Applications'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-dark-700 pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${activeTab === tab.id
                                ? 'bg-primary-500/20 text-primary-400 border-b-2 border-primary-500'
                                : 'text-dark-400 hover:text-dark-200'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {error ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="text-red-400 text-lg mb-2">Error Loading Analytics</div>
                        <div className="text-dark-400 text-sm mb-4">{error}</div>
                        <Button onClick={fetchAnalytics}>Retry</Button>
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Comparison Cards */}
                                {comparison && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-dark-400 text-sm mb-1">Jobs This Month</p>
                                                    <p className="text-3xl font-bold text-dark-50">
                                                        {comparison.current_month?.jobs || 0}
                                                    </p>
                                                </div>
                                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${(comparison.changes?.jobs_change || 0) >= 0
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {(comparison.changes?.jobs_change || 0) >= 0
                                                        ? <ArrowUpRight className="w-3 h-3" />
                                                        : <ArrowDownRight className="w-3 h-3" />
                                                    }
                                                    {Math.abs(comparison.changes?.jobs_change || 0)}%
                                                </div>
                                            </div>
                                            <p className="text-dark-500 text-xs mt-2">
                                                vs {comparison.previous_month?.jobs || 0} last month
                                            </p>
                                        </Card>


                                        <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-dark-400 text-sm mb-1">Resumes</p>
                                                    <p className="text-3xl font-bold text-dark-50">
                                                        {comparison.current_month?.resumes || 0}
                                                    </p>
                                                </div>
                                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${(comparison.changes?.resumes_change || 0) >= 0
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {(comparison.changes?.resumes_change || 0) >= 0
                                                        ? <ArrowUpRight className="w-3 h-3" />
                                                        : <ArrowDownRight className="w-3 h-3" />
                                                    }
                                                    {Math.abs(comparison.changes?.resumes_change || 0)}%
                                                </div>
                                            </div>
                                            <p className="text-dark-500 text-xs mt-2">
                                                vs {comparison.previous_month?.resumes || 0} last month
                                            </p>
                                        </Card>
                                    </div>
                                )}

                                {/* Quick Stats */}
                                <Card>
                                    <h2 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
                                        <PieChart className="w-5 h-5 text-primary-400" />
                                        Quick Overview
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center p-4 bg-dark-800/50 rounded-lg">
                                            <Briefcase className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                                            <p className="text-2xl font-bold text-dark-50">{skills.length}</p>
                                            <p className="text-dark-400 text-sm">Tracked Skills</p>
                                        </div>
                                        <div className="text-center p-4 bg-dark-800/50 rounded-lg">
                                            <TrendingUp className="w-8 h-8 mx-auto text-green-400 mb-2" />
                                            <p className="text-2xl font-bold text-dark-50">{trends.length}</p>
                                            <p className="text-dark-400 text-sm">Days of Data</p>
                                        </div>
                                        <div className="text-center p-4 bg-dark-800/50 rounded-lg">
                                            <Target className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
                                            <p className="text-2xl font-bold text-dark-50">
                                                {skills.filter(s => s?.gap && s.gap > 0).length}
                                            </p>
                                            <p className="text-dark-400 text-sm">Skills in Demand</p>
                                        </div>
                                        <div className="text-center p-4 bg-dark-800/50 rounded-lg">
                                            <Zap className="w-8 h-8 mx-auto text-purple-400 mb-2" />
                                            <p className="text-2xl font-bold text-dark-50">
                                                {insights ? 'Active' : 'N/A'}
                                            </p>
                                            <p className="text-dark-400 text-sm">AI Analysis</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Skills Gap Tab */}
                        {activeTab === 'skills' && (
                            <Card>
                                <h2 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-primary-400" />
                                    Skills Supply vs Demand
                                </h2>
                                {skills.length === 0 ? (
                                    <div className="text-center py-12">
                                        <BarChart3 className="w-16 h-16 mx-auto text-dark-600 mb-4" />
                                        <p className="text-dark-400">No skills data available yet</p>
                                        <p className="text-dark-500 text-sm">Add more jobs and resumes to see analytics</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {skills.slice(0, 15).map((skill, index) => {
                                            const maxDemand = getMaxValue(skills, 'demand_count');
                                            const maxSupply = getMaxValue(skills, 'supply_count');
                                            const demandWidth = (skill.demand_count / maxDemand) * 100;
                                            const supplyWidth = (skill.supply_count / maxSupply) * 100;

                                            return (
                                                <div key={index} className="group">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-dark-200 font-medium">{skill.skill_name}</span>
                                                        <span className={`text-sm ${skill.gap > 0 ? 'text-red-400' : skill.gap < 0 ? 'text-green-400' : 'text-dark-400'
                                                            }`}>
                                                            {skill.gap > 0 ? `${skill.gap} short` : skill.gap < 0 ? `${Math.abs(skill.gap)} surplus` : 'Balanced'}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs text-blue-400 w-16">Demand</span>
                                                                <div className="flex-1 h-3 bg-dark-700 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                                                                        style={{ width: `${demandWidth}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs text-dark-400 w-8 text-right">{skill.demand_count}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-green-400 w-16">Supply</span>
                                                                <div className="flex-1 h-3 bg-dark-700 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                                                                        style={{ width: `${supplyWidth}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs text-dark-400 w-8 text-right">{skill.supply_count}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* Trends Tab */}
                        {activeTab === 'trends' && (
                            <Card>
                                <h2 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-primary-400" />
                                    30-Day Activity Trends
                                </h2>
                                {trends.length === 0 ? (
                                    <div className="text-center py-12">
                                        <TrendingUp className="w-16 h-16 mx-auto text-dark-600 mb-4" />
                                        <p className="text-dark-400">No trend data available yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="h-64 flex items-end gap-1">
                                            {trends.slice(-30).map((day, index) => {
                                                try {
                                                    const applications = day?.applications || 0;
                                                    const jobs = day?.jobs || 0;
                                                    const interviews = day?.interviews || 0;
                                                    const total = applications + jobs + interviews;
                                                    const maxVal = Math.max(
                                                        ...trends.map(t => (t?.applications || 0) + (t?.jobs || 0) + (t?.interviews || 0)),
                                                        1
                                                    );
                                                    const height = (total / maxVal) * 100;

                                                    return (
                                                        <div key={index} className="flex-1 flex flex-col items-center group">
                                                            <div className="relative w-full">
                                                                <div
                                                                    className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-sm"
                                                                    style={{ height: `${Math.max(height, 2)}px` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                } catch (err) {
                                                    console.error('Error rendering trend bar:', err);
                                                    return null;
                                                }
                                            })}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* AI Insights Tab */}
                        {activeTab === 'insights' && (
                            <Card>
                                <h2 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-primary-400" />
                                    AI-Powered Insights
                                </h2>
                                {!insights ? (
                                    <div className="text-center py-12">
                                        <Brain className="w-16 h-16 mx-auto text-dark-600 mb-4" />
                                        <p className="text-dark-400">AI insights not available</p>
                                        <p className="text-dark-500 text-sm">Add more data to enable AI analysis</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {insights.recommendations?.map((rec: string, index: number) => (
                                            <div
                                                key={index}
                                                className="p-4 bg-gradient-to-r from-primary-600/10 to-primary-800/10 rounded-lg border border-primary-500/20"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Zap className="w-5 h-5 text-primary-400 mt-0.5" />
                                                    <p className="text-dark-200">{rec}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {insights.summary && (
                                            <div className="mt-6 p-4 bg-dark-800/50 rounded-lg">
                                                <h3 className="text-dark-100 font-medium mb-2">Summary</h3>
                                                <p className="text-dark-300">{insights.summary}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AnalyticsPage;
