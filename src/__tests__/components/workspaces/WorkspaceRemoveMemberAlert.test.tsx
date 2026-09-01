import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { WorkspaceRemoveMemberAlert } from "@/app/(protected)/(user)/workspaces/_components/WorkspaceRemoveMemberAlert";
import type { MemberSummary } from "@/actions/(user)/workspaces/get-workspace-members";

const target: MemberSummary = {
  userId: "user-1",
  name: "Maria Souza",
  avatarUrl: null,
  role: "member",
  joinedAt: new Date("2024-01-01"),
};

describe("WorkspaceRemoveMemberAlert", () => {
  it("não renderiza conteúdo quando target é null", () => {
    render(
      <WorkspaceRemoveMemberAlert
        target={null}
        removing={null}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("chama onConfirm ao clicar em Remover", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <WorkspaceRemoveMemberAlert
        target={target}
        removing={null}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />,
    );
    await user.click(screen.getByRole("button", { name: /^remover$/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("não chama onClose ao clicar em Remover (dialog não fecha antes da ação assíncrona resolver)", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <WorkspaceRemoveMemberAlert
        target={target}
        removing={null}
        onClose={onClose}
        onConfirm={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: /^remover$/i }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("desabilita botões quando removing corresponde ao userId do target", () => {
    render(
      <WorkspaceRemoveMemberAlert
        target={target}
        removing={target.userId}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /removendo/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeDisabled();
  });
});
