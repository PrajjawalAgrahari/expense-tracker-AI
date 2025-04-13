import { getUserAccounts } from "@/app/lib/dashboard";
import TransactionCreateForm from "./form";

export default async function CreateTransaction() {
  const accounts = await getUserAccounts();

  return (
    <main className="flex flex-col gap-4 items-center py-10">
      <h1>Add Transaction</h1>
      <TransactionCreateForm accounts={accounts} />
    </main>
  );
}
