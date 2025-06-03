"use client";

import { getFiveTransactions } from "@/app/lib/dashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect } from "react";

export default function RecentTransactionsCard(props: any) {
  const { accounts } = props;
  let defaultId: string = "";
  let defaultAccount: string = "";
  for (const account of accounts) {
    if (account.isDefault) {
      defaultAccount = account.name;
      defaultId = account.id;
      break;
    }
  }

  const [transactions, setTransactions] = React.useState<any[] | undefined>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await getFiveTransactions(defaultId);
        setTransactions(response);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [defaultId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Recent Transactions</h3>
        <Select
          defaultValue={defaultId}
          onValueChange={async (value) => {
            const newData = await getFiveTransactions(value);
            setTransactions(newData);
          }}
        >
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <SelectValue placeholder={defaultAccount} />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account: any) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {transactions?.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-gray-500">
            No transactions found
          </div>
        ) : (
          transactions?.map((transaction: any) => (
            <div
              key={transaction.id}
              className="flex items-start justify-between py-2"
            >
              <div className="space-y-1">
                <p className="font-medium text-sm">{transaction.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span
                className={`font-medium text-sm ${
                  transaction.type === "EXPENSE"
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {transaction.type === "EXPENSE" ? "-" : "+"}₹
                {transaction.amount}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
