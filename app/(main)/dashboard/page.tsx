import CreateAccountDrawer from "@/app/ui/Dashboard/create-account-drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Link as LinkIcon } from "lucide-react";
import {
  getBudget,
  getExpenseOfThisMonth,
  getUserAccounts,
  hasLinkedAccounts,
} from "@/app/lib/dashboard";
import AccountCard from "@/app/ui/Dashboard/accountCard";
import BudgetCard from "@/app/ui/Dashboard/budget-card";
import RecentTransactionsCard from "@/app/ui/Dashboard/recent-transaction-card";
import DashboardLayout from "@/app/ui/Dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { LinkBankButton } from "@/app/ui/Dashboard/link-bank-button";

export default async function Dashboard() {
  const accounts = await getUserAccounts();
  const budget = await getBudget();
  const lastMonthExpend = await getExpenseOfThisMonth();
  const hasLinked = await hasLinkedAccounts();
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Budget and Accounts */}
        <div className="lg:col-span-8 space-y-6">
          {/* Budget Progress */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-2 px-8">
              <CardTitle className="text-xl font-semibold text-gray-800">
                Monthly Budget
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <BudgetCard budget={budget} lastMonthExpend={lastMonthExpend} />
            </CardContent>
          </Card>

          {/* Accounts Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Your Accounts
              </h2>{" "}
              <div className="flex gap-2">
                <LinkBankButton hasLinkedAccounts={hasLinked} />
                <CreateAccountDrawer>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Account
                  </Button>
                </CreateAccountDrawer>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts?.map((account) => (
                <AccountCard key={account.id} {...account} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Recent Transactions */}
        <div className="lg:col-span-4">
          <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200 sticky top-4">
            <CardHeader className="pb-2 px-6">
              <CardTitle className="text-xl font-semibold text-gray-800">
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <RecentTransactionsCard accounts={accounts} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
