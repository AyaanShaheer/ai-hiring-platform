import React, { useState } from 'react';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { X, Plus } from 'lucide-react';

interface SkillInputProps {
    label: string;
    value: string[];
    onChange: (skills: string[]) => void;
    placeholder?: string;
    maxSkills?: number;
}

const SkillInput: React.FC<SkillInputProps> = ({
    label,
    value,
    onChange,
    placeholder = 'Type skill and press Enter',
    maxSkills = 20,
}) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            if (value.length < maxSkills && !value.includes(inputValue.trim())) {
                onChange([...value, inputValue.trim()]);
                setInputValue('');
            }
        }
    };

    const handleAdd = () => {
        if (inputValue.trim() && value.length < maxSkills && !value.includes(inputValue.trim())) {
            onChange([...value, inputValue.trim()]);
            setInputValue('');
        }
    };

    const handleRemove = (skillToRemove: string) => {
        onChange(value.filter(skill => skill !== skillToRemove));
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-dark-200">{label}</label>

            {/* Input with Add Button */}
            <div className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={value.length >= maxSkills}
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!inputValue.trim() || value.length >= maxSkills}
                    className="px-4 py-2 rounded-lg bg-primary-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {/* Skills Display */}
            {value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {value.map((skill, index) => (
                        <Badge
                            key={index}
                            variant="primary"
                            className="flex items-center gap-1 px-3 py-1"
                        >
                            <span>{skill}</span>
                            <button
                                type="button"
                                onClick={() => handleRemove(skill)}
                                className="hover:text-red-400 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Count */}
            <p className="text-xs text-dark-500">
                {value.length} / {maxSkills} skills added
            </p>
        </div>
    );
};

export default SkillInput;
