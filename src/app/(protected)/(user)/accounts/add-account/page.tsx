import { getCategoriesAction } from "@/actions/(user)/accounts/get-categories";
import { AddAccountClient } from "./AddAccountClient";

export default async function AddAccountPage() {
  const categoriesResult = await getCategoriesAction();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold font-heading tracking-tight capitalize">
        Preencha os dados da nova conta
      </h1>

      <AddAccountClient
        categories={categoriesResult.success ? categoriesResult.data : []}
      />
    </div>
  );
}
