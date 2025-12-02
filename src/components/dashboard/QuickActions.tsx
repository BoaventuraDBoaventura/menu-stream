import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, BarChart3, QrCode, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
        <CardDescription>Acesse módulos principais</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => navigate("/kitchen")}
          >
            <ChefHat className="h-6 w-6" />
            <span className="text-sm">Cozinha</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => navigate("/reports")}
          >
            <BarChart3 className="h-6 w-6" />
            <span className="text-sm">Relatórios</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => navigate("/menu")}
          >
            <Menu className="h-6 w-6" />
            <span className="text-sm">Menu</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => navigate("/qr-codes")}
          >
            <QrCode className="h-6 w-6" />
            <span className="text-sm">QR Codes</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
