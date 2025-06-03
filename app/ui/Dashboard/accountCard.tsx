"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import Link from "next/link";
import { changeDefaultAccount } from "@/app/lib/dashboard";
import { postSubmission } from "@/app/lib/data-submission";
import { Toaster, toast } from "sonner";

export default function AccountCard({ ...account }) {
  const type = account.type[0] + account.type.slice(1).toLowerCase();

  const { fn: changeDefault } = postSubmission(changeDefaultAccount);

  async function handleDefaultChange() {
    if (account.isDefault) {
      toast.warning("You need at least 1 default account");
      return;
    }
    await changeDefault(account.id);
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200">
      <Toaster />
      <Link href={`/account/${account.id}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{account.name}</h3>
                <p className="text-sm text-gray-500">{type} Account</p>
              </div>
            </div>
            <Switch
              disabled={account.isDefault}
              checked={account.isDefault}
              onClick={async (e) => {
                e.preventDefault();
                await handleDefaultChange();
              }}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">
                ₹{account.balance}
              </span>
              <span className="text-sm text-gray-500">balance</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              <div className="flex items-center gap-1 text-sm">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-gray-600">Income</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <ArrowDownRight className="h-4 w-4 text-red-500" />
                <span className="text-gray-600">Expense</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
