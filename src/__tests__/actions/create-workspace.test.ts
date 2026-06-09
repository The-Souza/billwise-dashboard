import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/guards", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    workspace_members: { count: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { createWorkspaceAction } from "@/actions/(user)/workspaces/create-workspace";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockCount = vi.mocked(prisma.workspace_members.count);
const mockTransaction = vi.mocked(prisma.$transaction);

const MOCK_USER = {
  id: "user-uuid-123",
  name: "Test",
  email: "user@test.com",
  avatarUrl: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER);
  mockTransaction.mockImplementation((fn) => fn({ workspaces: { create: vi.fn().mockResolvedValue({ id: "new-ws-id" }) }, workspace_members: { create: vi.fn() } } as never));
});

describe("createWorkspaceAction", () => {
  it("cria workspace quando usuário tem menos de 3", async () => {
    mockCount.mockResolvedValue(1);

    const result = await createWorkspaceAction({ name: "Negócios" });

    expect(result.success).toBe(true);
    expect(mockTransaction).toHaveBeenCalled();
  });

  it("retorna erro quando usuário já tem 3 workspaces", async () => {
    mockCount.mockResolvedValue(3);

    const result = await createWorkspaceAction({ name: "Quarto" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/limite/i);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("retorna erro com nome vazio", async () => {
    const result = await createWorkspaceAction({ name: "" });

    expect(result.success).toBe(false);
    expect(mockCount).not.toHaveBeenCalled();
  });

  it("retorna erro com nome acima de 50 caracteres", async () => {
    const result = await createWorkspaceAction({ name: "a".repeat(51) });

    expect(result.success).toBe(false);
    expect(mockCount).not.toHaveBeenCalled();
  });

  it("propaga erro de servidor", async () => {
    mockCount.mockResolvedValue(0);
    mockTransaction.mockRejectedValue(new Error("DB error"));

    const result = await createWorkspaceAction({ name: "Pessoal 2" });

    expect(result.success).toBe(false);
  });
});
