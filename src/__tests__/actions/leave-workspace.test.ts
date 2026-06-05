import { beforeEach, describe, expect, it, vi } from "vitest";
import type { workspace_members, workspaces } from "@/generated/prisma/client";
import { workspace_member_role } from "@/generated/prisma/enums";

vi.mock("@/lib/auth/guards", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    workspace_members: { findUnique: vi.fn(), delete: vi.fn() },
    workspaces: { findUnique: vi.fn() },
  },
}));

import { leaveWorkspaceAction } from "@/actions/(user)/workspaces/leave-workspace";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockMemberFindUnique = vi.mocked(prisma.workspace_members.findUnique);
const mockWorkspaceFindUnique = vi.mocked(prisma.workspaces.findUnique);
const mockDelete = vi.mocked(prisma.workspace_members.delete);

const USER_ID = "a1000000-0000-4000-8000-000000000001";
const WORKSPACE_ID = "b2000000-0000-4000-8000-000000000002";

const MOCK_USER = { id: USER_ID, name: "Test", email: "user@test.com", avatarUrl: null };

const MEMBER_MEMBERSHIP: workspace_members = {
  workspace_id: WORKSPACE_ID,
  user_id: USER_ID,
  role: workspace_member_role.member,
  joined_at: new Date(),
};

const NON_PERSONAL_WORKSPACE: workspaces = {
  id: WORKSPACE_ID,
  name: "Negócios",
  owner_id: "c3000000-0000-4000-8000-000000000003",
  is_personal: false,
  created_at: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER);
  mockWorkspaceFindUnique.mockResolvedValue(NON_PERSONAL_WORKSPACE);
  mockMemberFindUnique.mockResolvedValue(MEMBER_MEMBERSHIP);
  mockDelete.mockResolvedValue(MEMBER_MEMBERSHIP);
});

describe("leaveWorkspaceAction", () => {
  it("membro sai do workspace com sucesso", async () => {
    const result = await leaveWorkspaceAction(WORKSPACE_ID);

    expect(result.success).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith({
      where: { workspace_id_user_id: { workspace_id: WORKSPACE_ID, user_id: USER_ID } },
    });
  });

  it("retorna erro quando usuário não é membro", async () => {
    mockMemberFindUnique.mockResolvedValue(null);

    const result = await leaveWorkspaceAction(WORKSPACE_ID);

    expect(result.success).toBe(false);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("retorna erro quando usuário é owner (owner não pode sair)", async () => {
    mockMemberFindUnique.mockResolvedValue({
      ...MEMBER_MEMBERSHIP,
      role: workspace_member_role.owner,
    });

    const result = await leaveWorkspaceAction(WORKSPACE_ID);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/owner/i);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("retorna erro ao tentar sair do workspace pessoal", async () => {
    mockWorkspaceFindUnique.mockResolvedValue({
      ...NON_PERSONAL_WORKSPACE,
      is_personal: true,
    });

    const result = await leaveWorkspaceAction(WORKSPACE_ID);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/pessoal/i);
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
