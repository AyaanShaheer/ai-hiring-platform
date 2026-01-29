import React from 'react';
import { getATSStrokeColor } from '../../utils/resumeHelpers';

interface ATSScoreCircleProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

const ATSScoreCircle: React.FC<ATSScoreCircleProps> = ({ score, size = 'md', showLabel = true }) => {
    const sizes = {
        sm: { width: 80, strokeWidth: 6, fontSize: 'text-lg' },
        md: { width: 120, strokeWidth: 8, fontSize: 'text-2xl' },
        lg: { width: 160, strokeWidth: 10, fontSize: 'text-3xl' },
    };

    const config = sizes[size];
    const radius = (config.width - config.strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const strokeColor = getATSStrokeColor(score);

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative" style={{ width: config.width, height: config.width }}>
                <svg
                    width={config.width}
                    height={config.width}
                    className="transform -rotate-90"
                >
                    {/* Background circle */}
                    <circle
                        cx={config.width / 2}
                        cy={config.width / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={config.strokeWidth}
                        className="text-dark-700"
                    />
                    {/* Progress circle */}
                    <circle
                        cx={config.width / 2}
                        cy={config.width / 2}
                        r={radius}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={config.strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                {/* Score text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`${config.fontSize} font-bold text-dark-50`}>
                        {score}%
                    </span>
                </div>
            </div>
            {showLabel && (
                <p className="text-sm text-dark-400 font-medium">ATS Compatibility</p>
            )}
        </div>
    );
};

export default ATSScoreCircle;
