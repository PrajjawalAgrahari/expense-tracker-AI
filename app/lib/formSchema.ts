import {z, ZodType} from "zod"
import { AccountData } from "@/app/lib/type"
import { TransactionData } from "@/app/lib/type";

export const accountSchema: ZodType<AccountData> = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["CURRENT", "SAVINGS"]),
    balance: z.string().min(1, "Initial balance is required"),
    isDefault: z.boolean()
});

export const transactionSchema: ZodType<TransactionData> = z.object({
    type: z.enum(["EXPENSE", "INCOME"]),
    amount: z.string().min(1, "Amount is required"),
    account: z.string(),
    category: z.string().min(1, "Category is required"),
    description: z.string().optional(),
    date: z.date(),
    isRecurring: z.boolean(),
    recurringInterval: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
});