import api from '../config/api';

export interface RecommendationCandidate {
    resume_id: number;
    candidate_name: string | null;
    candidate_email: string | null;
    similarity_score: number;
    skills: string[];
    experience_years: number | null;
    rank: number;
    outreach_message?: string;
}

export interface BatchRecommendationResponse {
    job_id: number;
    job_title: string;
    total_candidates_screened: number;
    recommendations_count: number;
    top_candidates: RecommendationCandidate[];
    average_match_score: number;
}

export interface OutreachResponse {
    job_id: number;
    resume_id: number;
    candidate_name: string;
    match_score: number;
    outreach_message: string;
}

export const recommendationService = {
    async getJobRecommendations(
        jobId: number,
        topK: number = 10,
        generateMessages: boolean = false
    ): Promise<BatchRecommendationResponse> {
        const response = await api.post<BatchRecommendationResponse>(
            `/recommendations/job/${jobId}/recommend`,
            null,
            { params: { top_k: topK, generate_messages: generateMessages } }
        );
        return response.data;
    },

    async generateOutreachMessage(jobId: number, resumeId: number): Promise<OutreachResponse> {
        const response = await api.post<OutreachResponse>(
            `/recommendations/job/${jobId}/outreach/${resumeId}`
        );
        return response.data;
    },

    async semanticSearch(query: string, topK: number = 10): Promise<RecommendationCandidate[]> {
        const response = await api.get<RecommendationCandidate[]>(
            '/recommendations/candidates/search',
            { params: { query, top_k: topK } }
        );
        return response.data;
    },

    async updateEmbeddings(): Promise<{ message: string; stats: Record<string, number> }> {
        const response = await api.post<{ message: string; stats: Record<string, number> }>(
            '/recommendations/update-embeddings'
        );
        return response.data;
    }
};
