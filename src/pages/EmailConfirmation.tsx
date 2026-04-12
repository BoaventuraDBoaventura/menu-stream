import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "waiting">("waiting");
  const { platformName } = usePlatformSettings();

  // Check URL for confirmation status from Supabase redirect
  useEffect(() => {
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    const type = searchParams.get("type");

    if (error) {
      setStatus("error");
    } else if (type === "signup" || type === "email") {
      setStatus("success");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 gradient-warm">
      <Card className="w-full max-w-md shadow-medium text-center">
        <CardHeader className="space-y-4 px-4 sm:px-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ChefHat className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            <span className="text-xl sm:text-2xl font-bold">{platformName}</span>
          </div>

          {status === "waiting" && (
            <>
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Verifique seu email</CardTitle>
              <CardDescription className="text-base">
                Enviamos um link de confirmação para o seu email. Clique no link para ativar sua conta.
              </CardDescription>
            </>
          )}

          {status === "loading" && (
            <>
              <div className="flex justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </div>
              <CardTitle className="text-2xl">Confirmando...</CardTitle>
              <CardDescription className="text-base">
                Estamos confirmando seu email. Aguarde um momento.
              </CardDescription>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-green-700">Email Confirmado!</CardTitle>
              <CardDescription className="text-base">
                Sua conta foi verificada com sucesso. Agora você pode fazer login e começar a usar a plataforma.
              </CardDescription>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl text-destructive">Erro na Confirmação</CardTitle>
              <CardDescription className="text-base">
                {searchParams.get("error_description") || "O link de confirmação é inválido ou expirou. Tente registrar-se novamente."}
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="px-4 sm:px-6 space-y-4">
          {status === "waiting" && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground text-left space-y-2">
                <p>📧 Verifique sua caixa de entrada e spam</p>
                <p>⏰ O link expira em 24 horas</p>
                <p>🔄 Não recebeu? Tente registrar-se novamente</p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">Ir para o Login</Link>
              </Button>
            </div>
          )}

          {status === "success" && (
            <Button asChild className="w-full gradient-primary">
              <Link to="/login">Fazer Login</Link>
            </Button>
          )}

          {status === "error" && (
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link to="/register">Tentar Novamente</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">Ir para o Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmation;
