import { getUserAccounts } from "@/app/lib/dashboard";
import TransactionCreateForm from "./form";
import { getTransactionById } from "@/app/lib/transaction-create";

export default async function CreateTransaction({
  searchParams
} : any) {
  const params = await searchParams;
  const editId = params.edit || null;
  const accounts = await getUserAccounts();

  let transaction = null;
  if (editId) {
    transaction = await getTransactionById(editId); 
  }

  return (
    <main className="flex flex-col gap-4 items-center py-10">
      <h1>{editId ? "Edit Transaction" : "Add Transaction"}</h1>
      <TransactionCreateForm accounts={accounts} transaction={transaction} />
    </main>
  );
}
