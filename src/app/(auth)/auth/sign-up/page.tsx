import { Card } from "@/components/ui/card";
import { SignUpForm } from "./_components/SignUpForm";

export default function SignUp() {
  return (
    <Card className="w-full max-w-md border-none bg-transparent shadow-none">
      <SignUpForm />
    </Card>
  );
}
