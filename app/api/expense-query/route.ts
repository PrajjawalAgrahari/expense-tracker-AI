import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { parseExpenseEntities } from '@/lib/parseExpenseEntities';
import type { Prisma, Transaction } from '@/generated/prisma';
import { getUserId } from '@/app/lib/checkUser';

const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

const formatTransactionList = (transactions: Transaction[], total: number, page: number = 1, pageSize: number = 10): string => {
    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const pageTransactions = transactions.slice(startIdx, endIdx);
    const totalPages = Math.ceil(transactions.length / pageSize);

    let response = [
        `📊 Summary for ${transactions.length} transactions:`,
        `💰 Total Amount: ${formatCurrency(total)}`,
        `\n🧾 Transaction Details (Page ${page}/${totalPages}):\n`
    ];

    pageTransactions.forEach((t: Transaction) => {
        const line = [
            `📅 ${formatDate(t.date)}`,
            `${formatCurrency(Number(t.amount))}`,
            t.description ? `for ${t.description}` : '',
            `[${t.category}]`
        ].filter(Boolean).join(' ');

        response.push(line);
    });

    if (transactions.length > endIdx) {
        const remaining = transactions.length - endIdx;
        response.push(`\n... and ${remaining} more transactions. Use 'show more' to see the next page.`);
    }

    return response.join('\n');
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, userId, page = 1, pageSize = 10 } = body;

        const id = await getUserId(userId);

        // Use Gemini to parse entities from the message
        const entities = await parseExpenseEntities(message);

        // Build database query based on extracted entities
        const where: Prisma.TransactionWhereInput = {
            userId: id ? id : userId,
            type: "EXPENSE",
            ...(entities.timeRange && {
                date: {
                    gte: entities.timeRange.start,
                    lte: entities.timeRange.end
                }
            }),
            ...(entities.category && {
                category: entities.category
            }),
            ...(entities.amount && {
                amount: {
                    ...(entities.amount.min && { gte: entities.amount.min }),
                    ...(entities.amount.max && { lte: entities.amount.max })
                }
            }),
            ...(entities.merchant && {
                description: {
                    contains: entities.merchant,
                    mode: 'insensitive'
                }
            }),
            ...(entities.isRecurring !== undefined && {
                isRecurring: entities.isRecurring
            })
        };

        // Query transactions using prisma client
        const transactions = await prisma.transaction.findMany({
            where,
            orderBy: { date: 'desc' },
            include: { account: true }
        });

        // Format response
        if (transactions.length > 0) {
            const total = transactions.reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
            const response = formatTransactionList(transactions, total, page, pageSize);
            return NextResponse.json({
                response,
                metadata: {
                    total: transactions.length,
                    currentPage: page,
                    totalPages: Math.ceil(transactions.length / pageSize),
                    hasMore: transactions.length > page * pageSize
                }
            });
        } else {
            return NextResponse.json({
                response: "No transactions found matching your criteria.",
                metadata: {
                    total: 0,
                    currentPage: 1,
                    totalPages: 0,
                    hasMore: false
                }
            });
        }

    } catch (error) {
        console.error('[EXPENSE_QUERY_ERROR]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
} 