import { Card } from "@/components/ui/card";
import { ForgotPasswordForm } from "./_components/ForgotPasswordForm";

export default function ForgotPassword() {
  return (
    <Card className="w-full max-w-md border-none bg-transparent shadow-none">
      <ForgotPasswordForm />
    </Card>
  );
}
