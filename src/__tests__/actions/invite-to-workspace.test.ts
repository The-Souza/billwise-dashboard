import { beforeEach, describe, expect, it, vi } from "vitest";
import type { workspace_members, workspace_invites } from "@/generated/prisma/client";
import { workspace_member_role, workspace_invite_status } from "@/generated/prisma/enums";

vi.mock("@/lib/auth/guards", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    workspace_members: { findUnique: vi.fn() },
    workspace_invites: { findFirst: vi.fn() },
    $queryRaw: vi.fn(),
    $transaction: vi.fn(),
  },
}));

import { inviteToWorkspaceAction } from "@/actions/(user)/workspaces/invite-to-workspace";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockMemberFindUnique = vi.mocked(prisma.workspace_members.findUnique);
const mockInviteFindFirst = vi.mocked(prisma.workspace_invites.findFirst);
const mockQueryRaw = vi.mocked(prisma.$queryRaw);
const mockTransaction = vi.mocked(prisma.$transaction);

const OWNER_ID = "a1000000-0000-4000-8000-000000000001";
const WORKSPACE_ID = "b2000000-0000-4000-8000-000000000002";
const INVITED_USER_ID = "c3000000-0000-4000-8000-000000000003";

const MOCK_USER = { id: OWNER_ID, name: "Owner", email: "owner@test.com", avatarUrl: null };

const OWNER_MEMBERSHIP: workspace_members & { workspace: { name: string } } = {
  workspace_id: WORKSPACE_ID,
  user_id: OWNER_ID,
  role: workspace_member_role.owner,
  joined_at: new Date(),
  workspace: { name: "Workspace de Teste" },
};

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER);
  // First call: requester membership check (owner). Second call: alreadyMember check (null = not a member).
  mockMemberFindUnique.mockImplementation((args) =>
    Promise.resolve(
      args.where.workspace_id_user_id?.user_id === OWNER_ID ? OWNER_MEMBERSHIP : null,
    ) as never,
  );
  mockQueryRaw.mockResolvedValue([{ id: INVITED_USER_ID }]);
  mockInviteFindFirst.mockResolvedValue(null);
  mockTransaction.mockImplementation((fn) =>
    fn({
      workspace_invites: { create: vi.fn().mockResolvedValue({ id: "d4000000-0000-4000-8000-000000000004" }) },
      notifications: { create: vi.fn() },
    } as never),
  );
});

describe("inviteToWorkspaceAction", () => {
  it("cria convite e notificação com sucesso", async () => {
    const result = await inviteToWorkspaceAction({
      workspaceId: WORKSPACE_ID,
      email: "convidado@test.com",
    });

    expect(result.success).toBe(true);
    expect(mockTransaction).toHaveBeenCalled();
  });

  it("retorna erro quando invitador não é owner", async () => {
    mockMemberFindUnique.mockResolvedValue({
      ...OWNER_MEMBERSHIP,
      role: workspace_member_role.member,
    });

    const result = await inviteToWorkspaceAction({
      workspaceId: WORKSPACE_ID,
      email: "convidado@test.com",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/permissão/i);
  });

  it("retorna erro quando invitador não é membro do workspace", async () => {
    mockMemberFindUnique.mockResolvedValue(null);

    const result = await inviteToWorkspaceAction({
      workspaceId: WORKSPACE_ID,
      email: "convidado@test.com",
    });

    expect(result.success).toBe(false);
  });

  it("retorna erro quando email não existe na plataforma", async () => {
    mockQueryRaw.mockResolvedValue([]);

    const result = await inviteToWorkspaceAction({
      workspaceId: WORKSPACE_ID,
      email: "naoexiste@test.com",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/usuário/i);
  });

  it("retorna erro quando convidado já é membro", async () => {
    mockMemberFindUnique.mockImplementation((args) =>
      Promise.resolve(
        args.where.workspace_id_user_id?.user_id === OWNER_ID
          ? OWNER_MEMBERSHIP
          : { workspace_id: WORKSPACE_ID, user_id: INVITED_USER_ID, role: workspace_member_role.member, joined_at: new Date() },
      ) as never,
    );

    const result = await inviteToWorkspaceAction({
      workspaceId: WORKSPACE_ID,
      email: "convidado@test.com",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/membro/i);
  });

  it("retorna erro quando já há convite pendente", async () => {
    mockInviteFindFirst.mockResolvedValue({
      id: "d4000000-0000-4000-8000-000000000004",
      workspace_id: WORKSPACE_ID,
      invited_user_id: INVITED_USER_ID,
      invited_by: OWNER_ID,
      status: workspace_invite_status.pending,
      created_at: new Date(),
      expires_at: new Date(),
    } satisfies workspace_invites);

    const result = await inviteToWorkspaceAction({
      workspaceId: WORKSPACE_ID,
      email: "convidado@test.com",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/pendente/i);
  });

  it("retorna erro com email inválido", async () => {
    const result = await inviteToWorkspaceAction({
      workspaceId: WORKSPACE_ID,
      email: "nao-e-um-email",
    });

    expect(result.success).toBe(false);
    expect(mockMemberFindUnique).not.toHaveBeenCalled();
  });
});
