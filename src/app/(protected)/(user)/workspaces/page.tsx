import { getWorkspacesAction } from "@/actions/(user)/workspaces/get-workspaces";
import { requireAuth } from "@/lib/auth/guards";
import { WorkspacesClient } from "./_components/WorkspacesClient";

export default async function WorkspacesPage() {
  const [user, workspacesResult] = await Promise.all([
    requireAuth(),
    getWorkspacesAction(),
  ]);

  const workspaces = workspacesResult.success ? workspacesResult.data : [];

  return (
    <div className="flex flex-col gap-6 min-h-full">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold">Workspaces</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie seus contextos financeiros e membros.
        </p>
      </div>

      <WorkspacesClient workspaces={workspaces} currentUserId={user.id} />
    </div>
  );
}
