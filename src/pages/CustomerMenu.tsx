import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChefHat } from "lucide-react";
import { CategorySection } from "@/components/customer/CategorySection";
import { CartButton } from "@/components/customer/CartButton";
import { CartDrawer } from "@/components/customer/CartDrawer";
import { CartProvider } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

const CustomerMenu = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menu, setMenu] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);

  const tableToken = searchParams.get("table");

  useEffect(() => {
    loadMenuData();
  }, [slug]);

  const loadMenuData = async () => {
    try {
      setLoading(true);

      // Load restaurant
      const { data: restaurantData, error: restaurantError } = await supabase
        .from("restaurants")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (restaurantError) throw restaurantError;
      if (!restaurantData) {
        toast({
          title: "Restaurant not found",
          variant: "destructive",
        });
        return;
      }

      setRestaurant(restaurantData);

      // Load active menu
      const { data: menuData, error: menuError } = await supabase
        .from("menus")
        .select("*")
        .eq("restaurant_id", restaurantData.id)
        .eq("is_active", true)
        .single();

      if (menuError) throw menuError;
      setMenu(menuData);

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("menu_id", menuData.id)
        .order("position");

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Load menu items
      const { data: itemsData, error: itemsError } = await supabase
        .from("menu_items")
        .select("*")
        .eq("menu_id", menuData.id)
        .eq("is_available", true)
        .order("position");

      if (itemsError) throw itemsError;
      setMenuItems(itemsData || []);
    } catch (error: any) {
      console.error("Error loading menu:", error);
      toast({
        title: "Error loading menu",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!restaurant || !menu) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Menu Not Found</h1>
          <p className="text-muted-foreground">
            The restaurant menu you're looking for is not available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-gradient-warm pb-24">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border shadow-soft">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              {restaurant.logo_url ? (
                <img
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ChefHat className="h-6 w-6 text-primary" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold">{restaurant.name}</h1>
                {menu.description && (
                  <p className="text-sm text-muted-foreground">{menu.description}</p>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Menu Content */}
        <main className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">{menu.title}</h2>
            {tableToken && (
              <p className="text-sm text-muted-foreground">
                Viewing menu for your table
              </p>
            )}
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No menu items available at the moment.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {categories.map((category) => {
                const categoryItems = menuItems.filter(
                  (item) => item.category_id === category.id
                );
                if (categoryItems.length === 0) return null;
                
                return (
                  <CategorySection
                    key={category.id}
                    category={category}
                    items={categoryItems}
                    currency={restaurant.currency || "USD"}
                  />
                );
              })}

              {/* Uncategorized items */}
              {menuItems.filter((item) => !item.category_id).length > 0 && (
                <CategorySection
                  category={{ id: "uncategorized", name: "Other Items" }}
                  items={menuItems.filter((item) => !item.category_id)}
                  currency={restaurant.currency || "USD"}
                />
              )}
            </div>
          )}
        </main>

        {/* Floating Cart Button */}
        <CartButton onClick={() => setCartOpen(true)} />

        {/* Cart Drawer */}
        <CartDrawer
          open={cartOpen}
          onOpenChange={setCartOpen}
          restaurant={restaurant}
          tableToken={tableToken}
        />
      </div>
    </CartProvider>
  );
};

export default CustomerMenu;
