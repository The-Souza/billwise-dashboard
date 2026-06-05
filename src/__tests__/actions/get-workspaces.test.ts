import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/guards", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    workspace_members: { findMany: vi.fn() },
  },
}));

import { getWorkspacesAction } from "@/actions/(user)/workspaces/get-workspaces";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockFindMany = vi.mocked(prisma.workspace_members.findMany);

const MOCK_USER = { id: "user-uuid-123", name: "Test", email: "user@test.com", avatarUrl: null };

const MOCK_MEMBERSHIPS = [
  {
    workspace_id: "ws-personal",
    user_id: MOCK_USER.id,
    role: "owner",
    joined_at: new Date(),
    workspace: {
      id: "ws-personal",
      name: "Pessoal",
      owner_id: MOCK_USER.id,
      is_personal: true,
      created_at: new Date(),
      _count: { members: 1 },
    },
  },
  {
    workspace_id: "ws-business",
    user_id: MOCK_USER.id,
    role: "member",
    joined_at: new Date(),
    workspace: {
      id: "ws-business",
      name: "Negócios",
      owner_id: "other-user",
      is_personal: false,
      created_at: new Date(),
      _count: { members: 3 },
    },
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER);
  mockFindMany.mockResolvedValue(MOCK_MEMBERSHIPS as never);
});

describe("getWorkspacesAction", () => {
  it("retorna lista de workspaces do usuário com role e contagem de membros", async () => {
    const result = await getWorkspacesAction();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe("Pessoal");
      expect(result.data[0].role).toBe("owner");
      expect(result.data[1].name).toBe("Negócios");
      expect(result.data[1].role).toBe("member");
    }
  });

  it("retorna lista vazia quando não há memberships", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await getWorkspacesAction();

    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toHaveLength(0);
  });

  it("retorna erro de servidor quando prisma falha", async () => {
    mockFindMany.mockRejectedValue(new Error("DB error"));

    const result = await getWorkspacesAction();

    expect(result.success).toBe(false);
  });
});
