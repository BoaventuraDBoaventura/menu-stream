import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { QrCode, Smartphone, TrendingUp, Zap, CheckCircle2, ChefHat, Menu, X } from "lucide-react";
import { useState } from "react";

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            <span className="text-lg sm:text-xl font-bold">PratoDigital</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-smooth">
              Funcionalidades
            </a>
            <Link to="/precos" className="text-sm font-medium hover:text-primary transition-smooth">
              Preços
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
          </nav>
          <div className="md:hidden flex items-center gap-2">
            <Link to="/login">
              <Button size="sm" className="gradient-primary text-xs px-3">Entrar</Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-lg">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium hover:text-primary transition-smooth py-2"
              >
                Funcionalidades
              </a>
              <Link
                to="/precos"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium hover:text-primary transition-smooth py-2"
              >
                Preços
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full border border-primary/20">
                <span className="text-xs sm:text-sm font-medium text-primary">🚀 Transforme Seu Restaurante</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Menus Digitais,{" "}
                <span className="text-primary">
                  Sem Complicação
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed">
                Crie menus digitais deslumbrantes, gere códigos QR para mesas e receba pedidos diretamente dos clientes. 
                Gerencie tudo a partir de um painel poderoso.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link to="/login" className="w-full sm:w-auto">
                  <Button size="lg" className="gradient-primary shadow-glow text-base sm:text-lg px-6 sm:px-8 w-full">
                    Entrar
                  </Button>
                </Link>
                <Link to="/contato" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 w-full">
                    Ver Demo
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 pt-2 sm:pt-4">
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
            <div className="relative mt-8 lg:mt-0">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-border">
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                  <div className="text-center space-y-3 sm:space-y-4 p-6 sm:p-8">
                    <Smartphone className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 text-primary mx-auto animate-pulse" />
                    <p className="text-sm sm:text-base lg:text-lg font-semibold">Visualização Interativa do Menu</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-16 h-16 sm:w-24 sm:h-24 bg-secondary rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 w-20 h-20 sm:w-32 sm:h-32 bg-primary rounded-full blur-3xl opacity-30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-3 sm:space-y-4 mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Tudo Que Você Precisa</h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Funcionalidades poderosas projetadas especificamente para restaurantes modernos
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-2xl sm:rounded-3xl gradient-hero p-8 sm:p-10 lg:p-12 text-center text-white shadow-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Pronto para Digitalizar?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 px-4">
              Junte-se a centenas de restaurantes que já usam PratoDigital
            </p>
            <Link to="/login">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-base sm:text-lg px-6 sm:px-8">
                Entrar Agora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 sm:py-10 lg:py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
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
                <li><a href="#features" className="hover:text-primary transition-smooth">Funcionalidades</a></li>
                <li><Link to="/precos" className="hover:text-primary transition-smooth">Preços</Link></li>
                <li><Link to="/contato" className="hover:text-primary transition-smooth">Contato</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Sobre</a></li>
                <li><Link to="/contato" className="hover:text-primary transition-smooth">Contacto</Link></li>
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
    <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-soft border border-border hover:shadow-medium transition-smooth">
      <div className="mb-3 sm:mb-4">{icon}</div>
      <h3 className="text-lg sm:text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
    </div>
  );
};

export default Landing;
