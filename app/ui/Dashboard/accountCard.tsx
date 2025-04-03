"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";
import { changeDefaultAccount } from "@/app/lib/dashboard";
import { postSubmission } from "@/app/lib/data-submission";
import { Toaster, toast } from "sonner";
import { useEffect } from "react";

export default function AccountCard({ ...account }) {
  let type: string = account.type;
  type = type[0] + type.slice(1).toLowerCase();

  const {
    data,
    loading: isLoading,
    error,
    fn: changeDefault,
  } = postSubmission(changeDefaultAccount);

  async function handleDefaultChange() {
    if (account.isDefault) {
      toast.warning("You need at least 1 default account");
      return;
    }
    await changeDefault(account.id);
  }

//   useEffect(() => {
//     if (!isLoading) {
//       if (error !== "") {
//         toast.error(error || "Something went wrong");
//       } else {
//         toast.success("Default account changed successfully");
//       }
//     }
//   }, [isLoading, error]);

  return (
    <Card className="py-0">
      <Toaster />
      <Link href={`/account/${account.id}`}>
      <CardContent className="p-6 flex flex-col gap-3 justify-center">
        <div className="text-[0.875rem] font-medium flex items-center justify-between">
          <span>{account.name}</span>
          <Switch
            disabled={isLoading}
            checked={account.isDefault}
            onClick={async (e) => {
                e.preventDefault();
                await handleDefaultChange();
            }}
          ></Switch>
        </div>
        <div className="flex flex-col mb-2">
          <span className="text-[1.5rem] font-bold">{account.balance}</span>
          <span className="text-[0.75rem] text-[#737373]">{type} Account</span>
        </div>
        <div className="flex justify-between">
          <span className="flex gap-1 items-center text-[0.875rem] text-[#737373]">
            <ArrowUpRight className="h-4 w-4 text-green-400" /> Income
          </span>
          <span className="flex gap-1 items-center text-[0.875rem] text-[#737373]">
            <ArrowDownRight className="h-4 w-4 text-red-400" /> Expense
          </span>
        </div>
      </CardContent>
      </Link>
    </Card>
  );
}
