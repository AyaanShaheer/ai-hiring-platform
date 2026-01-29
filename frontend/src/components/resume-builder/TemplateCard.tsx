import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import type { ResumeTemplate } from '../../types/resume';
import { getCountryFlag } from '../../utils/resumeHelpers';

interface TemplateCardProps {
    template: ResumeTemplate;
    onClick: (template: ResumeTemplate) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onClick }) => {
    return (
        <Card
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:border-primary-500/50"
            onClick={() => onClick(template)}
        >
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">{getCountryFlag(template.country)}</span>
                        <div>
                            <h3 className="text-lg font-bold text-dark-50">{template.name}</h3>
                            <p className="text-sm text-dark-400">{template.country}</p>
                        </div>
                    </div>
                </div>

                {/* Type and Max Pages */}
                <div className="flex items-center gap-2">
                    <Badge variant="primary">{template.template_type}</Badge>
                    <Badge variant="secondary">{template.max_pages} page{template.max_pages > 1 ? 's' : ''}</Badge>
                    {template.requires_photo && (
                        <Badge variant="warning">Photo Required</Badge>
                    )}
                </div>

                {/* Description */}
                <p className="text-sm text-dark-300 line-clamp-2">
                    {template.description}
                </p>

                {/* Visual Indicator */}
                <div className="pt-3 border-t border-white/10">
                    <p className="text-xs text-primary-400 font-medium">Click to select →</p>
                </div>
            </div>
        </Card>
    );
};

export default TemplateCard;
