import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus } from "lucide-react";
import { AddToCartDialog } from "./AddToCartDialog";

interface CustomerMenuItemCardProps {
  item: any;
  currency: string;
}

export const CustomerMenuItemCard = ({ item, currency }: CustomerMenuItemCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-medium transition-smooth cursor-pointer group" onClick={() => setDialogOpen(true)}>
        {item.image_url && (
          <div className="aspect-video overflow-hidden bg-muted">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{item.name}</CardTitle>
            <Badge className="gradient-primary text-primary-foreground shrink-0">
              {formatPrice(item.price)}
            </Badge>
          </div>
          {item.description && (
            <CardDescription className="line-clamp-2">{item.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {item.prep_time_minutes && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{item.prep_time_minutes} min</span>
              </div>
            )}
            <Button
              size="sm"
              className="gradient-primary ml-auto"
              onClick={(e) => {
                e.stopPropagation();
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <AddToCartDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={item}
        currency={currency}
      />
    </>
  );
};
