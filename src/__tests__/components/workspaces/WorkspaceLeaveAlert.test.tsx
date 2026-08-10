import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { WorkspaceLeaveAlert } from "@/app/(protected)/(user)/workspaces/_components/WorkspaceLeaveAlert";

describe("WorkspaceLeaveAlert", () => {
  it("não renderiza conteúdo quando fechado", () => {
    render(
      <WorkspaceLeaveAlert
        open={false}
        onOpenChange={vi.fn()}
        leaving={false}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("chama onConfirm ao clicar em Sair", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <WorkspaceLeaveAlert
        open={true}
        onOpenChange={vi.fn()}
        leaving={false}
        onConfirm={onConfirm}
      />,
    );
    await user.click(screen.getByRole("button", { name: /^sair$/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("não chama onOpenChange ao clicar em Sair (dialog não fecha antes da ação assíncrona resolver)", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <WorkspaceLeaveAlert
        open={true}
        onOpenChange={onOpenChange}
        leaving={false}
        onConfirm={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: /^sair$/i }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("desabilita botões quando leaving é true", () => {
    render(
      <WorkspaceLeaveAlert
        open={true}
        onOpenChange={vi.fn()}
        leaving={true}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /saindo/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeDisabled();
  });
});
