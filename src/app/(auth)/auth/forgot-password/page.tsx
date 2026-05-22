import { Card } from "@/components/ui/card";
import type { Metadata } from "next";
import { ForgotPasswordForm } from "./_components/ForgotPasswordForm";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ForgotPassword() {
  return (
    <Card className="w-full max-w-md border-none bg-transparent shadow-none">
      <ForgotPasswordForm />
    </Card>
  );
}
