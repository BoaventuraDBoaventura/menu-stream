import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock } from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  order_status: string;
  created_at: string;
}

interface RecentOrdersProps {
  orders: Order[];
  currency: string;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500",
  preparing: "bg-yellow-500",
  ready: "bg-green-500",
  delivered: "bg-gray-500",
  cancelled: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  new: "Novo",
  preparing: "Preparando",
  ready: "Pronto",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export const RecentOrders = ({ orders, currency }: RecentOrdersProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL'
    }).format(value);
  };

  const getTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos Recentes</CardTitle>
        <CardDescription>Últimos 5 pedidos recebidos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum pedido hoje
            </p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">#{order.order_number}</p>
                    <Badge className={`${statusColors[order.order_status]} text-white`}>
                      {statusLabels[order.order_status] || order.order_status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {getTimeAgo(order.created_at)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(order.total_amount)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
