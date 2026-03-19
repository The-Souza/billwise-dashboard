// src/app/(protected)/(user)/accounts/[id]/page.tsx

interface EditAccountPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAccountPage({
  params,
}: EditAccountPageProps) {
  const { id } = await params;

  // futuramente: const account = await getAccountByIdAction(id)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold font-heading tracking-tight">
          Editar conta
        </h1>
        <p className="text-xs text-muted-foreground">
          Atualize os dados da conta
        </p>
      </div>
      {/* futuramente: <AccountForm account={account} /> */}
    </div>
  );
}
