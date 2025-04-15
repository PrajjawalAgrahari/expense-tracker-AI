import { generateMonthlyInsights } from "@/app/lib/generate-monthly-insights";
import { inngest } from "./client";
import { prisma } from "@/app/lib/prisma";
import { sendEmail, sendEmailMonthlyReport } from "@/app/lib/send-email";

export const triggerRecurringTransaction = inngest.createFunction(
    { id: "Trigger-Recurring-Transaction" },
    { cron: "0 0 * * *" },
    async ({ step }) => {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        startOfToday.setMinutes(startOfToday.getMinutes() + 330);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        endOfToday.setMinutes(endOfToday.getMinutes() + 330);

        const recurringTransactions = await step.run("get-recurring-transactions", async () => {
            return await prisma.transaction.findMany({
                where: {
                    isRecurring: true,
                    nextRecurringDate: {
                        gte: startOfToday,
                        lte: endOfToday,
                    },
                    recurringInterval: {
                        not: null,
                    }
                },
            });
        })

        const events = recurringTransactions.map((transaction) => {
            return {
                name: "app/user.transaction.created",
                data: {
                    userId: transaction.userId,
                    transaction,
                },
            };
        });
        await inngest.send(events);
    }
)

export const process = inngest.createFunction(
    {
        id: "Handle-Recurring-Transaction",
        name: "Handle Recurring Transaction",
        throttle: {
            limit: 10,
            period: "1m",
            key: "event.data.userId",
        }
    },
    { event: "app/user.transaction.created" },
    async ({ event, step }) => {
        await step.run(`update-transaction-${event.data.transaction.id}`, async () => {
            if (event.data.transaction.recurringInterval && event.data.transaction.nextRecurringDate) {
                await prisma.$transaction([
                    prisma.transaction.update({
                        where: { id: event.data.transaction.id },
                        data: {
                            nextRecurringDate: computeNextRecurringDate(
                                event.data.transaction.recurringInterval,
                                new Date(event.data.transaction.nextRecurringDate)
                            ),
                        },
                    }),
                    prisma.account.update({
                        where: { id: event.data.transaction.accountId },
                        data: {
                            balance: {
                                decrement: event.data.transaction.type === "EXPENSE" ? parseFloat(event.data.transaction.amount) : -parseFloat(event.data.transaction.amount),
                            },
                        },
                    }),
                ]);
            }
        })
    }
)

export const sendBudgetAlerts = inngest.createFunction(
    { id: "Check Budget Alerts" },
    { cron: "0 */6 * * *" },
    async ({ step }) => {
        const budgets = await step.run("get-budgets", async () => {
            return await prisma.budget.findMany({
                include: {
                    user: {
                        select: {
                            email: true,
                            name: true,
                        },
                    },
                },
            });
        })
        for (const budget of budgets) {
            await step.run(`check-budget-${budget.id}`, async () => {
                const expense = await prisma.transaction.aggregate({
                    where: {
                        userId: budget.userId,
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

                const totalExpenses = expense._sum.amount?.toNumber() || 0;
                const totalBudget = parseFloat(budget.amount) || 0;
                const percentageUsed = (totalExpenses / totalBudget) * 100;
                if ((percentageUsed >= 80) && (!budget.lastAlertSent || isNewMonth(new Date(budget.lastAlertSent)))) {
                    await sendEmail(budget.user.name, {
                        budgetAmount: totalBudget,
                        spentSoFar: totalExpenses,
                        remaining: totalBudget - totalExpenses,
                        percentageUsed: percentageUsed.toFixed(2),
                    })

                    await prisma.budget.update({
                        where: {
                            id: budget.id,
                        },
                        data: {
                            lastAlertSent: new Date(),
                        }
                    })
                }
            })
        }
    })

const isNewMonth = (lastAlertSent: Date) => {
    const currentDate = new Date();
    return lastAlertSent.getMonth() !== currentDate.getMonth() || lastAlertSent.getFullYear() !== currentDate.getFullYear();
}

export const sendMonthlyReport = inngest.createFunction(
    {
        id: "send-monthly-report",
        name: "Send Monthly Report",
    },
    {
        cron: "0 0 1 * *",
    },
    async ({ step }) => {
        const users = await step.run("get-users", async () => {
            return await prisma.user.findMany();
        });

        for (const user of users) {
            await step.run(`send-monthly-report-${user.id}`, async () => {
                const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
                const stats = await getMonthlyStats(user.id, lastMonth);
                const month = lastMonth.toLocaleString("default", { month: "long" });
                const insights = await generateMonthlyInsights(month, stats);
                await sendEmailMonthlyReport(user.name, {
                    stats,
                    month,
                    insights,
                })
            })
        }
    }
)

async function getMonthlyStats(userId: string, date: Date) {
    const transactions = await prisma.transaction.findMany({
        where: {
            userId: userId,
            date: {
                gte: new Date(date.getFullYear(), date.getMonth(), 1),
                lte: new Date(date.getFullYear(), date.getMonth() + 1, 0),
            },
        },
    })

    return transactions.reduce((acc: any, transaction: any) => {
        const category = transaction.category;
        acc.totalTransactions += 1;
        if (transaction.type === "INCOME") {
            acc.totalIncome += parseFloat(transaction.amount);
        } else {
            acc.categories[category] = (acc.categories[category] || 0) + parseFloat(transaction.amount);
            acc.totalExpense += parseFloat(transaction.amount);
        }
        return acc;
    }, {
        totalIncome: 0,
        totalExpense: 0,
        totalTransactions: 0,
        categories: {},
    })
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

// 'You can only send testing emails to your own email address (agrahariprajjawal5@gmail.com). To send emails to other recipients, please verify a domain at resend.com/domains, and change the `from` address to an email using this domain.',