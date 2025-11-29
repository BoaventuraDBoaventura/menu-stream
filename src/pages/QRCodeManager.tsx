import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, ArrowLeft, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TableList } from "@/components/qr/TableList";
import { TableDialog } from "@/components/qr/TableDialog";

const QRCodeManager = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any>(null);

  const restaurantId = searchParams.get("restaurant");

  useEffect(() => {
    if (!restaurantId) {
      toast({
        title: "No restaurant selected",
        description: "Please select a restaurant first",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }
    loadData();
  }, [restaurantId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load restaurant
      const { data: restaurantData, error: restaurantError } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", restaurantId)
        .single();

      if (restaurantError) throw restaurantError;
      setRestaurant(restaurantData);

      // Load tables
      await loadTables();
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTables = async () => {
    const { data, error } = await supabase
      .from("tables")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("name");

    if (error) {
      toast({
        title: "Error loading tables",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setTables(data || []);
    }
  };

  const handleAddTable = () => {
    setSelectedTable(null);
    setDialogOpen(true);
  };

  const handleEditTable = (table: any) => {
    setSelectedTable(table);
    setDialogOpen(true);
  };

  const handleDeleteTable = async (tableId: string) => {
    try {
      const { error } = await supabase
        .from("tables")
        .delete()
        .eq("id", tableId);

      if (error) throw error;

      toast({
        title: "Table deleted",
        description: "The table has been removed",
      });

      loadTables();
    } catch (error: any) {
      toast({
        title: "Error deleting table",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveTable = async (tableData: any) => {
    try {
      if (selectedTable) {
        // Update existing table
        const { error } = await supabase
          .from("tables")
          .update({
            name: tableData.name,
            is_active: tableData.is_active,
          })
          .eq("id", selectedTable.id);

        if (error) throw error;

        toast({
          title: "Table updated",
          description: "The table has been updated successfully",
        });
      } else {
        // Create new table
        const { error } = await supabase
          .from("tables")
          .insert({
            restaurant_id: restaurantId,
            name: tableData.name,
            qr_code_token: crypto.randomUUID(),
            is_active: tableData.is_active ?? true,
          });

        if (error) throw error;

        toast({
          title: "Table created",
          description: "The table has been created successfully",
        });
      }

      loadTables();
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error saving table",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <ChefHat className="h-7 w-7 text-primary" />
              <div>
                <h1 className="text-xl font-bold">QR Code Manager</h1>
                <p className="text-sm text-muted-foreground">{restaurant?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">Tables & QR Codes</h2>
            <p className="text-muted-foreground mt-1">
              Generate and manage QR codes for your restaurant tables
            </p>
          </div>
          <Button onClick={handleAddTable} className="gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Table
          </Button>
        </div>

        {tables.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No tables yet</CardTitle>
              <CardDescription>
                Create your first table to generate QR codes for customer orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleAddTable} className="gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create First Table
              </Button>
            </CardContent>
          </Card>
        ) : (
          <TableList
            tables={tables}
            restaurant={restaurant}
            onEdit={handleEditTable}
            onDelete={handleDeleteTable}
          />
        )}

        <TableDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          table={selectedTable}
          onSave={handleSaveTable}
        />
      </main>
    </div>
  );
};

export default QRCodeManager;
