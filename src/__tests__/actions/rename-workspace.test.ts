import { beforeEach, describe, expect, it, vi } from "vitest";
import type { workspace_members } from "@/generated/prisma/client";
import { workspace_member_role } from "@/generated/prisma/enums";

vi.mock("@/lib/auth/guards", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    workspace_members: { findUnique: vi.fn() },
    workspaces: { update: vi.fn() },
  },
}));

import { renameWorkspaceAction } from "@/actions/(user)/workspaces/rename-workspace";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockFindUnique = vi.mocked(prisma.workspace_members.findUnique);
const mockUpdate = vi.mocked(prisma.workspaces.update);

const OWNER_ID = "a1000000-0000-4000-8000-000000000001";
const WORKSPACE_ID = "b2000000-0000-4000-8000-000000000002";

const MOCK_USER = { id: OWNER_ID, name: "Owner", email: "owner@test.com", avatarUrl: null };

const OWNER_MEMBERSHIP: workspace_members = {
  workspace_id: WORKSPACE_ID,
  user_id: OWNER_ID,
  role: workspace_member_role.owner,
  joined_at: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER);
  mockFindUnique.mockResolvedValue(OWNER_MEMBERSHIP);
  mockUpdate.mockResolvedValue({ id: WORKSPACE_ID, name: "Novo Nome" } as never);
});

describe("renameWorkspaceAction", () => {
  it("owner renomeia workspace com sucesso", async () => {
    const result = await renameWorkspaceAction({ workspaceId: WORKSPACE_ID, name: "Novo Nome" });

    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: WORKSPACE_ID },
      data: { name: "Novo Nome" },
    });
  });

  it("retorna erro quando não é owner", async () => {
    mockFindUnique.mockResolvedValue({
      ...OWNER_MEMBERSHIP,
      role: workspace_member_role.member,
    });

    const result = await renameWorkspaceAction({ workspaceId: WORKSPACE_ID, name: "Novo Nome" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/permissão/i);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("retorna erro quando não é membro", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await renameWorkspaceAction({ workspaceId: WORKSPACE_ID, name: "Novo Nome" });

    expect(result.success).toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("retorna erro com nome vazio", async () => {
    const result = await renameWorkspaceAction({ workspaceId: WORKSPACE_ID, name: "" });

    expect(result.success).toBe(false);
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("retorna erro com nome acima de 50 caracteres", async () => {
    const result = await renameWorkspaceAction({ workspaceId: WORKSPACE_ID, name: "a".repeat(51) });

    expect(result.success).toBe(false);
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});
