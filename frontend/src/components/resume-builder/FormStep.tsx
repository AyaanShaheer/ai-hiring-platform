import React from 'react';
import Button from '../ui/Button';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';

interface FormStepProps {
    currentStep: number;
    totalSteps: number;
    title: string;
    children: React.ReactNode;
    onPrevious?: () => void;
    onNext?: () => void;
    onSubmit?: () => void;
    isSubmitting?: boolean;
    canGoNext?: boolean;
    hidePrevious?: boolean;
}

const FormStep: React.FC<FormStepProps> = ({
    currentStep,
    totalSteps,
    title,
    children,
    onPrevious,
    onNext,
    onSubmit,
    isSubmitting = false,
    canGoNext = true,
    hidePrevious = false,
}) => {
    const isLastStep = currentStep === totalSteps;
    const isFirstStep = currentStep === 1;

    return (
        <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">
                        Step {currentStep} of {totalSteps}
                    </span>
                    <span className="text-primary-400 font-medium">
                        {Math.round((currentStep / totalSteps) * 100)}% Complete
                    </span>
                </div>
                <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                </div>
            </div>

            {/* Step Title */}
            <div>
                <h2 className="text-2xl font-bold text-dark-50 mb-1">{title}</h2>
                <p className="text-sm text-dark-400">Please fill in all required fields</p>
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">{children}</div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div>
                    {!isFirstStep && !hidePrevious && (
                        <Button
                            type="button"
                            variant="ghost"
                            icon={<ChevronLeft className="w-5 h-5" />}
                            onClick={onPrevious}
                            disabled={isSubmitting}
                        >
                            Previous
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {isLastStep ? (
                        <Button
                            type="button"
                            variant="primary"
                            icon={<Save className="w-5 h-5" />}
                            onClick={onSubmit}
                            disabled={!canGoNext || isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Create Resume'}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="primary"
                            icon={<ChevronRight className="w-5 h-5" />}
                            onClick={onNext}
                            disabled={!canGoNext}
                        >
                            Next Step
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FormStep;
