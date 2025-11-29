import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Eye, Trash2, Loader2, Store } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  owner: {
    name: string;
    email: string;
  } | null;
}

export const RestaurantManagement = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);

      const { data: restaurantsData, error: restaurantsError } = await supabase
        .from("restaurants")
        .select(`
          id,
          name,
          slug,
          address,
          phone,
          email,
          is_active,
          created_at,
          owner_id
        `)
        .order("created_at", { ascending: false });

      if (restaurantsError) throw restaurantsError;

      // Fetch owner profiles
      const ownerIds = restaurantsData?.map((r: any) => r.owner_id) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", ownerIds);

      // Fetch owner emails using the secure function
      const { data: authUsersData, error: authError } = await supabase.rpc("get_all_users_for_admin");

      if (authError) {
        console.error("Error fetching auth users:", authError);
      }

      const restaurantsWithOwners = (restaurantsData || []).map((restaurant: any) => {
        const profile = profiles?.find((p: any) => p.id === restaurant.owner_id);
        const authUser = authUsersData?.find((u: any) => u.id === restaurant.owner_id);

        return {
          ...restaurant,
          owner: profile && authUser ? {
            name: profile.name,
            email: authUser.email || "N/A",
          } : null,
        };
      });

      setRestaurants(restaurantsWithOwners);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar restaurantes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (restaurantId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("restaurants")
        .update({ is_active: !currentStatus })
        .eq("id", restaurantId);

      if (error) throw error;

      toast({
        title: currentStatus ? "Restaurante desativado" : "Restaurante ativado",
        description: "O status do restaurante foi atualizado.",
      });

      fetchRestaurants();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar restaurante",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (restaurantId: string) => {
    try {
      const { error } = await supabase
        .from("restaurants")
        .delete()
        .eq("id", restaurantId);

      if (error) throw error;

      toast({
        title: "Restaurante deletado",
        description: "O restaurante foi deletado permanentemente.",
      });

      fetchRestaurants();
    } catch (error: any) {
      toast({
        title: "Erro ao deletar restaurante",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (restaurants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Management</CardTitle>
          <CardDescription>View and manage all restaurants on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Store className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Nenhum restaurante ainda</p>
            <p className="text-sm text-muted-foreground">Os restaurantes aparecerão aqui quando forem criados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Restaurantes</CardTitle>
        <CardDescription>Visualize e gerencie todos os restaurantes na plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Proprietário</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restaurants.map((restaurant) => (
                <TableRow key={restaurant.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{restaurant.name}</p>
                      <p className="text-sm text-muted-foreground">/{restaurant.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {restaurant.owner ? (
                      <div>
                        <p className="font-medium">{restaurant.owner.name}</p>
                        <p className="text-sm text-muted-foreground">{restaurant.owner.email}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Sem proprietário</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {restaurant.phone && <p>{restaurant.phone}</p>}
                      {restaurant.email && <p className="text-muted-foreground">{restaurant.email}</p>}
                      {!restaurant.phone && !restaurant.email && (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={restaurant.is_active ? "default" : "secondary"}>
                      {restaurant.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(restaurant.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(restaurant.id, restaurant.is_active)}
                      >
                        {restaurant.is_active ? "Desativar" : "Ativar"}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deletar Restaurante?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Isso irá deletar permanentemente {restaurant.name} e todos os dados associados incluindo
                              menus, items, mesas e pedidos. Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(restaurant.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Deletar
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
      </CardContent>
    </Card>
  );
};
