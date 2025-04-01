import CreateAccountDrawer from "@/app/ui/Dashboard/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { getUserAccounts } from "@/app/lib/dashboard";
import AccountCard from "@/app/ui/Dashboard/accountCard";

export default async function Dashboard() {
  const accounts = await getUserAccounts();
  const accountCards = accounts?.map((account) => {
    return <AccountCard key={account.id} {...account} />;
  });
  return (
    <>
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
