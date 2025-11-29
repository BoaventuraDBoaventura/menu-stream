import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, LogOut, ArrowLeft, Plus, Loader2, Users, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddTeamMemberDialog } from "@/components/team/AddTeamMemberDialog";
import { EditPermissionsDialog } from "@/components/team/EditPermissionsDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
    reports: boolean;
  };
}

const TeamManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get("restaurant");
  
  const [user, setUser] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    checkAccess();
  }, [restaurantId]);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);

      if (!restaurantId) {
        navigate("/dashboard");
        return;
      }

      // Check if user is owner or has permission
      const { data: restaurantData, error: restaurantError } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", restaurantId)
        .single();

      if (restaurantError || !restaurantData) {
        toast({
          title: "Erro",
          description: "Restaurante não encontrado",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setRestaurant(restaurantData);
      await fetchTeamMembers();
    } catch (error) {
      console.error("Error checking access:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      // Fetch all permissions for this restaurant
      const { data: permissions, error: permError } = await supabase
        .from("restaurant_permissions")
        .select("*")
        .eq("restaurant_id", restaurantId);

      if (permError) throw permError;

      // Fetch profiles for these users
      const userIds = permissions?.map(p => p.user_id) || [];
      
      if (userIds.length === 0) {
        setTeamMembers([]);
        return;
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      // Fetch roles
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds);

      // Fetch emails
      const { data: authUsers } = await supabase.rpc("get_all_users_for_admin");

      // Combine data
      const members: TeamMember[] = (permissions || []).map(perm => {
        const profile = profiles?.find(p => p.id === perm.user_id);
        const userRole = roles?.find(r => r.user_id === perm.user_id);
        const authUser = authUsers?.find((u: any) => u.id === perm.user_id);

        // Parse permissions with type safety
        const perms = (perm.permissions as any) || {
          menu_editor: true,
          qr_codes: true,
          orders: true,
          kitchen: true,
          settings: false,
        };

        return {
          id: perm.id,
          user_id: perm.user_id,
          name: profile?.name || "N/A",
          email: authUser?.email || "N/A",
          role: userRole?.role || "staff",
          permissions: {
            menu_editor: perms.menu_editor ?? true,
            qr_codes: perms.qr_codes ?? true,
            orders: perms.orders ?? true,
            kitchen: perms.kitchen ?? true,
            settings: perms.settings ?? false,
            reports: perms.reports ?? false,
          },
        };
      });

      setTeamMembers(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a equipe",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMember = async (permissionId: string, userName: string) => {
    try {
      const { error } = await supabase
        .from("restaurant_permissions")
        .delete()
        .eq("id", permissionId);

      if (error) throw error;

      toast({
        title: "Membro removido",
        description: `${userName} foi removido da equipe`,
      });

      fetchTeamMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ChefHat className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold">PratoDigital</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Gestão de Equipe</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Gestão de Equipe</h1>
          <p className="text-muted-foreground">
            {restaurant?.name} - Gerencie membros da equipe e suas permissões
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Membros da Equipe</CardTitle>
                <CardDescription>
                  Adicione membros e defina quais módulos cada um pode acessar
                </CardDescription>
              </div>
              <Button onClick={() => setAddDialogOpen(true)} className="gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Membro
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum membro na equipe ainda</p>
                <Button onClick={() => setAddDialogOpen(true)} variant="outline" className="mt-4">
                  Adicionar Primeiro Membro
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Permissões</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Badge variant={member.role === "restaurant_admin" ? "default" : "secondary"}>
                            {member.role === "restaurant_admin" ? "Admin" : "Staff"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {member.permissions.menu_editor && (
                              <Badge variant="outline" className="text-xs">Menu</Badge>
                            )}
                            {member.permissions.qr_codes && (
                              <Badge variant="outline" className="text-xs">QR</Badge>
                            )}
                            {member.permissions.orders && (
                              <Badge variant="outline" className="text-xs">Pedidos</Badge>
                            )}
                            {member.permissions.kitchen && (
                              <Badge variant="outline" className="text-xs">Cozinha</Badge>
                            )}
                            {member.permissions.settings && (
                              <Badge variant="outline" className="text-xs">Config</Badge>
                            )}
                            {member.permissions.reports && (
                              <Badge variant="outline" className="text-xs">Relatórios</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedMember(member);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover Membro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover {member.name} da equipe?
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteMember(member.id, member.name)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AddTeamMemberDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        restaurantId={restaurantId!}
        onSuccess={fetchTeamMembers}
      />

      {selectedMember && (
        <EditPermissionsDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          member={selectedMember}
          onSuccess={fetchTeamMembers}
        />
      )}
    </div>
  );
};

export default TeamManagement;
