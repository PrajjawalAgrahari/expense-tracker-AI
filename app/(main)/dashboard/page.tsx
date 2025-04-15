import CreateAccountDrawer from "@/app/ui/Dashboard/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { getBudget, getExpenseOfThisMonth, getUserAccounts } from "@/app/lib/dashboard";
import AccountCard from "@/app/ui/Dashboard/accountCard";
import BudgetCard from "@/app/ui/Dashboard/budget-card";
import RecentTransactionsCard from "@/app/ui/Dashboard/recent-transaction-card";

export default async function Dashboard() {
  const accounts = await getUserAccounts();
  const accountCards = accounts?.map((account) => {
    return <AccountCard key={account.id} {...account} />;
  });
  const budget = await getBudget();
  const lastMonthExpend = await getExpenseOfThisMonth();
  return (
    <>
      <BudgetCard budget={budget} lastMonthExpend={lastMonthExpend}/>
      <RecentTransactionsCard accounts={accounts}/>
      <CreateAccountDrawer>
        <Card className="py-12 px-24 hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Plus className="h-10 w-10" />
            <span className="text-[14px] font-[500]">Add new Account</span>
          </CardContent>
        </Card>
      </CreateAccountDrawer>

      <div className="grid grid-cols-3 gap-4">{accountCards}</div>
    </>
  );
}
