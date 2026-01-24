import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { recommendationService } from '../../services/recommendationService';
import type { RecommendationCandidate, BatchRecommendationResponse } from '../../services/recommendationService';
import { jobService } from '../../services/jobService';
import type { Job } from '../../types';
import {
    Search,
    Sparkles,
    User,
    Mail,
    Star,
    MessageSquare,
    Copy,
    Check,
    ChevronDown,
    Target,
    Zap,
    TrendingUp,
    RefreshCw
} from 'lucide-react';

const RecommendationsPage: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
    const [recommendations, setRecommendations] = useState<BatchRecommendationResponse | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<RecommendationCandidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [generatingMessage, setGeneratingMessage] = useState<number | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [outreachMessages, setOutreachMessages] = useState<Record<number, string>>({});
    const [activeTab, setActiveTab] = useState<'job' | 'search'>('job');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const data = await jobService.getJobs();
            setJobs(data);
            if (data.length > 0 && !selectedJobId) {
                setSelectedJobId(data[0].id);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    };

    const fetchRecommendations = async () => {
        if (!selectedJobId) return;

        setLoading(true);
        try {
            const data = await recommendationService.getJobRecommendations(selectedJobId, 10, false);
            setRecommendations(data);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSemanticSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearchLoading(true);
        try {
            const results = await recommendationService.semanticSearch(searchQuery, 10);
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching:', error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const generateOutreach = async (resumeId: number) => {
        if (!selectedJobId) return;

        setGeneratingMessage(resumeId);
        try {
            const response = await recommendationService.generateOutreachMessage(selectedJobId, resumeId);
            setOutreachMessages(prev => ({ ...prev, [resumeId]: response.outreach_message }));
        } catch (error) {
            console.error('Error generating outreach:', error);
        } finally {
            setGeneratingMessage(null);
        }
    };

    const copyToClipboard = (text: string, id: number) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return 'from-green-600/20 to-green-800/20 border-green-500/30';
        if (score >= 60) return 'from-yellow-600/20 to-yellow-800/20 border-yellow-500/30';
        return 'from-red-600/20 to-red-800/20 border-red-500/30';
    };

    useEffect(() => {
        if (selectedJobId && activeTab === 'job') {
            fetchRecommendations();
        }
    }, [selectedJobId]);

    const CandidateCard = ({ candidate, showOutreach = true }: { candidate: RecommendationCandidate; showOutreach?: boolean }) => (
        <Card className={`bg-gradient-to-br ${getScoreBgColor(candidate.similarity_score)}`}>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {(candidate.candidate_name || 'C')[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-dark-100">
                                {candidate.candidate_name || 'Unknown Candidate'}
                            </h3>
                            <Badge variant="info">#{candidate.rank}</Badge>
                        </div>
                        <p className="text-dark-400 text-sm flex items-center gap-1 mb-2">
                            <Mail className="w-3 h-3" />
                            {candidate.candidate_email || 'No email'}
                        </p>
                        <p className="text-dark-400 text-sm mb-3">
                            {candidate.experience_years} years experience
                        </p>
                        {candidate.skills && candidate.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {candidate.skills.slice(0, 6).map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-0.5 text-xs rounded-full bg-dark-700/50 text-dark-300"
                                    >
                                        {skill}
                                    </span>
                                ))}
                                {candidate.skills.length > 6 && (
                                    <span className="px-2 py-0.5 text-xs text-dark-500">
                                        +{candidate.skills.length - 6} more
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                        <p className={`text-3xl font-bold ${getScoreColor(candidate.similarity_score)}`}>
                            {candidate.similarity_score.toFixed(0)}%
                        </p>
                        <p className="text-dark-500 text-xs">Match Score</p>
                    </div>

                    {showOutreach && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateOutreach(candidate.resume_id)}
                            disabled={generatingMessage === candidate.resume_id}
                            className="flex items-center gap-1"
                        >
                            {generatingMessage === candidate.resume_id ? (
                                <>
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <MessageSquare className="w-3 h-3" />
                                    Generate Outreach
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Outreach Message */}
            {outreachMessages[candidate.resume_id] && (
                <div className="mt-4 pt-4 border-t border-dark-600">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-dark-200 font-medium flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary-400" />
                            AI-Generated Outreach Message
                        </h4>
                        <button
                            onClick={() => copyToClipboard(outreachMessages[candidate.resume_id], candidate.resume_id)}
                            className="flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors text-sm"
                        >
                            {copiedId === candidate.resume_id ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    Copy
                                </>
                            )}
                        </button>
                    </div>
                    <div className="bg-dark-800/50 rounded-lg p-4 text-dark-300 text-sm whitespace-pre-wrap">
                        {outreachMessages[candidate.resume_id]}
                    </div>
                </div>
            )}
        </Card>
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-dark-50 mb-2">AI Recommendations</h1>
                    <p className="text-dark-400">Discover top candidates with AI-powered matching and outreach</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('job')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'job'
                            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
                            : 'bg-dark-800 text-dark-400 hover:text-dark-200 border border-dark-700'
                            }`}
                    >
                        <Target className="w-4 h-4" />
                        Job Recommendations
                    </button>
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'search'
                            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
                            : 'bg-dark-800 text-dark-400 hover:text-dark-200 border border-dark-700'
                            }`}
                    >
                        <Search className="w-4 h-4" />
                        Semantic Search
                    </button>
                </div>

                {/* Job Recommendations Tab */}
                {activeTab === 'job' && (
                    <div className="space-y-6">
                        {/* Job Selector */}
                        <Card>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block text-dark-200 text-sm font-medium mb-2">
                                        Select a Job to Find Top Candidates
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedJobId || ''}
                                            onChange={(e) => setSelectedJobId(Number(e.target.value))}
                                            className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:border-primary-500 appearance-none cursor-pointer pr-10"
                                        >
                                            <option value="">Select a job...</option>
                                            {jobs.map(job => (
                                                <option key={job.id} value={job.id}>
                                                    {job.title} - {job.company}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        onClick={fetchRecommendations}
                                        disabled={!selectedJobId || loading}
                                        className="flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                Finding...
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="w-4 h-4" />
                                                Find Candidates
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Recommendations Results */}
                        {recommendations && (
                            <div className="space-y-4">
                                {/* Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Card className="bg-gradient-to-br from-primary-600/20 to-primary-800/20 border-primary-500/30">
                                        <div className="text-center">
                                            <p className="text-3xl font-bold text-dark-50">{recommendations.recommendations_count}</p>
                                            <p className="text-dark-400 text-sm">Top Candidates</p>
                                        </div>
                                    </Card>
                                    <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
                                        <div className="text-center">
                                            <p className="text-3xl font-bold text-dark-50">{recommendations.total_candidates_screened}</p>
                                            <p className="text-dark-400 text-sm">Total Screened</p>
                                        </div>
                                    </Card>
                                    <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
                                        <div className="text-center">
                                            <p className="text-3xl font-bold text-dark-50">{recommendations.average_match_score.toFixed(0)}%</p>
                                            <p className="text-dark-400 text-sm">Avg Match Score</p>
                                        </div>
                                    </Card>
                                    <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
                                        <div className="text-center">
                                            <p className="text-3xl font-bold text-dark-50 truncate">{recommendations.job_title}</p>
                                            <p className="text-dark-400 text-sm">Target Position</p>
                                        </div>
                                    </Card>
                                </div>

                                {/* Candidate List */}
                                <div className="space-y-4">
                                    <h2 className="text-lg font-semibold text-dark-100 flex items-center gap-2">
                                        <Star className="w-5 h-5 text-primary-400" />
                                        Top Candidates for {recommendations.job_title}
                                    </h2>
                                    {recommendations.top_candidates.length === 0 ? (
                                        <Card>
                                            <div className="text-center py-12">
                                                <User className="w-16 h-16 mx-auto text-dark-600 mb-4" />
                                                <p className="text-dark-400">No matching candidates found</p>
                                                <p className="text-dark-500 text-sm">Try uploading more resumes</p>
                                            </div>
                                        </Card>
                                    ) : (
                                        recommendations.top_candidates.map(candidate => (
                                            <CandidateCard key={candidate.resume_id} candidate={candidate} />
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {!recommendations && !loading && (
                            <Card>
                                <div className="text-center py-12">
                                    <Sparkles className="w-16 h-16 mx-auto text-dark-600 mb-4" />
                                    <h3 className="text-xl font-semibold text-dark-300 mb-2">AI-Powered Candidate Matching</h3>
                                    <p className="text-dark-500 mb-4">Select a job and click "Find Candidates" to discover top matches</p>
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                {/* Semantic Search Tab */}
                {activeTab === 'search' && (
                    <div className="space-y-6">
                        {/* Search Input */}
                        <Card>
                            <h2 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
                                <Search className="w-5 h-5 text-primary-400" />
                                Natural Language Candidate Search
                            </h2>
                            <p className="text-dark-400 text-sm mb-4">
                                Describe the ideal candidate in plain English. Our AI will find the best matches.
                            </p>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSemanticSearch()}
                                    placeholder="e.g., Senior React developer with 5+ years experience and TypeScript skills..."
                                    className="flex-1 px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-500 focus:outline-none focus:border-primary-500"
                                />
                                <Button
                                    onClick={handleSemanticSearch}
                                    disabled={searchLoading || !searchQuery.trim()}
                                    className="flex items-center gap-2"
                                >
                                    {searchLoading ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="w-4 h-4" />
                                            Search
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Card>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold text-dark-100 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-primary-400" />
                                    Search Results ({searchResults.length} matches)
                                </h2>
                                {searchResults.map(candidate => (
                                    <CandidateCard key={candidate.resume_id} candidate={candidate} showOutreach={false} />
                                ))}
                            </div>
                        )}

                        {searchResults.length === 0 && searchQuery && !searchLoading && (
                            <Card>
                                <div className="text-center py-12">
                                    <Search className="w-16 h-16 mx-auto text-dark-600 mb-4" />
                                    <p className="text-dark-400">No candidates match your search</p>
                                    <p className="text-dark-500 text-sm">Try different search terms</p>
                                </div>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default RecommendationsPage;
