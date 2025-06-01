import { GoogleGenerativeAI } from '@google/generative-ai';

interface ExpenseEntities {
    timeRange?: {
        start: Date;
        end: Date;
    };
    category?: string;
    amount?: {
        min?: number;
        max?: number;
    };
    merchant?: string;
    isRecurring?: boolean;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function parseExpenseEntities(
    message: string
): Promise<ExpenseEntities> {

    const today = new Date().toISOString().split('T')[0]; 
    
    const prompt = `Today's date is ${today}.

Parse the following expense query into structured data:
Query: "${message}"

Extract and return a JSON object with these possible fields:
- timeRange: { start: ISO date string, end: ISO date string }
- category: one of [housing, transportation, groceries, utilities, entertainment, food, shopping, healthcare, education, personal, travel, insurance, gifts, bills, other-expense]
- amount: { min: number, max: number }
- merchant: string
- isRecurring: boolean

Only include fields that are explicitly or implicitly mentioned in the query.
For time ranges, convert natural language to actual date ranges (e.g., "this month" → current month's start and end dates).

Example response format:
{
    "timeRange": {
        "start": "2024-03-01T00:00:00Z",
        "end": "2024-03-31T23:59:59Z"
    },
    "category": "food",
    "amount": {
        "min": 50
    }
}

Return ONLY the JSON object, no additional text.`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        const cleanText = text.trim().replace(/^```json|```$/g, '').trim();
        // Parse the response text as JSON
        const parsed = JSON.parse(cleanText);

        // Convert date strings to Date objects if timeRange exists
        if (parsed.timeRange) {
            parsed.timeRange.start = new Date(parsed.timeRange.start);
            parsed.timeRange.end = new Date(parsed.timeRange.end);
        }

        return parsed;
    } catch (error) {
        console.error('Error parsing expense entities:', error);
        // Return empty object if parsing fails
        return {};
    }
} 