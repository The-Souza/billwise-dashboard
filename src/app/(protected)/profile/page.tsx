import { AppAlert } from "@/components/ui/app-alert";
import { getUserWithRole } from "@/lib/auth/get-user-with-role";
import { ProfileForm } from "./_components/ProfileForm";

export default async function ProfilePage() {
  const user = await getUserWithRole();

  if (!user) {
    return (
      <AppAlert
        variant="warning"
        title="Não foi possível carregar o perfil"
        description="Recarregue a página ou faça login novamente."
      />
    );
  }

  return <ProfileForm user={user} />;
}
