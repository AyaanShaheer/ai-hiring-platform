import React from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Trash2, Plus, Minus } from 'lucide-react';
import type { WorkExperience } from '../../types/resume';

interface ExperienceFormProps {
    experience: WorkExperience;
    onChange: (experience: WorkExperience) => void;
    onRemove: () => void;
    canRemove: boolean;
}

const ExperienceForm: React.FC<ExperienceFormProps> = ({
    experience,
    onChange,
    onRemove,
    canRemove,
}) => {
    const handleChange = (field: keyof WorkExperience, value: any) => {
        onChange({ ...experience, [field]: value });
    };

    const addResponsibility = () => {
        const responsibilities = experience.responsibilities || [];
        onChange({ ...experience, responsibilities: [...responsibilities, ''] });
    };

    const updateResponsibility = (index: number, value: string) => {
        const responsibilities = [...(experience.responsibilities || [])];
        responsibilities[index] = value;
        onChange({ ...experience, responsibilities });
    };

    const removeResponsibility = (index: number) => {
        const responsibilities = [...(experience.responsibilities || [])];
        responsibilities.splice(index, 1);
        onChange({ ...experience, responsibilities });
    };

    const addAchievement = () => {
        const achievements = experience.achievements || [];
        onChange({ ...experience, achievements: [...achievements, ''] });
    };

    const updateAchievement = (index: number, value: string) => {
        const achievements = [...(experience.achievements || [])];
        achievements[index] = value;
        onChange({ ...experience, achievements });
    };

    const removeAchievement = (index: number) => {
        const achievements = [...(experience.achievements || [])];
        achievements.splice(index, 1);
        onChange({ ...experience, achievements });
    };

    return (
        <Card className="relative">
            {/* Remove Button */}
            {canRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-300 transition-colors"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            )}

            <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Job Title"
                        value={experience.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="e.g., Software Engineer"
                        required
                    />
                    <Input
                        label="Company"
                        value={experience.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        placeholder="e.g., Tech Corp"
                        required
                    />
                </div>

                <Input
                    label="Location"
                    value={experience.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                />

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Start Date"
                        type="month"
                        value={experience.start_date}
                        onChange={(e) => handleChange('start_date', e.target.value)}
                        required
                    />
                    {!experience.is_current && (
                        <Input
                            label="End Date"
                            type="month"
                            value={experience.end_date || ''}
                            onChange={(e) => handleChange('end_date', e.target.value || null)}
                        />
                    )}
                </div>

                {/* Currently Working */}
                <label className="flex items-center gap-2 text-sm text-dark-200">
                    <input
                        type="checkbox"
                        checked={experience.is_current}
                        onChange={(e) => {
                            handleChange('is_current', e.target.checked);
                            if (e.target.checked) {
                                handleChange('end_date', null);
                            }
                        }}
                        className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                    />
                    I currently work here
                </label>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-dark-200 mb-2">
                        Description (Optional)
                    </label>
                    <textarea
                        value={experience.description || ''}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Brief overview of your role..."
                        rows={3}
                        className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-50 placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                </div>

                {/* Responsibilities */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-dark-200">
                            Responsibilities
                        </label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            icon={<Plus className="w-4 h-4" />}
                            onClick={addResponsibility}
                        >
                            Add
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {(experience.responsibilities || []).map((resp, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    value={resp}
                                    onChange={(e) => updateResponsibility(index, e.target.value)}
                                    placeholder="• Describe a responsibility..."
                                />
                                <button
                                    type="button"
                                    onClick={() => removeResponsibility(index)}
                                    className="text-red-400 hover:text-red-300 p-2"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Achievements */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-dark-200">
                            Achievements (Optional)
                        </label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            icon={<Plus className="w-4 h-4" />}
                            onClick={addAchievement}
                        >
                            Add
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {(experience.achievements || []).map((ach, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    value={ach}
                                    onChange={(e) => updateAchievement(index, e.target.value)}
                                    placeholder="• Highlight an achievement..."
                                />
                                <button
                                    type="button"
                                    onClick={() => removeAchievement(index)}
                                    className="text-red-400 hover:text-red-300 p-2"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ExperienceForm;
