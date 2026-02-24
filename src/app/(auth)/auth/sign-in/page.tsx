import { SignInForm } from "./_components/SignInForm";

export default function SignIn() {
  return (
    <div className="min-h-[60vh] sm:min-h-[65vh] xl:min-h-[80vh] w-full max-w-md flex flex-col flex-1 items-center justify-center">
      <SignInForm />
    </div>
  );
}
