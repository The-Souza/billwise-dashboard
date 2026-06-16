import { NotificationPrefsSection } from "./_components/NotificationPrefsSection";
import { RecurringRulesSection } from "./_components/RecurringRulesSection";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 min-h-full">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Preferências e configurações da sua conta.
        </p>
      </div>

      <RecurringRulesSection />
      <NotificationPrefsSection />
    </div>
  );
}
