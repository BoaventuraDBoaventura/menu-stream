import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Eye, EyeOff, CheckCircle2, XCircle, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const hasMinLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setIsValidToken(true);
        setIsChecking(false);
      }
    });

    // Check URL hash for recovery token
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get("access_token");
    const type = hashParams.get("type");

    if (type === "recovery" && accessToken) {
      // Let Supabase client process the tokens from the URL
      // It will fire onAuthStateChange with PASSWORD_RECOVERY
      timeout = setTimeout(() => {
        // If after 5 seconds the event didn't fire, try setting session manually
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            setIsValidToken(true);
          }
          setIsChecking(false);
        });
      }, 5000);
    } else {
      // No recovery params in URL - check if there's already a session (e.g. from PKCE flow)
      supabase.auth.getSession().then(({ data: { session } }) => {
        // Check if URL has query params from PKCE flow
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        
        if (code) {
          // PKCE flow: exchange code for session
          supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
            if (data?.session) {
              setIsValidToken(true);
            }
            setIsChecking(false);
          });
        } else if (session) {
          setIsValidToken(true);
          setIsChecking(false);
        } else {
          setIsChecking(false);
        }
      });
    }

    return () => {
      subscription.unsubscribe();
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordsMatch) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (!hasMinLength) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Senha redefinida!",
        description: "Sua senha foi alterada com sucesso.",
      });

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Erro ao redefinir senha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordRule = ({ met, label }: { met: boolean; label: string }) => (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
      )}
      <span className={met ? "text-green-600" : "text-muted-foreground"}>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 gradient-warm">
      <Card className="w-full max-w-md shadow-medium">
        <CardHeader className="space-y-2 text-center px-4 sm:px-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ChefHat className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            <span className="text-xl sm:text-2xl font-bold">PratoDigital</span>
          </div>
          <CardTitle className="text-2xl sm:text-3xl">Redefinir Senha</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {isSuccess
              ? "Senha alterada com sucesso!"
              : "Digite sua nova senha abaixo"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                Sua senha foi redefinida com sucesso. Você será redirecionado para o login em instantes...
              </p>
              <Button onClick={() => navigate("/login")} variant="outline" className="w-full">
                Ir para o Login
              </Button>
            </div>
          ) : !isValidToken ? (
            <div className="text-center py-6 space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-muted p-3">
                  <Lock className="h-10 w-10 text-muted-foreground" />
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                Link inválido ou expirado. Por favor, solicite um novo link de redefinição na página de login.
              </p>
              <Button onClick={() => navigate("/login")} variant="outline" className="w-full">
                Voltar ao Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="space-y-1 pt-1">
                  <PasswordRule met={hasMinLength} label="Mínimo de 6 caracteres" />
                  <PasswordRule met={hasUpperCase} label="Uma letra maiúscula" />
                  <PasswordRule met={hasNumber} label="Um número" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className="flex items-center gap-2 text-xs pt-1">
                    {passwordsMatch ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-green-600">Senhas coincidem</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5 text-destructive" />
                        <span className="text-destructive">Senhas não coincidem</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <Button
                type="submit"
                className="w-full gradient-primary"
                disabled={isLoading || !hasMinLength || !passwordsMatch}
              >
                {isLoading ? "Redefinindo..." : "Redefinir Senha"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Voltar ao Login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
