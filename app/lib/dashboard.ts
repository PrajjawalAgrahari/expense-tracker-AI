'use server'

import { prisma } from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { Budget } from "@/generated/prisma";

// In Next.js, floating-point numbers (floats) are not directly supported in certain cases, particularly when passing props from the server (e.g., getServerSideProps or getStaticProps) to the client. This happens because Next.js serializes props as JSON, and JSON does not support NaN or Infinity values, which are possible with floats in JavaScript.
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

export async function createAccount(data: any) {
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
        const balanceInFloat = parseFloat(data.balance)
        if (isNaN(balanceInFloat)) {
            throw new Error('Invalid balance amount')
        }

        const numberOfAccounts = await prisma.account.findMany({
            where: {
                userId: user.id,
            },
        }).then((accounts) => accounts.length)

        if (numberOfAccounts > 0 && data.isDefault) {
            throw new Error('You can only have one default account')
        }

        const shouldBeDefault = (numberOfAccounts === 0 || data.isDefault)

        if (shouldBeDefault) {
            await prisma.account.updateMany({
                where: {
                    isDefault: true,
                    userId: user.id,
                },
                data: {
                    isDefault: false,
                },
            })
        }

        const account = await prisma.account.create({
            data: {
                ...data,
                balance: balanceInFloat,
                userId: user.id,
                isDefault: shouldBeDefault,
            },
        });
        const serializedAccount = serializeTransaction(account)
        revalidatePath('/dashboard')
        return;

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error creating account:", error?.message);
            throw error
        }
    }
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
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: {
                    select: {
                        name: true
                    }
                },
                _count: {
                    select: {
                        transactions: true,
                    }
                }
            }
        })
        return accounts.map((account) => serializeTransaction(account))
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching accounts:", error?.message);
            throw error
        }
    }
}

export async function changeDefaultAccount(id: string) {
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
        await prisma.account.updateMany({
            where: {
                userId: user.id,
                isDefault: true,
            },
            data: {
                isDefault: false,
            },
        })
        await prisma.account.update({
            where: {
                id,
            },
            data: {
                isDefault: true,
            },
        })
        revalidatePath('/dashboard')
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error changing default account:", error?.message);
            throw error
        }
    }
}

export async function getBudget(): Promise<Budget | null | undefined> {
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
        const budget = await prisma.budget.findFirst({
            where: {
                userId: user.id,
            },
        })
        if (!budget) {
            return null;
        }
        return serializeTransaction(budget)
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching budget:", error?.message);
            throw error
        }
    }
}

export async function setBudget(data: any) {
    try {
        const amount = data.get("amount");
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
        await prisma.budget.upsert({
            where: {
                userId: user.id,
            },
            update: {
                amount: amount,
            },
            create: {
                userId: user.id,
                amount: amount,
            }
        })
        revalidatePath('/dashboard');
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error setting budget:", error?.message);
            throw error
        }
    }
}

export async function getExpenseOfThisMonth() {
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
        const transactions = await prisma.transaction.aggregate({
            where: {
                userId: user.id,
                createdAt: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
                },
                type: "EXPENSE",
            },
            _sum: {
                amount: true,
            }
        })
        return transactions._sum.amount?.toNumber() ?? 0;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching expense:", error?.message);
            throw error
        }
    }
}

export async function getFiveTransactions(accountId: string) {
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
        const transactions = await prisma.transaction.findMany({
            where: {
                accountId,
                userId: user.id,
            },
            orderBy: {
                updatedAt: "desc",
            },
            take: 5,
        })
        return transactions.map((transaction) => serializeTransaction(transaction))
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching transactions:", error?.message);
            throw error
        }
    }
}

export async function getExpenseOfThisMonthCategory() {
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
        const transactions = await prisma.transaction.groupBy({
            by: ['category'],
            where: {
                userId: user.id,
                createdAt: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
                },
                type: "EXPENSE",
            },
            _sum: {
                amount: true,
            },
        })
        const data = transactions.map((transaction) => {
            return {
                category: transaction.category,
                amount: transaction._sum.amount?.toNumber() ?? 0,
            }
        })
        return data
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching expense:", error?.message);
            throw error
        }
        return []
    }
}