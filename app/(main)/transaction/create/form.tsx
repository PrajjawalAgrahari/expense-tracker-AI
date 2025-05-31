"use client";

import {
  createTransaction,
  updateTransaction,
} from "@/app/lib/transaction-create";
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
import { useForm, useFieldArray, FieldErrors } from "react-hook-form";
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
import { categorizeTransactionDescription } from "@/app/lib/auto-categorize";
import { useDebounce } from "@/hooks/debounce";
import { z } from "zod";
import { useState } from "react";
import { Trash2, Copy, PlusCircle, Sparkles, Loader2 } from "lucide-react";
import get from "lodash/get"; // Add this import for safe nested property access

const bulkTransactionSchema = z.object({
  transactions: z.array(transactionSchema),
});

type BulkTransactionData = z.infer<typeof bulkTransactionSchema>;

export default function TransactionCreateForm(props: any) {
  const router = useRouter();
  const accounts = props.accounts;
  const transaction = props.transaction;
  const edit = transaction !== null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categorizingStates, setCategorizingStates] = useState<Record<number, boolean>>({});
  const [autoSuggestions, setAutoSuggestions] = useState<Record<number, string>>({});
  
  let defaultAccountId: string = "";
  for (let i = 0; i < accounts.length; i++) {
    if (accounts[i].isDefault) {
      defaultAccountId = accounts[i].id;
      break;
    }
  }

  // Default transaction object
  const defaultTransaction: TransactionData = {
    type: "EXPENSE",
    amount: "",
    account: defaultAccountId,
    category: "",
    date: new Date(),
    description: "",
    isRecurring: false,
    recurringInterval: "DAILY",
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch,
    reset,
  } = useForm<BulkTransactionData>({
    resolver: zodResolver(bulkTransactionSchema),
    defaultValues: !edit
      ? { transactions: [defaultTransaction] }
      : {
          transactions: [
            {
              type: transaction.type,
              amount: transaction.amount.toString(),
              account: transaction.accountId,
              category: transaction.category,
              date: new Date(transaction.date),
              description: transaction.description,
              isRecurring: transaction.isRecurring,
              recurringInterval: transaction.recurringInterval,
            },
          ],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "transactions",
  });

  // Helper function to safely get error messages
  const getErrorMessage = (index: number, field: keyof TransactionData): string | undefined => {
    return get(errors, `transactions.${index}.${field}.message`) as string | undefined;
  };

  // Auto-categorization logic
  const performAutoCategorization = async (index: number, description: string, type: "EXPENSE" | "INCOME") => {
    if (!description || description.trim().length < 3) return;

    setCategorizingStates(prev => ({ ...prev, [index]: true }));
    
    try {
      const suggestedCategory = await categorizeTransactionDescription(description, type);
      
      if (suggestedCategory) {
        // Check if user hasn't manually selected a category yet
        const currentCategory = getValues(`transactions.${index}.category`);
        if (!currentCategory || currentCategory === autoSuggestions[index]) {
          setValue(`transactions.${index}.category`, suggestedCategory);
          setAutoSuggestions(prev => ({ ...prev, [index]: suggestedCategory }));
        }
      }
    } catch (error) {
      console.error('Auto-categorization error:', error);
    } finally {
      setCategorizingStates(prev => ({ ...prev, [index]: false }));
    }
  };

  fields.forEach((_, index) => {
    const description = watch(`transactions.${index}.description`);
    const type = watch(`transactions.${index}.type`);
    
    useDebounce(
      () => {
        if (description && type) {
          performAutoCategorization(index, description, type);
        }
      },
      1000, // 1 second delay
      [description, type, index]
    );
  });


  async function onSubmit(data: BulkTransactionData) {
    setIsSubmitting(true);
    try {
      if (!edit) {
        const promises = data.transactions.map((transaction) =>
          createTransaction(transaction)
        );
        await Promise.all(promises);
      } else {
        const updateData = data.transactions[0];
        (updateData as any).id = transaction.id;
        await updateTransaction(updateData as any);
      }
      router.push(`/account/${data.transactions[0].account}`);
    } catch (error) {
      console.error("Error submitting transactions:", error);
    } finally {
      setIsSubmitting(false);
    }
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

  const handleUpload = async (e: any, index: number) => {
    const file = e.target?.files[0];
    if (!file) return;

    const text = await extractTextFromImage(file);
    const data = await extractTransactionData(text);

    if (data) {
      setValue(`transactions.${index}.type`, data.type as "EXPENSE" | "INCOME");
      setValue(`transactions.${index}.amount`, data.amount);
      setValue(`transactions.${index}.category`, data.category);
      setValue(`transactions.${index}.description`, data.description ?? "");
      setValue(`transactions.${index}.date`, new Date(data.date));
    } else {
      console.error("Failed to extract transaction data from receipt.");
    }
  };

  const addNewTransaction = () => {
    append(defaultTransaction);
  };

  const copyTransaction = (index: number) => {
    const currentTransaction = getValues(`transactions.${index}`);
    append({
      ...currentTransaction,
      description: `${currentTransaction.description} (copy)`,
    });
  };

  const calculateTotal = () => {
    return fields.reduce((total, _, index) => {
      const type = watch(`transactions.${index}.type`);
      const amount = parseFloat(watch(`transactions.${index}.amount`) || "0");
      return type === "EXPENSE" ? total - amount : total + amount;
    }, 0);
  };

  const handleManualCategoryChange = (index: number, value: string) => {
    setValue(`transactions.${index}.category`, value);
    // Clear auto-suggestion when user manually selects
    setAutoSuggestions(prev => ({ ...prev, [index]: '' }));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-6">
        {fields.map((field, index) => {
          const type = watch(`transactions.${index}.type`);
          const isRecurring = watch(`transactions.${index}.isRecurring`);
          const date = watch(`transactions.${index}.date`);
          const currentCategory = watch(`transactions.${index}.category`);
          const isAutoSuggested = autoSuggestions[index] === currentCategory;
          const isCategorizing = categorizingStates[index];
          const filteredCategories = defaultCategories.filter(
            (category) => category.type === type
          );

          return (
            <div key={field.id} className="p-6 border rounded-lg shadow-sm bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Transaction #{index + 1}</h3>
                <div className="flex gap-2">
                  {fields.length > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyTransaction(index)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Type and Amount Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label htmlFor={`transactions.${index}.type`} className="block text-sm font-medium">
                    Transaction Type
                  </label>
                  <Select
                    onValueChange={(value) => {
                      setValue(`transactions.${index}.type`, value as "EXPENSE" | "INCOME")
                      setValue(`transactions.${index}.category`, ""); 
                      setAutoSuggestions(prev => ({ ...prev, [index]: '' })); 
                    }}
                    value={watch(`transactions.${index}.type`)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXPENSE">Expense</SelectItem>
                      <SelectItem value="INCOME">Income</SelectItem>
                    </SelectContent>
                  </Select>
                  {getErrorMessage(index, 'type') && (
                    <p className="text-red-500 text-sm">{getErrorMessage(index, 'type')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor={`transactions.${index}.amount`} className="block text-sm font-medium">
                    Amount
                  </label>
                  <Input
                    {...register(`transactions.${index}.amount`)}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                  {getErrorMessage(index, 'amount') && (
                    <p className="text-red-500 text-sm">{getErrorMessage(index, 'amount')}</p>
                  )}
                </div>
              </div>

              {/* Account and Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label htmlFor={`transactions.${index}.account`} className="block text-sm font-medium">
                    Account
                  </label>
                  <Select
                    onValueChange={(value) => setValue(`transactions.${index}.account`, value)}
                    value={watch(`transactions.${index}.account`)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts?.map((account: Account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} (${account.balance.toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <CreateAccountDrawer>
                  {getErrorMessage(index, 'account') && (
                    <p className="text-red-500 text-sm">{getErrorMessage(index, 'account')}</p>
                  )}
                  </CreateAccountDrawer>
                </div>

                <div className="space-y-2">
                  <label htmlFor={`transactions.${index}.category`} className="block text-sm font-medium">
                    Category
                    {isCategorizing && (
                      <span className="ml-2 inline-flex items-center text-xs text-blue-600">
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Auto-categorizing...
                      </span>
                    )}
                    {isAutoSuggested && !isCategorizing && (
                      <span className="ml-2 inline-flex items-center text-xs text-green-600">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI suggested
                      </span>
                    )}
                  </label>
                  <Select
                    onValueChange={(value) => handleManualCategoryChange(index, value)}
                    value={currentCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getErrorMessage(index, 'category') && (
                    <p className="text-red-500 text-sm">{getErrorMessage(index, 'category')}</p>
                  )}
                </div>
              </div>

              {/* Date and Description Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label htmlFor={`transactions.${index}.date`} className="block text-sm font-medium">
                    Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        {date?.toLocaleString("default", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                          setValue(`transactions.${index}.date`, selectedDate as Date);
                        }}
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                  {getErrorMessage(index, 'date') && (
                    <p className="text-red-500 text-sm">{getErrorMessage(index, 'date')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor={`transactions.${index}.description`} className="block text-sm font-medium">
                    Description
                    <span className="text-[8px] text-gray-500 ml-2">
                      (Auto-categorization will trigger as you type)
                    </span>
                  </label>
                  <Input
                    {...register(`transactions.${index}.description`)}
                    placeholder="Enter description"
                  />
                  {getErrorMessage(index, 'description') && (
                    <p className="text-red-500 text-sm">{getErrorMessage(index, 'description')}</p>
                  )}
                </div>
              </div>

              {/* Recurring Transaction */}
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  onCheckedChange={(checked) => {
                    setValue(`transactions.${index}.isRecurring`, checked);
                  }}
                  id={`transactions.${index}.isRecurring`}
                  checked={isRecurring ? true : false}
                />
                <label
                  htmlFor={`transactions.${index}.isRecurring`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Recurring Transaction
                </label>
              </div>

              {isRecurring && (
                <div className="mb-4">
                  <label htmlFor={`transactions.${index}.recurringInterval`} className="block text-sm font-medium mb-2">
                    Set up a recurring schedule for this transaction
                  </label>
                  <Select
                    onValueChange={(value) => setValue(`transactions.${index}.recurringInterval`, value as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY")}
                    value={watch(`transactions.${index}.recurringInterval`)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Interval" />
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

              {/* Receipt Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Upload Receipt (Optional)</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(e, index)}
                  className="cursor-pointer"
                />
              </div>

              {index < fields.length - 1 && <hr className="my-6" />}
            </div>
          );
        })}
      </div>

      {/* Add More Transaction Button */}
      {!edit && (
        <Button
          type="button"
          variant="outline"
          onClick={addNewTransaction}
          className="w-full flex items-center justify-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Add Another Transaction
        </Button>
      )}

      {/* Summary Section */}
      {fields.length > 1 && (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-medium mb-2">Summary</h3>
          <p>Total Transactions: {fields.length}</p>
          <p className={calculateTotal() >= 0 ? "text-green-600" : "text-red-600"}>
            Net Amount: ${calculateTotal().toFixed(2)}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? "Processing..." 
            : edit 
              ? "Update Transaction" 
              : fields.length > 1 
                ? `Add ${fields.length} Transactions` 
                : "Add Transaction"
          }
        </Button>
      </div>
    </form>
  );
}
