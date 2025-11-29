import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ChefHat className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold">PratoDigital</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">Voltar</Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="gradient-primary">Entrar</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl md:text-5xl font-bold">Preço Simples e Transparente</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Um único plano com todas as funcionalidades
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <Card className="border-2 border-primary shadow-elegant">
              <CardHeader className="text-center pb-8 pt-12">
                <CardTitle className="text-3xl mb-2">Plano Mensal</CardTitle>
                <CardDescription className="text-lg">
                  Tudo que você precisa para digitalizar seu restaurante
                </CardDescription>
                <div className="mt-8">
                  <div className="inline-flex items-baseline gap-2 bg-primary px-8 py-4 rounded-lg">
                    <span className="text-5xl font-bold text-white">
                      1.500
                    </span>
                    <span className="text-xl text-white">MT/mês</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pb-12">
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Menus digitais ilimitados</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Códigos QR para todas as mesas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Gestão de pedidos em tempo real</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Painel de cozinha completo</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Relatórios e análises detalhadas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Gestão de equipa e permissões</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Suporte técnico prioritário</span>
                  </li>
                </ul>
                <Link to="/login" className="block">
                  <Button className="w-full gradient-primary text-lg py-6">
                    Começar Agora
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center space-y-4">
            <p className="text-muted-foreground">
              Todas as funcionalidades incluídas. Sem custos escondidos.
            </p>
            <div className="flex justify-center items-center gap-8 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                <span className="text-sm text-muted-foreground">Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                <span className="text-sm text-muted-foreground">14 dias de teste</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
