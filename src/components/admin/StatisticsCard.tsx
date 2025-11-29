import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatisticsCardProps {
  title: string;
  value: number;
  change?: number;
  icon: React.ReactNode;
  trend?: "up" | "down";
}

export const StatisticsCard = ({ title, value, change, icon, trend }: StatisticsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value.toLocaleString()}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            <p className={`text-xs ${trend === "up" ? "text-success" : "text-destructive"}`}>
              {change > 0 ? "+" : ""}{change}% desde o mês passado
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
