import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatisticsCard } from "./StatisticsCard";
import { Users, Store, ShoppingCart, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2 } from "lucide-react";

interface Statistics {
  totalUsers: number;
  totalRestaurants: number;
  totalOrders: number;
  usersChange: number;
  restaurantsChange: number;
  ordersChange: number;
}

interface GrowthData {
  date: string;
  users: number;
  restaurants: number;
  orders: number;
}

export const StatisticsDashboard = () => {
  const [stats, setStats] = useState<Statistics>({
    totalUsers: 0,
    totalRestaurants: 0,
    totalOrders: 0,
    usersChange: 0,
    restaurantsChange: 0,
    ordersChange: 0,
  });
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
    setupRealtimeSubscription();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      // Fetch total users
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch total restaurants
      const { count: totalRestaurants } = await supabase
        .from("restaurants")
        .select("*", { count: "exact", head: true });

      // Fetch total orders
      const { count: totalOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      // Fetch users from last month for comparison
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const { count: usersLastMonth } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .lt("created_at", lastMonth.toISOString());

      const { count: restaurantsLastMonth } = await supabase
        .from("restaurants")
        .select("*", { count: "exact", head: true })
        .lt("created_at", lastMonth.toISOString());

      const { count: ordersLastMonth } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .lt("created_at", lastMonth.toISOString());

      // Calculate percentage changes
      const usersChange = usersLastMonth ? Math.round(((totalUsers || 0) - usersLastMonth) / usersLastMonth * 100) : 0;
      const restaurantsChange = restaurantsLastMonth ? Math.round(((totalRestaurants || 0) - restaurantsLastMonth) / restaurantsLastMonth * 100) : 0;
      const ordersChange = ordersLastMonth ? Math.round(((totalOrders || 0) - ordersLastMonth) / ordersLastMonth * 100) : 0;

      setStats({
        totalUsers: totalUsers || 0,
        totalRestaurants: totalRestaurants || 0,
        totalOrders: totalOrders || 0,
        usersChange,
        restaurantsChange,
        ordersChange,
      });

      // Fetch growth data for chart (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: usersData } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", sevenDaysAgo.toISOString());

      const { data: restaurantsData } = await supabase
        .from("restaurants")
        .select("created_at")
        .gte("created_at", sevenDaysAgo.toISOString());

      const { data: ordersData } = await supabase
        .from("orders")
        .select("created_at")
        .gte("created_at", sevenDaysAgo.toISOString());

      // Process data for chart
      const chartData: GrowthData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

        const usersCount = usersData?.filter(u => 
          new Date(u.created_at).toDateString() === date.toDateString()
        ).length || 0;

        const restaurantsCount = restaurantsData?.filter(r => 
          new Date(r.created_at).toDateString() === date.toDateString()
        ).length || 0;

        const ordersCount = ordersData?.filter(o => 
          new Date(o.created_at).toDateString() === date.toDateString()
        ).length || 0;

        chartData.push({
          date: dateStr,
          users: usersCount,
          restaurants: restaurantsCount,
          orders: ordersCount,
        });
      }

      setGrowthData(chartData);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    // Subscribe to new users
    const usersChannel = supabase
      .channel("users-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "profiles",
        },
        () => {
          fetchStatistics();
        }
      )
      .subscribe();

    // Subscribe to new restaurants
    const restaurantsChannel = supabase
      .channel("restaurants-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "restaurants",
        },
        () => {
          fetchStatistics();
        }
      )
      .subscribe();

    // Subscribe to new orders
    const ordersChannel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        () => {
          fetchStatistics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(restaurantsChannel);
      supabase.removeChannel(ordersChannel);
    };
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

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatisticsCard
          title="Total de Usuários"
          value={stats.totalUsers}
          change={stats.usersChange}
          trend={stats.usersChange >= 0 ? "up" : "down"}
          icon={<Users className="h-4 w-4" />}
        />
        <StatisticsCard
          title="Total de Restaurantes"
          value={stats.totalRestaurants}
          change={stats.restaurantsChange}
          trend={stats.restaurantsChange >= 0 ? "up" : "down"}
          icon={<Store className="h-4 w-4" />}
        />
        <StatisticsCard
          title="Total de Pedidos"
          value={stats.totalOrders}
          change={stats.ordersChange}
          trend={stats.ordersChange >= 0 ? "up" : "down"}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
      </div>

      {/* Growth Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Crescimento nos Últimos 7 Dias</CardTitle>
          </div>
          <CardDescription>
            Acompanhe o crescimento da plataforma em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Usuários"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="restaurants"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                name="Restaurantes"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                name="Pedidos"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
