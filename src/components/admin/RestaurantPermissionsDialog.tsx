import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Store } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

interface RestaurantPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

export const RestaurantPermissionsDialog = ({
  open,
  onOpenChange,
  userId,
  userName,
}: RestaurantPermissionsDialogProps) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, userId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all restaurants
      const { data: restaurantsData, error: restaurantsError } = await supabase
        .from("restaurants")
        .select("id, name, slug")
        .order("name");

      if (restaurantsError) throw restaurantsError;

      // Fetch user's current permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from("restaurant_permissions")
        .select("restaurant_id")
        .eq("user_id", userId);

      if (permissionsError) throw permissionsError;

      setRestaurants(restaurantsData || []);
      setSelectedRestaurants(
        new Set(permissionsData?.map((p) => p.restaurant_id) || [])
      );
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRestaurant = async (restaurantId: string, checked: boolean) => {
    setSaving(true);
    try {
      if (checked) {
        // Add permission
        const { error } = await supabase
          .from("restaurant_permissions")
          .insert({ user_id: userId, restaurant_id: restaurantId });

        if (error) throw error;

        setSelectedRestaurants((prev) => new Set(prev).add(restaurantId));
      } else {
        // Remove permission
        const { error } = await supabase
          .from("restaurant_permissions")
          .delete()
          .eq("user_id", userId)
          .eq("restaurant_id", restaurantId);

        if (error) throw error;

        setSelectedRestaurants((prev) => {
          const newSet = new Set(prev);
          newSet.delete(restaurantId);
          return newSet;
        });
      }

      toast({
        title: checked ? "Permissão adicionada" : "Permissão removida",
        description: checked
          ? "Usuário agora tem acesso a este restaurante."
          : "Acesso ao restaurante foi removido.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar permissão",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Permissões de Restaurante</DialogTitle>
          <DialogDescription>
            Selecione quais restaurantes <strong>{userName}</strong> pode gerenciar.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : restaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Store className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Nenhum restaurante disponível
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedRestaurants.has(restaurant.id)}
                    onCheckedChange={(checked) =>
                      handleToggleRestaurant(restaurant.id, checked as boolean)
                    }
                    disabled={saving}
                    id={restaurant.id}
                  />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={restaurant.id}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {restaurant.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      /{restaurant.slug}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
