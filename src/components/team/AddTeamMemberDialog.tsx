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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const createMemberSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  phone: z.string().trim().optional(),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["restaurant_admin", "staff"]),
  permissions: z.object({
    menu_editor: z.boolean(),
    qr_codes: z.boolean(),
    orders: z.boolean(),
    kitchen: z.boolean(),
    settings: z.boolean(),
  }),
});

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  onSuccess: () => void;
}

export const AddTeamMemberDialog = ({
  open,
  onOpenChange,
  restaurantId,
  onSuccess,
}: AddTeamMemberDialogProps) => {
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);

  const form = useForm<z.infer<typeof createMemberSchema>>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "staff",
      permissions: {
        menu_editor: true,
        qr_codes: true,
        orders: true,
        kitchen: true,
        settings: false,
      },
    },
  });

  const handleSubmit = async (values: z.infer<typeof createMemberSchema>) => {
    try {
      setCreating(true);

      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
            phone: values.phone,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Falha ao criar usuário");
      }

      // Check if this was a repeated signup (user already exists)
      const { data: existingPermission } = await supabase
        .from("restaurant_permissions")
        .select("id")
        .eq("user_id", authData.user.id)
        .eq("restaurant_id", restaurantId)
        .maybeSingle();

      if (existingPermission) {
        throw new Error("Este email já está cadastrado como membro desta equipe.");
      }

      // Check if user already has a role (meaning they were created before)
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (existingRole) {
        throw new Error("Este email já está cadastrado no sistema. Use um email diferente.");
      }

      // Wait for profile to be created by trigger and verify it exists
      let profileExists = false;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!profileExists && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: profileCheck } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", authData.user.id)
          .maybeSingle();
        
        if (profileCheck) {
          profileExists = true;
        } else {
          attempts++;
        }
      }

      if (!profileExists) {
        throw new Error("Falha ao criar perfil do usuário. Por favor, tente novamente.");
      }

      // Update the role created by the trigger
      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ role: values.role })
        .eq("user_id", authData.user.id);

      if (roleError) throw roleError;

      // Add restaurant permission with granular permissions
      const { error: permError } = await supabase
        .from("restaurant_permissions")
        .insert({
          user_id: authData.user.id,
          restaurant_id: restaurantId,
          permissions: values.permissions,
        });

      if (permError) throw permError;

      toast({
        title: "Membro adicionado",
        description: "Novo membro foi adicionado à equipe com sucesso.",
      });

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error creating member:", error);
      toast({
        title: "Erro ao criar membro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Membro da Equipe</DialogTitle>
          <DialogDescription>
            Crie uma nova conta e defina as permissões de acesso aos módulos
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="joao@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+258 84 000 0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma função" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="restaurant_admin">Admin do Restaurante</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-4" />

            <div className="space-y-4">
              <Label className="text-base font-semibold">Permissões de Acesso</Label>
              <p className="text-sm text-muted-foreground">
                Selecione quais módulos este usuário pode acessar
              </p>

              <FormField
                control={form.control}
                name="permissions.menu_editor"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Editor de Menu</FormLabel>
                      <FormDescription>
                        Pode criar e editar itens do menu, categorias
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permissions.qr_codes"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Códigos QR</FormLabel>
                      <FormDescription>
                        Pode gerar e gerenciar QR codes das mesas
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permissions.orders"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Pedidos</FormLabel>
                      <FormDescription>
                        Pode visualizar e gerenciar pedidos
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permissions.kitchen"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Cozinha</FormLabel>
                      <FormDescription>
                        Pode acessar a tela da cozinha
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permissions.settings"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Configurações</FormLabel>
                      <FormDescription>
                        Pode editar configurações do restaurante
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Adicionar Membro
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
