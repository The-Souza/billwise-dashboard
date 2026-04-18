import { Card } from "@/components/ui/card";
import { SignInForm } from "./_components/SignInForm";

export default function SignIn() {
  return (
    <Card className="w-full max-w-md border-none bg-transparent shadow-none">
      <SignInForm />
    </Card>
  );
}
