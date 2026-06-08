import { beforeEach, describe, expect, it, vi } from "vitest";
import type { workspace_members } from "@/generated/prisma/client";
import { workspace_member_role } from "@/generated/prisma/enums";

vi.mock("@/lib/auth/guards", () => ({ requireAuth: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    workspace_members: { findUnique: vi.fn() },
  },
}));

import { switchWorkspaceAction } from "@/actions/(user)/workspaces/switch-workspace";
import { requireAuth } from "@/lib/auth/guards";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockCookies = vi.mocked(cookies);
const mockFindUnique = vi.mocked(prisma.workspace_members.findUnique);

const USER_ID = "a1000000-0000-4000-8000-000000000001";
const WORKSPACE_ID = "b2000000-0000-4000-8000-000000000002";

const MOCK_USER = { id: USER_ID, name: "Test", email: "user@test.com", avatarUrl: null };

const MEMBERSHIP: workspace_members = {
  workspace_id: WORKSPACE_ID,
  user_id: USER_ID,
  role: workspace_member_role.member,
  joined_at: new Date(),
};

const mockCookieSet = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER);
  mockCookies.mockResolvedValue({ set: mockCookieSet } as unknown as Awaited<ReturnType<typeof cookies>>);
  mockFindUnique.mockResolvedValue(MEMBERSHIP);
});

describe("switchWorkspaceAction", () => {
  it("seta o cookie active_workspace_id quando é membro", async () => {
    const result = await switchWorkspaceAction({ workspaceId: WORKSPACE_ID });

    expect(result.success).toBe(true);
    expect(mockCookieSet).toHaveBeenCalledWith(
      "active_workspace_id",
      WORKSPACE_ID,
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it("retorna erro quando usuário não é membro do workspace", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await switchWorkspaceAction({ workspaceId: WORKSPACE_ID });

    expect(result.success).toBe(false);
    expect(mockCookieSet).not.toHaveBeenCalled();
  });

  it("retorna erro com workspaceId inválido", async () => {
    const result = await switchWorkspaceAction({ workspaceId: "nao-e-uuid" });

    expect(result.success).toBe(false);
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});
