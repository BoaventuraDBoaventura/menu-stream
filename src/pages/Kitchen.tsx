import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat, Clock, CheckCircle2, ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Kitchen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const restaurantId = searchParams.get("restaurant");

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
            event: '*',
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUser(user);
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
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
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error("Error loading orders:", error);
      toast({
        title: "Erro ao carregar pedidos",
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
        title: "Status atualizado!",
        description: `Pedido marcado como ${getStatusLabel(newStatus)}`,
      });
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      new: "Novo",
      preparing: "Em Preparação",
      ready: "Pronto",
      delivered: "Entregue",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  const filterOrders = (status: string[]) => {
    return orders.filter(order => status.includes(order.order_status));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
              <h1 className="text-2xl font-bold">Cozinha</h1>
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
              Novos ({filterOrders(["new"]).length})
            </TabsTrigger>
            <TabsTrigger value="preparing">
              Preparando ({filterOrders(["preparing"]).length})
            </TabsTrigger>
            <TabsTrigger value="ready">
              Prontos ({filterOrders(["ready"]).length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Finalizados ({filterOrders(["delivered"]).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            <OrdersList
              orders={filterOrders(["new"])}
              onUpdateStatus={updateOrderStatus}
              nextStatus="preparing"
              nextStatusLabel="Iniciar Preparo"
            />
          </TabsContent>

          <TabsContent value="preparing">
            <OrdersList
              orders={filterOrders(["preparing"])}
              onUpdateStatus={updateOrderStatus}
              nextStatus="ready"
              nextStatusLabel="Marcar como Pronto"
            />
          </TabsContent>

          <TabsContent value="ready">
            <OrdersList
              orders={filterOrders(["ready"])}
              onUpdateStatus={updateOrderStatus}
              nextStatus="delivered"
              nextStatusLabel="Marcar como Entregue"
            />
          </TabsContent>

          <TabsContent value="completed">
            <OrdersList
              orders={filterOrders(["delivered"])}
              onUpdateStatus={updateOrderStatus}
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
  nextStatusLabel 
}: { 
  orders: any[];
  onUpdateStatus: (orderId: string, status: string) => void;
  nextStatus?: string;
  nextStatusLabel?: string;
}) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum pedido nesta categoria</p>
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
              <p>Cliente: {order.customer_name}</p>
              {order.tables && <p>Mesa: {order.tables.name}</p>}
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
                        {item.options.size && <p>Tamanho: {item.options.size.name}</p>}
                        {item.options.extras && item.options.extras.length > 0 && (
                          <p>Extras: {item.options.extras.map((e: any) => e.name).join(", ")}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="text-sm bg-muted p-2 rounded">
                  <p className="font-medium text-xs text-muted-foreground mb-1">Observações:</p>
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
