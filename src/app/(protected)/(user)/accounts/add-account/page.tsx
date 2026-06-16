import { getCategoriesAction } from "@/actions/(user)/accounts/get-categories";
import { AddAccountClient } from "./AddAccountClient";

export default async function AddAccountPage() {
  const categoriesResult = await getCategoriesAction();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold">Nova Conta</h1>
        <p className="text-sm text-muted-foreground">
          Preencha os dados da nova conta.
        </p>
      </div>

      <AddAccountClient
        categories={categoriesResult.success ? categoriesResult.data : []}
      />
    </div>
  );
}
