import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, CheckCircle2, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Pricing = () => {
  const { language, setLanguage, t } = useLanguage();
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  <Globe className="h-4 w-4 mr-2" />
                  {language === "pt" ? "PT" : "EN"}
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
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">{t("pricing.header.back")}</Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="gradient-primary text-xs sm:text-sm px-3 sm:px-4">{t("pricing.header.login")}</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-3 sm:space-y-4 mb-10 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold px-4">{t("pricing.title")}</h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              {t("pricing.subtitle")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Plano Básico */}
            <Card className="border-2 border-border hover:border-primary transition-all shadow-sm hover:shadow-elegant">
              <CardHeader className="text-center pb-6 pt-8 px-4">
                <CardTitle className="text-xl sm:text-2xl mb-2">{t("pricing.plans.basic.name")}</CardTitle>
                <CardDescription className="text-sm">
                  {t("pricing.plans.basic.description")}
                </CardDescription>
                <div className="mt-6">
                  <div className="inline-flex items-baseline gap-2 bg-muted px-4 py-3 rounded-lg">
                    <span className="text-3xl sm:text-4xl font-bold">
                      {t("pricing.plans.basic.price")}
                    </span>
                    <span className="text-base text-muted-foreground">{t("pricing.plans.basic.period")}</span>
                  </div>
                  <p className="text-sm text-primary font-semibold mt-3">{t("pricing.plans.basic.restaurants")}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pb-8 px-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.unlimitedMenus")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.qrCodes")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.realTimeOrders")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.kitchenPanel")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.reports")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.teamManagement")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.prioritySupport")}</span>
                  </li>
                </ul>
                <Link to="/login" className="block">
                  <Button className="w-full gradient-primary text-sm py-5">
                    {t("pricing.cta.button")}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary shadow-elegant relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-semibold">
                {t("pricing.plans.growth.badge")}
              </div>
              <CardHeader className="text-center pb-6 pt-8 px-4">
                <CardTitle className="text-xl sm:text-2xl mb-2">{t("pricing.plans.growth.name")}</CardTitle>
                <CardDescription className="text-sm">
                  {t("pricing.plans.growth.description")}
                </CardDescription>
                <div className="mt-6">
                  <div className="inline-flex items-baseline gap-2 bg-primary px-4 py-3 rounded-lg">
                    <span className="text-3xl sm:text-4xl font-bold text-white">
                      {t("pricing.plans.growth.price")}
                    </span>
                    <span className="text-base text-white">{t("pricing.plans.growth.period")}</span>
                  </div>
                  <p className="text-sm text-white font-semibold mt-3">{t("pricing.plans.growth.restaurants")}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pb-8 px-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.unlimitedMenus")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.qrCodes")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.realTimeOrders")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.kitchenPanel")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.reports")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.teamManagement")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.prioritySupport")}</span>
                  </li>
                </ul>
                <Link to="/login" className="block">
                  <Button className="w-full gradient-primary text-sm py-5">
                    {t("pricing.cta.button")}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Plano Profissional */}
            <Card className="border-2 border-border hover:border-primary transition-all shadow-sm hover:shadow-elegant">
              <CardHeader className="text-center pb-6 pt-8 px-4">
                <CardTitle className="text-xl sm:text-2xl mb-2">{t("pricing.plans.professional.name")}</CardTitle>
                <CardDescription className="text-sm">
                  {t("pricing.plans.professional.description")}
                </CardDescription>
                <div className="mt-6">
                  <div className="inline-flex items-baseline gap-2 bg-muted px-4 py-3 rounded-lg">
                    <span className="text-3xl sm:text-4xl font-bold">
                      {t("pricing.plans.professional.price")}
                    </span>
                    <span className="text-base text-muted-foreground">{t("pricing.plans.professional.period")}</span>
                  </div>
                  <p className="text-sm text-primary font-semibold mt-3">{t("pricing.plans.professional.restaurants")}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pb-8 px-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.unlimitedMenus")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.qrCodes")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.realTimeOrders")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.kitchenPanel")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.reports")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.teamManagement")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.prioritySupport")}</span>
                  </li>
                </ul>
                <Link to="/login" className="block">
                  <Button className="w-full gradient-primary text-sm py-5">
                    {t("pricing.cta.button")}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Plano Enterprise */}
            <Card className="border-2 border-accent shadow-elegant">
              <CardHeader className="text-center pb-6 pt-8 px-4">
                <CardTitle className="text-xl sm:text-2xl mb-2">{t("pricing.plans.enterprise.name")}</CardTitle>
                <CardDescription className="text-sm">
                  {t("pricing.plans.enterprise.description")}
                </CardDescription>
                <div className="mt-6">
                  <div className="inline-flex items-baseline gap-2 bg-accent px-4 py-3 rounded-lg">
                    <span className="text-3xl sm:text-4xl font-bold text-accent-foreground">
                      {t("pricing.plans.enterprise.price")}
                    </span>
                    <span className="text-base text-accent-foreground">{t("pricing.plans.enterprise.period")}</span>
                  </div>
                  <p className="text-sm text-accent font-semibold mt-3">{t("pricing.plans.enterprise.restaurants")}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pb-8 px-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.unlimitedMenus")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.qrCodes")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.realTimeOrders")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.kitchenPanel")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.reports")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.teamManagement")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t("pricing.features.prioritySupport")}</span>
                  </li>
                </ul>
                <Link to="/login" className="block">
                  <Button className="w-full gradient-primary text-sm py-5">
                    {t("pricing.cta.button")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="mt-10 sm:mt-16 text-center space-y-3 sm:space-y-4 px-4">
            <p className="text-sm sm:text-base text-muted-foreground">
              {t("pricing.footer.allFeatures")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 pt-2 sm:pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground">{t("pricing.footer.noCreditCard")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground">{t("pricing.footer.freeTrial")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
