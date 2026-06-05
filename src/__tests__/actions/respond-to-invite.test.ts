import { beforeEach, describe, expect, it, vi } from "vitest";
import type { workspace_invites } from "@/generated/prisma/client";
import { workspace_invite_status } from "@/generated/prisma/enums";

vi.mock("@/lib/auth/guards", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    workspace_invites: { findUnique: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { respondToInviteAction } from "@/actions/(user)/workspaces/respond-to-invite";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockInviteFindUnique = vi.mocked(prisma.workspace_invites.findUnique);
const mockTransaction = vi.mocked(prisma.$transaction);

const USER_ID = "a1000000-0000-4000-8000-000000000001";
const INVITE_ID = "b2000000-0000-4000-8000-000000000002";
const WORKSPACE_ID = "c3000000-0000-4000-8000-000000000003";
const OWNER_ID = "d4000000-0000-4000-8000-000000000004";

const MOCK_USER = { id: USER_ID, name: "Test", email: "user@test.com", avatarUrl: null };

const PENDING_INVITE: workspace_invites = {
  id: INVITE_ID,
  workspace_id: WORKSPACE_ID,
  invited_user_id: USER_ID,
  invited_by: OWNER_ID,
  status: workspace_invite_status.pending,
  created_at: new Date(),
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER);
  mockInviteFindUnique.mockResolvedValue(PENDING_INVITE);
  mockTransaction.mockImplementation((fn) =>
    fn({
      workspace_invites: { update: vi.fn() },
      workspace_members: { create: vi.fn() },
      notifications: { updateMany: vi.fn() },
    } as never),
  );
});

describe("respondToInviteAction", () => {
  it("aceita convite e cria membership", async () => {
    const result = await respondToInviteAction({
      inviteId: INVITE_ID,
      response: "accepted",
    });

    expect(result.success).toBe(true);
    expect(mockTransaction).toHaveBeenCalled();
  });

  it("recusa convite sem criar membership", async () => {
    const result = await respondToInviteAction({
      inviteId: INVITE_ID,
      response: "declined",
    });

    expect(result.success).toBe(true);
    expect(mockTransaction).toHaveBeenCalled();
  });

  it("retorna erro quando convite não existe", async () => {
    mockInviteFindUnique.mockResolvedValue(null);

    const result = await respondToInviteAction({
      inviteId: INVITE_ID,
      response: "accepted",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/convite/i);
  });

  it("retorna erro quando convite não pertence ao usuário", async () => {
    mockInviteFindUnique.mockResolvedValue({
      ...PENDING_INVITE,
      invited_user_id: "e5000000-0000-4000-8000-000000000005",
    });

    const result = await respondToInviteAction({
      inviteId: INVITE_ID,
      response: "accepted",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/convite/i);
  });

  it("retorna erro quando convite está expirado", async () => {
    mockInviteFindUnique.mockResolvedValue({
      ...PENDING_INVITE,
      expires_at: new Date(Date.now() - 1000),
    });

    const result = await respondToInviteAction({
      inviteId: INVITE_ID,
      response: "accepted",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/expirado/i);
  });

  it("retorna erro quando convite não está pendente", async () => {
    mockInviteFindUnique.mockResolvedValue({
      ...PENDING_INVITE,
      status: workspace_invite_status.accepted,
    });

    const result = await respondToInviteAction({
      inviteId: INVITE_ID,
      response: "accepted",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/pendente/i);
  });
});
