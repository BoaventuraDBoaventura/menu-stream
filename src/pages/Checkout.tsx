import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ShoppingBag, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCustomerSession } from "@/hooks/useCustomerSession";

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { items, getTotalPrice, clearCart } = useCart();
  const { getSession, saveSession } = useCustomerSession();
  
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [hasExistingSession, setHasExistingSession] = useState(false);
  const [restaurantSlug, setRestaurantSlug] = useState("");

  const restaurantId = searchParams.get("restaurant");
  const tableToken = searchParams.get("table");
  const currency = searchParams.get("currency") || "USD";

  useEffect(() => {
    // Check for existing customer session
    const session = getSession();
    if (session && session.restaurantId === restaurantId) {
      setCustomerName(session.customerName);
      setCustomerPhone(session.customerPhone);
      setHasExistingSession(true);
    }

    if (restaurantId) {
      fetchPaymentMethods();
      fetchRestaurantSlug();
    }
  }, [restaurantId]);

  const fetchRestaurantSlug = async () => {
    const { data } = await supabase
      .from("restaurants")
      .select("slug")
      .eq("id", restaurantId)
      .single();
    
    if (data) {
      setRestaurantSlug(data.slug);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("is_enabled", true)
        .order("position", { ascending: true });

      if (error) throw error;
      setPaymentMethods(data || []);
      
      // Auto-select first method if available
      if (data && data.length > 0) {
        setSelectedPaymentMethod(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  const handleSubmitOrder = async () => {
    if (!customerName.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha seu nome",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPaymentMethod) {
      toast({
        title: "Método de pagamento obrigatório",
        description: "Por favor, selecione um método de pagamento",
        variant: "destructive",
      });
      return;
    }

    if (!restaurantId) {
      toast({
        title: "Erro",
        description: "Restaurante não identificado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get table_id if tableToken exists
      let tableId = null;
      if (tableToken) {
        const { data: tableData } = await supabase
          .from("tables")
          .select("id")
          .eq("qr_code_token", tableToken)
          .eq("restaurant_id", restaurantId)
          .single();
        
        tableId = tableData?.id;
      }

      // Generate order number
      const { data: orderNumberData } = await supabase
        .rpc("generate_order_number", { restaurant_id: restaurantId });

      // Get payment method name
      const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
      
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          restaurant_id: restaurantId,
          table_id: tableId,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim() || "Não informado",
          notes: notes.trim() || null,
          order_number: orderNumberData,
          total_amount: getTotalPrice(),
          order_status: "new",
          payment_status: "pending",
          payment_method: selectedMethod?.name || "Não especificado",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        price: item.price,
        options: item.selectedOptions || null,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Save customer session for future orders
      saveSession({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || "Não informado",
        restaurantId: restaurantId,
        tableToken: tableToken || "",
        restaurantSlug: restaurantSlug,
      });

      // Clear cart
      clearCart();

      toast({
        title: "Pedido enviado!",
        description: `Número do pedido: ${orderData.order_number}`,
      });

      // Navigate to order status page with customer info for viewing all orders
      navigate(`/order-status?restaurant=${restaurantId}&customer=${encodeURIComponent(customerName.trim())}`);
    } catch (error: any) {
      console.error("Error submitting order:", error);
      toast({
        title: "Erro ao enviar pedido",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Carrinho Vazio</h1>
          <p className="text-muted-foreground mb-4">
            Adicione itens ao carrinho antes de finalizar
          </p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <h1 className="text-3xl font-bold mb-6">Finalizar Pedido</h1>

        {/* Customer Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Suas Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasExistingSession ? (
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Cliente identificado:</p>
                <p className="font-medium text-lg">{customerName}</p>
                {customerPhone && customerPhone !== "Não informado" && (
                  <p className="text-sm text-muted-foreground">{customerPhone}</p>
                )}
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone (opcional)</Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Alguma observação sobre seu pedido?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Método de Pagamento *</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentMethods.length > 0 ? (
              <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center space-x-3">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="cursor-pointer flex-1">
                        {method.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum método de pagamento disponível
              </p>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item) => {
                let itemTotal = item.price;
                if (item.selectedOptions?.size) {
                  itemTotal += item.selectedOptions.size.price;
                }
                if (item.selectedOptions?.extras) {
                  itemTotal += item.selectedOptions.extras.reduce((sum, e) => sum + e.price, 0);
                }
                itemTotal *= item.quantity;

                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-medium">{formatPrice(itemTotal)}</span>
                  </div>
                );
              })}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>

            <Button
              onClick={handleSubmitOrder}
              disabled={loading}
              className="w-full mt-6 gradient-primary py-6 text-lg"
              size="lg"
            >
              {loading ? "Enviando..." : "Enviar Pedido"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
