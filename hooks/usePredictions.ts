'use client';

import { useQuery } from '@tanstack/react-query';

interface PredictionResponse {
    predicted_amount: number;
    confidence_interval: {
        lower: number;
        upper: number;
    };
    method: 'holt_winters' | 'simple_average';
    historical_stats?: {
        average: number;
        std_dev: number;
        months_analyzed: number;
    };
    warning?: string;
}

interface CategoryPrediction {
    category: string;
    predicted_amount: number;
    raw_predicted_amount: number;
    confidence_interval: {
        lower: number;
        upper: number;
    };
    historical_average: number;
    recent_trend: number;
    data_points: number;
    prediction_method: 'holt_winters' | 'simple_average';
    allocation_percentage: number;
    scaling_factor: number;
}

export function usePredictions(userId: string) {
    const { data: nextMonthPrediction, isLoading: isLoadingPrediction } = useQuery<PredictionResponse>({
        queryKey: ['predictions', 'next-month', userId],
        queryFn: async () => {
            const response = await fetch(`http://localhost:8001/predict/next-month/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch prediction');
            const data = await response.json();
            console.log('Next month prediction:', data);
            return data;
        },
        enabled: !!userId,
    });

    const { data: categoryBreakdown, isLoading: isLoadingCategories } = useQuery<CategoryPrediction[]>({
        queryKey: ['predictions', 'category-breakdown', userId],
        queryFn: async () => {
            const response = await fetch(`http://localhost:8001/predict/category-breakdown/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch category breakdown');
            const data = await response.json();
            console.log('Category breakdown:', data);
            return data;
        },
        enabled: !!userId,
    });

    return {
        nextMonthPrediction,
        categoryBreakdown,
        isLoading: isLoadingPrediction || isLoadingCategories,
        error: null, // You can add proper error handling here if needed
    };
} 