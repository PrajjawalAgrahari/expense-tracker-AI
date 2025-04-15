"use client";

import { createTransaction, updateTransaction } from "@/app/lib/transaction-create";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { defaultCategories } from "@/app/lib/data/categories";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { TransactionData } from "@/app/lib/type";
import { transactionSchema } from "@/app/lib/formSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Account } from "@/generated/prisma";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import CreateAccountDrawer from "@/app/ui/Dashboard/create-account-drawer";
import Tesseract from "tesseract.js";
import { extractTransactionData } from "@/app/lib/extract-transaction";

export default function TransactionCreateForm(props: any) {
  const router = useRouter();
  const accounts = props.accounts;
  const transaction = props.transaction;
  const edit = (transaction !== null);
  let defaultAccountId: string = "";
  for (let i = 0; i < accounts.length; i++) {
    if (accounts[i].isDefault) {
      defaultAccountId = accounts[i].id;
      break;
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch,
    reset,
  } = useForm<TransactionData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: !edit ? {
      type: "EXPENSE",
      amount: "",
      account: defaultAccountId,
      category: "",
      date: new Date(),
      description: "",
      isRecurring: false,
      recurringInterval: "DAILY",
    } : {
      type: transaction.type,
      amount: transaction.amount.toString(),
      account: transaction.accountId,
      category: transaction.category,
      date: new Date(transaction.date),
      description: transaction.description,
      isRecurring: transaction.isRecurring,
      recurringInterval: transaction.recurringInterval,
    },
  });

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");
  const filteredCategories = defaultCategories.filter(
    (category) => category.type === type
  );

  async function onSubmit(data: TransactionData) {
    if(!edit) {
      await createTransaction(data);
    }
    else {
      data.id = transaction.id;
      await updateTransaction(data);
    }
    router.push(`/account/${data.account}`);
  }

  async function extractTextFromImage(file: File): Promise<string> {
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const result = await Tesseract.recognize(dataUrl, "eng");
    return result.data.text;
  }

  const handleUpload = async (e: any) => {
    const file = e.target?.files[0];
    if (!file) return;

    const text = await extractTextFromImage(file);
    const data = await extractTransactionData(text);

    console.log(data);

    if (data) {
      setValue("type", data.type);
      setValue("amount", data.amount);
      setValue("category", data.category);
      setValue("description", data.description ?? "");
      setValue("date", new Date(data.date));
    } else {
      console.error("Failed to extract transaction data from receipt.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800">New Transaction</h2>
      <Button className="cursor-pointer">
        <input type="file" accept="image/*" onChange={handleUpload} />
      </Button>
      <div className="space-y-6">
        {/* Type and Amount Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Transaction Type
            </label>
            <Select
              {...register("type")}
              defaultValue="EXPENSE"
              onValueChange={(value: "EXPENSE" | "INCOME") =>
                setValue("type", value)
              }
              value={watch("type")}
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue placeholder="Expense" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Amount
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                $
              </span>
              <Input
                {...register("amount")}
                id="amount"
                placeholder="0.00"
                className="pl-8"
                type="number"
                step={0.1}
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>
        </div>

        {/* Account and Category Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="account"
              className="block text-sm font-medium text-gray-700"
            >
              Account
            </label>
            <Select
              {...register("account")}
              defaultValue={defaultAccountId}
              onValueChange={(value: string) => setValue("account", value)}
            >
              <SelectTrigger id="account" className="w-full">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts?.map((account: Account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} (${account.balance.toFixed(2)})
                  </SelectItem>
                ))}
                <CreateAccountDrawer>
                  <Button className="cursor-pointer">Create Account</Button>
                </CreateAccountDrawer>
              </SelectContent>
            </Select>
            {errors.account && (
              <p className="text-red-500 text-xs mt-1">
                {errors.account.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <Select
              {...register("category")}
              onValueChange={(value: string) => setValue("category", value)}
              defaultValue={getValues("category")}
              value={watch("category")}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories?.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">
                {errors.category.message}
              </p>
            )}
          </div>
        </div>

        {/* Date and Description Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700"
            >
              Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-white border-gray-300"
                >
                  <span>
                    {date?.toLocaleString("default", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={watch("date")}
                  onSelect={(selectedDate) => {
                    setValue("date", selectedDate as Date);
                  }}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <Input
              {...register("description")}
              id="description"
              placeholder="Enter description"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Recurring Transaction */}
        <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
          <div className="space-y-1">
            <label
              htmlFor="isRecurring"
              className="block text-sm font-medium text-gray-700"
            >
              Recurring Transaction
            </label>
            <p className="text-sm text-gray-500">
              Set up a recurring schedule for this transaction
            </p>
          </div>
          <Switch
            onCheckedChange={(checked: boolean) => {
              setValue("isRecurring", checked);
            }}
            id="isRecurring"
            name="isRecurring"
            checked={isRecurring ? true : false}
          />
        </div>

        {isRecurring && (
          <div>
            <label htmlFor="interval"></label>
            <Select
              defaultValue="DAILY"
              {...register("recurringInterval")}
              onValueChange={(
                value: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
              ) => setValue("recurringInterval", value)}
            >
              <SelectTrigger id="interval" className="w-full">
                <SelectValue placeholder="Daily" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="YEARLY">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <Button variant="outline" className="px-6 cursor-pointer">
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-6 bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            {edit ? "Update Transaction" : "Add Transaction"}
          </Button>
        </div>
      </div>
    </form>
  );
}
