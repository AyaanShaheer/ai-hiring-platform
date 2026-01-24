import api from '../config/api';

export interface FraudAnalysis {
    resume_id: number;
    candidate_name: string | null;
    inflation_score: number;
    risk_level: 'low' | 'medium' | 'high';
    fraud_flags: string[];
    flag_count: number;
    authenticity_assessment?: string;
    concerns?: string[];
    red_flags?: string[];
    recommendations?: string[];
    verification_suggestions?: string[];
    overall_verdict?: string;
    reasoning?: string;
}

export interface FraudScore {
    resume_id: number;
    candidate_name: string | null;
    inflation_score: number | null;
    fraud_flags: string[];
    has_fraud_concerns: boolean;
}

export const fraudService = {
    analyzeResumeFraud: async (resumeId: number, useAI: boolean = true): Promise<FraudAnalysis> => {
        const response = await api.post(`/fraud/analyze/${resumeId}`, null, {
            params: { use_ai: useAI }
        });
        return response.data;
    },

    getResumeFraudScore: async (resumeId: number): Promise<FraudScore> => {
        const response = await api.get(`/fraud/resume/${resumeId}/fraud-score`);
        return response.data;
    }
};
