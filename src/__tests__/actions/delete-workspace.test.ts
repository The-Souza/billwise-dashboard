import { beforeEach, describe, expect, it, vi } from "vitest";
import type { workspace_members, workspaces } from "@/generated/prisma/client";
import { workspace_member_role } from "@/generated/prisma/enums";

vi.mock("@/lib/auth/guards", () => ({ requireAuth: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    workspace_members: { findUnique: vi.fn(), findMany: vi.fn() },
    workspaces: { findUnique: vi.fn(), delete: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { deleteWorkspaceAction } from "@/actions/(user)/workspaces/delete-workspace";
import { requireAuth } from "@/lib/auth/guards";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockCookies = vi.mocked(cookies);
const mockMemberFindUnique = vi.mocked(prisma.workspace_members.findUnique);
const mockMemberFindMany = vi.mocked(prisma.workspace_members.findMany);
const mockWorkspaceFindUnique = vi.mocked(prisma.workspaces.findUnique);
const mockDelete = vi.mocked(prisma.workspaces.delete);
const mockTransaction = vi.mocked(prisma.$transaction);
const mockCookieGet = vi.fn();
const mockCookieDelete = vi.fn();
const mockNotificationsCreateMany = vi.fn();

const OWNER_ID = "a1000000-0000-4000-8000-000000000001";
const WORKSPACE_ID = "b2000000-0000-4000-8000-000000000002";
const OTHER_MEMBER_ID = "c3000000-0000-4000-8000-000000000003";

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
  mockMemberFindMany.mockResolvedValue([]);
  mockWorkspaceFindUnique.mockResolvedValue(NON_PERSONAL_WORKSPACE);
  mockDelete.mockResolvedValue(NON_PERSONAL_WORKSPACE);
  mockCookieGet.mockReturnValue(undefined);
  mockCookies.mockResolvedValue({
    get: mockCookieGet,
    delete: mockCookieDelete,
  } as unknown as Awaited<ReturnType<typeof cookies>>);
  mockNotificationsCreateMany.mockClear();
  mockTransaction.mockImplementation((fn) =>
    fn({
      workspaces: { delete: mockDelete },
      notifications: { createMany: mockNotificationsCreateMany },
    } as never),
  );
});

describe("deleteWorkspaceAction", () => {
  it("owner deleta workspace não-pessoal com sucesso", async () => {
    const result = await deleteWorkspaceAction(WORKSPACE_ID);

    expect(result.success).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: WORKSPACE_ID } });
  });

  it("não cria notificações quando o owner é o único membro", async () => {
    mockMemberFindMany.mockResolvedValue([]);

    const result = await deleteWorkspaceAction(WORKSPACE_ID);

    expect(result.success).toBe(true);
    expect(mockNotificationsCreateMany).not.toHaveBeenCalled();
  });

  it("cria notificação para os demais membros ao deletar workspace com múltiplos membros", async () => {
    mockMemberFindMany.mockResolvedValue([
      { workspace_id: WORKSPACE_ID, user_id: OTHER_MEMBER_ID, role: workspace_member_role.member, joined_at: new Date() },
    ]);

    const result = await deleteWorkspaceAction(WORKSPACE_ID);

    expect(result.success).toBe(true);
    expect(mockMemberFindMany).toHaveBeenCalledWith({
      where: { workspace_id: WORKSPACE_ID, user_id: { not: OWNER_ID } },
      select: { user_id: true },
    });
    expect(mockNotificationsCreateMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          user_id: OTHER_MEMBER_ID,
          type: "workspace_deleted",
        }),
      ],
    });
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
