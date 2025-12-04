import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, ChefHat, Package, Home, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { playSoundNotification } from "@/utils/soundNotification";

const OrderStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<string>("USD");
  const [tableToken, setTableToken] = useState<string>("");
  const [restaurantSlug, setRestaurantSlug] = useState<string>("");

  const orderNumber = searchParams.get("order");
  const restaurantId = searchParams.get("restaurant");

  useEffect(() => {
    if (orderNumber && restaurantId) {
      loadOrder();
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel('order-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `order_number=eq.${orderNumber}`,
          },
          (payload) => {
            console.log('Order status updated:', payload);
            setOrder(payload.new);
            
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
  }, [orderNumber, restaurantId]);

  const loadOrder = async () => {
    try {
      // Load restaurant to get currency and slug
      const { data: restaurantData } = await supabase
        .from("restaurants")
        .select("currency, slug")
        .eq("id", restaurantId)
        .single();

      if (restaurantData) {
        setCurrency(restaurantData.currency || "USD");
        setRestaurantSlug(restaurantData.slug);
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*, tables(name, qr_code_token)")
        .eq("order_number", orderNumber)
        .eq("restaurant_id", restaurantId)
        .single();

      if (error) throw error;
      setOrder(data);
      
      // Store table token for navigation
      if (data?.tables?.qr_code_token) {
        setTableToken(data.tables.qr_code_token);
      }
    } catch (error: any) {
      console.error("Error loading order:", error);
      toast({
        title: "Erro ao carregar pedido",
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
        return <Clock className="h-8 w-8 text-yellow-500" />;
      case "preparing":
        return <ChefHat className="h-8 w-8 text-blue-500" />;
      case "ready":
        return <Package className="h-8 w-8 text-green-500" />;
      case "delivered":
        return <CheckCircle2 className="h-8 w-8 text-green-600" />;
      default:
        return <Clock className="h-8 w-8 text-muted-foreground" />;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Pedido não encontrado</h1>
          <p className="text-muted-foreground">
            Verifique o número do pedido e tente novamente
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {getStatusIcon(order.order_status)}
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Pedido #{order.order_number}
          </h1>
          <p className="text-muted-foreground">
            {getStatusMessage(order.order_status)}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Status do Pedido</CardTitle>
              {getStatusBadge(order.order_status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Status Timeline */}
              <div className="space-y-4">
                <StatusStep
                  label="Pedido Recebido"
                  completed={["new", "preparing", "ready", "delivered"].includes(order.order_status)}
                  active={order.order_status === "new"}
                />
                <StatusStep
                  label="Em Preparação"
                  completed={["preparing", "ready", "delivered"].includes(order.order_status)}
                  active={order.order_status === "preparing"}
                />
                <StatusStep
                  label="Pronto"
                  completed={["ready", "delivered"].includes(order.order_status)}
                  active={order.order_status === "ready"}
                />
                <StatusStep
                  label="Entregue"
                  completed={order.order_status === "delivered"}
                  active={order.order_status === "delivered"}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informações do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente:</span>
              <span className="font-medium">{order.customer_name}</span>
            </div>
            {order.tables && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mesa:</span>
                <span className="font-medium">{order.tables.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-medium text-lg">
                {formatPrice(parseFloat(order.total_amount))}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            onClick={() => {
              if (restaurantSlug) {
                const tableParam = tableToken ? `?table=${tableToken}` : "";
                navigate(`/menu/${restaurantSlug}${tableParam}`);
              } else {
                navigate("/");
              }
            }}
            className="w-full"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Fazer Novo Pedido
          </Button>
          
          <Button
            onClick={() => {
              if (restaurantSlug) {
                const tableParam = tableToken ? `?table=${tableToken}` : "";
                navigate(`/menu/${restaurantSlug}${tableParam}`);
              } else {
                navigate("/");
              }
            }}
            variant="outline"
            className="w-full"
          >
            <Home className="h-4 w-4 mr-2" />
            Voltar ao Menu
          </Button>
        </div>
      </div>
    </div>
  );
};

const StatusStep = ({ 
  label, 
  completed, 
  active 
}: { 
  label: string; 
  completed: boolean; 
  active: boolean;
}) => {
  return (
    <div className="flex items-center gap-3">
      <div className={`
        h-3 w-3 rounded-full flex-shrink-0
        ${completed ? "bg-primary" : "bg-muted"}
        ${active ? "ring-4 ring-primary/20" : ""}
      `} />
      <span className={`
        ${completed ? "text-foreground font-medium" : "text-muted-foreground"}
      `}>
        {label}
      </span>
    </div>
  );
};

export default OrderStatus;
