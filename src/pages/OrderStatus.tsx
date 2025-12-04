import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, ChefHat, Package, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { playSoundNotification } from "@/utils/soundNotification";
import { useCustomerSession } from "@/hooks/useCustomerSession";

const OrderStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getSession } = useCustomerSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<string>("USD");
  const [restaurantSlug, setRestaurantSlug] = useState<string>("");
  const [tableToken, setTableToken] = useState<string>("");

  const restaurantId = searchParams.get("restaurant");
  const customerNameParam = searchParams.get("customer");

  useEffect(() => {
    if (restaurantId) {
      loadOrders();
      
      // Subscribe to real-time updates for all customer orders
      const channel = supabase
        .channel('customer-orders-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `restaurant_id=eq.${restaurantId}`,
          },
          (payload) => {
            console.log('Order status updated:', payload);
            setOrders(prev => prev.map(order => 
              order.id === payload.new.id ? { ...order, ...payload.new } : order
            ));
            
            // Play sound notification when status changes
            playSoundNotification('status-change');
            
            toast({
              title: "🔔 Status atualizado!",
              description: getStatusMessage(payload.new.order_status),
              duration: 5000,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [restaurantId, customerNameParam]);

  const loadOrders = async () => {
    try {
      // Get customer session or use URL param
      const session = getSession();
      const customerName = customerNameParam || session?.customerName;
      
      if (!customerName) {
        setLoading(false);
        return;
      }

      // Load restaurant info
      const { data: restaurantData } = await supabase
        .from("restaurants")
        .select("currency, slug")
        .eq("id", restaurantId)
        .single();

      if (restaurantData) {
        setCurrency(restaurantData.currency || "USD");
        setRestaurantSlug(restaurantData.slug);
      }

      // Load all orders for this customer at this restaurant (today only)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*, tables(name, qr_code_token)")
        .eq("restaurant_id", restaurantId)
        .eq("customer_name", customerName)
        .gte("created_at", today.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setOrders(ordersData || []);
      
      // Store table token for navigation
      if (ordersData && ordersData.length > 0 && ordersData[0]?.tables?.qr_code_token) {
        setTableToken(ordersData[0].tables.qr_code_token);
      } else if (session?.tableToken) {
        setTableToken(session.tableToken);
      }
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "new":
        return "Pedido recebido pela cozinha";
      case "preparing":
        return "Seu pedido está sendo preparado";
      case "ready":
        return "Pedido pronto para retirada!";
      case "delivered":
        return "Pedido entregue. Bom apetite!";
      case "cancelled":
        return "Pedido cancelado";
      default:
        return "Status desconhecido";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case "preparing":
        return <ChefHat className="h-6 w-6 text-blue-500" />;
      case "ready":
        return <Package className="h-6 w-6 text-green-500" />;
      case "delivered":
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      default:
        return <Clock className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      new: "secondary",
      preparing: "default",
      ready: "default",
      delivered: "default",
      cancelled: "destructive",
    };

    const labels: any = {
      new: "Novo",
      preparing: "Preparando",
      ready: "Pronto",
      delivered: "Entregue",
      cancelled: "Cancelado",
    };

    return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>;
  };

  const handleNewOrder = () => {
    if (restaurantSlug) {
      const tableParam = tableToken ? `?table=${tableToken}` : "";
      navigate(`/menu/${restaurantSlug}${tableParam}`);
    } else {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Nenhum pedido encontrado</h1>
          <p className="text-muted-foreground mb-4">
            Você ainda não fez nenhum pedido hoje
          </p>
          <Button onClick={handleNewOrder}>
            <ShoppingBag className="h-4 w-4 mr-2" />
            Fazer Pedido
          </Button>
        </div>
      </div>
    );
  }

  const totalAmount = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Seus Pedidos
          </h1>
          <p className="text-muted-foreground">
            {orders[0]?.customer_name} • {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
          </p>
          {orders[0]?.tables && (
            <p className="text-sm text-primary font-medium mt-1">
              {orders[0].tables.name}
            </p>
          )}
        </div>

        {/* Orders List */}
        <div className="space-y-4 mb-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.order_status)}
                    <div>
                      <CardTitle className="text-lg">Pedido #{order.order_number}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {getStatusMessage(order.order_status)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(order.order_status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Status Timeline */}
                  <div className="flex items-center gap-2 py-2">
                    <StatusDot 
                      completed={["new", "preparing", "ready", "delivered"].includes(order.order_status)} 
                      active={order.order_status === "new"}
                    />
                    <div className="flex-1 h-1 bg-muted rounded">
                      <div 
                        className={`h-full bg-primary rounded transition-all ${
                          order.order_status === "new" ? "w-1/4" :
                          order.order_status === "preparing" ? "w-1/2" :
                          order.order_status === "ready" ? "w-3/4" :
                          order.order_status === "delivered" ? "w-full" : "w-0"
                        }`}
                      />
                    </div>
                    <StatusDot 
                      completed={order.order_status === "delivered"} 
                      active={order.order_status === "ready"}
                    />
                  </div>

                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">{formatPrice(parseFloat(order.total_amount))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Total Summary */}
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total Geral</span>
              <span className="text-2xl font-bold text-primary">{formatPrice(totalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <Button
          onClick={handleNewOrder}
          className="w-full"
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          Fazer Novo Pedido
        </Button>
      </div>
    </div>
  );
};

const StatusDot = ({ completed, active }: { completed: boolean; active: boolean }) => {
  return (
    <div className={`
      h-3 w-3 rounded-full flex-shrink-0
      ${completed ? "bg-primary" : "bg-muted"}
      ${active ? "ring-4 ring-primary/20" : ""}
    `} />
  );
};

export default OrderStatus;
