import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface AddToCartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
  currency: string;
}

export const AddToCartDialog = ({ open, onOpenChange, item, currency }: AddToCartDialogProps) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [selectedExtras, setSelectedExtras] = useState<any[]>([]);

  const options = item.options || [];
  const sizes = options.filter((opt: any) => opt.type === "size");
  const extras = options.filter((opt: any) => opt.type === "extra");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  const calculateTotal = () => {
    let total = item.price;
    if (selectedSize) total += selectedSize.price;
    total += selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    return total * quantity;
  };

  const handleAddToCart = () => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      image_url: item.image_url,
      selectedOptions: {
        size: selectedSize,
        extras: selectedExtras,
      },
    });

    toast({
      title: "Added to cart",
      description: `${quantity}x ${item.name}`,
    });

    onOpenChange(false);
    setQuantity(1);
    setSelectedSize(null);
    setSelectedExtras([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription>{item.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Item Image */}
          {item.image_url && (
            <div className="aspect-video overflow-hidden rounded-lg bg-muted">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Size Options */}
          {sizes.length > 0 && (
            <div>
              <Label className="text-base font-semibold mb-3 block">Select Size</Label>
              <RadioGroup value={selectedSize?.name} onValueChange={(value) => {
                const size = sizes.find((s: any) => s.name === value);
                setSelectedSize(size);
              }}>
                <div className="space-y-2">
                  {sizes.map((size: any) => (
                    <div key={size.name} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-smooth">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value={size.name} id={size.name} />
                        <Label htmlFor={size.name} className="cursor-pointer font-normal">
                          {size.name}
                        </Label>
                      </div>
                      {size.price > 0 && (
                        <Badge variant="secondary">+{formatPrice(size.price)}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Extra Options */}
          {extras.length > 0 && (
            <div>
              <Label className="text-base font-semibold mb-3 block">Add Extras</Label>
              <div className="space-y-2">
                {extras.map((extra: any) => (
                  <div key={extra.name} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-smooth">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={extra.name}
                        checked={selectedExtras.some((e) => e.name === extra.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedExtras([...selectedExtras, extra]);
                          } else {
                            setSelectedExtras(selectedExtras.filter((e) => e.name !== extra.name));
                          }
                        }}
                      />
                      <Label htmlFor={extra.name} className="cursor-pointer font-normal">
                        {extra.name}
                      </Label>
                    </div>
                    <Badge variant="secondary">+{formatPrice(extra.price)}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Quantity</Label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-2xl font-bold min-w-[3ch] text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleAddToCart}
            className="w-full gradient-primary text-lg py-6"
          >
            Add to Cart • {formatPrice(calculateTotal())}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
