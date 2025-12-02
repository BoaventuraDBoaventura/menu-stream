import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Settings } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useLanguage } from "@/contexts/LanguageContext";
import { RestaurantSelector } from "@/components/dashboard/RestaurantSelector";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useToast } from "@/hooks/use-toast";
import { playSoundNotification } from "@/utils/soundNotification";

interface Restaurant {
  id: string;
  name: string;
  logo_url?: string;
  currency: string;
  owner_id: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, setActiveRestaurant } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [activeRestaurantId, setActiveRestaurantIdState] = useState<string>("");
  const [activeRestaurant, setActiveRestaurantData] = useState<Restaurant | null>(null);
  const { isSuperAdmin } = useUserRole(user?.id);

  // Dashboard data
  const [todaySales, setTodaySales] = useState(0);
  const [yesterdaySales, setYesterdaySales] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [yesterdayOrders, setYesterdayOrders] = useState(0);
  const [averageTicket, setAverageTicket] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [salesChartData, setSalesChartData] = useState<Array<{ date: string; sales: number }>>([]);
  const [topProducts, setTopProducts] = useState<Array<{ name: string; quantity: number; total: number }>>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (activeRestaurantId) {
      loadDashboardData();
      setupRealtimeSubscription();
    }
  }, [activeRestaurantId]);

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

      // Set the first restaurant as active
      if (restaurantsWithOwnership.length > 0) {
        const firstRestaurant = restaurantsWithOwnership[0];
        setActiveRestaurantIdState(firstRestaurant.id);
        setActiveRestaurantData(firstRestaurant);
        setActiveRestaurant(firstRestaurant.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    if (!activeRestaurantId) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch today's orders
    const { data: todayOrdersData } = await supabase
      .from("orders")
      .select("total_amount, order_status")
      .eq("restaurant_id", activeRestaurantId)
      .gte("created_at", today.toISOString());

    const todaySalesTotal = todayOrdersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
    const todayOrdersCount = todayOrdersData?.length || 0;
    const pendingCount = todayOrdersData?.filter(o => o.order_status === 'new' || o.order_status === 'preparing').length || 0;

    setTodaySales(todaySalesTotal);
    setTodayOrders(todayOrdersCount);
    setPendingOrders(pendingCount);
    setAverageTicket(todayOrdersCount > 0 ? todaySalesTotal / todayOrdersCount : 0);

    // Fetch yesterday's orders
    const { data: yesterdayOrdersData } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("restaurant_id", activeRestaurantId)
      .gte("created_at", yesterday.toISOString())
      .lt("created_at", today.toISOString());

    setYesterdaySales(yesterdayOrdersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0);
    setYesterdayOrders(yesterdayOrdersData?.length || 0);

    // Fetch last 7 days for chart
    const { data: weekOrdersData } = await supabase
      .from("orders")
      .select("total_amount, created_at")
      .eq("restaurant_id", activeRestaurantId)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const daySales = weekOrdersData?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= dayStart && orderDate <= dayEnd;
      }).reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      chartData.push({ date: dateStr, sales: daySales });
    }
    setSalesChartData(chartData);

    // Fetch top products
    const { data: orderItemsData } = await supabase
      .from("order_items")
      .select(`
        quantity,
        price,
        menu_item_id,
        menu_items(name),
        order_id,
        orders!inner(restaurant_id, created_at)
      `)
      .eq("orders.restaurant_id", activeRestaurantId)
      .gte("orders.created_at", today.toISOString());

    const productsMap: Record<string, { name: string; quantity: number; total: number }> = {};
    orderItemsData?.forEach((item: any) => {
      const name = item.menu_items?.name || 'Produto desconhecido';
      if (!productsMap[name]) {
        productsMap[name] = { name, quantity: 0, total: 0 };
      }
      productsMap[name].quantity += item.quantity;
      productsMap[name].total += Number(item.price) * item.quantity;
    });

    const topProductsArray = Object.values(productsMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    setTopProducts(topProductsArray);

    // Fetch recent orders
    const { data: recentOrdersData } = await supabase
      .from("orders")
      .select("*")
      .eq("restaurant_id", activeRestaurantId)
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false })
      .limit(5);

    setRecentOrders(recentOrdersData || []);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('dashboard-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${activeRestaurantId}`
        },
        (payload) => {
          console.log('New order received:', payload);
          playSoundNotification('new-order');
          toast({
            title: "Novo Pedido!",
            description: `Pedido #${payload.new.order_number} recebido`,
          });
          loadDashboardData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${activeRestaurantId}`
        },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleRestaurantChange = (restaurantId: string) => {
    setActiveRestaurantIdState(restaurantId);
    setActiveRestaurant(restaurantId);
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      setActiveRestaurantData(restaurant);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo ao PratoDigital</CardTitle>
            <CardDescription>Comece criando seu primeiro restaurante</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/restaurants")} className="gradient-primary">
              Criar Restaurante
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Olá, {profile?.name}! Acompanhe o desempenho do seu restaurante
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <RestaurantSelector
            restaurants={restaurants}
            activeRestaurantId={activeRestaurantId}
            onRestaurantChange={handleRestaurantChange}
          />
          {isSuperAdmin && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/admin")}
              >
                <Crown className="h-4 w-4 mr-2" />
                Admin
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/platform-settings")}
              >
                <Settings className="h-4 w-4 mr-2" />
                Config
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <DashboardStats
        todaySales={todaySales}
        yesterdaySales={yesterdaySales}
        todayOrders={todayOrders}
        yesterdayOrders={yesterdayOrders}
        averageTicket={averageTicket}
        pendingOrders={pendingOrders}
        currency={activeRestaurant?.currency || 'BRL'}
      />

      {/* Charts and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart 
          data={salesChartData} 
          currency={activeRestaurant?.currency || 'BRL'} 
        />
        <TopProducts 
          products={topProducts} 
          currency={activeRestaurant?.currency || 'BRL'} 
        />
      </div>

      {/* Recent Orders and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrders 
            orders={recentOrders} 
            currency={activeRestaurant?.currency || 'BRL'} 
          />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
