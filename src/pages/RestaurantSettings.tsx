import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChefHat, ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const RestaurantSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get("restaurant");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    language: "pt",
    currency: "MZN"
  });

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurant();
    } else {
      toast({
        title: "Erro",
        description: "ID do restaurante não fornecido",
        variant: "destructive"
      });
      navigate("/dashboard");
    }
  }, [restaurantId]);

  const fetchRestaurant = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", restaurantId)
        .single();

      if (error) throw error;

      setRestaurant(data);
      const settings = data.settings as { language?: string } | null;
      setFormData({
        name: data.name || "",
        language: settings?.language || "pt",
        currency: data.currency || "MZN"
      });
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações do restaurante",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentSettings = (restaurant?.settings as { language?: string } | null) || {};
      const { error } = await supabase
        .from("restaurants")
        .update({
          name: formData.name,
          currency: formData.currency,
          settings: {
            ...currentSettings,
            language: formData.language
          }
        })
        .eq("id", restaurantId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações atualizadas com sucesso"
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating restaurant:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold">PratoDigital</span>
          </div>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Painel
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Configurações do Restaurante</h1>
          <p className="text-muted-foreground">
            Configure as preferências do seu restaurante
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
            <CardDescription>
              Atualize o nome, idioma e moeda do seu restaurante
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Restaurant Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Restaurante *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Digite o nome do restaurante"
                maxLength={100}
              />
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">Idioma do Sistema *</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Selecione o idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="en">Inglês</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                O idioma em que o sistema será exibido para você
              </p>
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">Moeda *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Selecione a moeda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MZN">Metical (MZN)</SelectItem>
                  <SelectItem value="ZAR">Rand (ZAR)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                A moeda em que os preços serão exibidos
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving || !formData.name}
                className="gradient-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Salvando..." : "Salvar Configurações"}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
                disabled={saving}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RestaurantSettings;
