


import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

const BANK_API_BASE_URL = "http://localhost:3001/api";

export default async function insertaccountandtransactions(accessToken?: string) {
    try {
        const { userId } = await auth();
        if (!userId) {
            throw new Error("User not authenticated");
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: {
                clerkUserId: userId,
            },
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Use provided access token or get from database
        const token = accessToken || user.accessToken;
        if (!token) {
            throw new Error("No access token available");
        }

        console.log("Fetching bank accounts and transactions for user:", user.id);        // Fetch bank accounts
        const accountsResponse = await fetch(`${BANK_API_BASE_URL}/accounts`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!accountsResponse.ok) {
            throw new Error(`Failed to fetch bank accounts: ${accountsResponse.status}`);
        }

        const accountsData = await accountsResponse.json();

        console.log("Bank accounts data:", accountsData);        // Fetch bank transactions
        const transactionsResponse = await fetch(`${BANK_API_BASE_URL}/transactions`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!transactionsResponse.ok) {
            throw new Error(`Failed to fetch bank transactions: ${transactionsResponse.status}`);
        }

        const transactionsData = await transactionsResponse.json();
        console.log("Bank transactions data:", transactionsData);

        // Process and store accounts
        if (accountsData.success && accountsData.data.accounts) {
            for (const bankAccount of accountsData.data.accounts) {
                // Check if account already exists
                const existingAccount = await prisma.account.findFirst({
                    where: {
                        userId: user.id,
                        name: bankAccount.name,
                    },
                });

                if (!existingAccount) {
                    // Create new account
                    await prisma.account.create({
                        data: {
                            name: bankAccount.name,
                            type: bankAccount.accountType === 'SAVINGS' ? 'SAVINGS' : 'CURRENT',
                            balance: parseFloat(bankAccount.balance.toString()),
                            userId: user.id,
                            accountLinked: true,
                            isDefault: true, // You can set logic for default account
                        },
                    });
                    console.log(`Created bank account: ${bankAccount.name}`);
                } else {
                    // Update existing account
                    await prisma.account.update({
                        where: {
                            id: existingAccount.id,
                        },
                        data: {
                            balance: parseFloat(bankAccount.balance.toString()),
                            accountLinked: true,
                        },
                    });
                    console.log(`Updated bank account: ${bankAccount.name}`);
                }
            }
        }

        // Process and store transactions
        if (transactionsData.success && transactionsData.data.transactions) {
            // Get the user's bank account (assuming first linked account for now)
            const bankAccount = await prisma.account.findFirst({
                where: {
                    userId: user.id,
                    accountLinked: true,
                },
            });

            if (!bankAccount) {
                throw new Error("No linked bank account found to associate transactions");
            }

            for (const bankTransaction of transactionsData.data.transactions) {
                // Check if transaction already exists (avoid duplicates)
                const existingTransaction = await prisma.transaction.findFirst({
                    where: {
                        userId: user.id,
                        accountId: bankAccount.id,
                        amount: parseFloat(bankTransaction.amount.toString()),
                        date: new Date(bankTransaction.postedAt),
                        description: bankTransaction.description,
                    },
                });

                if (!existingTransaction) {
                    // Create new transaction
                    await prisma.transaction.create({
                        data: {
                            type: bankTransaction.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
                            amount: parseFloat(Math.abs(bankTransaction.amount).toString()),
                            description: bankTransaction.description || bankTransaction.merchant || 'Bank Transaction',
                            date: new Date(bankTransaction.postedAt),
                            category: bankTransaction.category || 'Bank Transfer',
                            userId: user.id,
                            accountId: bankAccount.id
                        },
                    });
                    console.log(`Created transaction: ${bankTransaction.description || bankTransaction.merchant}`);
                }
            }
        }

        console.log("Successfully integrated bank accounts and transactions");
        return { success: true };

    } catch (error) {
        console.error("Failed to integrate bank data:", error);
        throw new Error("Failed to integrate bank accounts and transactions");
    }
}