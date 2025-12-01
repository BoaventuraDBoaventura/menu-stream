import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChefHat, Mail, Phone, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Contact = () => {
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactSchema = z.object({
    name: z.string().trim().min(1, t("contact.validation.nameRequired")).max(100, t("contact.validation.nameTooLong")),
    email: z.string().trim().email(t("contact.validation.emailInvalid")).max(255, t("contact.validation.emailTooLong")),
    phone: z.string().trim().min(1, t("contact.validation.phoneRequired")).max(20, t("contact.validation.phoneInvalid")),
    restaurant: z.string().trim().min(1, t("contact.validation.restaurantRequired")).max(100, t("contact.validation.restaurantTooLong")),
    message: z.string().trim().min(1, t("contact.validation.messageRequired")).max(1000, t("contact.validation.messageTooLong")),
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      restaurant: formData.get("restaurant") as string,
      message: formData.get("message") as string,
    };

    try {
      const validated = contactSchema.parse(data);
      
      // Here you would send to your backend/edge function
      // For now, just show success message
      toast({
        title: t("contact.form.success"),
        description: t("contact.form.successDescription"),
      });
      
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t("contact.form.error"),
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <Link to="/">
              <Button variant="ghost" size="sm">{t("contact.header.back")}</Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="gradient-primary">{t("contact.header.login")}</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Contact Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold">{t("contact.title")}</h1>
            <p className="text-xl text-muted-foreground">
              {t("contact.subtitle")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="border-2">
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">{t("contact.info.title")}</h2>
                    <p className="text-muted-foreground mb-6">
                      {t("contact.info.description")}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{t("contact.info.phone")}</h3>
                        <a href="tel:+258846004801" className="text-muted-foreground hover:text-primary transition-smooth block">
                          +258 84 600 4801
                        </a>
                        <a href="tel:+258869464474" className="text-muted-foreground hover:text-primary transition-smooth block">
                          +258 86 946 4474
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{t("contact.info.email")}</h3>
                        <a href="mailto:boaven00@gmail.com" className="text-muted-foreground hover:text-primary transition-smooth">
                          boaven00@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      {t("contact.info.hours")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Contact Form */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-6">{t("contact.form.title")}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      {t("contact.form.name")} *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                      placeholder={t("contact.form.namePlaceholder")}
                      required
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      {t("contact.form.email")} *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                      placeholder={t("contact.form.emailPlaceholder")}
                      required
                      maxLength={255}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      {t("contact.form.phone")} *
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                      placeholder={t("contact.form.phonePlaceholder")}
                      required
                      maxLength={20}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="restaurant" className="text-sm font-medium">
                      {t("contact.form.restaurant")} *
                    </label>
                    <input
                      id="restaurant"
                      name="restaurant"
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                      placeholder={t("contact.form.restaurantPlaceholder")}
                      required
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      {t("contact.form.message")} *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background resize-none"
                      placeholder={t("contact.form.messagePlaceholder")}
                      required
                      maxLength={1000}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full gradient-primary text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t("contact.form.submitting") : t("contact.form.submit")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
