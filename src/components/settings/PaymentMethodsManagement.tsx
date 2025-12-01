import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethod {
  id: string;
  name: string;
  is_enabled: boolean;
  position: number;
}

interface PaymentMethodsManagementProps {
  restaurantId: string;
}

export const PaymentMethodsManagement = ({ restaurantId }: PaymentMethodsManagementProps) => {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMethodName, setNewMethodName] = useState("");
  const [addingNew, setAddingNew] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, [restaurantId]);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("position", { ascending: true });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os métodos de pagamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = async () => {
    if (!newMethodName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite um nome para o método de pagamento",
        variant: "destructive",
      });
      return;
    }

    setAddingNew(true);
    try {
      const maxPosition = paymentMethods.length > 0
        ? Math.max(...paymentMethods.map(m => m.position))
        : -1;

      const { error } = await supabase
        .from("payment_methods")
        .insert({
          restaurant_id: restaurantId,
          name: newMethodName.trim(),
          is_enabled: true,
          position: maxPosition + 1,
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Método de pagamento adicionado",
      });

      setNewMethodName("");
      fetchPaymentMethods();
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o método de pagamento",
        variant: "destructive",
      });
    } finally {
      setAddingNew(false);
    }
  };

  const handleToggleEnabled = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("payment_methods")
        .update({ is_enabled: !currentValue })
        .eq("id", id);

      if (error) throw error;

      setPaymentMethods(methods =>
        methods.map(m => m.id === id ? { ...m, is_enabled: !currentValue } : m)
      );

      toast({
        title: "Atualizado",
        description: "Status do método de pagamento alterado",
      });
    } catch (error) {
      console.error("Error toggling payment method:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o método de pagamento",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este método de pagamento?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Excluído",
        description: "Método de pagamento removido",
      });

      fetchPaymentMethods();
    } catch (error) {
      console.error("Error deleting payment method:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o método de pagamento",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pagamento</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métodos de Pagamento</CardTitle>
        <CardDescription>
          Gerencie os métodos de pagamento disponíveis para os clientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Payment Methods */}
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-card"
            >
              <div className="flex items-center gap-3 flex-1">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{method.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`enabled-${method.id}`} className="text-sm cursor-pointer">
                    {method.is_enabled ? "Ativo" : "Inativo"}
                  </Label>
                  <Switch
                    id={`enabled-${method.id}`}
                    checked={method.is_enabled}
                    onCheckedChange={() => handleToggleEnabled(method.id, method.is_enabled)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(method.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Payment Method */}
        <div className="pt-4 border-t">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Nome do método de pagamento (ex: PIX, Dinheiro)"
                value={newMethodName}
                onChange={(e) => setNewMethodName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddMethod()}
              />
            </div>
            <Button
              onClick={handleAddMethod}
              disabled={addingNew || !newMethodName.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
