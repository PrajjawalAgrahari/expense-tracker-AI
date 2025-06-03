"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TransactionChart from "@/app/ui/Dashboard/transactions/transaction-chart";
import { DataTable } from "@/app/ui/Dashboard/transactions/data-table";
import { columns } from "@/app/ui/Dashboard/transactions/columns";
import { useEffect, useState, useCallback } from "react";
import { getAllTransactions, getDataForAllAccounts } from "@/app/lib/dashboard";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    const transactionsData = await getAllTransactions();
    const formattedTransactions = transactionsData.map((transaction: any) => ({
      date: transaction.date,
      description: transaction?.description,
      category: transaction.category,
      amount:
        transaction.type === "INCOME"
          ? transaction.amount
          : -transaction.amount,
      recurring: transaction.isRecurring ? "Yes" : "No",
      recurringInterval: transaction.recurringInterval,
      nextRecurringDate: transaction.nextRecurringDate,
      type: transaction.type,
      transactionId: transaction.id,
      account: transaction.account.name,
    }));
    setTransactions(formattedTransactions);

    const chartData = await getDataForAllAccounts();
    setChartData(chartData);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  console.log("transactions", transactions[0]);
  //   console.log("chartData", chartData[0]);

  return (
    <div className="space-y-6">
      {/* Transaction Overview Chart */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2 px-6">
          <CardTitle className="text-xl font-semibold text-gray-800">
            Transaction Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          <TransactionChart data={chartData} id="all" />
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2 px-6">
          <CardTitle className="text-xl font-semibold text-gray-800">
            All Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          <DataTable
            columns={columns}
            data={transactions}
            onDataChange={fetchData}
          />
        </CardContent>
      </Card>
    </div>
  );
}
