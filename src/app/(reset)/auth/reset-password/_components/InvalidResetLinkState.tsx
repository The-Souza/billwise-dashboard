import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangleIcon } from "lucide-react";
import Link from "next/link";

export function InvalidResetLinkState() {
  return (
    <>
      <CardHeader className="flex flex-col items-center gap-2 text-center">
        <div className="p-3 rounded-full bg-destructive/10">
          <AlertTriangleIcon className="h-5 w-5 text-destructive" />
        </div>
        <CardTitle as="h1" className="text-2xl font-heading">
          Link inválido ou expirado
        </CardTitle>
        <CardDescription className="text-md text-muted-foreground">
          Este link de redefinição de senha não é mais válido. Solicite um
          novo para continuar.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button asChild className="text-md">
          <Link href="/auth/forgot-password">Solicitar novo link</Link>
        </Button>
      </CardContent>
    </>
  );
}
