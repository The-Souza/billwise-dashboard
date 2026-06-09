import { describe, it, expect, vi, beforeEach } from "vitest";
import type { workspace_members, workspaces } from "@/generated/prisma/client";
import { workspace_member_role } from "@/generated/prisma/enums";
import { requireWorkspace } from "@/lib/auth/workspace";

const MOCK_USER = {
  id: "user-uuid-123",
  name: "Test User",
  email: "user@test.com",
  avatarUrl: null,
};

const WORKSPACE_ID = "workspace-uuid-456";
const PERSONAL_WORKSPACE_ID = "personal-workspace-uuid-789";

vi.mock("@/lib/auth/guards", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    workspace_members: {
      findUnique: vi.fn(),
    },
    workspaces: {
      findFirst: vi.fn(),
    },
  },
}));

import { requireAuth } from "@/lib/auth/guards";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";

const mockRequireAuth = vi.mocked(requireAuth);
const mockCookies = vi.mocked(cookies);
const mockFindUnique = vi.mocked(prisma.workspace_members.findUnique);
const mockFindFirst = vi.mocked(prisma.workspaces.findFirst);

function makeCookieStore(workspaceId?: string) {
  return {
    get: (key: string) =>
      key === "active_workspace_id" && workspaceId
        ? { name: "active_workspace_id", value: workspaceId }
        : undefined,
  } as unknown as Awaited<ReturnType<typeof cookies>>;
}

const MOCK_MEMBER: workspace_members = {
  workspace_id: WORKSPACE_ID,
  user_id: MOCK_USER.id,
  role: workspace_member_role.member,
  joined_at: new Date(),
};

const MOCK_OWNER_MEMBER: workspace_members = {
  ...MOCK_MEMBER,
  role: workspace_member_role.owner,
};

const MOCK_PERSONAL_WORKSPACE: workspaces = {
  id: PERSONAL_WORKSPACE_ID,
  name: "Pessoal",
  owner_id: MOCK_USER.id,
  is_personal: true,
  created_at: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAuth.mockResolvedValue(MOCK_USER);
});

describe("requireWorkspace", () => {
  it("retorna workspace do cookie quando membro existe", async () => {
    mockCookies.mockResolvedValue(makeCookieStore(WORKSPACE_ID));
    mockFindUnique.mockResolvedValue(MOCK_MEMBER);

    const ctx = await requireWorkspace();

    expect(ctx.workspaceId).toBe(WORKSPACE_ID);
    expect(ctx.workspaceRole).toBe("member");
    expect(ctx.user).toEqual(MOCK_USER);
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it("retorna role 'owner' quando membro tem role owner", async () => {
    mockCookies.mockResolvedValue(makeCookieStore(WORKSPACE_ID));
    mockFindUnique.mockResolvedValue(MOCK_OWNER_MEMBER);

    const ctx = await requireWorkspace();

    expect(ctx.workspaceRole).toBe("owner");
    expect(ctx.workspaceId).toBe(WORKSPACE_ID);
  });

  it("faz fallback para workspace pessoal quando cookie aponta workspace sem membership", async () => {
    mockCookies.mockResolvedValue(makeCookieStore(WORKSPACE_ID));
    mockFindUnique.mockResolvedValue(null);
    mockFindFirst.mockResolvedValue(MOCK_PERSONAL_WORKSPACE);

    const ctx = await requireWorkspace();

    expect(ctx.workspaceId).toBe(PERSONAL_WORKSPACE_ID);
    expect(ctx.workspaceRole).toBe("owner");
  });

  it("faz fallback direto para workspace pessoal quando não há cookie", async () => {
    mockCookies.mockResolvedValue(makeCookieStore());
    mockFindFirst.mockResolvedValue(MOCK_PERSONAL_WORKSPACE);

    const ctx = await requireWorkspace();

    expect(ctx.workspaceId).toBe(PERSONAL_WORKSPACE_ID);
    expect(ctx.workspaceRole).toBe("owner");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("lança erro quando workspace pessoal não existe", async () => {
    mockCookies.mockResolvedValue(makeCookieStore());
    mockFindFirst.mockResolvedValue(null);

    await expect(requireWorkspace()).rejects.toThrow(
      `Personal workspace not found for user ${MOCK_USER.id}`,
    );
  });

  it("propaga erro quando requireAuth falha", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Not authenticated"));
    mockCookies.mockResolvedValue(makeCookieStore());

    await expect(requireWorkspace()).rejects.toThrow("Not authenticated");
  });
});
