import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";

export default function AccountCard({ ...account }) {
  let type: string = account.type;
  type = type[0] + type.slice(1).toLowerCase();

  return (
    <Card className="py-0">
      <Link href={`/account/${account.id}`}>
        <CardContent className="p-6 flex flex-col gap-3 justify-center">
          <div className="text-[0.875rem] font-medium flex items-center justify-between">
            <span>{account.name}</span>
            <Switch checked={account.isDefault}></Switch>
          </div>
          <div className="flex flex-col mb-2">
            <span className="text-[1.5rem] font-bold">{account.balance}</span>
            <span className="text-[0.75rem] text-[#737373]">
              {type} Account
            </span>
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
