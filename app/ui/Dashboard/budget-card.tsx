"use client";

import { setBudget } from "@/app/lib/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Pencil } from "lucide-react";
import { useState } from "react";

export default function BudgetCard(props: any) {
  const [isEditing, setIsEditing] = useState(false);
  const budget = props.budget;
  const lastMonthExpend = props.lastMonthExpend;
  const progress = budget ? (lastMonthExpend / budget.amount) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-gray-900">
            ₹{lastMonthExpend}
          </span>
          {budget && (
            <>
              <span className="text-xl text-gray-500 font-medium">/</span>
              <span className="text-xl text-gray-500">₹{budget.amount}</span>
            </>
          )}
        </div>
        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-gray-100"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4 text-gray-500" />
          </Button>
        )}
      </div>

      {isEditing ? (
        <form
          className="flex items-center gap-2"
          action={async (formData: FormData) => {
            await setBudget(formData);
            setIsEditing(false);
          }}
        >
          <div className="flex items-center">
            <span className="text-lg font-medium mr-2">₹</span>
            <Input
              className="w-32 text-lg"
              name="amount"
              placeholder="Set budget"
              defaultValue={budget?.amount}
              autoFocus
            />
          </div>
          <Button type="submit" size="sm">
            Set
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
        </form>
      ) : (
        <div className="space-y-2">
          <Progress
            value={progress}
            className="h-2 bg-gray-100 [&>div]:bg-blue-500"
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {progress.toFixed(1)}% spent
            </span>
            <span className="text-sm font-medium text-blue-600">On track</span>
          </div>
        </div>
      )}
    </div>
  );
}
