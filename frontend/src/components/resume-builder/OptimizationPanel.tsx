import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Sparkles, Check, X, RefreshCw } from 'lucide-react';

interface OptimizationPanelProps {
    resumeId: number;
    currentSummary?: string;
    currentExperience?: any[];
    currentSkills?: any;
    onOptimize: (type: 'summary' | 'experience' | 'skills', data: any) => void;
}

const OptimizationPanel: React.FC<OptimizationPanelProps> = ({
    resumeId,
    currentSummary = '',
    currentExperience = [],
    currentSkills = {},
    onOptimize,
}) => {
    const [loading, setLoading] = useState<string | null>(null);
    const [optimizedSummary, setOptimizedSummary] = useState<string | null>(null);
    const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);

    const handleOptimizeSummary = async () => {
        setLoading('summary');
        // Simulate API call - in real implementation, call the API
        setTimeout(() => {
            setOptimizedSummary(
                'Highly motivated and results-driven professional with extensive experience in delivering innovative solutions and driving business growth. Proven track record of exceeding expectations and collaborating effectively with cross-functional teams.'
            );
            setLoading(null);
        }, 2000);
    };

    const handleOptimizeExperience = async () => {
        setLoading('experience');
        // In real implementation, call the API
        setTimeout(() => {
            setLoading(null);
            alert('Experience optimization would update the work experience bullets with AI-enhanced descriptions');
        }, 2000);
    };

    const handleSuggestSkills = async () => {
        setLoading('skills');
        // In real implementation, call the API
        setTimeout(() => {
            setSuggestedSkills(['Cloud Architecture', 'Microservices', 'CI/CD', 'Kubernetes', 'GraphQL']);
            setLoading(null);
        }, 2000);
    };

    const handleAcceptSummary = () => {
        if (optimizedSummary) {
            onOptimize('summary', optimizedSummary);
            setOptimizedSummary(null);
        }
    };

    const handleAcceptSkills = (skill: string) => {
        onOptimize('skills', skill);
        setSuggestedSkills(prev => prev.filter(s => s !== skill));
    };

    return (
        <div className="space-y-6">
            {/* AI Optimization Controls */}
            <Card>
                <h3 className="text-lg font-bold text-dark-50 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary-400" />
                    AI Optimization
                </h3>

                <div className="space-y-3">
                    <Button
                        variant="primary"
                        onClick={handleOptimizeSummary}
                        disabled={loading !== null}
                        icon={loading === 'summary' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        className="w-full"
                    >
                        {loading === 'summary' ? 'Optimizing Summary...' : 'Optimize Professional Summary'}
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={handleOptimizeExperience}
                        disabled={loading !== null}
                        icon={loading === 'experience' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        className="w-full"
                    >
                        {loading === 'experience' ? 'Optimizing Experience...' : 'Optimize Work Experience'}
                    </Button>

                    <Button
                        variant="accent"
                        onClick={handleSuggestSkills}
                        disabled={loading !== null}
                        icon={loading === 'skills' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        className="w-full"
                    >
                        {loading === 'skills' ? 'Analyzing Skills...' : 'Suggest Additional Skills'}
                    </Button>
                </div>
            </Card>

            {/* Summary Comparison */}
            {optimizedSummary && (
                <Card>
                    <h3 className="text-lg font-bold text-dark-50 mb-4">Professional Summary Optimization</h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Original */}
                        <div>
                            <p className="text-sm font-medium text-dark-400 mb-2">Current</p>
                            <div className="p-4 bg-dark-800 rounded-lg border border-dark-600">
                                <p className="text-dark-200 text-sm">
                                    {currentSummary || 'No summary provided'}
                                </p>
                            </div>
                        </div>

                        {/* Optimized */}
                        <div>
                            <p className="text-sm font-medium text-primary-400 mb-2">AI Optimized</p>
                            <div className="p-4 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-lg border border-primary-500/30">
                                <p className="text-dark-100 text-sm">
                                    {optimizedSummary}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-4">
                        <Button
                            variant="primary"
                            icon={<Check className="w-4 h-4" />}
                            onClick={handleAcceptSummary}
                        >
                            Accept Changes
                        </Button>
                        <Button
                            variant="ghost"
                            icon={<X className="w-4 h-4" />}
                            onClick={() => setOptimizedSummary(null)}
                        >
                            Reject
                        </Button>
                    </div>
                </Card>
            )}

            {/* Suggested Skills */}
            {suggestedSkills.length > 0 && (
                <Card>
                    <h3 className="text-lg font-bold text-dark-50 mb-4">Suggested Skills</h3>
                    <p className="text-sm text-dark-400 mb-4">
                        Based on your target role, consider adding these skills:
                    </p>

                    <div className="space-y-2">
                        {suggestedSkills.map((skill, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors"
                            >
                                <span className="text-dark-100">{skill}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAcceptSkills(skill)}
                                        className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                                    >
                                        Add
                                    </button>
                                    <button
                                        onClick={() => setSuggestedSkills(prev => prev.filter(s => s !== skill))}
                                        className="px-3 py-1 bg-dark-600 text-dark-300 rounded-lg text-sm hover:bg-dark-500 transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default OptimizationPanel;
