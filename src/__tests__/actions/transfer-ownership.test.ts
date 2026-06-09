import type { workspace_members, workspaces } from "@/generated/prisma/client";
import { workspace_member_role } from "@/generated/prisma/enums";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/guards", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    workspace_members: { findUnique: vi.fn() },
    workspaces: { findUnique: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { transferOwnershipAction } from "@/actions/(user)/workspaces/transfer-ownership";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockMemberFindUnique = vi.mocked(prisma.workspace_members.findUnique);
const mockWorkspaceFindUnique = vi.mocked(prisma.workspaces.findUnique);
const mockTransaction = vi.mocked(prisma.$transaction);

const OWNER_ID = "a1000000-0000-4000-8000-000000000001";
const WORKSPACE_ID = "b2000000-0000-4000-8000-000000000002";
const NEW_OWNER_ID = "c3000000-0000-4000-8000-000000000003";

const MOCK_USER = {
  id: OWNER_ID,
  name: "Owner",
  email: "owner@test.com",
  avatarUrl: null,
};

const OWNER_MEMBERSHIP: workspace_members = {
  workspace_id: WORKSPACE_ID,
  user_id: OWNER_ID,
  role: workspace_member_role.owner,
  joined_at: new Date(),
};

const TARGET_MEMBERSHIP: workspace_members = {
  workspace_id: WORKSPACE_ID,
  user_id: NEW_OWNER_ID,
  role: workspace_member_role.member,
  joined_at: new Date(),
};

const WORKSPACE: workspaces = {
  id: WORKSPACE_ID,
  name: "Teste workspace",
  owner_id: OWNER_ID,
  is_personal: false,
  created_at: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER);
  mockMemberFindUnique
    .mockResolvedValueOnce(OWNER_MEMBERSHIP)
    .mockResolvedValueOnce(TARGET_MEMBERSHIP);
  mockWorkspaceFindUnique.mockResolvedValue(WORKSPACE as never);
  mockTransaction.mockImplementation((fn) =>
    fn({
      workspaces: { update: vi.fn().mockResolvedValue({}) },
      workspace_members: { update: vi.fn().mockResolvedValue({}) },
    } as never),
  );
});

describe("transferOwnershipAction", () => {
  it("transfere propriedade com sucesso", async () => {
    const result = await transferOwnershipAction({
      workspaceId: WORKSPACE_ID,
      newOwnerId: NEW_OWNER_ID,
    });

    expect(result.success).toBe(true);
    expect(mockTransaction).toHaveBeenCalled();
  });

  it("retorna erro com input inválido", async () => {
    const result = await transferOwnershipAction({
      workspaceId: "nao-e-uuid",
      newOwnerId: NEW_OWNER_ID,
    });

    expect(result.success).toBe(false);
    expect(mockAuth).not.toHaveBeenCalled();
  });

  it("retorna erro quando tenta transferir para si mesmo", async () => {
    const result = await transferOwnershipAction({
      workspaceId: WORKSPACE_ID,
      newOwnerId: OWNER_ID,
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/si mesmo/i);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("retorna erro quando não é owner do workspace", async () => {
    mockMemberFindUnique.mockReset();
    mockMemberFindUnique.mockResolvedValueOnce({
      ...OWNER_MEMBERSHIP,
      role: workspace_member_role.member,
    });

    const result = await transferOwnershipAction({
      workspaceId: WORKSPACE_ID,
      newOwnerId: NEW_OWNER_ID,
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/permissão/i);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("retorna erro quando não é membro do workspace", async () => {
    mockMemberFindUnique.mockReset();
    mockMemberFindUnique.mockResolvedValueOnce(null);

    const result = await transferOwnershipAction({
      workspaceId: WORKSPACE_ID,
      newOwnerId: NEW_OWNER_ID,
    });

    expect(result.success).toBe(false);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("retorna erro quando workspace é pessoal", async () => {
    mockWorkspaceFindUnique.mockResolvedValue({
      ...WORKSPACE,
      is_personal: true,
    } as never);

    const result = await transferOwnershipAction({
      workspaceId: WORKSPACE_ID,
      newOwnerId: NEW_OWNER_ID,
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/pessoal/i);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("retorna erro quando novo owner não é membro", async () => {
    mockMemberFindUnique.mockReset();
    mockMemberFindUnique
      .mockResolvedValueOnce(OWNER_MEMBERSHIP)
      .mockResolvedValueOnce(null);

    const result = await transferOwnershipAction({
      workspaceId: WORKSPACE_ID,
      newOwnerId: NEW_OWNER_ID,
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/membro/i);
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});
