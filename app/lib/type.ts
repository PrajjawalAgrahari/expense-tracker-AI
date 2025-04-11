export type AccountData = {
    name: String,
    type: "CURRENT" | "SAVINGS",
    balance: String,
    isDefault: Boolean
}

export type TransactionData = {
    type: "EXPENSE" | "INCOME",
    amount: string,
    account: string,
    category: string,
    description?: string,
    date: Date,
    isRecurring: Boolean,
    recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
}
