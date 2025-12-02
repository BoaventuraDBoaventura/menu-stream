import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, TrendingUpIcon, Clock } from "lucide-react";

interface DashboardStatsProps {
  todaySales: number;
  yesterdaySales: number;
  todayOrders: number;
  yesterdayOrders: number;
  averageTicket: number;
  pendingOrders: number;
  currency: string;
}

export const DashboardStats = ({
  todaySales,
  yesterdaySales,
  todayOrders,
  yesterdayOrders,
  averageTicket,
  pendingOrders,
  currency
}: DashboardStatsProps) => {
  const salesChange = yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 : 0;
  const ordersChange = yesterdayOrders > 0 ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(todaySales)}</div>
          {salesChange !== 0 && (
            <div className="flex items-center gap-1 mt-2">
              {salesChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <p className={`text-xs ${salesChange > 0 ? "text-green-500" : "text-red-500"}`}>
                {salesChange > 0 ? "+" : ""}{salesChange.toFixed(1)}% vs ontem
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayOrders}</div>
          {ordersChange !== 0 && (
            <div className="flex items-center gap-1 mt-2">
              {ordersChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <p className={`text-xs ${ordersChange > 0 ? "text-green-500" : "text-red-500"}`}>
                {ordersChange > 0 ? "+" : ""}{ordersChange.toFixed(1)}% vs ontem
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(averageTicket)}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Valor médio por pedido
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingOrders}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Aguardando preparo
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
