import { Home, Store, LayoutDashboard, QrCode, ChefHat, BarChart3, Settings, Crown, Users, Cog } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const [user, setUser] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const { isSuperAdmin, loading: roleLoading } = useUserRole(user?.id);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      // Fetch user's restaurants to check permissions
      const { data: restaurantsData } = await supabase
        .from("restaurants")
        .select("*")
        .order("created_at", { ascending: false });

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
    }
  };

  const hasAnyRestaurantPermission = (permissionKey: string) => {
    return isSuperAdmin || restaurants.some(r => r.permissions?.[permissionKey]);
  };

  const mainItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home, show: true },
    { title: "Restaurantes", url: "/restaurants", icon: Store, show: true },
    { title: "Menu", url: `/menu/editor${restaurants[0] ? `?restaurant=${restaurants[0].id}` : ''}`, icon: LayoutDashboard, show: hasAnyRestaurantPermission('menu_editor') },
    { title: "Código QR", url: `/qr-codes${restaurants[0] ? `?restaurant=${restaurants[0].id}` : ''}`, icon: QrCode, show: hasAnyRestaurantPermission('qr_codes') },
    { title: "Cozinha", url: `/kitchen${restaurants[0] ? `?restaurant=${restaurants[0].id}` : ''}`, icon: ChefHat, show: hasAnyRestaurantPermission('kitchen') },
    { title: "Relatórios", url: `/reports${restaurants[0] ? `?restaurant=${restaurants[0].id}` : ''}`, icon: BarChart3, show: hasAnyRestaurantPermission('reports') },
    { title: "Configurações", url: `/restaurant/settings${restaurants[0] ? `?restaurant=${restaurants[0].id}` : ''}`, icon: Settings, show: hasAnyRestaurantPermission('settings') },
  ];

  const adminItems = [
    { title: "Painel Admin", url: "/admin", icon: Users, show: isSuperAdmin },
    { title: "Config. Plataforma", url: "/platform-settings", icon: Cog, show: isSuperAdmin },
  ];

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + "?");

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent>
        {/* Logo Header */}
        <div className="px-4 py-6 border-b border-border">
          <div className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-primary" />
            {!collapsed && (
              <div>
                <span className="text-lg font-bold">PratoDigital</span>
                {isSuperAdmin && (
                  <Badge variant="default" className="ml-2 text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.filter(item => item.show).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Menu */}
        {!roleLoading && isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.filter(item => item.show).map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="hover:bg-muted/50"
                        activeClassName="bg-muted text-primary font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
