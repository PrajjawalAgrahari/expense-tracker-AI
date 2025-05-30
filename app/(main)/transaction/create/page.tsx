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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {editId ? "Edit Transaction" : "Add Transactions"}
        </h1>
        <p className="text-gray-600 text-lg">
          {editId 
            ? "Update your transaction details below" 
            : "Add one or more transactions to track your expenses and income"
          }
        </p>
      </div>
      <TransactionCreateForm accounts={accounts} transaction={transaction} />
    </main>
  );
}
