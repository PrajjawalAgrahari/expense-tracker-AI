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