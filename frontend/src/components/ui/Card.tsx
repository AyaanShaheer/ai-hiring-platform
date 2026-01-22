import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false, onClick }) => {
    return (
        <div
            className={`
        glass rounded-xl p-6 shadow-lg
        ${hover ? 'glass-hover cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card;
