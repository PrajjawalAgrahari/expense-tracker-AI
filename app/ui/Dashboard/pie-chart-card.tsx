"use client";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
import React from "react";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { categoryColors } from "@/app/lib/data/categories";

const SimplePieChart = (props: {
  data: {
    category: string;
    amount: number;
  }[];
}) => {
  const data = props.data;

  return (
    <ResponsiveContainer width="100%" height={500}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={180}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                categoryColors[entry.category as keyof typeof categoryColors]
              }
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend/>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default SimplePieChart;
