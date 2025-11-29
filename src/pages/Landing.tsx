import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { QrCode, Smartphone, TrendingUp, Zap, CheckCircle2, ChefHat } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold">PratoDigital</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-smooth">
              Funcionalidades
            </a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-smooth">
              Preços
            </a>
            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
          </nav>
          <div className="md:hidden">
            <Link to="/login">
              <Button size="sm" className="gradient-primary">Entrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <span className="text-sm font-medium text-primary">🚀 Transforme Seu Restaurante</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Menus Digitais,{" "}
                <span className="gradient-hero bg-clip-text text-transparent">
                  Sem Complicação
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Crie menus digitais deslumbrantes, gere códigos QR para mesas e receba pedidos diretamente dos clientes. 
                Gerencie tudo a partir de um painel poderoso.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login">
                  <Button size="lg" className="gradient-primary shadow-glow text-lg px-8 w-full sm:w-auto">
                    Entrar
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg px-8 w-full sm:w-auto">
                  Ver Demo
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
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
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border">
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <Smartphone className="h-24 w-24 text-primary mx-auto animate-pulse" />
                    <p className="text-lg font-semibold">Visualização Interativa do Menu</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary rounded-full blur-3xl opacity-30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">Tudo Que Você Precisa</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades poderosas projetadas especificamente para restaurantes modernos
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<QrCode className="h-10 w-10 text-primary" />}
              title="Menus com QR Code"
              description="Gere códigos QR únicos para cada mesa. Os clientes escaneiam e fazem pedidos instantaneamente sem esperar pelo atendimento."
            />
            <FeatureCard
              icon={<Smartphone className="h-10 w-10 text-primary" />}
              title="Design Mobile-First"
              description="Menus bonitos e responsivos que funcionam perfeitamente em qualquer dispositivo. Sem necessidade de instalar aplicativo."
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10 text-primary" />}
              title="Pedidos em Tempo Real"
              description="Receba pedidos instantaneamente no seu painel com atualizações ao vivo. Nunca mais perca um pedido."
            />
            <FeatureCard
              icon={<TrendingUp className="h-10 w-10 text-primary" />}
              title="Análises e Relatórios"
              description="Acompanhe seus itens mais vendidos, horários de pico e receita com análises detalhadas."
            />
            <FeatureCard
              icon={<CheckCircle2 className="h-10 w-10 text-primary" />}
              title="Atualizações Fáceis do Menu"
              description="Atualize preços, adicione itens ou marque pratos como indisponíveis em segundos de qualquer lugar."
            />
            <FeatureCard
              icon={<ChefHat className="h-10 w-10 text-primary" />}
              title="Gestão de Cozinha"
              description="Imprima tickets automaticamente e atualize o status do pedido da preparação à entrega."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">Preço Simples e Transparente</h2>
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
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-6xl font-bold gradient-hero bg-clip-text text-transparent">
                      1.500
                    </span>
                    <span className="text-2xl text-muted-foreground">MT/mês</span>
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-3xl gradient-hero p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Pronto para Digitalizar?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Junte-se a centenas de restaurantes que já usam PratoDigital
            </p>
            <Link to="/login">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8">
                Entrar Agora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ChefHat className="h-6 w-6 text-primary" />
                <span className="font-bold">PratoDigital</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Soluções modernas de menu digital para restaurantes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Preços</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Sobre</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Contacto</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Suporte</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Privacidade</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Termos</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2024 PratoDigital. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft border border-border hover:shadow-medium transition-smooth">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Landing;
