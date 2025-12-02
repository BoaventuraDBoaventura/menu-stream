import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Settings } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { RestaurantSelector } from "@/components/dashboard/RestaurantSelector";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { useToast } from "@/hooks/use-toast";
import { playSoundNotification } from "@/utils/soundNotification";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";

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
  const { platformName } = usePlatformSettings();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [activeRestaurantId, setActiveRestaurantIdState] = useState<string>("");
  const [activeRestaurant, setActiveRestaurantData] = useState<Restaurant | null>(null);
  const { isSuperAdmin } = useUserRole(user?.id);
  
  // Date range filter - default to last 7 days
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      from: today,
      to: new Date()
    };
  });

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
    if (activeRestaurantId && dateRange?.from) {
      loadDashboardData();
      setupRealtimeSubscription();
    }
  }, [activeRestaurantId, dateRange]);

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
    if (!activeRestaurantId || !dateRange?.from) return;

    const startDate = new Date(dateRange.from);
    startDate.setHours(0, 0, 0, 0);
    const endDate = dateRange.to ? new Date(dateRange.to) : new Date();
    endDate.setHours(23, 59, 59, 999);

    // Calculate previous period for comparison
    const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const previousStart = subDays(startDate, periodDays);
    const previousEnd = subDays(endDate, periodDays);

    // Fetch current period orders
    const { data: currentPeriodOrdersData } = await supabase
      .from("orders")
      .select("total_amount, order_status, created_at")
      .eq("restaurant_id", activeRestaurantId)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    const currentSalesTotal = currentPeriodOrdersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
    const currentOrdersCount = currentPeriodOrdersData?.length || 0;
    const pendingCount = currentPeriodOrdersData?.filter(o => o.order_status === 'new' || o.order_status === 'preparing').length || 0;

    setTodaySales(currentSalesTotal);
    setTodayOrders(currentOrdersCount);
    setPendingOrders(pendingCount);
    setAverageTicket(currentOrdersCount > 0 ? currentSalesTotal / currentOrdersCount : 0);

    // Fetch previous period orders for comparison
    const { data: previousPeriodOrdersData } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("restaurant_id", activeRestaurantId)
      .gte("created_at", previousStart.toISOString())
      .lte("created_at", previousEnd.toISOString());

    setYesterdaySales(previousPeriodOrdersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0);
    setYesterdayOrders(previousPeriodOrdersData?.length || 0);

    // Fetch orders for chart (group by day within the selected period)
    const chartData = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const { data: dayOrdersData } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("restaurant_id", activeRestaurantId)
        .gte("created_at", dayStart.toISOString())
        .lte("created_at", dayEnd.toISOString());

      const daySales = dayOrdersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const dateStr = currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      chartData.push({ date: dateStr, sales: daySales });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setSalesChartData(chartData);

    // Fetch top products for selected period
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
      .gte("orders.created_at", startDate.toISOString())
      .lte("orders.created_at", endDate.toISOString());

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

    // Fetch recent orders from selected period
    const { data: recentOrdersData } = await supabase
      .from("orders")
      .select("*")
      .eq("restaurant_id", activeRestaurantId)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
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
            <CardTitle>Bem-vindo ao {platformName}</CardTitle>
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
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Olá, {profile?.name}! Acompanhe o desempenho do seu restaurante
            </p>
          </div>
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
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <RestaurantSelector
            restaurants={restaurants}
            activeRestaurantId={activeRestaurantId}
            onRestaurantChange={handleRestaurantChange}
          />
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
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
