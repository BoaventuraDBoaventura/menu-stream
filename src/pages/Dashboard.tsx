import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Plus, QrCode, LayoutDashboard, LogOut, Crown, Users, Settings, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { RestaurantCard } from "@/components/dashboard/RestaurantCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [restaurantPermissions, setRestaurantPermissions] = useState<Record<string, any>>({});
  const [maxRestaurants, setMaxRestaurants] = useState<number | null>(null);
  const { role, isSuperAdmin } = useUserRole(user?.id);

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

      // Fetch user's max_restaurants limit
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("max_restaurants")
        .eq("user_id", user.id)
        .single();
      
      setMaxRestaurants(roleData?.max_restaurants ?? null);

      // Fetch user's restaurants (owned or with permissions)
      const { data: restaurantsData } = await supabase
        .from("restaurants")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch user permissions for each restaurant
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

      // Add ownership info to each restaurant
      const restaurantsWithOwnership = restaurantsData?.map(restaurant => ({
        ...restaurant,
        isOwner: restaurant.owner_id === user.id,
        permissions: restaurant.owner_id === user.id 
          ? { menu_editor: true, qr_codes: true, orders: true, kitchen: true, settings: true, reports: true }
          : permissionsMap[restaurant.id] || {}
      })) || [];

      setRestaurants(restaurantsWithOwnership);
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Bem-vindo, {profile?.name}</span>
              {isSuperAdmin && (
                <Badge className="gradient-primary text-white">
                  <Crown className="h-3 w-3 mr-1" />
                  Super Admin
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Painel</h1>
          <p className="text-muted-foreground">Gerencie a presença digital do seu restaurante</p>
        </div>

        {/* My Restaurants Section */}
        {restaurants.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Meus Restaurantes</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Ações Rápidas</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isSuperAdmin && (
            <>
              <DashboardCard
                icon={<Users className="h-8 w-8 text-primary" />}
                title="Painel Admin"
                description="Gerencie todos os usuários, restaurantes e atribua funções"
                action="Abrir Painel Admin"
                onClick={() => navigate("/admin")}
              />
              <DashboardCard
                icon={<Settings className="h-8 w-8 text-primary" />}
                title="Configurações da Plataforma"
                description="Configure definições globais e preferências do sistema"
                action="Configurações"
                onClick={() => navigate("/platform-settings")}
              />
            </>
          )}
          {(isSuperAdmin || role === 'restaurant_admin') && (() => {
            // Count restaurants owned by the user
            const ownedRestaurantsCount = restaurants.filter(r => r.owner_id === user?.id).length;
            const canCreateMore = maxRestaurants === null || ownedRestaurantsCount < maxRestaurants;
            
            // Only show create button if user can create more restaurants
            if (!canCreateMore && !isSuperAdmin) {
              return null;
            }
            
            return (
              <DashboardCard
                icon={<Plus className="h-8 w-8 text-primary" />}
                title="Criar Restaurante"
                description="Configure o perfil do seu restaurante e comece a criar menus"
                action="Começar"
                onClick={() => navigate("/restaurant/create")}
              />
            );
          })()}
          {(isSuperAdmin || restaurants[0]?.permissions?.menu_editor) && (
            <DashboardCard
              icon={<LayoutDashboard className="h-8 w-8 text-primary" />}
              title="Gerir Menus"
              description="Crie e edite seus menus digitais com facilidade"
              action="Ver Menus"
              onClick={() => {
                if (restaurants.length > 0) {
                  navigate(`/menu/editor?restaurant=${restaurants[0].id}`);
                } else {
                  toast({ 
                    title: "Nenhum restaurante encontrado", 
                    description: "Por favor, crie um restaurante primeiro" 
                  });
                }
              }}
            />
          )}
          {(isSuperAdmin || restaurants[0]?.permissions?.qr_codes) && (
            <DashboardCard
              icon={<QrCode className="h-8 w-8 text-primary" />}
              title="Códigos QR"
              description="Gere e baixe códigos QR para suas mesas"
              action="Gerar"
              onClick={() => {
                if (restaurants.length > 0) {
                  navigate(`/qr-codes?restaurant=${restaurants[0].id}`);
                } else {
                  toast({ 
                    title: "Nenhum restaurante encontrado", 
                    description: "Por favor, crie um restaurante primeiro" 
                  });
                }
              }}
            />
          )}
          {(isSuperAdmin || restaurants[0]?.permissions?.kitchen) && (
            <DashboardCard
              icon={<ChefHat className="h-8 w-8 text-primary" />}
              title="Cozinha"
              description="Gerenciar pedidos e atualizar status de preparação"
              action="Abrir Cozinha"
              onClick={() => {
                if (restaurants.length > 0) {
                  navigate(`/kitchen?restaurant=${restaurants[0].id}`);
                } else {
                  toast({ 
                    title: "No restaurant found", 
                    description: "Please create a restaurant first" 
                  });
                }
              }}
            />
          )}
          {(isSuperAdmin || restaurants[0]?.permissions?.reports) && (
            <DashboardCard
              icon={<BarChart3 className="h-8 w-8 text-primary" />}
              title="Relatórios"
              description="Visualize relatórios de vendas com filtros por período"
              action="Ver Relatórios"
              onClick={() => {
                if (restaurants.length > 0) {
                  navigate(`/reports?restaurant=${restaurants[0].id}`);
                } else {
                  toast({ 
                    title: "No restaurant found", 
                    description: "Please create a restaurant first" 
                  });
                }
              }}
            />
          )}
        </div>
      </div>
      </main>
    </div>
  );
};

const DashboardCard = ({ 
  icon, 
  title, 
  description, 
  action, 
  onClick 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  action: string;
  onClick: () => void;
}) => {
  return (
    <Card className="hover:shadow-medium transition-smooth cursor-pointer" onClick={onClick}>
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full gradient-primary">{action}</Button>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
