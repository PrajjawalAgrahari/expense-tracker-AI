import { inngest } from "./client";
import { prisma } from "@/app/lib/prisma";
import { sendEmail } from "@/app/lib/send-email";

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

// 'You can only send testing emails to your own email address (agrahariprajjawal5@gmail.com). To send emails to other recipients, please verify a domain at resend.com/domains, and change the `from` address to an email using this domain.',