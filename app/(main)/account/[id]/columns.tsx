"use client";
import { Decimal } from "@/generated/prisma/runtime/library";
import { ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { categoryColors } from "@/app/lib/data/categories";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Clock, RefreshCcw } from "lucide-react";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type TransactionColumns = {
  date: Date;
  description: String;
  category: String;
  amount: Decimal;
  recurring: String;
  recurringInterval: String;
  nextRecurringDate: Date;
  type: String;
};

export const columns: ColumnDef<TransactionColumns>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="border-1 border-slate-700 hover:border-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-slate-500 focus-visible:ring-offset-slate-100"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="border-1 border-slate-700 hover:border-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-slate-500 focus-visible:ring-offset-slate-100"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      let category: String = row.getValue("category");
      let Category =
        category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
      return (
        <div className="flex items-center space-x-2">
          <Badge
            style={{
              backgroundColor:
                categoryColors[category as keyof typeof categoryColors],
            }}
          >
            {Category}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const amount: Decimal = row.getValue("amount");
      const intAmount = parseInt(amount.toString(), 10);

      return (
        <div
          className={clsx(`text-right`, {
            "text-red-500": intAmount < 0,
            "text-green-500": intAmount > 0,
          })}
        >
          {amount.toString()}
        </div>
      );
    },
  },
  {
    accessorKey: "recurring",
    header: "Recurring",
    cell: ({ row }) => {
      const recurring: string = row.getValue("recurring");
      const data = row.original;
      const recurringInterval: String = data.recurringInterval;
      const nextRecurringDate: Date = data.nextRecurringDate;

      return recurring === "Yes" ? (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant={"outline"}
                className="flex items-center space-x-2 bg-purple-100 text-purple-700 hover:bg-purple-200"
              >
                <RefreshCcw />
                {recurringInterval
                  ? recurringInterval[0] +
                    recurringInterval.slice(1).toLowerCase()
                  : "Recurring"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <div>Next Date:</div>
                <div className="font-medium">
                  {nextRecurringDate
                    ? nextRecurringDate.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      })
                    : ""}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Badge variant={"outline"} className="flex items-center space-x-2">
          <Clock />
          One-time
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => {
      return <div className="hidden"></div>;
    },
    cell: ({ row }) => {
      const type: String = row.getValue("type");
      return (
        <div className="hidden">
          {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
        </div>
      );
    },
  },
];
