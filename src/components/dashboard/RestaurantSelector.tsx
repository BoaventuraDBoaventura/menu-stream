import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

interface Restaurant {
  id: string;
  name: string;
  logo_url?: string;
}

interface RestaurantSelectorProps {
  restaurants: Restaurant[];
  activeRestaurantId: string;
  onRestaurantChange: (restaurantId: string) => void;
}

export const RestaurantSelector = ({ restaurants, activeRestaurantId, onRestaurantChange }: RestaurantSelectorProps) => {
  const { t } = useLanguage();

  return (
    <Select value={activeRestaurantId} onValueChange={onRestaurantChange}>
      <SelectTrigger className="w-full sm:w-[280px]">
        <SelectValue placeholder="Selecione um restaurante" />
      </SelectTrigger>
      <SelectContent>
        {restaurants.map((restaurant) => (
          <SelectItem key={restaurant.id} value={restaurant.id}>
            <div className="flex items-center gap-2">
              {restaurant.logo_url && (
                <img src={restaurant.logo_url} alt={restaurant.name} className="w-5 h-5 rounded-full object-cover" />
              )}
              <span>{restaurant.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
