'use server'

import { prisma } from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import arcjet, { fixedWindow, request } from "@arcjet/next";

const aj = arcjet({
    key: process.env.ARCJET_KEY!,
    rules: [
        fixedWindow({
            mode: "LIVE",
            window: "1h",
            max: 60,
        }),
    ],
});

function serializeTransaction(obj: any) {
    const serialized = { ...obj }
    if (serialized.balance) {
        serialized.balance = obj.balance.toNumber();
    }
    if (serialized.amount) {
        serialized.amount = obj.amount.toNumber();
    }
    return serialized;
}

export async function getUserAccounts() {
    try {
        const { userId } = await auth();
        if (!userId) {
            throw new Error('Unauthorized')
        }
        const user = await prisma.user.findUnique({
            where: {
                clerkUserId: userId,
            },
        });
        if (!user) {
            throw new Error('User not found')
        }
        const accounts = await prisma.account.findMany({
            where: {
                userId: user.id,
            }
        })
        return accounts.map((account) => serializeTransaction(account));
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error?.message)
        }
    }
}

export async function createTransaction(data: any) {
    try {
        const { userId } = await auth();
        if (!userId) {
            throw new Error('Unauthorized')
        }
        const user = await prisma.user.findUnique({
            where: {
                clerkUserId: userId,
            },
        });
        if (!user) {
            throw new Error('User not found')
        }
        const req = await request();
        const decision = await aj.protect(req);
        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                throw new Error("Rate limit exceeded. Please try again later.")
            }
            throw new Error("Request denied. Please try again later.")
        }

        let nextRecurringDate = null;
        if (data.isRecurring) {
            nextRecurringDate = computeNextRecurringDate(data.recurringInterval, new Date(data.date));
        }

        await prisma.$transaction([
            prisma.transaction.create({
                data: {
                    type: data.type,
                    amount: parseFloat(data.amount),
                    description: data.description,
                    date: new Date(data.date),
                    category: data.category,
                    accountId: data.account,
                    userId: user.id,
                    isRecurring: data.isRecurring,
                    recurringInterval: data.recurringInterval,
                    nextRecurringDate: nextRecurringDate,
                },
            }),
            prisma.account.update({
                where: {
                    id: data.account,
                },
                data: {
                    balance: {
                        increment: data.type === "INCOME" ? parseFloat(data.amount) : -parseFloat(data.amount),
                    },
                },
            }),
        ])
        revalidatePath(`account/${data.account}`)
        revalidatePath('/dashboard')
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error?.message)
        }
    }
}

export async function getTransactionById(id: string) {
    try {
        const { userId } = await auth();
        if (!userId) {
            throw new Error('Unauthorized')
        }
        const user = await prisma.user.findUnique({
            where: {
                clerkUserId: userId,
            },
        });
        if (!user) {
            throw new Error('User not found')
        }
        const transaction = await prisma.transaction.findUnique({
            where: {
                id,
            },
        })
        return serializeTransaction(transaction);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error?.message)
        }
    }
}

export async function updateTransaction(data: any) {
    try {
        const { userId } = await auth();
        if (!userId) {
            throw new Error('Unauthorized')
        }
        const user = await prisma.user.findUnique({
            where: {
                clerkUserId: userId,
            },
        });
        if (!user) {
            throw new Error('User not found')
        }
        // const req = await request();
        // const decision = await aj.protect(req);
        // if (decision.isDenied()) {
        //     if (decision.reason.isRateLimit()) {
        //         throw new Error("Rate limit exceeded. Please try again later.")
        //     }
        //     throw new Error("Request denied. Please try again later.")
        // }

        const prevData = await prisma.transaction.findUnique({
            where: {
                id: data.id,
            },
        });

        if (!prevData) {
            return
        }

        let nextRecurringDate = null;
        if (data.isRecurring) {
            nextRecurringDate = computeNextRecurringDate(data.recurringInterval, prevData.lastProcessed || new Date(data.date));
        }

        let change = (prevData.type === 'EXPENSE') ? parseFloat(prevData.amount.toString()) : -parseFloat(prevData.amount.toString());
        change += (data.type === 'EXPENSE') ? -parseFloat(data.amount) : parseFloat(data.amount);

        await prisma.$transaction([
            prisma.transaction.update({
                where: {
                    id: data.id,
                },
                data: {
                    type: data.type,
                    amount: parseFloat(data.amount),
                    description: data.description,
                    date: new Date(data.date),
                    category: data.category,
                    accountId: data.account,
                    isRecurring: data.isRecurring,
                    recurringInterval: data.recurringInterval,
                    nextRecurringDate: nextRecurringDate,
                },
            }),
            prisma.account.update({
                where: {
                    id: data.account,
                },
                data: {
                    balance: {
                        increment: change,
                    },
                },
            })
        ]
        )
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error?.message)
        }
    }
}

function computeNextRecurringDate(recurringInterval: string, date: Date) {
    const nextDate = new Date(date);
    switch (recurringInterval) {
        case "DAILY":
            nextDate.setDate(nextDate.getDate() + 1);
            break;
        case "WEEKLY":
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case "MONTHLY":
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        case "YEARLY":
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
        default:
            throw new Error("Invalid recurring interval");
    }
    return nextDate;
}