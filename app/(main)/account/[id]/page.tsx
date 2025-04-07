import { getAccountById } from "@/app/lib/account";
import { notFound } from "next/navigation";
import React from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Transaction } from "@/generated/prisma";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const account = await getAccountById(id);
  const transactions = account.transactions.map((transaction: Transaction) => ({
    date: transaction.date,
    description: transaction?.description,
    category: transaction.category,
    amount:
      transaction.type === "INCOME" ? transaction.amount : -transaction.amount,
    recurring: transaction.isRecurring ? "Yes" : "No",
    recurringInterval: transaction.recurringInterval,
    nextRecurringDate: transaction.nextRecurringDate,
    type: transaction.type,
    transactionId: transaction.id,
  }));

  if (!account) {
    notFound();
  }

  return (
    <main className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-purple-900 text-3xl font-bold">{account.name}</h1>
          <span className="text-gray-500 text-sm">
            {account.type[0] + account.type.slice(1).toLowerCase()} Account
          </span>
        </div>
        <div className="flex flex-col">
          <span>{account.balance}</span>
          <span>{account._count.transactions} Transactions</span>
        </div>
      </div>

      <DataTable columns={columns} data={transactions} />
    </main>
  );
}
