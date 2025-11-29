import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            <span className="text-lg sm:text-xl font-bold">PratoDigital</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Voltar</Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="gradient-primary text-xs sm:text-sm px-3 sm:px-4">Entrar</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-3 sm:space-y-4 mb-10 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold px-4">Preço Simples e Transparente</h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Um único plano com todas as funcionalidades
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <Card className="border-2 border-primary shadow-elegant">
              <CardHeader className="text-center pb-6 sm:pb-8 pt-8 sm:pt-12 px-4 sm:px-6">
                <CardTitle className="text-2xl sm:text-3xl mb-2">Plano Mensal</CardTitle>
                <CardDescription className="text-base sm:text-lg">
                  Tudo que você precisa para digitalizar seu restaurante
                </CardDescription>
                <div className="mt-6 sm:mt-8">
                  <div className="inline-flex items-baseline gap-2 bg-primary px-6 sm:px-8 py-3 sm:py-4 rounded-lg">
                    <span className="text-4xl sm:text-5xl font-bold text-white">
                      1.500
                    </span>
                    <span className="text-lg sm:text-xl text-white">MT/mês</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 pb-8 sm:pb-12 px-4 sm:px-6">
                <ul className="space-y-3 sm:space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">Menus digitais ilimitados</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">Códigos QR para todas as mesas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">Gestão de pedidos em tempo real</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">Painel de cozinha completo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">Relatórios e análises detalhadas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">Gestão de equipa e permissões</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">Suporte técnico prioritário</span>
                  </li>
                </ul>
                <Link to="/login" className="block">
                  <Button className="w-full gradient-primary text-base sm:text-lg py-5 sm:py-6">
                    Começar Agora
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="mt-10 sm:mt-16 text-center space-y-3 sm:space-y-4 px-4">
            <p className="text-sm sm:text-base text-muted-foreground">
              Todas as funcionalidades incluídas. Sem custos escondidos.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 pt-2 sm:pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground">Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground">14 dias de teste</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
