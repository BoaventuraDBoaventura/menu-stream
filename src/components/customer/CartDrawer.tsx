import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import pt from "@/locales/pt";
import en from "@/locales/en";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: any;
  tableToken: string | null;
  language: "pt" | "en";
}

export const CartDrawer = ({ open, onOpenChange, restaurant, tableToken, language }: CartDrawerProps) => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getTotalPrice } = useCart();
  
  const t = language === "pt" ? pt : en;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: restaurant.currency || "USD",
    }).format(price);
  };

  const getItemTotal = (item: any) => {
    let total = item.price;
    if (item.selectedOptions?.size) {
      total += item.selectedOptions.size.price;
    }
    if (item.selectedOptions?.extras) {
      total += item.selectedOptions.extras.reduce((sum: number, extra: any) => sum + extra.price, 0);
    }
    return total * item.quantity;
  };

  const handleCheckout = () => {
    onOpenChange(false);
    navigate(`/checkout?restaurant=${restaurant.id}&table=${tableToken || ""}&currency=${restaurant.currency || "USD"}`);
  };

  if (items.length === 0) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{t.cart.title}</SheetTitle>
            <SheetDescription>{t.cart.empty}</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <ShoppingBag className="h-20 w-20 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {t.cart.emptyMessage}
            </p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>{t.cart.title}</SheetTitle>
          <SheetDescription>{items.length} {t.cart.items}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6 my-4">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 rounded-lg border border-border">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{item.name}</h4>
                  
                  {/* Options */}
                  <div className="text-sm text-muted-foreground mt-1 space-y-1">
                    {item.selectedOptions?.size && (
                      <p>{t.cart.size}: {item.selectedOptions.size.name}</p>
                    )}
                    {item.selectedOptions?.extras && item.selectedOptions.extras.length > 0 && (
                      <p>{t.cart.extras}: {item.selectedOptions.extras.map((e: any) => e.name).join(", ")}</p>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium min-w-[2ch] text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary">{formatPrice(getItemTotal(item))}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="space-y-4 border-t border-border pt-4">
          {/* Total */}
          <div className="flex items-center justify-between text-lg font-bold">
            <span>{t.cart.total}</span>
            <span>{formatPrice(getTotalPrice())}</span>
          </div>

          {/* Checkout Button */}
          <Button
            onClick={handleCheckout}
            className="w-full gradient-primary py-6 text-lg"
            size="lg"
          >
            {t.cart.checkout}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
