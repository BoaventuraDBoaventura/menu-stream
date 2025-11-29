import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChefHat } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  phone: z.string().trim().min(1, "Telefone é obrigatório").max(20, "Telefone inválido"),
  restaurant: z.string().trim().min(1, "Nome do restaurante é obrigatório").max(100, "Nome muito longo"),
  message: z.string().trim().min(1, "Mensagem é obrigatória").max(1000, "Mensagem muito longa"),
});

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        title: "Mensagem enviada!",
        description: "Entraremos em contato em breve.",
      });
      
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro no formulário",
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
            <Link to="/">
              <Button variant="ghost" size="sm">Voltar</Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="gradient-primary">Entrar</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Contact Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold">Entre em Contato</h1>
            <p className="text-xl text-muted-foreground">
              Preencha o formulário e entraremos em contato em breve
            </p>
          </div>
          <Card className="border-2">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nome *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                    placeholder="Seu nome"
                    required
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                    placeholder="seu@email.com"
                    required
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Telefone *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                    placeholder="+258 XX XXX XXXX"
                    required
                    maxLength={20}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="restaurant" className="text-sm font-medium">
                    Nome do Restaurante *
                  </label>
                  <input
                    id="restaurant"
                    name="restaurant"
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                    placeholder="Nome do seu restaurante"
                    required
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Mensagem *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background resize-none"
                    placeholder="Conte-nos sobre o seu restaurante..."
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
                  {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Contact;
