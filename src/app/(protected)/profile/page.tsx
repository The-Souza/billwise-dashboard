import { getUserWithRole } from "@/lib/auth/getUserWithRole";
import { ProfileForm } from "./_components/ProfileForm";

export default async function Profile() {
  const user = await getUserWithRole();

  if (!user) return;

  return <ProfileForm user={user} />;
}
