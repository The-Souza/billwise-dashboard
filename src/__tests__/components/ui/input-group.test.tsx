import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InputGroupButton } from "@/components/ui/input-group";

describe("InputGroupButton", () => {
  it("repassa size icon-xs para o Button subjacente (aplica o hit-slop de toque)", () => {
    render(<InputGroupButton size="icon-xs">Ação</InputGroupButton>);
    expect(screen.getByRole("button")).toHaveClass("before:absolute");
  });

  it("repassa size icon-sm para o Button subjacente (aplica o hit-slop de toque)", () => {
    render(<InputGroupButton size="icon-sm">Ação</InputGroupButton>);
    expect(screen.getByRole("button")).toHaveClass("before:absolute");
  });

  it("não aplica hit-slop de ícone para size xs (botão de texto, não ícone)", () => {
    render(<InputGroupButton size="xs">Ação</InputGroupButton>);
    expect(screen.getByRole("button")).not.toHaveClass("before:absolute");
  });
});
