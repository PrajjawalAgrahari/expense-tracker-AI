// File: app/api/expenses/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractExpenseFromMessage } from '@/app/lib/extract-transaction';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Received data:', data);

    // Check if this is a message that needs entity extraction
    if (data.message) {
      console.log('Processing message for entity extraction:', data.message);
      
      // Extract entities from the message using Gemini
      const extractedData = await extractExpenseFromMessage(data.message);
      
      if (!extractedData) {
        return NextResponse.json(
          { error: 'Could not extract expense information from message' },
          { status: 400 }
        );
      }
      
      // Merge extracted data with any other data sent
      const processedData = {
        ...data,
        ...extractedData,
      };

      // console.log(processedData)
      
      console.log('Processed expense data:', processedData);
      
      // Here you would save to your database
      // const savedExpense = await db.expenses.create({ data: processedData });
      
      return NextResponse.json(
        { message: 'Expense data processed and saved', data: processedData },
        {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }
    
    // If no message field, process as regular expense data
    return NextResponse.json(
      { message: 'Expense data received', data },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Invalid JSON or processing error' },
      { status: 400 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    null,
    {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
