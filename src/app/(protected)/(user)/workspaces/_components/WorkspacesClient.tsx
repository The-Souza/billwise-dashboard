"use client";

import { WorkspaceSummary } from "@/actions/(user)/workspaces/get-workspaces";
import { WorkspaceCreateDialog } from "@/components/workspaces/WorkspaceCreateDialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { WorkspaceCard } from "./WorkspaceCard";

interface WorkspacesClientProps {
  workspaces: WorkspaceSummary[];
  currentUserId: string;
}

export function WorkspacesClient({
  workspaces,
  currentUserId,
}: WorkspacesClientProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {workspaces.length} de 3 workspaces
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setCreateOpen(true)}
          disabled={workspaces.length >= 3}
        >
          <PlusIcon className="size-4" />
          Criar workspace
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {workspaces.map((ws) => (
          <WorkspaceCard
            key={ws.id}
            workspace={ws}
            currentUserId={currentUserId}
          />
        ))}
      </div>

      <WorkspaceCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
