import { beforeEach, describe, expect, it, vi } from "vitest";
import type { workspace_members } from "@/generated/prisma/client";
import { workspace_member_role } from "@/generated/prisma/enums";

vi.mock("@/lib/auth/guards", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    workspace_members: { findUnique: vi.fn(), findMany: vi.fn() },
  },
}));

import { getWorkspaceMembersAction } from "@/actions/(user)/workspaces/get-workspace-members";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockFindUnique = vi.mocked(prisma.workspace_members.findUnique);
const mockFindMany = vi.mocked(prisma.workspace_members.findMany);

const USER_ID = "a1000000-0000-4000-8000-000000000001";
const WORKSPACE_ID = "b2000000-0000-4000-8000-000000000002";
const MEMBER_ID = "c3000000-0000-4000-8000-000000000003";

const MOCK_USER = { id: USER_ID, name: "Test", email: "user@test.com", avatarUrl: null };

const REQUESTER_MEMBERSHIP: workspace_members = {
  workspace_id: WORKSPACE_ID,
  user_id: USER_ID,
  role: workspace_member_role.owner,
  joined_at: new Date(),
};

const MOCK_MEMBERS = [
  {
    workspace_id: WORKSPACE_ID,
    user_id: USER_ID,
    role: "owner",
    joined_at: new Date(),
    user: { id: USER_ID, name: "Test", avatar_url: null },
  },
  {
    workspace_id: WORKSPACE_ID,
    user_id: MEMBER_ID,
    role: "member",
    joined_at: new Date(),
    user: { id: MEMBER_ID, name: "Membro", avatar_url: null },
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER);
  mockFindUnique.mockResolvedValue(REQUESTER_MEMBERSHIP);
  mockFindMany.mockResolvedValue(MOCK_MEMBERS as never);
});

describe("getWorkspaceMembersAction", () => {
  it("retorna membros do workspace quando é membro", async () => {
    const result = await getWorkspaceMembersAction(WORKSPACE_ID);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0].role).toBe("owner");
      expect(result.data[1].role).toBe("member");
    }
  });

  it("retorna erro quando usuário não é membro", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await getWorkspaceMembersAction(WORKSPACE_ID);

    expect(result.success).toBe(false);
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("retorna erro com workspaceId inválido", async () => {
    const result = await getWorkspaceMembersAction("nao-e-uuid");

    expect(result.success).toBe(false);
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});
