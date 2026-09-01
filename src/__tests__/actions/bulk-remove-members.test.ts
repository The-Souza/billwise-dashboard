import { beforeEach, describe, expect, it, vi } from "vitest";
import { workspace_member_role } from "@/generated/prisma/enums";

vi.mock("@/lib/auth/guards", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    workspace_members: { findUnique: vi.fn(), deleteMany: vi.fn() },
  },
}));

import { bulkRemoveMembersAction } from "@/actions/(user)/workspaces/bulk-remove-members";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockFindUnique = vi.mocked(prisma.workspace_members.findUnique);
const mockDeleteMany = vi.mocked(prisma.workspace_members.deleteMany);

const OWNER_ID = "a1000000-0000-4000-8000-000000000001";
const WORKSPACE_ID = "b2000000-0000-4000-8000-000000000002";
const MEMBER_ID_1 = "c3000000-0000-4000-8000-000000000003";
const MEMBER_ID_2 = "d4000000-0000-4000-8000-000000000004";

const MOCK_USER = {
  id: OWNER_ID,
  name: "Owner",
  email: "owner@test.com",
  avatarUrl: null,
};

const OWNER_MEMBERSHIP = {
  workspace_id: WORKSPACE_ID,
  user_id: OWNER_ID,
  role: workspace_member_role.owner,
  joined_at: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER);
  mockFindUnique.mockResolvedValue(OWNER_MEMBERSHIP);
  mockDeleteMany.mockResolvedValue({ count: 2 });
});

describe("bulkRemoveMembersAction", () => {
  it("owner remove múltiplos membros com sucesso", async () => {
    const result = await bulkRemoveMembersAction(WORKSPACE_ID, [
      MEMBER_ID_1,
      MEMBER_ID_2,
    ]);

    expect(result.success).toBe(true);
    if (result.success) expect(result.removed).toBe(2);
    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: {
        workspace_id: WORKSPACE_ID,
        user_id: { in: [MEMBER_ID_1, MEMBER_ID_2] },
      },
    });
  });

  it("retorna erro quando lista de ids está vazia", async () => {
    const result = await bulkRemoveMembersAction(WORKSPACE_ID, []);

    expect(result.success).toBe(false);
    expect(mockDeleteMany).not.toHaveBeenCalled();
  });

  it("retorna erro quando algum id é inválido", async () => {
    const result = await bulkRemoveMembersAction(WORKSPACE_ID, [
      MEMBER_ID_1,
      "not-a-uuid",
    ]);

    expect(result.success).toBe(false);
    expect(mockDeleteMany).not.toHaveBeenCalled();
  });

  it("retorna erro quando workspaceId é inválido", async () => {
    const result = await bulkRemoveMembersAction("not-a-uuid", [MEMBER_ID_1]);

    expect(result.success).toBe(false);
    expect(mockDeleteMany).not.toHaveBeenCalled();
  });

  it("retorna erro quando tenta remover a si mesmo junto com outros", async () => {
    const result = await bulkRemoveMembersAction(WORKSPACE_ID, [
      MEMBER_ID_1,
      OWNER_ID,
    ]);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/si mesmo/i);
    expect(mockDeleteMany).not.toHaveBeenCalled();
  });

  it("retorna erro quando requester não é owner", async () => {
    mockFindUnique.mockResolvedValue({
      ...OWNER_MEMBERSHIP,
      role: workspace_member_role.member,
    });

    const result = await bulkRemoveMembersAction(WORKSPACE_ID, [MEMBER_ID_1]);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/permissão/i);
    expect(mockDeleteMany).not.toHaveBeenCalled();
  });

  it("retorna erro quando requester não é membro do workspace", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await bulkRemoveMembersAction(WORKSPACE_ID, [MEMBER_ID_1]);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/permissão/i);
    expect(mockDeleteMany).not.toHaveBeenCalled();
  });

  it("retorna erro quando nenhum dos ids selecionados é membro", async () => {
    mockDeleteMany.mockResolvedValue({ count: 0 });

    const result = await bulkRemoveMembersAction(WORKSPACE_ID, [MEMBER_ID_1]);

    expect(result.success).toBe(false);
  });
});
