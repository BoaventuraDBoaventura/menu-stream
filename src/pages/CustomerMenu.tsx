import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChefHat } from "lucide-react";
import { CustomerMenuItemCard } from "@/components/customer/CustomerMenuItemCard";
import { CartButton } from "@/components/customer/CartButton";
import { CartDrawer } from "@/components/customer/CartDrawer";
import { useToast } from "@/hooks/use-toast";

const CustomerMenu = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menu, setMenu] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [table, setTable] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const tableToken = searchParams.get("table");

  useEffect(() => {
    loadMenuData();
  }, [slug]);

  const loadMenuData = async () => {
    try {
      setLoading(true);
      console.log("Loading menu for slug:", slug);

      // Load restaurant
      const { data: restaurantData, error: restaurantError } = await supabase
        .from("restaurants")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      console.log("Restaurant data:", restaurantData, "Error:", restaurantError);

      if (restaurantError) throw restaurantError;
      if (!restaurantData) {
        toast({
          title: "Restaurante não encontrado",
          variant: "destructive",
        });
        return;
      }

      setRestaurant(restaurantData);

      // Load table information if token is provided
      if (tableToken) {
        const { data: tableData, error: tableError } = await supabase
          .from("tables")
          .select("*")
          .eq("qr_code_token", tableToken)
          .eq("restaurant_id", restaurantData.id)
          .single();

        if (!tableError && tableData) {
          setTable(tableData);
        }
      }

      // Load active menu
      const { data: menuData, error: menuError } = await supabase
        .from("menus")
        .select("*")
        .eq("restaurant_id", restaurantData.id)
        .eq("is_active", true)
        .maybeSingle();

      console.log("Menu data:", menuData, "Error:", menuError);

      if (menuError) {
        console.error("Menu error details:", menuError);
        toast({
          title: "Menu não encontrado",
          description: "Este restaurante ainda não tem um menu ativo. Por favor, crie um menu primeiro.",
          variant: "destructive",
        });
        return;
      }
      
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
      
      // Set first category as selected by default
      if (categoriesData && categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0].id);
      }
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

  const filteredItems = selectedCategory
    ? menuItems.filter((item) => item.category_id === selectedCategory)
    : [];

  return (
    <div className="min-h-screen bg-gradient-warm pb-24">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-soft">
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
                {table && (
                  <p className="text-sm text-primary font-medium">{table.name}</p>
                )}
                {menu.description && !table && (
                  <p className="text-sm text-muted-foreground">{menu.description}</p>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Category Navigation */}
        {categories.length > 0 && (
          <div className="sticky top-[88px] z-40 bg-card/95 backdrop-blur-sm border-b border-border shadow-soft">
            <div className="container mx-auto px-4 py-3">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {categories.map((category) => {
                  const categoryItems = menuItems.filter(
                    (item) => item.category_id === category.id
                  );
                  if (categoryItems.length === 0) return null;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-smooth ${
                        selectedCategory === category.id
                          ? "bg-primary text-primary-foreground shadow-medium"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {category.name}
                    </button>
                  );
                })}
                {menuItems.filter((item) => !item.category_id).length > 0 && (
                  <button
                    onClick={() => setSelectedCategory("uncategorized")}
                    className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-smooth ${
                      selectedCategory === "uncategorized"
                        ? "bg-primary text-primary-foreground shadow-medium"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Outros
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Menu Content */}
        <main className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">{menu.title}</h2>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No menu items available at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {selectedCategory === "uncategorized"
                ? menuItems
                    .filter((item) => !item.category_id)
                    .map((item) => (
                      <CustomerMenuItemCard
                        key={item.id}
                        item={item}
                        currency={restaurant.currency || "USD"}
                      />
                    ))
                : filteredItems.map((item) => (
                    <CustomerMenuItemCard
                      key={item.id}
                      item={item}
                      currency={restaurant.currency || "USD"}
                    />
                  ))}
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
  );
};

export default CustomerMenu;
