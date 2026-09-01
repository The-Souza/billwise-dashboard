import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/actions/(user)/workspaces/get-workspace-members", () => ({
  getWorkspaceMembersAction: vi.fn(),
}));
vi.mock("@/actions/(user)/workspaces/bulk-remove-members", () => ({
  bulkRemoveMembersAction: vi.fn(),
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
vi.mock("@/utils/app-toast", () => ({
  appToast: { success: vi.fn(), error: vi.fn() },
}));

import { bulkRemoveMembersAction } from "@/actions/(user)/workspaces/bulk-remove-members";
import { getWorkspaceMembersAction } from "@/actions/(user)/workspaces/get-workspace-members";
import type { WorkspaceSummary } from "@/actions/(user)/workspaces/get-workspaces";
import { useWorkspaceCard } from "@/app/(protected)/(user)/workspaces/_hooks/useWorkspaceCard";
import { appToast } from "@/utils/app-toast";

const mockGetMembers = vi.mocked(getWorkspaceMembersAction);
const mockBulkRemove = vi.mocked(bulkRemoveMembersAction);

const WORKSPACE: WorkspaceSummary = {
  id: "ws-1",
  name: "Casa",
  isPersonal: false,
  ownerId: "user-1",
  role: "owner",
  memberCount: 3,
};

const MEMBER_A = {
  userId: "user-2",
  name: "Ana",
  avatarUrl: null,
  role: "member" as const,
  joinedAt: new Date(),
};
const MEMBER_B = {
  userId: "user-3",
  name: "Bruno",
  avatarUrl: null,
  role: "member" as const,
  joinedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGetMembers.mockResolvedValue({ success: true, data: [MEMBER_A, MEMBER_B] });
});

async function renderExpanded() {
  const { result } = renderHook(() => useWorkspaceCard(WORKSPACE));
  act(() => result.current.setExpanded(true));
  await waitFor(() => expect(result.current.members).not.toBeNull());
  return result;
}

describe("useWorkspaceCard — seleção e remoção em massa", () => {
  it("toggleSelect adiciona e remove ids do conjunto selecionado", async () => {
    const result = await renderExpanded();

    act(() => result.current.toggleSelect(MEMBER_A.userId));
    expect(result.current.selectedIds.has(MEMBER_A.userId)).toBe(true);

    act(() => result.current.toggleSelect(MEMBER_A.userId));
    expect(result.current.selectedIds.has(MEMBER_A.userId)).toBe(false);
  });

  it("confirmBulkRemove não faz nada quando nenhum membro está selecionado", async () => {
    const result = await renderExpanded();

    await act(async () => result.current.confirmBulkRemove());

    expect(mockBulkRemove).not.toHaveBeenCalled();
  });

  it("confirmBulkRemove remove os membros selecionados da lista e limpa a seleção em caso de sucesso", async () => {
    mockBulkRemove.mockResolvedValue({ success: true, removed: 1 });
    const result = await renderExpanded();

    act(() => result.current.toggleSelect(MEMBER_A.userId));
    await act(async () => result.current.confirmBulkRemove());

    expect(mockBulkRemove).toHaveBeenCalledWith(WORKSPACE.id, [MEMBER_A.userId]);
    expect(result.current.members).toEqual([MEMBER_B]);
    expect(result.current.selectedIds.size).toBe(0);
    expect(result.current.bulkRemoveOpen).toBe(false);
    expect(result.current.bulkRemoving).toBe(false);
    expect(appToast.success).toHaveBeenCalled();
  });

  it("confirmBulkRemove mantém a lista e a seleção intactas quando a action falha", async () => {
    mockBulkRemove.mockResolvedValue({ success: false, error: "Sem permissão" });
    const result = await renderExpanded();

    act(() => result.current.toggleSelect(MEMBER_A.userId));
    await act(async () => result.current.confirmBulkRemove());

    expect(result.current.members).toEqual([MEMBER_A, MEMBER_B]);
    expect(result.current.selectedIds.has(MEMBER_A.userId)).toBe(true);
    expect(result.current.bulkRemoving).toBe(false);
    expect(appToast.error).toHaveBeenCalledWith("Sem permissão");
  });

  it("limpa a seleção quando o workspace muda", () => {
    const { result, rerender } = renderHook(
      ({ workspace }) => useWorkspaceCard(workspace),
      { initialProps: { workspace: WORKSPACE } },
    );

    act(() => result.current.toggleSelect(MEMBER_A.userId));
    expect(result.current.selectedIds.size).toBe(1);

    rerender({ workspace: { ...WORKSPACE, id: "ws-2" } });
    expect(result.current.selectedIds.size).toBe(0);
  });
});
