import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/actions/(user)/workspaces/get-workspace-members", () => ({
  getWorkspaceMembersAction: vi.fn().mockResolvedValue({
    success: true,
    data: [],
  }),
}));

vi.mock("@/actions/(user)/workspaces/delete-workspace", () => ({
  deleteWorkspaceAction: vi.fn(),
}));

vi.mock("@/actions/(user)/workspaces/leave-workspace", () => ({
  leaveWorkspaceAction: vi.fn(),
}));

vi.mock("@/actions/(user)/workspaces/remove-member", () => ({
  removeMemberAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { WorkspaceCard } from "@/app/(protected)/(user)/workspaces/_components/WorkspaceCard";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { WorkspaceSummary } from "@/actions/(user)/workspaces/get-workspaces";

const workspace: WorkspaceSummary = {
  id: "ws-1",
  name: "Casa",
  isPersonal: false,
  ownerId: "user-1",
  role: "owner",
  memberCount: 2,
};

describe("WorkspaceCard", () => {
  it("mostra um tooltip com o rótulo da ação ao focar um botão de ícone", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <WorkspaceCard workspace={workspace} currentUserId="user-1" />
      </TooltipProvider>,
    );

    const renameButton = screen.getByRole("button", {
      name: /renomear workspace/i,
    });
    await user.tab();
    renameButton.focus();

    expect(
      await screen.findByText("Renomear workspace", { selector: "[role=tooltip], span" }),
    ).toBeInTheDocument();
  });
});
