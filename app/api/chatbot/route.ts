'use server'

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { auth } from '@clerk/nextjs/server';

const RASA_SERVER_URL = 'http://localhost:5005';

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  const authHeader = req.headers.get('authorization');
  const { userId } = await auth();


  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const rasaResponse = await axios.post(`${RASA_SERVER_URL}/webhooks/rest/webhook`, {
      sender: userId || 'user',
      message,
      metadata: {
        'X-Clerk-Auth': authHeader,
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const botMessages = rasaResponse.data.map((msg: any) => msg.text).filter(Boolean);
    const reply = botMessages.length > 0 ? botMessages.join('\n') : "I'm not sure how to respond to that.";

    return NextResponse.json({ reply }, { status: 200 });
  } catch (error) {
    console.error('Error processing chatbot request:', error);
    return NextResponse.json({ error: 'Failed to process your message' }, { status: 500 });
  }
}
