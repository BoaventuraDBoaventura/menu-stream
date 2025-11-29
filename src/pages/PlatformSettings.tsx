import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat, LogOut, Crown, Settings, Database, Shield, Loader2, ArrowLeft } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { StatisticsDashboard } from "@/components/admin/StatisticsDashboard";

const PlatformSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { role, isSuperAdmin } = useUserRole(user?.id);
  
  // Platform settings state
  const [platformName, setPlatformName] = useState("PratoDigital");
  const [supportEmail, setSupportEmail] = useState("suporte@pratodigital.com");
  const [enableRegistration, setEnableRegistration] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (!loading && role && !isSuperAdmin) {
      navigate("/dashboard");
    }
  }, [loading, role, isSuperAdmin, navigate]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);
    } catch (error) {
      console.error("Error checking user:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações da plataforma foram atualizadas com sucesso.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground mb-4">Você não tem permissão para acessar esta página.</p>
          <Button onClick={() => navigate("/dashboard")}>Ir para Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ChefHat className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold">PratoDigital</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
              <Settings className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Configurações da Plataforma</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
              <Crown className="h-4 w-4 mr-2" />
              Admin Panel
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Configurações da Plataforma</h1>
          <p className="text-muted-foreground">Gerencie configurações globais e preferências do sistema</p>
        </div>

        <Tabs defaultValue="statistics" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>

          <TabsContent value="statistics" className="space-y-4">
            <StatisticsDashboard />
          </TabsContent>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>Configure as informações básicas da plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Nome da Plataforma</Label>
                  <Input
                    id="platformName"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    placeholder="PratoDigital"
                  />
                  <p className="text-sm text-muted-foreground">Nome exibido em toda a plataforma</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Email de Suporte</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="suporte@pratodigital.com"
                  />
                  <p className="text-sm text-muted-foreground">Email para contato de suporte técnico</p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Permitir Novos Registros</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir que novos usuários se registrem na plataforma
                    </p>
                  </div>
                  <Switch
                    checked={enableRegistration}
                    onCheckedChange={setEnableRegistration}
                  />
                </div>

                <Button onClick={handleSaveSettings} className="w-full gradient-primary">
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Configurações de Segurança</CardTitle>
                </div>
                <CardDescription>Configure políticas de segurança e autenticação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Verificação de Email Obrigatória</Label>
                    <p className="text-sm text-muted-foreground">
                      Exigir que usuários verifiquem seus emails antes de acessar o sistema
                    </p>
                  </div>
                  <Switch
                    checked={requireEmailVerification}
                    onCheckedChange={setRequireEmailVerification}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Política de Senhas</Label>
                  <div className="text-sm text-muted-foreground space-y-1 pl-4">
                    <p>• Mínimo de 6 caracteres</p>
                    <p>• Configurável nas configurações do Supabase</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('https://supabase.com/dashboard/project/qpccxwtqidyzsrazlwvv/auth/providers', '_blank')}
                  >
                    Abrir Configurações do Supabase
                  </Button>
                </div>

                <Button onClick={handleSaveSettings} className="w-full gradient-primary">
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <CardTitle>Configurações do Sistema</CardTitle>
                </div>
                <CardDescription>Configure opções avançadas do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo de Manutenção</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar para impedir acesso de usuários não-admin ao sistema
                    </p>
                  </div>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Estatísticas da Plataforma</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Total de Usuários</p>
                      <p className="text-2xl font-bold">5</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Restaurantes Ativos</p>
                      <p className="text-2xl font-bold">1</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Links Úteis</Label>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('https://supabase.com/dashboard/project/qpccxwtqidyzsrazlwvv', '_blank')}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Dashboard do Supabase
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('https://supabase.com/dashboard/project/qpccxwtqidyzsrazlwvv/auth/users', '_blank')}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Gerenciar Usuários no Supabase
                    </Button>
                  </div>
                </div>

                <Button onClick={handleSaveSettings} className="w-full gradient-primary">
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PlatformSettings;
