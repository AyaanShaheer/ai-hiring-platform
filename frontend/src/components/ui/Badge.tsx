import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
    const variantClasses = {
        default: 'bg-dark-700 text-dark-200',
        success: 'bg-success-500/20 text-success-400 border border-success-500/30',
        warning: 'bg-warning-500/20 text-warning-400 border border-warning-500/30',
        danger: 'bg-danger-500/20 text-danger-400 border border-danger-500/30',
        info: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
    };

    return (
        <span
            className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variantClasses[variant]}
        ${className}
      `}
        >
            {children}
        </span>
    );
};

export default Badge;
