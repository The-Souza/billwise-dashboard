import { getAccountByIdAction } from "@/actions/(user)/accounts/get-account-by-id";
import { getCategoriesAction } from "@/actions/(user)/accounts/get-categories";
import { notFound } from "next/navigation";
import { EditAccountClient } from "./EditAccountClient";

interface EditAccountPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAccountPage({
  params,
}: EditAccountPageProps) {
  const { id } = await params;

  const [accountResult, categoriesResult] = await Promise.all([
    getAccountByIdAction(id),
    getCategoriesAction(),
  ]);

  if (!accountResult.success) notFound();

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold">Editar Conta</h1>
        <p className="text-sm text-muted-foreground">
          Atualize os dados da conta.
        </p>
      </div>

      <EditAccountClient
        id={id}
        account={accountResult.data}
        categories={categoriesResult.success ? categoriesResult.data : []}
      />
    </div>
  );
}
