import {z, ZodType} from "zod"
import { AccountData } from "@/app/lib/type"

export const accountSchema: ZodType<AccountData> = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["CURRENT", "SAVINGS"]),
    balance: z.string().min(1, "Initial balance is required"),
    isDefault: z.boolean()
});