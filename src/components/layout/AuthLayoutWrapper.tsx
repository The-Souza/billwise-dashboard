import { ToggleTheme } from "@/components/ui/toggle-theme";
import {
  BarChart3,
  LockIcon,
  LogOutIcon,
  PiggyBank,
  RefreshCw,
  ShieldCheckIcon,
  Users,
} from "lucide-react";
import Image from "next/image";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Dashboard completo",
    desc: "Visão geral de receitas, despesas e saldo do mês.",
  },
  {
    icon: PiggyBank,
    title: "Orçamentos inteligentes",
    desc: "Defina metas e acompanhe gastos por categoria.",
  },
  {
    icon: RefreshCw,
    title: "Pagamentos recorrentes",
    desc: "Cadastre cobranças fixas e nunca perca um vencimento.",
  },
  {
    icon: Users,
    title: "Workspaces colaborativos",
    desc: "Gerencie finanças em conjunto com família ou amigos.",
  },
];

const SECURITY_POINTS = [
  {
    icon: ShieldCheckIcon,
    title: "Link de uso único",
    desc: "Cada link de redefinição funciona uma vez só e expira automaticamente.",
  },
  {
    icon: LockIcon,
    title: "Conexão sempre criptografada",
    desc: "Sua nova senha trafega por uma conexão segura, do início ao fim.",
  },
  {
    icon: LogOutIcon,
    title: "Sessões encerradas por segurança",
    desc: "Ao trocar sua senha, todos os outros acessos são desconectados.",
  },
];

interface AuthLayoutWrapperProps {
  children: React.ReactNode;
  variant?: "marketing" | "reassurance";
}

export function AuthLayoutWrapper({
  children,
  variant = "marketing",
}: AuthLayoutWrapperProps) {
  const isReassurance = variant === "reassurance";
  const items = isReassurance ? SECURITY_POINTS : FEATURES;

  return (
    <div className="min-h-dvh flex">
      {/* Left panel — sticky, doesn't scroll with the form */}
      <div className="hidden lg:flex lg:w-[45%] lg:sticky lg:top-0 lg:self-start h-dvh shrink-0 flex-col justify-between bg-primary p-12 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-primary/80 pointer-events-none" />
        <div className="absolute -top-48 -right-48 w-xl h-144 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-48 -left-48 w-xl h-144 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-72 h-72 -translate-y-1/2 translate-x-1/3 rounded-full bg-white/3 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm">
            <Image
              src="/icon-dark-theme.png"
              width={24}
              height={24}
              alt="Billwise"
              priority
            />
          </div>
          <span className="text-lg font-bold font-heading text-white">
            Billwise
          </span>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-bold font-heading text-white leading-snug">
              {isReassurance
                ? "Vamos recuperar o acesso à sua conta"
                : "Organize, acompanhe e planeje suas finanças"}
            </h2>
            <p className="text-white text-base font-normal leading-relaxed">
              {isReassurance
                ? "Sua segurança vem em primeiro lugar. Redefina sua senha com tranquilidade."
                : "Gerencie suas finanças pessoais ou em conjunto com família e amigos, tudo em um só lugar."}
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {items.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-white/15 shrink-0">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-white text-sm font-semibold">
                    {title}
                  </span>
                  <span className="text-white text-xs font-normal leading-relaxed">
                    {desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-white text-xs border-t border-white/20 pt-4">
          © 2026 Billwise. Todos os direitos reservados.
        </p>
      </div>

      {/* Right panel — scrolls independently */}
      <div className="flex-1 flex flex-col min-h-dvh">
        {/* Toggle — in normal flow so it never overlaps form content on short viewports */}
        <div className="flex justify-end p-6">
          <ToggleTheme />
        </div>
        <main className="flex-1 flex items-center justify-center">
          {children}
        </main>
      </div>
    </div>
  );
}
