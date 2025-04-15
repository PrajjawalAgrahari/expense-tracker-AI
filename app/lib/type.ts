export type AccountData = {
    name: String,
    type: "CURRENT" | "SAVINGS",
    balance: String,
    isDefault: Boolean
}

export type TransactionData = {
    id?: string,
    type: "EXPENSE" | "INCOME",
    amount: string,
    account?: string,
    category: string,
    description?: string,
    date: Date,
    isRecurring: boolean,
    recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
}
