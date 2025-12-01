import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ChefHat, Clock, CheckCircle2, ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { playSoundNotification } from "@/utils/soundNotification";

const Kitchen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t, setActiveRestaurant } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>("");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && restaurantId) {
      loadOrders();
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel('kitchen-orders')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'orders',
            filter: `restaurant_id=eq.${restaurantId}`,
          },
          (payload) => {
            console.log('New order received:', payload);
            // Play sound notification for new order
            playSoundNotification('new-order');
            
            toast({
              title: "🔔 Novo Pedido!",
              description: `Pedido #${payload.new.order_number} recebido`,
              duration: 5000,
            });
            
            loadOrders();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `restaurant_id=eq.${restaurantId}`,
          },
          () => {
            loadOrders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, restaurantId]);

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Auth error:", error);
        toast({
          title: t("kitchen.authError"),
          description: error.message,
          variant: "destructive",
        });
        navigate("/login");
        return;
      }
      if (!user) {
        navigate("/login");
        return;
      }
      setUser(user);

      // Get restaurant ID from URL or find user's accessible restaurant
      let restaurantIdFromParams = searchParams.get("restaurant");
      
      if (!restaurantIdFromParams) {
        // Fetch restaurants the user has access to
        const { data: restaurants } = await supabase
          .from("restaurants")
          .select("id, name, owner_id")
          .or(`owner_id.eq.${user.id}`)
          .order("created_at", { ascending: false });

        // Also check restaurant_permissions
        const { data: permissions } = await supabase
          .from("restaurant_permissions")
          .select("restaurant_id, permissions")
          .eq("user_id", user.id);

        // Filter restaurants where user has kitchen permission
        const accessibleRestaurants = restaurants?.filter(r => {
          const isOwner = r.owner_id === user.id;
          const hasPermission = permissions?.find(p => {
            const perms = p.permissions as any;
            return p.restaurant_id === r.id && perms?.kitchen;
          });
          return isOwner || hasPermission;
        }) || [];

        if (accessibleRestaurants.length === 0) {
          toast({
            title: t("kitchen.noAccess"),
            description: t("kitchen.noAccessDesc"),
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        // Use the first accessible restaurant
        restaurantIdFromParams = accessibleRestaurants[0].id;
        setRestaurantName(accessibleRestaurants[0].name);
      } else {
        // Get restaurant name
        const { data: restaurant } = await supabase
          .from("restaurants")
          .select("name")
          .eq("id", restaurantIdFromParams)
          .single();
        
        if (restaurant) {
          setRestaurantName(restaurant.name);
        }
      }

      setRestaurantId(restaurantIdFromParams);
      // Set active restaurant for language context
      if (restaurantIdFromParams) {
        setActiveRestaurant(restaurantIdFromParams);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      navigate("/login");
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Get date from 24 hours ago to limit the query
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);
      
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          tables(name),
          order_items(
            id,
            quantity,
            price,
            options,
            menu_items(name, description)
          )
        `)
        .eq("restaurant_id", restaurantId)
        .in("order_status", ["new", "preparing", "ready", "delivered"])
        .gte("created_at", yesterday.toISOString())
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error("Error loading orders:", error);
      toast({
        title: t("kitchen.errorLoading"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: t("kitchen.statusUpdated"),
        description: `${t("kitchen.statusUpdatedDesc")} ${getStatusLabel(newStatus)}`,
      });
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast({
        title: t("kitchen.errorUpdating"),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      new: t("kitchen.new"),
      preparing: t("kitchen.preparing"),
      ready: t("kitchen.ready"),
      delivered: t("kitchen.delivered"),
      cancelled: t("kitchen.cancelled"),
    };
    return labels[status] || status;
  };

  const filterOrders = (status: string[]) => {
    return orders.filter(order => status.includes(order.order_status));
  };

  // Memoize filtered orders to avoid recalculating on every render
  const newOrders = useMemo(() => filterOrders(["new"]), [orders]);
  const preparingOrders = useMemo(() => filterOrders(["preparing"]), [orders]);
  const readyOrders = useMemo(() => filterOrders(["ready"]), [orders]);
  const deliveredOrders = useMemo(() => filterOrders(["delivered"]), [orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-8 w-48" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">
          <Skeleton className="h-12 w-full mb-6" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">{t("kitchen.title")}</h1>
                {restaurantName && (
                  <p className="text-sm text-muted-foreground">{restaurantName}</p>
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={loadOrders}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="new">
              {t("kitchen.newOrders")} ({newOrders.length})
            </TabsTrigger>
            <TabsTrigger value="preparing">
              {t("kitchen.preparing")} ({preparingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="ready">
              {t("kitchen.ready")} ({readyOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              {t("kitchen.delivered")} ({deliveredOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            <OrdersList
              orders={newOrders}
              onUpdateStatus={updateOrderStatus}
              nextStatus="preparing"
              nextStatusLabel={t("kitchen.markPreparing")}
              t={t}
            />
          </TabsContent>

          <TabsContent value="preparing">
            <OrdersList
              orders={preparingOrders}
              onUpdateStatus={updateOrderStatus}
              nextStatus="ready"
              nextStatusLabel={t("kitchen.markReady")}
              t={t}
            />
          </TabsContent>

          <TabsContent value="ready">
            <OrdersList
              orders={readyOrders}
              onUpdateStatus={updateOrderStatus}
              nextStatus="delivered"
              nextStatusLabel={t("kitchen.markDelivered")}
              t={t}
            />
          </TabsContent>

          <TabsContent value="completed">
            <OrdersList
              orders={deliveredOrders}
              onUpdateStatus={updateOrderStatus}
              t={t}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const OrdersList = ({ 
  orders, 
  onUpdateStatus,
  nextStatus,
  nextStatusLabel,
  t
}: { 
  orders: any[];
  onUpdateStatus: (orderId: string, status: string) => void;
  nextStatus?: string;
  nextStatusLabel?: string;
  t: (key: string) => string;
}) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("kitchen.noOrders")}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">#{order.order_number}</CardTitle>
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(order.created_at).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{t("kitchen.customer")}: {order.customer_name}</p>
              {order.tables && <p>{t("kitchen.table")}: {order.tables.name}</p>}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Order Items */}
              <div className="space-y-2">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="text-sm">
                    <span className="font-medium">
                      {item.quantity}x {item.menu_items?.name}
                    </span>
                    {item.options && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.options.size && <p>{t("kitchen.size")}: {item.options.size.name}</p>}
                        {item.options.extras && item.options.extras.length > 0 && (
                          <p>{t("kitchen.extras")}: {item.options.extras.map((e: any) => e.name).join(", ")}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="text-sm bg-muted p-2 rounded">
                  <p className="font-medium text-xs text-muted-foreground mb-1">{t("kitchen.notes")}:</p>
                  <p>{order.notes}</p>
                </div>
              )}

              {/* Actions */}
              {nextStatus && nextStatusLabel && (
                <Button
                  onClick={() => onUpdateStatus(order.id, nextStatus)}
                  className="w-full gradient-primary"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {nextStatusLabel}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Kitchen;
