import React from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import { Trash2 } from 'lucide-react';
import type { Education } from '../../types/resume';

interface EducationFormProps {
    education: Education;
    onChange: (education: Education) => void;
    onRemove: () => void;
    canRemove: boolean;
}

const EducationForm: React.FC<EducationFormProps> = ({
    education,
    onChange,
    onRemove,
    canRemove,
}) => {
    const handleChange = (field: keyof Education, value: string) => {
        onChange({ ...education, [field]: value });
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
                <Input
                    label="Degree"
                    value={education.degree}
                    onChange={(e) => handleChange('degree', e.target.value)}
                    placeholder="e.g., Bachelor of Science in Computer Science"
                    required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Institution"
                        value={education.institution}
                        onChange={(e) => handleChange('institution', e.target.value)}
                        placeholder="e.g., MIT"
                        required
                    />
                    <Input
                        label="Location"
                        value={education.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        placeholder="e.g., Cambridge, MA"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="Year/Duration"
                        value={education.year}
                        onChange={(e) => handleChange('year', e.target.value)}
                        placeholder="e.g., 2016-2020"
                        required
                    />
                    <Input
                        label="GPA (Optional)"
                        value={education.gpa || ''}
                        onChange={(e) => handleChange('gpa', e.target.value)}
                        placeholder="e.g., 3.8/4.0"
                    />
                    <Input
                        label="Honors (Optional)"
                        value={education.honors || ''}
                        onChange={(e) => handleChange('honors', e.target.value)}
                        placeholder="e.g., Magna Cum Laude"
                    />
                </div>
            </div>
        </Card>
    );
};

export default EducationForm;
