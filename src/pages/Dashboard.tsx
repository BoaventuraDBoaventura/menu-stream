import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, LayoutDashboard, Crown, Settings } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useLanguage } from "@/contexts/LanguageContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t, setActiveRestaurant } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [restaurantPermissions, setRestaurantPermissions] = useState<Record<string, any>>({});
  const { isSuperAdmin } = useUserRole(user?.id);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

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

      // Create permissions map
      const permissionsMap: Record<string, any> = {};
      permissionsData?.forEach(perm => {
        permissionsMap[perm.restaurant_id] = perm.permissions;
      });
      setRestaurantPermissions(permissionsMap);

      const restaurantsWithOwnership = restaurantsData?.map(restaurant => ({
        ...restaurant,
        isOwner: restaurant.owner_id === user.id,
        permissions: restaurant.owner_id === user.id 
          ? { menu_editor: true, qr_codes: true, orders: true, kitchen: true, settings: true, reports: true }
          : permissionsMap[restaurant.id] || {}
      })) || [];

      setRestaurants(restaurantsWithOwnership);

      // Set the first restaurant as active
      if (restaurantsWithOwnership.length > 0) {
        setActiveRestaurant(restaurantsWithOwnership[0].id);
      }
    } finally {
      setLoading(false);
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
    <div className="container mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-bold mb-2">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground text-lg">{t("dashboard.subtitle")}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Restaurantes</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restaurants.length}</div>
            <p className="text-xs text-muted-foreground">
              Restaurantes ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acesso Rápido</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(restaurantPermissions).length}</div>
            <p className="text-xs text-muted-foreground">
              Módulos disponíveis
            </p>
          </CardContent>
        </Card>

        {isSuperAdmin && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Painel Admin</CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full mt-2" 
                  onClick={() => navigate("/admin")}
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Configurações</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => navigate("/platform-settings")}
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Activity or Welcome Message */}
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao PratoDigital</CardTitle>
          <CardDescription>
            Use o menu lateral para navegar entre os diferentes módulos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Você está logado como <span className="font-medium text-foreground">{profile?.name}</span>
            </p>
            {restaurants.length === 0 && (
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Comece criando seu primeiro restaurante</p>
                  <p className="text-sm text-muted-foreground">
                    Acesse a página de Restaurantes no menu lateral
                  </p>
                </div>
                <Button 
                  onClick={() => navigate("/restaurants")}
                  className="gradient-primary"
                >
                  Ver Restaurantes
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
