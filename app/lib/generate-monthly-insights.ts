'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateMonthlyInsights(month: any, stats: any) {
    const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: $${stats.totalIncome}
    - Total Expenses: $${stats.totalExpense}
    - Net Income: $${stats.totalIncome - stats.totalExpense}
    - Expense Categories: ${Object.entries(stats.categories)
            .map(([category, amount]) => `${category}: $${amount}`)
            .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;


    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const chat = model.startChat();
        const result = await chat.sendMessage(prompt);
        const response = result.response;

        const content = response.text();
        // Remove code block formatting like ```json ... ```
        const cleanContent = content.trim().replace(/^```json|```$/g, '').trim();
        const parsed = JSON.parse(cleanContent);
        return {
            ...parsed,
        };
    } catch (err) {
        console.error('Failed to parse response:', err);
        return null;
    }
}
