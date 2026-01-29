import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import TemplateCard from '../../components/resume-builder/TemplateCard';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { resumeBuilderService } from '../../services/resumeBuilderService';
import type { ResumeTemplate } from '../../types/resume';

const TemplateSelectionPage: React.FC = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<ResumeTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<string>('all');

    useEffect(() => {
        fetchTemplates();
    }, []);

    useEffect(() => {
        if (selectedCountry === 'all') {
            setFilteredTemplates(templates);
        } else {
            setFilteredTemplates(templates.filter(t => t.country === selectedCountry));
        }
    }, [selectedCountry, templates]);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await resumeBuilderService.getTemplates();
            setTemplates(data);
            setFilteredTemplates(data);
        } catch (err: any) {
            console.error('Failed to fetch templates:', err);
            setError(err.response?.data?.detail || 'Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleTemplateSelect = (template: ResumeTemplate) => {
        navigate(`/resume-builder/create?template=${template.id}`);
    };

    const countries: { value: string; label: string; flag: string }[] = [
        { value: 'all', label: 'All Countries', flag: '🌐' },
        { value: 'US', label: 'United States', flag: '🇺🇸' },
        { value: 'UK', label: 'United Kingdom', flag: '🇬🇧' },
        { value: 'DE', label: 'Germany', flag: '🇩🇪' },
        { value: 'FR', label: 'France', flag: '🇫🇷' },
        { value: 'NL', label: 'Netherlands', flag: '🇳🇱' },
        { value: 'EUROPASS', label: 'Europass', flag: '🇪🇺' },
    ];

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
                <div>
                    <Button
                        variant="ghost"
                        icon={<ArrowLeft className="w-5 h-5" />}
                        onClick={() => navigate('/resume-builder')}
                        className="mb-4"
                    >
                        Back to Resumes
                    </Button>
                    <h1 className="text-3xl font-bold text-dark-50 mb-2">Choose a Template</h1>
                    <p className="text-dark-400">
                        Select a resume template tailored to your target country and industry
                    </p>
                </div>

                {/* Country Filter */}
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-dark-200">Filter by Country:</label>
                    <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-50 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    >
                        {countries.map(country => (
                            <option key={country.value} value={country.value}>
                                {country.flag} {country.label}
                            </option>
                        ))}
                    </select>
                    <span className="text-sm text-dark-500">
                        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
                    </span>
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
                                    onClick={fetchTemplates}
                                    className="mt-2"
                                >
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Templates Grid */}
                {!error && filteredTemplates.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTemplates.map(template => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onClick={handleTemplateSelect}
                            />
                        ))}
                    </div>
                )}

                {/* Empty Filter State */}
                {!error && filteredTemplates.length === 0 && templates.length > 0 && (
                    <Card className="text-center py-16">
                        <p className="text-dark-400">
                            No templates found for the selected country. Try selecting "All Countries".
                        </p>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
};

export default TemplateSelectionPage;
