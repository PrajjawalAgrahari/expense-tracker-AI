'use server'

import { prisma } from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// In Next.js, floating-point numbers (floats) are not directly supported in certain cases, particularly when passing props from the server (e.g., getServerSideProps or getStaticProps) to the client. This happens because Next.js serializes props as JSON, and JSON does not support NaN or Infinity values, which are possible with floats in JavaScript.
function serializeTransaction(obj: any) {
    const serialized = { ...obj }
    serialized.balance = obj.balance.toNumber();
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