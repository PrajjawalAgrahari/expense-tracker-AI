"use client";

import { setBudget } from "@/app/lib/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

export default function BudgetCard(props: any) {
  const [func, setFunc] = useState(false);
  const budget = props.budget;
  const lastMonthExpend = props.lastMonthExpend;
  return (
    <Card>
      <CardContent className="px-10">
        <h2 className="text-lg font-semibold">Monthly Budget</h2>
        {!func ? (
          <div>
            <div className="flex gap-4 items-center mt-2">
              <span>
                {budget ? (
                  <>
                    ₹{lastMonthExpend} of ₹{budget.amount} spent
                  </>
                ) : (
                  "No budget set"
                )}
              </span>
              <Button
                className="cursor-pointer"
                onClick={() => {
                  setFunc(true);
                }}
              >
                Set
              </Button>
            </div>
            {budget && (
              <Progress
                value={budget ? (lastMonthExpend / budget.amount) * 100 : 0}
                className="mt-4"
              ></Progress>
            )}
          </div>
        ) : (
          <div className="mt-2">
            <form
              className="flex gap-4"
              action={async (formData: FormData) => {
                await setBudget(formData);
                setFunc(false);
              }}
            >
              <Input
                className="max-w-[100px]"
                name="amount"
                placeholder="₹0.00"
                defaultValue={budget?.amount}
              ></Input>
              <Button className="cursor-pointer" type="submit">
                Tick
              </Button>
              <Button
                className="cursor-pointer"
                onClick={() => {
                  setFunc(false);
                }}
              >
                Cut
              </Button>
            </form>
          </div>
        )}
      </CardContent>
      {/* <Button><PencilIcon></PencilIcon></Button> */}
    </Card>
  );
}
