import api from '../config/api';

export interface BiasFlag {
    type: string;
    text: string;
    suggestion?: string;
}

export interface BiasAnalysis {
    job_id: number;
    job_title: string;
    bias_score: number;
    bias_risk_level: 'low' | 'medium' | 'high';
    flags: BiasFlag[];
    has_bias: boolean;
    potential_biases?: string[];
    recommendations?: string[];
    best_practices?: string[];
    fairness_score?: number;
    summary?: string;
}

export interface FairnessReport {
    job_id: number;
    job_title: string;
    candidate_count: number;
    average_score: number;
    score_variance: number;
    has_bias_indicators: boolean;
    analysis: string;
    recommendation: string;
}

export const biasService = {
    analyzeJobBias: async (jobId: number, useAI: boolean = true): Promise<BiasAnalysis> => {
        const response = await api.post(`/bias/analyze-job/${jobId}`, null, {
            params: { use_ai: useAI }
        });
        return response.data;
    },

    getFairnessReport: async (jobId: number): Promise<FairnessReport> => {
        const response = await api.get(`/bias/job/${jobId}/fairness-report`);
        return response.data;
    }
};
