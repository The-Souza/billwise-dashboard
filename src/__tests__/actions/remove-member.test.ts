import { beforeEach, describe, expect, it, vi } from "vitest";
import type { workspace_members } from "@/generated/prisma/client";
import { workspace_member_role } from "@/generated/prisma/enums";

vi.mock("@/lib/auth/guards", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    workspace_members: { findUnique: vi.fn(), delete: vi.fn() },
  },
}));

import { removeMemberAction } from "@/actions/(user)/workspaces/remove-member";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockFindUnique = vi.mocked(prisma.workspace_members.findUnique);
const mockDelete = vi.mocked(prisma.workspace_members.delete);

const OWNER_ID = "a1000000-0000-4000-8000-000000000001";
const WORKSPACE_ID = "b2000000-0000-4000-8000-000000000002";
const MEMBER_ID = "c3000000-0000-4000-8000-000000000003";

const MOCK_USER = { id: OWNER_ID, name: "Owner", email: "owner@test.com", avatarUrl: null };

const OWNER_MEMBERSHIP: workspace_members = {
  workspace_id: WORKSPACE_ID,
  user_id: OWNER_ID,
  role: workspace_member_role.owner,
  joined_at: new Date(),
};

const TARGET_MEMBERSHIP: workspace_members = {
  workspace_id: WORKSPACE_ID,
  user_id: MEMBER_ID,
  role: workspace_member_role.member,
  joined_at: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER);
  mockFindUnique
    .mockResolvedValueOnce(OWNER_MEMBERSHIP)
    .mockResolvedValueOnce(TARGET_MEMBERSHIP);
  mockDelete.mockResolvedValue(TARGET_MEMBERSHIP);
});

describe("removeMemberAction", () => {
  it("owner remove membro com sucesso", async () => {
    const result = await removeMemberAction(WORKSPACE_ID, MEMBER_ID);

    expect(result.success).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith({
      where: { workspace_id_user_id: { workspace_id: WORKSPACE_ID, user_id: MEMBER_ID } },
    });
  });

  it("retorna erro quando não é owner", async () => {
    mockFindUnique.mockReset();
    mockFindUnique.mockResolvedValueOnce({
      ...OWNER_MEMBERSHIP,
      role: workspace_member_role.member,
    });

    const result = await removeMemberAction(WORKSPACE_ID, MEMBER_ID);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/permissão/i);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("retorna erro quando tenta remover a si mesmo", async () => {
    mockFindUnique.mockReset();

    const result = await removeMemberAction(WORKSPACE_ID, OWNER_ID);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/si mesmo/i);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("retorna erro quando alvo não é membro", async () => {
    mockFindUnique.mockReset();
    mockFindUnique
      .mockResolvedValueOnce(OWNER_MEMBERSHIP)
      .mockResolvedValueOnce(null);

    const result = await removeMemberAction(WORKSPACE_ID, MEMBER_ID);

    expect(result.success).toBe(false);
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
