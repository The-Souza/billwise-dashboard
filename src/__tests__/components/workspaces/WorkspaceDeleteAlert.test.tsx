import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { WorkspaceDeleteAlert } from "@/app/(protected)/(user)/workspaces/_components/WorkspaceDeleteAlert";

describe("WorkspaceDeleteAlert", () => {
  it("não renderiza conteúdo quando fechado", () => {
    render(
      <WorkspaceDeleteAlert
        open={false}
        onOpenChange={vi.fn()}
        deleting={false}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("chama onConfirm ao clicar em Deletar", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <WorkspaceDeleteAlert
        open={true}
        onOpenChange={vi.fn()}
        deleting={false}
        onConfirm={onConfirm}
      />,
    );
    await user.click(screen.getByRole("button", { name: /^deletar$/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("não chama onOpenChange ao clicar em Deletar (dialog não fecha antes da ação assíncrona resolver)", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <WorkspaceDeleteAlert
        open={true}
        onOpenChange={onOpenChange}
        deleting={false}
        onConfirm={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: /^deletar$/i }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("desabilita botões quando deleting é true", () => {
    render(
      <WorkspaceDeleteAlert
        open={true}
        onOpenChange={vi.fn()}
        deleting={true}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /deletando/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeDisabled();
  });
});
