'use server'

import { prisma } from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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

export async function getAccountById(id: string) {
    try {
        const account = await prisma.account.findUnique({
            where: {
                id,
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
                },
                transactions: {
                    orderBy: {
                        date: "desc",
                    },
                }
            }
        })
        if (!account) {
            return null;
        }
        return {
            ...serializeTransaction(account),
            transactions: account?.transactions.map((transaction: any) => serializeTransaction(transaction))
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error?.message)
        }
    }
}

export async function deleteTransactions(ids: string[]) {
    try {
        const { userId } = await auth()
        if (!userId) {
            throw new Error("User not authenticated")
        }

        const transactions = await prisma.transaction.findMany({
            where: {
                id: {
                    in: ids,
                }
            },
        })

        const accountId = transactions[0]?.accountId

        let change = 0;
        transactions.forEach((transaction) => {
            change += transaction.type === "INCOME" ? transaction.amount.toNumber() : -transaction.amount.toNumber()
        })

        await prisma.$transaction([
            prisma.account.update({
                where: {
                    id: accountId,
                },
                data: {
                    balance: {
                        decrement: change,
                    },
                },
            }),
            prisma.transaction.deleteMany({
                where: {
                    id: {
                        in: ids,
                    },
                },
            })
        ])
        revalidatePath("/account/[id]", 'page')
        revalidatePath("/dashboard")
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error?.message)
        }
    }
}

export async function deleteOneRow(id: string) {
    await deleteTransactions([id])
}

export async function getDataForChart(id: string) {
    const data = await prisma.transaction.groupBy({
        where: {
            accountId: id,
        },
        by: ['date', 'type'],
        _sum: {
            amount: true,
        },
        orderBy: {
            date: "desc",
        },
    })
    const formattedData = data.map((item: any) => ({
        // I want date in the format Dec 20
        date: item.date,
        type: item.type,
        amount: item._sum.amount?.toNumber(),
    }));

    const groupedData = formattedData.reduce((acc: any, item: any) => {
        const date = item.date;
        if (!acc[date]) {
            acc[date] = { date, INCOME: 0, EXPENSE: 0 };
        }
        acc[date][item.type] += item.amount;
        return acc;
    }, {});

    const groupedDataArray = Object.values(groupedData).map((item: any) => ({
        date: item.date,
        INCOME: item.INCOME,
        EXPENSE: item.EXPENSE,
    }));

    return groupedDataArray;
}

export async function getDefaultAccountId() {
    try {
        const { userId } = await auth();
        if (!userId) {
            throw new Error("User not authenticated");
        }
        const user = await prisma.user.findUnique({
            where: {
                clerkUserId: userId,
            },
        });
        if (!user) {
            throw new Error("User not found");
        }

        const account = await prisma.account.findFirst({
            where: {
                userId: user.id,
                isDefault: true,
            },
        });

        if (!account) {
            return null;
        }

        return account.id;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error?.message);
        }
    }
}