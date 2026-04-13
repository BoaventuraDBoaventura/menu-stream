import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, BarChart3, QrCode, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickActionsProps {
  permissions?: {
    menu_editor?: boolean;
    qr_codes?: boolean;
    orders?: boolean;
    kitchen?: boolean;
    settings?: boolean;
    reports?: boolean;
    dashboard?: boolean;
  };
  restaurantId?: string;
}

export const QuickActions = ({ permissions, restaurantId }: QuickActionsProps) => {
  const navigate = useNavigate();

  const allPermissions = permissions || {
    menu_editor: true,
    qr_codes: true,
    orders: true,
    kitchen: true,
    settings: true,
    reports: true,
    dashboard: true,
  };

  const suffix = restaurantId ? `?restaurant=${restaurantId}` : "";

  const actions = [
    { key: "kitchen", label: "Cozinha", icon: ChefHat, path: `/kitchen${suffix}`, show: allPermissions.kitchen },
    { key: "reports", label: "Relatórios", icon: BarChart3, path: `/reports${suffix}`, show: allPermissions.reports },
    { key: "menu_editor", label: "Menu", icon: Menu, path: `/menu/editor${suffix}`, show: allPermissions.menu_editor },
    { key: "qr_codes", label: "QR Codes", icon: QrCode, path: `/qr-codes${suffix}`, show: allPermissions.qr_codes },
  ];

  const visibleActions = actions.filter(a => a.show);

  if (visibleActions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
        <CardDescription>Acesse módulos principais</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {visibleActions.map((action) => (
            <Button
              key={action.key}
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => navigate(action.path)}
            >
              <action.icon className="h-6 w-6" />
              <span className="text-sm">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
