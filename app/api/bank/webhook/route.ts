import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

interface WebhookPayload {
    event: 'transaction.created' | 'transaction.updated' | 'ping';
    timestamp: string;
    data: {
        transaction?: {
            id: string;
            userId: string;
            amount: number;
            description: string;
            category: string;
            type: 'INCOME' | 'EXPENSE';
            date: string;
            merchantName?: string;
            accountId: string;
        };
        user_id?: string;
        message?: string;
    };
    signature?: string;
}

/**
 * Verify webhook signature for security
 */
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
        // Parse the received payload
        const parsedPayload = JSON.parse(payload);

        // Create the same payload structure that was signed (without signature field)
        const payloadToVerify = {
            event: parsedPayload.event,
            timestamp: parsedPayload.timestamp,
            data: parsedPayload.data
        };

        // Generate expected signature using the same structure
        const payloadString = JSON.stringify(payloadToVerify);

        console.log('Verifying payload:', {
            secret: secret.substring(0, 10) + '...',
            payloadLength: payloadString.length,
            payloadPreview: payloadString.substring(0, 100) + '...'
        });

        console.log('Full payload to verify:', payloadString);

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payloadString)
            .digest('hex');

        console.log('Expected signature:', expectedSignature);
        console.log('Received signature:', signature);

        const isValid = crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );

        console.log('Signature valid:', isValid);
        return isValid;

    } catch (error) {
        console.error('Error verifying webhook signature:', error);
        return false;
    }
}

/**
 * Process transaction creation webhook
 */
async function processTransactionCreated(transaction: any) {
    
}

/**
 * POST handler for bank webhooks
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const headersList = request.headers;
        // console.log(headersList);
        // return;

        // Get webhook headers
        const webhookEvent = headersList.get('X-Webhook-Event');
        const webhookSignature = headersList.get('X-Webhook-Signature');

        console.log('Received webhook:', {
            event: webhookEvent,
            hasSignature: !!webhookSignature,
            bodyLength: body.length
        });

        // Verify webhook signature
        const webhookSecret = process.env.WEBHOOK_SECRET || 'your-webhook-secret';
        if (webhookSignature) {
            const isValid = verifyWebhookSignature(body, webhookSignature, webhookSecret);
            if (!isValid) {
                console.error('Invalid webhook signature');
                return NextResponse.json(
                    { error: 'Invalid signature' },
                    { status: 401 }
                );
            }
        } else {
            console.warn('No webhook signature provided');
        }

        // Parse webhook payload
        let payload: WebhookPayload;
        try {
            payload = JSON.parse(body);
            console.log(payload)
        } catch (error) {
            console.error('Invalid JSON payload:', error);
            return NextResponse.json(
                { error: 'Invalid JSON' },
                { status: 400 }
            );
        }

        // Handle different webhook events
        switch (payload.event) {
            case 'ping':
                console.log('Received ping webhook');
                return NextResponse.json({
                    success: true,
                    message: 'Webhook endpoint is working',
                    timestamp: new Date().toISOString()
                });

            case 'transaction.created':
                if (!payload.data.transaction) {
                    return NextResponse.json(
                        { error: 'Missing transaction data' },
                        { status: 400 }
                    );
                }

                console.log(payload.data.transaction);

                // const result = await processTransactionCreated(payload.data.transaction);

                return NextResponse.json({
                    success: true,
                    message: 'Transaction processed successfully',
                    // data: result,
                    timestamp: new Date().toISOString()
                });

            case 'transaction.updated':
                // Handle transaction updates if needed
                console.log('Transaction update webhook received (not implemented)');
                return NextResponse.json({
                    success: true,
                    message: 'Transaction update acknowledged',
                    timestamp: new Date().toISOString()
                });

            default:
                console.warn(`Unknown webhook event: ${payload.event}`);
                return NextResponse.json(
                    { error: `Unknown event: ${payload.event}` },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('Webhook processing error:', error);

        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}

/**
 * GET handler for webhook endpoint testing
 */
export async function GET(request: NextRequest) {
    return NextResponse.json({
        message: 'Bank webhook endpoint is active',
        timestamp: new Date().toISOString(),
        endpoints: {
            'POST /api/bank/webhook': 'Receive transaction webhooks from bank server'
        }
    });
}
