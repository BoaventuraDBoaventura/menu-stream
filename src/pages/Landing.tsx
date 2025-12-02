import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { QrCode, Smartphone, TrendingUp, Zap, CheckCircle2, ChefHat, Menu, X, Globe } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { platformName } = usePlatformSettings();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            <span className="text-lg sm:text-xl font-bold">{platformName}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-smooth">
              {t("landing.header.features")}
            </a>
            <Link to="/precos" className="text-sm font-medium hover:text-primary transition-smooth">
              {t("landing.header.pricing")}
            </Link>
            <Link to="/contato" className="text-sm font-medium hover:text-primary transition-smooth">
              {t("landing.header.contact")}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Globe className="h-4 w-4 mr-2" />
                  {language === "pt" ? "PT" : "EN"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("pt")}>
                  🇵🇹 Português
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("en")}>
                  🇬🇧 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/login">
              <Button variant="ghost" size="sm">{t("landing.header.login")}</Button>
            </Link>
          </nav>
          <div className="md:hidden flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("pt")}>
                  🇵🇹 PT
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("en")}>
                  🇬🇧 EN
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/login">
              <Button size="sm" className="gradient-primary text-xs px-3">{t("landing.header.login")}</Button>
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
                {t("landing.header.features")}
              </a>
              <Link
                to="/precos"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium hover:text-primary transition-smooth py-2"
              >
                {t("landing.header.pricing")}
              </Link>
              <Link
                to="/contato"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium hover:text-primary transition-smooth py-2"
              >
                {t("landing.header.contact")}
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
                <span className="text-xs sm:text-sm font-medium text-primary">{t("landing.hero.badge")}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {t("landing.hero.title")}{" "}
                <span className="text-primary">
                  {t("landing.hero.titleHighlight")}
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed">
                {t("landing.hero.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link to="/login" className="w-full sm:w-auto">
                  <Button size="lg" className="gradient-primary shadow-glow text-base sm:text-lg px-6 sm:px-8 w-full">
                    {t("landing.hero.loginButton")}
                  </Button>
                </Link>
                <Link to="/contato" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 w-full">
                    {t("landing.hero.demoButton")}
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 pt-2 sm:pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-muted-foreground">{t("landing.hero.noCreditCard")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-muted-foreground">{t("landing.hero.freeTrial")}</span>
                </div>
              </div>
            </div>
            <div className="relative mt-8 lg:mt-0">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-border">
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                  <div className="text-center space-y-3 sm:space-y-4 p-6 sm:p-8">
                    <Smartphone className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 text-primary mx-auto animate-pulse" />
                    <p className="text-sm sm:text-base lg:text-lg font-semibold">{t("landing.hero.interactivePreview")}</p>
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
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">{t("landing.features.title")}</h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              {t("landing.features.subtitle")}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <FeatureCard
              icon={<QrCode className="h-10 w-10 text-primary" />}
              title={t("landing.features.qrMenus.title")}
              description={t("landing.features.qrMenus.description")}
            />
            <FeatureCard
              icon={<Smartphone className="h-10 w-10 text-primary" />}
              title={t("landing.features.mobileFirst.title")}
              description={t("landing.features.mobileFirst.description")}
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10 text-primary" />}
              title={t("landing.features.realtime.title")}
              description={t("landing.features.realtime.description")}
            />
            <FeatureCard
              icon={<TrendingUp className="h-10 w-10 text-primary" />}
              title={t("landing.features.analytics.title")}
              description={t("landing.features.analytics.description")}
            />
            <FeatureCard
              icon={<CheckCircle2 className="h-10 w-10 text-primary" />}
              title={t("landing.features.easyUpdates.title")}
              description={t("landing.features.easyUpdates.description")}
            />
            <FeatureCard
              icon={<ChefHat className="h-10 w-10 text-primary" />}
              title={t("landing.features.kitchenManagement.title")}
              description={t("landing.features.kitchenManagement.description")}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-2xl sm:rounded-3xl gradient-hero p-8 sm:p-10 lg:p-12 text-center text-white shadow-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              {t("landing.cta.title")}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 px-4">
              {t("landing.cta.subtitle")}
            </p>
            <Link to="/login">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-base sm:text-lg px-6 sm:px-8">
                {t("landing.cta.button")}
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
                <span className="font-bold">{platformName}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("landing.footer.description")}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t("landing.footer.product")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-smooth">{t("landing.header.features")}</a></li>
                <li><Link to="/precos" className="hover:text-primary transition-smooth">{t("landing.header.pricing")}</Link></li>
                <li><Link to="/contato" className="hover:text-primary transition-smooth">{t("landing.header.contact")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t("landing.footer.company")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">{t("landing.footer.about")}</a></li>
                <li><Link to="/contato" className="hover:text-primary transition-smooth">{t("landing.header.contact")}</Link></li>
                <li><a href="#" className="hover:text-primary transition-smooth">{t("landing.footer.support")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t("landing.footer.legal")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">{t("landing.footer.privacy")}</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">{t("landing.footer.terms")}</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} {platformName}. {t("landing.footer.copyright")}</p>
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
