"use client";

import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash, X } from "lucide-react";
import { deleteTransactions } from "@/app/lib/account";
import { postSubmission } from "@/app/lib/data-submission";
import { BarLoader } from "react-spinners";
import { DataTablePagination } from "./pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      rowSelection,
      columnFilters,
    },
  });

  const {
    data: newData,
    loading: isLoading,
    error,
    fn: deleteBulkTransactions,
  } = postSubmission(deleteTransactions);

  const isFilterApplied =
    (table.getColumn("description")?.getFilterValue() as string) ||
    (table.getColumn("type")?.getFilterValue() as string) ||
    (table.getColumn("recurring")?.getFilterValue() as string);

  function clearFilters() {
    table.resetColumnFilters();
  }

  async function deleteSelectedRows() {
    if (
      !window.confirm(
        `Are you sure you want to delete ${
          table.getFilteredSelectedRowModel().rows.length
        } transactions?`
      )
    ) {
      return;
    }

    const selectedRows = table.getFilteredSelectedRowModel().rows;

    const transactionIds = selectedRows.map((row) => {
      return (row.original as any).transactionId;
    });

    await deleteBulkTransactions(transactionIds);
    table.resetRowSelection();
  }

  return (
    <>
      {isLoading && (
        <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
      )}
      <div className="flex items-center py-4">
        <Input
          placeholder="Search transactions..."
          value={
            (table.getColumn("description")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("description")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Select
          value={
            (table.getColumn("type")?.getFilterValue() as string) ?? "All Types"
          }
          onValueChange={(value) => {
            table
              .getColumn("type")
              ?.setFilterValue(value === "All Types" ? "" : value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Types">All Types</SelectItem>
            <SelectItem value="Income">Income</SelectItem>
            <SelectItem value="Expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={
            (table.getColumn("recurring")?.getFilterValue() as string) ??
            "All Transactions"
          }
          onValueChange={(value) => {
            table
              .getColumn("recurring")
              ?.setFilterValue(value === "All Transactions" ? "" : value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Transactions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Transactions">All Transactions</SelectItem>
            <SelectItem value="Yes">Recurring Only</SelectItem>
            <SelectItem value="No">Non-recurring Only</SelectItem>
          </SelectContent>
        </Select>
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <Button
            variant="destructive"
            className="ml-4 cursor-pointer text-sm"
            onClick={deleteSelectedRows}
          >
            <Trash />
            Delete Selected ({table.getFilteredSelectedRowModel().rows.length})
          </Button>
        )}
        {isFilterApplied && (
          <Button variant={"outline"} size={"icon"} onClick={clearFilters}>
            <X className="h-4 w-5" />
          </Button>
        )}
      </div>
      <div className="rounded-md border-gray-300 border">
        {/* <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div> */}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-12 text-center text-muted-foreground"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </>
  );
}
