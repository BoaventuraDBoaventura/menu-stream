import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, Edit, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    address: string | null;
    is_active: boolean;
    logo_url: string | null;
  };
}

export const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-medium transition-smooth">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {restaurant.logo_url ? (
              <img 
                src={restaurant.logo_url} 
                alt={restaurant.name}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Store className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-xl">{restaurant.name}</CardTitle>
              <CardDescription>/{restaurant.slug}</CardDescription>
            </div>
          </div>
          <Badge variant={restaurant.is_active ? "default" : "secondary"}>
            {restaurant.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {restaurant.address && (
          <p className="text-sm text-muted-foreground">{restaurant.address}</p>
        )}
        <div className="flex gap-2">
          <Button 
            className="flex-1 gradient-primary"
            onClick={() => navigate(`/menu/editor?restaurant=${restaurant.id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Menu
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(`/qr-codes?restaurant=${restaurant.id}`)}
          >
            <QrCode className="h-4 w-4 mr-2" />
            QR Codes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
