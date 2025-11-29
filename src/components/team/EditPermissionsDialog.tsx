import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { FormDescription } from "@/components/ui/form";

interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  permissions: {
    menu_editor: boolean;
    qr_codes: boolean;
    orders: boolean;
    kitchen: boolean;
    settings: boolean;
  };
}

interface EditPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember;
  onSuccess: () => void;
}

export const EditPermissionsDialog = ({
  open,
  onOpenChange,
  member,
  onSuccess,
}: EditPermissionsDialogProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState(member.permissions);

  const handleSave = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from("restaurant_permissions")
        .update({ permissions })
        .eq("id", member.id);

      if (error) throw error;

      toast({
        title: "Permissões atualizadas",
        description: `Permissões de ${member.name} foram atualizadas com sucesso.`,
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error updating permissions:", error);
      toast({
        title: "Erro ao atualizar permissões",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Permissões</DialogTitle>
          <DialogDescription>
            Atualize as permissões de acesso de {member.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Editor de Menu</Label>
              <FormDescription>
                Pode criar e editar itens do menu, categorias
              </FormDescription>
            </div>
            <Switch
              checked={permissions.menu_editor}
              onCheckedChange={(checked) =>
                setPermissions({ ...permissions, menu_editor: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Códigos QR</Label>
              <FormDescription>
                Pode gerar e gerenciar QR codes das mesas
              </FormDescription>
            </div>
            <Switch
              checked={permissions.qr_codes}
              onCheckedChange={(checked) =>
                setPermissions({ ...permissions, qr_codes: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Pedidos</Label>
              <FormDescription>
                Pode visualizar e gerenciar pedidos
              </FormDescription>
            </div>
            <Switch
              checked={permissions.orders}
              onCheckedChange={(checked) =>
                setPermissions({ ...permissions, orders: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Cozinha</Label>
              <FormDescription>
                Pode acessar a tela da cozinha
              </FormDescription>
            </div>
            <Switch
              checked={permissions.kitchen}
              onCheckedChange={(checked) =>
                setPermissions({ ...permissions, kitchen: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Configurações</Label>
              <FormDescription>
                Pode editar configurações do restaurante
              </FormDescription>
            </div>
            <Switch
              checked={permissions.settings}
              onCheckedChange={(checked) =>
                setPermissions({ ...permissions, settings: checked })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
