import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

let autoResolveCaptcha = true;
let triggerCaptchaError = false;
const resetMock = vi.fn();
vi.mock("@marsidev/react-turnstile", () => ({
  Turnstile: ({
    onSuccess,
    onError,
    ref,
  }: {
    onSuccess?: (token: string) => void;
    onError?: () => void;
    ref?: { current: unknown };
  }) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only fire once, like the real widget's script callback
    useEffect(() => {
      if (ref) ref.current = { reset: resetMock };
      if (autoResolveCaptcha) onSuccess?.("test-captcha-token");
      if (triggerCaptchaError) onError?.();
    }, []);
    return null;
  },
}));

import { TurnstileField } from "@/components/auth/TurnstileField";

describe("TurnstileField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    autoResolveCaptcha = true;
    triggerCaptchaError = false;
  });

  it("chama onTokenChange com o token em caso de sucesso", () => {
    const onTokenChange = vi.fn();
    render(
      <TurnstileField
        action="sign-in"
        theme="light"
        onTokenChange={onTokenChange}
      />,
    );
    expect(onTokenChange).toHaveBeenCalledWith("test-captcha-token");
  });

  it("mostra mensagem de erro e botão de retry quando o widget falha", () => {
    autoResolveCaptcha = false;
    triggerCaptchaError = true;
    render(<TurnstileField action="sign-in" theme="light" onTokenChange={vi.fn()} />);

    expect(
      screen.getByText(/não foi possível carregar a verificação de segurança/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /tentar novamente/i }),
    ).toBeInTheDocument();
  });

  it("reseta o widget e limpa o erro ao clicar em 'Tentar novamente'", async () => {
    autoResolveCaptcha = false;
    triggerCaptchaError = true;
    const onTokenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TurnstileField
        action="sign-in"
        theme="light"
        onTokenChange={onTokenChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /tentar novamente/i }));

    expect(resetMock).toHaveBeenCalledOnce();
    expect(onTokenChange).toHaveBeenCalledWith(undefined);
    expect(
      screen.queryByText(/não foi possível carregar a verificação de segurança/i),
    ).not.toBeInTheDocument();
  });
});
