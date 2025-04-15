import { Resend } from "resend";
import Email from "@/emails/monthly-report";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(name: string | null, budget: any) {
    try {
        const result = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: "agrahariprajjawal5@gmail.com",
            subject: "Monthly Budget Alert",
            react: Email({
                name: name,
                budgetAmount: budget.budgetAmount,
                spentSoFar: budget.spentSoFar,
                remaining: budget.remaining,
                percentageUsed: budget.percentageUsed,
            }),
        });
        console.log("Email sent successfully:", result);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

export async function sendEmailMonthlyReport(name: string | null, data: any) {
    try {
        const result = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: "agrahariprajjawal5@gmail.com",
            subject: "Monthly Budget Alert",
            react: Email({
                name: name,
                stats: data.stats,
                month: data.month,
                insights: data.insights,
            }),
        });
        console.log("Email sent successfully:", result);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}