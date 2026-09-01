import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/actions/(user)/workspaces/get-workspace-members", () => ({
  getWorkspaceMembersAction: vi.fn(),
}));

vi.mock("@/actions/(user)/workspaces/transfer-ownership", () => ({
  transferOwnershipAction: vi.fn(),
}));

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock("@/utils/app-toast", () => ({
  appToast: { success: vi.fn(), error: vi.fn() },
}));

import { getWorkspaceMembersAction } from "@/actions/(user)/workspaces/get-workspace-members";
import { WorkspaceTransferDialog } from "@/app/(protected)/(user)/workspaces/_components/WorkspaceTransferDialog";

const mockGetMembers = vi.mocked(getWorkspaceMembersAction);

const MEMBER = {
  userId: "user-2",
  name: "Maria Souza",
  avatarUrl: null,
  role: "member" as const,
  joinedAt: new Date("2024-01-01"),
};

describe("WorkspaceTransferDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMembers.mockResolvedValue({ success: true, data: [MEMBER] });
  });

  it("anuncia via aria-pressed qual membro está selecionado antes de confirmar", async () => {
    const user = userEvent.setup();
    render(
      <WorkspaceTransferDialog
        open={true}
        onOpenChange={vi.fn()}
        workspaceId="ws-1"
        currentUserId="user-1"
      />,
    );

    const memberButton = await screen.findByRole("button", {
      name: /maria souza/i,
    });
    expect(memberButton).toHaveAttribute("aria-pressed", "false");

    await user.click(memberButton);
    expect(memberButton).toHaveAttribute("aria-pressed", "true");
  });
});
