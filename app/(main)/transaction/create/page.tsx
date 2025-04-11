import { getUserAccounts } from "@/app/lib/dashboard";
import { Button } from "@/components/ui/button";
import TransactionCreateForm from "./form";

export default async function CreateTransaction() {
  const accounts = await getUserAccounts();

  return (
    <main className="flex flex-col gap-4 items-center py-10">
      <h1>Add Transaction</h1>
      <Button className="cursor-pointer">Scan Receipt with AI</Button>
      <TransactionCreateForm accounts={accounts} />
    </main>
  );
}
