// src/app/(protected)/(user)/accounts/add-account/page.tsx

export default function AddAccountPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold font-heading tracking-tight">
          Nova conta
        </h1>
        <p className="text-xs text-muted-foreground">
          Preencha os dados da nova conta
        </p>
      </div>
      {/* futuramente: <AccountForm /> */}
    </div>
  );
}
