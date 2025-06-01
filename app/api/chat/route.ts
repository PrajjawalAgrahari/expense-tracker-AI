import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import axios from 'axios';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { message } = body;

        // Send message to Rasa
        const response = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
            sender: userId,
            message: message
        });

        // Format Rasa response
        const messages = response.data.map((msg: any) => ({
            text: msg.text,
            type: 'bot'
        }));

        return NextResponse.json(messages);

    } catch (error) {
        console.error('[CHAT_ERROR]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
} 