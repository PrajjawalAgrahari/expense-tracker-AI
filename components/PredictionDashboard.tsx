"use client";

import { usePredictions } from "@/hooks/usePredictions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "./ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface PredictionDashboardProps {
  userId: string;
}

export function PredictionDashboard({ userId }: PredictionDashboardProps) {
  const { nextMonthPrediction, categoryBreakdown, isLoading, error } =
    usePredictions(userId);

  if (isLoading) {
    return (
      <div className="p-6 mx-auto max-w-7xl">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[220px] rounded-lg" />
          <Skeleton className="h-[220px] rounded-lg md:col-span-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 mx-auto max-w-7xl">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Unable to Load Predictions
            </h3>
            <p className="text-red-600">
              We couldn't fetch your prediction data at this time. Please check
              your connection and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto max-w-7xl space-y-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Spending Predictions
        </h1>
        <p className="text-gray-600">
          AI-powered insights into your upcoming expenses
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Monthly Prediction Card */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Next Month's Prediction
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {nextMonthPrediction ? (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {formatCurrency(nextMonthPrediction.predicted_amount)}
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      Confidence Range
                    </p>
                    <p className="text-sm text-gray-800">
                      {formatCurrency(
                        nextMonthPrediction.confidence_interval.lower
                      )}{" "}
                      -{" "}
                      {formatCurrency(
                        nextMonthPrediction.confidence_interval.upper
                      )}
                    </p>
                  </div>
                </div>

                {nextMonthPrediction.historical_stats && (
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Historical Context
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">
                          Average
                        </p>
                        <p className="text-lg font-semibold text-blue-900">
                          {formatCurrency(
                            nextMonthPrediction.historical_stats.average
                          )}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">
                          Months
                        </p>
                        <p className="text-lg font-semibold text-green-900">
                          {nextMonthPrediction.historical_stats.months_analyzed}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {nextMonthPrediction.warning && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm text-yellow-800">
                        {nextMonthPrediction.warning}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">
                  No prediction data available yet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Add more transactions to generate predictions
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown Card */}
        <Card className="md:col-span-2 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Category Breakdown Predictions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {categoryBreakdown && categoryBreakdown.length > 0 ? (
              <div className="space-y-5">
                {/* Totals Summary */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-blue-900">
                      Prediction Summary
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-600 font-medium">
                        Category Total:
                      </p>
                      <p className="text-lg font-bold text-blue-900">
                        {formatCurrency(
                          categoryBreakdown.reduce(
                            (acc, curr) => acc + curr.predicted_amount,
                            0
                          )
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-600 font-medium">
                        Monthly Total:
                      </p>
                      <p className="text-lg font-bold text-blue-900">
                        {nextMonthPrediction
                          ? formatCurrency(nextMonthPrediction.predicted_amount)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  {nextMonthPrediction && (
                    <div className="mt-2 text-xs text-blue-600">
                      {Math.abs(
                        categoryBreakdown.reduce(
                          (acc, curr) => acc + curr.predicted_amount,
                          0
                        ) - nextMonthPrediction.predicted_amount
                      ) < 0.01
                        ? "✓ Totals match (proportional allocation applied)"
                        : "⚠ Totals don't match - check data consistency"}
                    </div>
                  )}
                </div>

                {categoryBreakdown.map((category, index) => {
                  const percentOfTotal =
                    category.allocation_percentage ||
                    (category.predicted_amount /
                      categoryBreakdown.reduce(
                        (acc, curr) => acc + curr.predicted_amount,
                        0
                      )) *
                      100;

                  return (
                    <div
                      key={category.category}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {category.category}
                            </p>
                            <p className="text-lg font-bold text-gray-800 mt-1">
                              {formatCurrency(category.predicted_amount)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                category.recent_trend > 0
                                  ? "bg-green-100 text-green-800"
                                  : category.recent_trend < 0
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {category.recent_trend > 0
                                ? "↗"
                                : category.recent_trend < 0
                                ? "↘"
                                : "→"}
                              {category.recent_trend > 0 && "+"}
                              {(category.recent_trend * 100).toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            vs last period
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {percentOfTotal.toFixed(1)}% of total
                          </span>
                          {category.scaling_factor &&
                            category.scaling_factor !== 1.0 && (
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                Scaled{" "}
                                {(category.scaling_factor * 100).toFixed(1)}%
                              </span>
                            )}
                        </div>
                        <Progress
                          value={percentOfTotal}
                          className="h-2 bg-gray-200"
                        />
                        {category.prediction_method && (
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Method: {category.prediction_method}</span>
                            <span>{category.data_points} data points</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Category Data
                </h3>
                <p className="text-sm text-gray-500">
                  Category breakdown will appear once you have enough
                  transaction data
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
