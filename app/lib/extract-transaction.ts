'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { TransactionData } from './type';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractTransactionData(receiptText: string | undefined): Promise<TransactionData | null> {
    if (!receiptText) return null;
    const prompt = `
You are a smart financial assistant. Parse the following receipt text and convert it into a JSON object with this structure:
{
  type: "EXPENSE" or "INCOME",
  amount: string (in plain digits, e.g. "200.50"),
  category: string (one of: Housing, Transportation, Groceries, Utilities, Entertainment, Food, Shopping, Healthcare, Education, Personal, Travel, Insurance, Gifts, Bills, Other Expenses )
  description: optional short note (max 20 words),
  date: in the format (2025-04-13),
}

Receipt Text:
"""
${receiptText}
"""

Return only the JSON.
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
            // date: new Date(parsed.date),
        };
    } catch (err) {
        console.error('Failed to parse response:', err);
        return null;
    }
}

export async function extractExpenseFromMessage(message: string): Promise<any> {
  if (!message) return null;

  const prompt = `
  You are a financial assistant that extracts expense information from user messages.
  
  Extract the following information from this message:
  - amount: numeric value (required)
  - category: one of [housing, transportation, groceries, utilities, entertainment, food, shopping, healthcare, education, personal, travel, insurance, gifts, bills, other-expense] (required)
  - date: in YYYY-MM-DD format (use today's date if not specified)
  - description: a brief description (optional)
  
  Message: "${message}"
  
  Return ONLY a valid JSON object with these fields. If you cannot extract a required field, use null for that field.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const content = response.text();

    // Clean up the response to ensure it's valid JSON
    const cleanContent = content.trim().replace(/^```json|```$/g, '').trim();
    
    const parsed = JSON.parse(cleanContent);
    
    // Add default values and type
    return {
      type: "EXPENSE",
      amount: parsed.amount?.toString() || null,
      category: parsed.category || null,
      description: parsed.description || "",
      date: parsed.date || new Date().toISOString().split('T')[0],
    };
  } catch (err) {
    console.error('Failed to extract expense from message:', err);
    return null;
  }
}
