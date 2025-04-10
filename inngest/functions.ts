import { inngest } from "./client";
import { prisma } from "@/app/lib/prisma";

export const sendBudgetAlerts = inngest.createFunction(
    { id: "Check Budget Alerts" },
    { cron: "0 */6 * * *" },
    async ({ step }) => {
        const budgets = await step.run("get-budgets", async () => {
            return await prisma.budget.findMany();
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
                console.log(percentageUsed)
                if ((percentageUsed >= 80) && (!budget.lastAlertSent || isNewMonth(new Date(budget.lastAlertSent)))) {
                    // send mail
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
