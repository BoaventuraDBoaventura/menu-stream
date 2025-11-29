import { useNavigate } from "react-router-dom";
import { ChefHat, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateRestaurantForm } from "@/components/restaurant/CreateRestaurantForm";

const CreateRestaurant = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold">PratoDigital</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <CreateRestaurantForm
          onSuccess={() => navigate("/dashboard")}
          onCancel={() => navigate("/dashboard")}
        />
      </main>
    </div>
  );
};

export default CreateRestaurant;
