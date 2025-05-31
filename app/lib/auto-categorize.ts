'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function categorizeTransactionDescription(
  description: string,
  transactionType: "EXPENSE" | "INCOME"
): Promise<string | null> {
  if (!description || description.trim().length < 3) return null;

  const expenseCategories = [
    "housing", "transportation", "groceries", "utilities", "entertainment", 
    "food", "shopping", "healthcare", "education", "personal", "travel", 
    "insurance", "gifts", "bills", "other-expense"
  ];

  const incomeCategories = [
    "salary", "freelance", "business", "investment", "rental", "gift", 
    "refund", "bonus", "other-income"
  ];

  const categories = transactionType === "EXPENSE" ? expenseCategories : incomeCategories;

  const prompt = `
You are a financial transaction categorization expert. Given a transaction description, determine the most appropriate category.

Transaction Type: ${transactionType}
Description: "${description}"

Available Categories: ${categories.join(", ")}

Rules:
1. Return ONLY the category name (lowercase, hyphenated format)
2. If you cannot confidently categorize (confidence < 70%), return "UNCERTAIN"
3. Choose the most specific and relevant category
4. Consider common merchant names, keywords, and context

Examples:
- "Walmart grocery shopping" → "groceries"
- "Gas station Shell" → "transportation"
- "Netflix subscription" → "entertainment"
- "Electric bill payment" → "utilities"
- "Salary deposit ABC Corp" → "salary"

Response:`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim().toLowerCase();

    // Validate response
    if (response === "uncertain") return null;
    if (categories.includes(response)) return response;
    
    return null;
  } catch (error) {
    console.error('Auto-categorization failed:', error);
    return null;
  }
}