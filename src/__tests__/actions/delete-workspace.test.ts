import { beforeEach, describe, expect, it, vi } from "vitest";
import type { workspace_members, workspaces } from "@/generated/prisma/client";
import { workspace_member_role } from "@/generated/prisma/enums";

vi.mock("@/lib/auth/guards", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    workspace_members: { findUnique: vi.fn() },
    workspaces: { findUnique: vi.fn(), delete: vi.fn() },
  },
}));

import { deleteWorkspaceAction } from "@/actions/(user)/workspaces/delete-workspace";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockMemberFindUnique = vi.mocked(prisma.workspace_members.findUnique);
const mockWorkspaceFindUnique = vi.mocked(prisma.workspaces.findUnique);
const mockDelete = vi.mocked(prisma.workspaces.delete);

const OWNER_ID = "a1000000-0000-4000-8000-000000000001";
const WORKSPACE_ID = "b2000000-0000-4000-8000-000000000002";

const MOCK_USER = { id: OWNER_ID, name: "Owner", email: "owner@test.com", avatarUrl: null };

const OWNER_MEMBERSHIP: workspace_members = {
  workspace_id: WORKSPACE_ID,
  user_id: OWNER_ID,
  role: workspace_member_role.owner,
  joined_at: new Date(),
};

const NON_PERSONAL_WORKSPACE: workspaces = {
  id: WORKSPACE_ID,
  name: "Negócios",
  owner_id: OWNER_ID,
  is_personal: false,
  created_at: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER);
  mockMemberFindUnique.mockResolvedValue(OWNER_MEMBERSHIP);
  mockWorkspaceFindUnique.mockResolvedValue(NON_PERSONAL_WORKSPACE);
  mockDelete.mockResolvedValue(NON_PERSONAL_WORKSPACE);
});

describe("deleteWorkspaceAction", () => {
  it("owner deleta workspace não-pessoal com sucesso", async () => {
    const result = await deleteWorkspaceAction(WORKSPACE_ID);

    expect(result.success).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: WORKSPACE_ID } });
  });

  it("retorna erro quando não é owner", async () => {
    mockMemberFindUnique.mockResolvedValue({
      ...OWNER_MEMBERSHIP,
      role: workspace_member_role.member,
    });

    const result = await deleteWorkspaceAction(WORKSPACE_ID);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/permissão/i);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("retorna erro ao tentar deletar workspace pessoal", async () => {
    mockWorkspaceFindUnique.mockResolvedValue({
      ...NON_PERSONAL_WORKSPACE,
      is_personal: true,
    });

    const result = await deleteWorkspaceAction(WORKSPACE_ID);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/pessoal/i);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("retorna erro quando workspace não existe", async () => {
    mockWorkspaceFindUnique.mockResolvedValue(null);

    const result = await deleteWorkspaceAction(WORKSPACE_ID);

    expect(result.success).toBe(false);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("retorna erro com workspaceId inválido", async () => {
    const result = await deleteWorkspaceAction("nao-e-uuid");

    expect(result.success).toBe(false);
    expect(mockMemberFindUnique).not.toHaveBeenCalled();
  });
});
