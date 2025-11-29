import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, ArrowLeft, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CategoryList } from "@/components/menu/CategoryList";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { CategoryDialog } from "@/components/menu/CategoryDialog";
import { MenuItemDialog } from "@/components/menu/MenuItemDialog";

const MenuEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get("restaurant");
  
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menu, setMenu] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (restaurantId) {
      fetchData();
    }
  }, [restaurantId]);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchMenuItems();
    }
  }, [selectedCategoryId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch restaurant
      const { data: restaurantData, error: restaurantError } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", restaurantId)
        .maybeSingle();

      if (restaurantError) throw restaurantError;
      
      if (!restaurantData) {
        toast({
          title: "Restaurante não encontrado",
          description: "O restaurante não pôde ser encontrado.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }
      
      setRestaurant(restaurantData);

      // Fetch menu
      const { data: menuData, error: menuError } = await supabase
        .from("menus")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("is_active", true)
        .maybeSingle();

      if (menuError) throw menuError;
      
      if (!menuData) {
        toast({
          title: "Nenhum menu encontrado",
          description: "Por favor, crie um menu primeiro.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setMenu(menuData);

      // Fetch categories with item counts
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select(`
          *,
          menu_items(count)
        `)
        .eq("menu_id", menuData.id)
        .order("position");

      if (categoriesError) throw categoriesError;

      const categoriesWithCounts = categoriesData.map((cat: any) => ({
        ...cat,
        item_count: cat.menu_items[0]?.count || 0,
      }));

      setCategories(categoriesWithCounts);

      if (categoriesWithCounts.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(categoriesWithCounts[0].id);
      }
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

  const fetchMenuItems = async () => {
    if (!selectedCategoryId) return;

    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("category_id", selectedCategoryId)
        .order("position");

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar itens",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleItemAvailability = async (itemId: string, available: boolean) => {
    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ is_available: available })
        .eq("id", itemId);

      if (error) throw error;

      toast({
        title: available ? "Item ativado" : "Item desativado",
        description: available ? "O item está agora disponível." : "O item está agora indisponível.",
      });

      fetchMenuItems();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      toast({
        title: "Item excluído",
        description: "O item do menu foi removido.",
      });

      fetchMenuItems();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!restaurant || !menu) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ChefHat className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-xl font-bold">{restaurant.name}</h1>
              <p className="text-sm text-muted-foreground">Editor de Menu</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Categorias</CardTitle>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
                <CardDescription>Arraste para reordenar</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryList
                  menuId={menu.id}
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onCategorySelect={setSelectedCategoryId}
                  onRefresh={fetchData}
                  onEdit={(category) => {
                    setEditingCategory(category);
                    setCategoryDialogOpen(true);
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Menu Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Itens do Menu</CardTitle>
                    <CardDescription>
                      {categories.find((c) => c.id === selectedCategoryId)?.name || "Selecione uma categoria"}
                    </CardDescription>
                  </div>
                  {selectedCategoryId && (
                    <Button 
                      onClick={() => {
                        setEditingItem(null);
                        setItemDialogOpen(true);
                      }}
                      className="gradient-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Item
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!selectedCategoryId ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Selecione uma categoria para ver os itens</p>
                  </div>
                ) : menuItems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Ainda não há itens nesta categoria</p>
                    <Button 
                      onClick={() => {
                        setEditingItem(null);
                        setItemDialogOpen(true);
                      }}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeiro Item
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {menuItems.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        currency={restaurant.currency}
                        onEdit={() => {
                          setEditingItem(item);
                          setItemDialogOpen(true);
                        }}
                        onDelete={() => handleDeleteItem(item.id)}
                        onToggleAvailability={(available) => 
                          handleToggleItemAvailability(item.id, available)
                        }
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        menuId={menu.id}
        category={editingCategory}
        onSuccess={fetchData}
      />

      {selectedCategoryId && (
        <MenuItemDialog
          open={itemDialogOpen}
          onOpenChange={setItemDialogOpen}
          menuId={menu.id}
          categoryId={selectedCategoryId}
          item={editingItem}
          onSuccess={fetchMenuItems}
        />
      )}
    </div>
  );
};

export default MenuEditor;
