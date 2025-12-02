import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { RestaurantCard } from "@/components/dashboard/RestaurantCard";

const Restaurants = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [maxRestaurants, setMaxRestaurants] = useState<number | null>(null);
  const { role, isSuperAdmin } = useUserRole(user?.id);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);

      // Fetch user's max_restaurants limit
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("max_restaurants")
        .eq("user_id", user.id)
        .single();
      
      setMaxRestaurants(roleData?.max_restaurants ?? null);

      // Fetch user's restaurants
      const { data: restaurantsData } = await supabase
        .from("restaurants")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch user permissions
      const { data: permissionsData } = await supabase
        .from("restaurant_permissions")
        .select("restaurant_id, permissions")
        .eq("user_id", user.id);

      const permissionsMap: Record<string, any> = {};
      permissionsData?.forEach(perm => {
        permissionsMap[perm.restaurant_id] = perm.permissions;
      });

      const restaurantsWithOwnership = restaurantsData?.map(restaurant => ({
        ...restaurant,
        isOwner: restaurant.owner_id === user.id,
        permissions: restaurant.owner_id === user.id 
          ? { menu_editor: true, qr_codes: true, orders: true, kitchen: true, settings: true, reports: true }
          : permissionsMap[restaurant.id] || {}
      })) || [];

      setRestaurants(restaurantsWithOwnership);
    } catch (error: any) {
      console.error("Error fetching restaurants:", error);
      toast({
        title: "Erro ao carregar restaurantes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canCreateRestaurant = () => {
    if (isSuperAdmin) return true;
    if (role !== 'restaurant_admin') return false;
    
    const ownedRestaurantsCount = restaurants.filter(r => r.owner_id === user?.id).length;
    return maxRestaurants === null || ownedRestaurantsCount < maxRestaurants;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">Meus Restaurantes</h1>
          <p className="text-muted-foreground">
            Gerencie todos os seus restaurantes em um só lugar
          </p>
        </div>
        
        {canCreateRestaurant() && (
          <Button onClick={() => navigate("/restaurant/create")} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Novo Restaurante
          </Button>
        )}
      </div>

      {/* Restaurant Limit Info */}
      {!isSuperAdmin && maxRestaurants !== null && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Limite de Restaurantes</CardTitle>
            <CardDescription>
              Você pode criar até {maxRestaurants} restaurante{maxRestaurants > 1 ? 's' : ''}.
              Atualmente possui {restaurants.filter(r => r.owner_id === user?.id).length}.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Restaurants Grid */}
      {restaurants.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold">Nenhum restaurante encontrado</h3>
              <p className="text-muted-foreground">
                Comece criando seu primeiro restaurante
              </p>
              {canCreateRestaurant() && (
                <Button onClick={() => navigate("/restaurant/create")} size="lg" className="mt-4">
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Primeiro Restaurante
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Restaurants;
