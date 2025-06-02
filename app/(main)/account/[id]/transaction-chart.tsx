"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { SelectTrigger } from "@radix-ui/react-select";

export default function TransactionChart(props: { id: string; data: any[] }) {
  const id = props.id;
  const data = props.data;

  const [timeLine, setTimeLine] = useState("3M");

  const timeLineMappings = {
    "7D": { label: "Last 7 Days", days: 7 },
    "1M": { label: "Last Month", days: 30 },
    "3M": { label: "Last 3 Months", days: 90 },
    "6M": { label: "Last 6 Months", days: 180 },
  };

  const filteredData = useMemo(() => {
    const days =
      timeLineMappings[timeLine as keyof typeof timeLineMappings].days;
    const currentDate = new Date();
    const pastDate = new Date(currentDate);
    pastDate.setDate(currentDate.getDate() - days);

    let newData = data.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= pastDate && itemDate <= currentDate;
    });
    let income = 0,
      expense = 0;
    newData = newData.map((item) => {
      income += item.INCOME;
      expense += item.EXPENSE;
      return {
        ...item,
        date: item.date.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
        }),
      };
    });
    return {
      income,
      expense,
      newData,
    };
  }, [timeLine, []]);
  return (
    <>
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Transaction Overview</CardTitle>
          <Select
            defaultValue="1M"
            onValueChange={(value) => setTimeLine(value)}
          >
            <SelectTrigger className="w-[180px] py-[2px] border-1 border-gray-400 rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-1 py-[2px] border-gray-400 rounded-md">
              {Object.entries(timeLineMappings).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="flex flex-col gap-7 mt-3">
          <div className="flex justify-around">
            <div className="flex flex-col items-center">
              <span className="text-gray-600 text-sm">Total Income</span>
              <span className="text-green-600 text-lg font-bold">
                ₹{filteredData.income.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gray-600 text-sm">Total Expenses</span>
              <span className="text-red-600 text-lg font-bold">
                ₹{filteredData.expense.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gray-600 text-sm">Net</span>
              <span className="text-green-600 text-lg font-bold">
                ₹{(filteredData.income - filteredData.expense).toFixed(2)}
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={filteredData.newData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis className="text-[9px]" dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="INCOME" fill="#00FF00" />
              <Bar dataKey="EXPENSE" fill="#FF0000" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}
