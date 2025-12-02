import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, AlertTriangle } from "lucide-react";
import { subDays, subMonths, subYears } from "date-fns";

interface DataManagementProps {
  restaurantId: string;
}

export const DataManagement = ({ restaurantId }: DataManagementProps) => {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const [deleteRange, setDeleteRange] = useState<string>("all");
  const [isOpen, setIsOpen] = useState(false);

  const handleDeleteOrders = async () => {
    setDeleting(true);
    try {
      let query = supabase
        .from("orders")
        .delete()
        .eq("restaurant_id", restaurantId);

      // Apply date filter if not "all"
      if (deleteRange !== "all") {
        const now = new Date();
        let cutoffDate: Date;

        switch (deleteRange) {
          case "7days":
            cutoffDate = subDays(now, 7);
            break;
          case "30days":
            cutoffDate = subDays(now, 30);
            break;
          case "3months":
            cutoffDate = subMonths(now, 3);
            break;
          case "6months":
            cutoffDate = subMonths(now, 6);
            break;
          case "1year":
            cutoffDate = subYears(now, 1);
            break;
          default:
            cutoffDate = new Date(0); // Beginning of time
        }

        query = query.lte("created_at", cutoffDate.toISOString());
      }

      const { error, count } = await query;

      if (error) throw error;

      toast({
        title: "Dados deletados com sucesso",
        description: `${count || 0} pedidos foram removidos do sistema.`,
      });

      setIsOpen(false);
    } catch (error: any) {
      console.error("Error deleting orders:", error);
      toast({
        title: "Erro ao deletar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const getRangeDescription = () => {
    switch (deleteRange) {
      case "all":
        return "todos os pedidos";
      case "7days":
        return "pedidos com mais de 7 dias";
      case "30days":
        return "pedidos com mais de 30 dias";
      case "3months":
        return "pedidos com mais de 3 meses";
      case "6months":
        return "pedidos com mais de 6 meses";
      case "1year":
        return "pedidos com mais de 1 ano";
      default:
        return "os dados selecionados";
    }
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
        </div>
        <CardDescription>
          Ações irreversíveis que afetam permanentemente os dados do restaurante
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Delete Orders Section */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Limpar Dados de Vendas</h3>
            <p className="text-sm text-muted-foreground">
              Remove pedidos e dados de vendas do sistema. Esta ação não pode ser desfeita.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delete-range">Período a deletar</Label>
            <Select value={deleteRange} onValueChange={setDeleteRange}>
              <SelectTrigger id="delete-range">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os pedidos</SelectItem>
                <SelectItem value="7days">Mais de 7 dias</SelectItem>
                <SelectItem value="30days">Mais de 30 dias</SelectItem>
                <SelectItem value="3months">Mais de 3 meses</SelectItem>
                <SelectItem value="6months">Mais de 6 meses</SelectItem>
                <SelectItem value="1year">Mais de 1 ano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Dados de Vendas
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Confirmar Exclusão de Dados
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>
                    Esta ação vai <strong className="text-destructive">deletar permanentemente {getRangeDescription()}</strong> deste restaurante.
                  </p>
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 space-y-2">
                    <p className="font-semibold text-sm">⚠️ Atenção:</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Os pedidos serão removidos permanentemente</li>
                      <li>Os itens dos pedidos também serão deletados</li>
                      <li>Esta ação não pode ser desfeita</li>
                      <li>Os relatórios e estatísticas serão afetados</li>
                    </ul>
                  </div>
                  <p className="text-sm">
                    Tem certeza que deseja continuar?
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteOrders}
                  disabled={deleting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {deleting ? "Deletando..." : "Sim, Deletar Dados"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="bg-muted/50 border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">
            <strong>Nota:</strong> Apenas o proprietário do restaurante ou administradores com permissões adequadas podem executar esta ação.
            Recomendamos fazer backup dos dados antes de realizar exclusões permanentes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
