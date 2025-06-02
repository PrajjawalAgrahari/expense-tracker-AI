"use client";

import { getFiveTransactions } from "@/app/lib/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  }, []);

  return (
    <Card className="w-[40%]">
      <CardHeader className="flex items-center justify-between space-y-1 pb-2">
        <CardTitle>Recent Transactions</CardTitle>
        <Select
          defaultValue={defaultId}
          onValueChange={async (value) => {
            const newData = await getFiveTransactions(value);
            setTransactions(newData);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={defaultAccount} />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account: any) => {
              return (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-10">
        {transactions?.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No transactions found
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {transactions?.map((transaction: any) => {
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      {transaction.description}
                    </span>
                    <span className="text-sm">
                      {transaction.date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">
                    ₹{transaction.amount}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
