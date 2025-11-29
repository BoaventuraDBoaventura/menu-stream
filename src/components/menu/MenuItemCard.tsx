import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Image as ImageIcon } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  prep_time_minutes: number | null;
  is_available: boolean;
  options: any;
}

interface MenuItemCardProps {
  item: MenuItem;
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailability: (available: boolean) => void;
}

export const MenuItemCard = ({ 
  item, 
  currency, 
  onEdit, 
  onDelete, 
  onToggleAvailability 
}: MenuItemCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-medium transition-smooth">
      <CardContent className="p-0">
        <div className="flex">
          {/* Image */}
          <div className="w-32 h-32 bg-muted flex-shrink-0">
            {item.image_url ? (
              <img 
                src={item.image_url} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{item.name}</h4>
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Switch
                  checked={item.is_available}
                  onCheckedChange={onToggleAvailability}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-primary">
                  {currency} {item.price.toFixed(2)}
                </span>
                {item.prep_time_minutes && (
                  <Badge variant="outline">
                    {item.prep_time_minutes} min
                  </Badge>
                )}
                {!item.is_available && (
                  <Badge variant="secondary">Unavailable</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onEdit}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
