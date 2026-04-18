import { ToggleTheme } from "@/components/ui/toggle-theme";
import { BarChart3, PiggyBank, RefreshCw } from "lucide-react";
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
];

export function AuthLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-primary p-12 relative overflow-hidden">
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
              Controle total das suas finanças
            </h2>
            <p className="text-white/70 text-base leading-relaxed">
              Gerencie contas, orçamentos e pagamentos recorrentes em um só
              lugar.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-white/15 shrink-0">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-white text-sm font-semibold">
                    {title}
                  </span>
                  <span className="text-white/60 text-xs leading-relaxed">
                    {desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-white/40 text-xs">
          © 2025 Billwise. Todos os direitos reservados.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-end p-5">
          <ToggleTheme />
        </div>
        <main className="flex-1 flex items-center justify-center px-6 pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}
