import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { LogOut, ArrowLeft, Loader2, FileText, TrendingUp, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Restaurant {
  id: string;
  name: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
}

const Reports = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [restaurantLogo, setRestaurantLogo] = useState<string>("");
  const [currency, setCurrency] = useState<string>("MZN");
  
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [selectedDay, setSelectedDay] = useState<string>(new Date().getDate().toString());
  const [selectedHour, setSelectedHour] = useState<string>("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("all");
  const [paymentMethods, setPaymentMethods] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchUserRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurantId) {
      loadRestaurantData();
      fetchPaymentMethods();
    }
  }, [selectedRestaurantId]);

  useEffect(() => {
    applyFilters();
  }, [filterType, selectedYear, selectedMonth, selectedDay, selectedHour, selectedPaymentMethod, orders]);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("id, name")
        .eq("restaurant_id", selectedRestaurantId)
        .order("position", { ascending: true });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  const fetchUserRestaurants = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: restaurantsData, error } = await supabase
        .from("restaurants")
        .select("id, name")
        .order("name");

      if (error) throw error;

      setRestaurants(restaurantsData || []);
      
      // Set initial restaurant from URL or first available
      const urlRestaurantId = searchParams.get("restaurant");
      if (urlRestaurantId && restaurantsData?.some(r => r.id === urlRestaurantId)) {
        setSelectedRestaurantId(urlRestaurantId);
      } else if (restaurantsData && restaurantsData.length > 0) {
        setSelectedRestaurantId(restaurantsData[0].id);
        setSearchParams({ restaurant: restaurantsData[0].id });
      }
    } catch (error: any) {
      console.error("Error fetching restaurants:", error);
      toast({
        title: "Erro ao carregar restaurantes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRestaurantData = async () => {
    try {
      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("name, currency, logo_url")
        .eq("id", selectedRestaurantId)
        .single();

      if (restaurant) {
        setRestaurantName(restaurant.name);
        setCurrency(restaurant.currency || "MZN");
        setRestaurantLogo(restaurant.logo_url || "");
      }

      await fetchOrders(selectedRestaurantId);
    } catch (error: any) {
      console.error("Error loading restaurant data:", error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRestaurantChange = (restaurantId: string) => {
    setSelectedRestaurantId(restaurantId);
    setSearchParams({ restaurant: restaurantId });
  };

  const fetchOrders = async (restaurantId: string) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Erro ao carregar pedidos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    if (filterType === "year") {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.created_at);
        return orderDate.getFullYear().toString() === selectedYear;
      });
    } else if (filterType === "month") {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.created_at);
        return (
          orderDate.getFullYear().toString() === selectedYear &&
          (orderDate.getMonth() + 1).toString() === selectedMonth
        );
      });
    } else if (filterType === "day") {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.created_at);
        return (
          orderDate.getFullYear().toString() === selectedYear &&
          (orderDate.getMonth() + 1).toString() === selectedMonth &&
          orderDate.getDate().toString() === selectedDay
        );
      });
    } else if (filterType === "hour") {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.created_at);
        const hourMatch = selectedHour === "all" || orderDate.getHours().toString() === selectedHour;
        return (
          orderDate.getFullYear().toString() === selectedYear &&
          (orderDate.getMonth() + 1).toString() === selectedMonth &&
          orderDate.getDate().toString() === selectedDay &&
          hourMatch
        );
      });
    }

    // Apply payment method filter
    if (selectedPaymentMethod !== "all") {
      filtered = filtered.filter((order) => order.payment_method === selectedPaymentMethod);
    }

    setFilteredOrders(filtered);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const calculateTotals = () => {
    const total = filteredOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const completed = filteredOrders.filter(o => o.order_status === 'completed').length;
    const pending = filteredOrders.filter(o => o.order_status === 'new' || o.order_status === 'preparing').length;
    
    return { total, count: filteredOrders.length, completed, pending };
  };

  const totals = calculateTotals();

  const generatePDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // ===== HEADER SECTION =====
    // Header background - azul suave
    doc.setFillColor(239, 246, 255); // Light blue background
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // System branding
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235); // Blue
    doc.text("PratoDigital", 15, 22);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("Sistema de Gestão de Restaurantes", 15, 30);
    
    // Restaurant logo (right side)
    if (restaurantLogo) {
      try {
        doc.addImage(restaurantLogo, "PNG", pageWidth - 48, 10, 33, 33);
      } catch (error) {
        console.error("Error adding restaurant logo:", error);
      }
    }
    
    let yPosition = 60;
    
    // ===== RESTAURANT INFO & TITLE =====
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(restaurantName, 15, yPosition);
    yPosition += 10;
    
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text("Relatório de Vendas", 15, yPosition);
    yPosition += 15;
    
    // ===== FILTER INFO BOX =====
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(191, 219, 254);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, yPosition, pageWidth - 30, 24, 3, 3, 'FD');
    
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138);
    doc.text("Período do Relatório:", 20, yPosition);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    let filterText = "";
    if (filterType === "all") {
      filterText = "Todos os pedidos registrados";
    } else if (filterType === "year") {
      filterText = `Ano completo de ${selectedYear}`;
    } else if (filterType === "month") {
      filterText = `${format(new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1), "MMMM 'de' yyyy", { locale: ptBR })}`;
    } else if (filterType === "day") {
      filterText = `Dia ${selectedDay} de ${format(new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1), "MMMM 'de' yyyy", { locale: ptBR })}`;
    } else if (filterType === "hour") {
      filterText = `${selectedDay}/${selectedMonth}/${selectedYear} - ${selectedHour === "all" ? "Todas as horas" : `Período: ${selectedHour}:00 até ${selectedHour}:59`}`;
    }
    doc.text(filterText, 20, yPosition + 5);
    
    if (selectedPaymentMethod !== "all") {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 58, 138);
      doc.text("Método de Pagamento:", 20, yPosition + 10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      doc.text(selectedPaymentMethod, 64, yPosition + 10);
    }
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Relatório gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 20, yPosition + 15);
    yPosition += 30;
    
    // ===== SUMMARY STATISTICS CARDS =====
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138);
    doc.text("Resumo Executivo", 15, yPosition);
    yPosition += 10;
    
    const cardWidth = (pageWidth - 40) / 2;
    const cardHeight = 28;
    const cardSpacing = 5;
    
    // Card 1: Total de Vendas
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(191, 219, 254);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, yPosition, cardWidth - 2.5, cardHeight, 2, 2, 'FD');
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("Total de Vendas", 20, yPosition + 8);
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text(formatPrice(totals.total), 20, yPosition + 18);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Baseado em ${totals.count} pedido${totals.count !== 1 ? 's' : ''}`, 20, yPosition + 24);
    
    // Card 2: Ticket Médio
    doc.roundedRect(15 + cardWidth + 2.5, yPosition, cardWidth - 2.5, cardHeight, 2, 2, 'FD');
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("Ticket Médio", 20 + cardWidth + 2.5, yPosition + 8);
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    const avgTicket = totals.count > 0 ? formatPrice(totals.total / totals.count) : formatPrice(0);
    doc.text(avgTicket, 20 + cardWidth + 2.5, yPosition + 18);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Valor médio por pedido", 20 + cardWidth + 2.5, yPosition + 24);
    
    yPosition += cardHeight + cardSpacing;
    
    // Card 3: Pedidos Completos
    doc.roundedRect(15, yPosition, cardWidth - 2.5, cardHeight, 2, 2, 'FD');
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("Pedidos Concluídos", 20, yPosition + 8);
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text(totals.completed.toString(), 20, yPosition + 18);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    const completedPercent = totals.count > 0 ? ((totals.completed / totals.count) * 100).toFixed(1) : "0";
    doc.text(`${completedPercent}% dos pedidos finalizados`, 20, yPosition + 24);
    
    // Card 4: Pedidos Pendentes
    doc.roundedRect(15 + cardWidth + 2.5, yPosition, cardWidth - 2.5, cardHeight, 2, 2, 'FD');
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("Pedidos em Andamento", 20 + cardWidth + 2.5, yPosition + 8);
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text(totals.pending.toString(), 20 + cardWidth + 2.5, yPosition + 18);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Novos ou em preparação", 20 + cardWidth + 2.5, yPosition + 24);
    
    yPosition += cardHeight + 18;
    
    // ===== ORDERS TABLE TITLE =====
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Detalhamento dos Pedidos (${filteredOrders.length})`, 15, yPosition);
    yPosition += 8;
    
    // ===== ORDERS TABLE =====
    const tableData = filteredOrders.map(order => [
      order.order_number,
      order.customer_name,
      format(new Date(order.created_at), "dd/MM/yy HH:mm", { locale: ptBR }),
      order.order_status === 'new' ? 'Novo' :
        order.order_status === 'preparing' ? 'Preparando' :
        order.order_status === 'ready' ? 'Pronto' :
        order.order_status === 'completed' ? 'Concluído' : 'Cancelado',
      order.payment_method === 'cash' ? 'Dinheiro' : order.payment_method,
      formatPrice(Number(order.total_amount))
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Nº Pedido', 'Cliente', 'Data/Hora', 'Status', 'Pagamento', 'Valor Total']],
      body: tableData,
      theme: 'plain',
      headStyles: { 
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 4
      },
      styles: { 
        fontSize: 9,
        cellPadding: 4,
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
        textColor: [51, 65, 85]
      },
      columnStyles: {
        0: { cellWidth: 28, fontStyle: 'bold', textColor: [37, 99, 235] },
        1: { cellWidth: 45 },
        2: { halign: 'center', cellWidth: 28 },
        3: { halign: 'center', cellWidth: 26 },
        4: { cellWidth: 30 },
        5: { halign: 'right', fontStyle: 'bold', cellWidth: 30, textColor: [37, 99, 235] }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 15, right: 15 },
      didDrawPage: (data) => {
        // Add page numbers
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Página ${data.pageNumber}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
    });
    
    // ===== FOOTER =====
    const finalY = (doc as any).lastAutoTable.finalY || yPosition;
    
    // Footer background
    doc.setFillColor(239, 246, 255);
    doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');
    
    // Footer text
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "normal");
    const footerText = `Processado por PratoDigital em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`;
    const footerTextWidth = doc.getTextWidth(footerText);
    doc.text(footerText, (pageWidth - footerTextWidth) / 2, pageHeight - 12);
    
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Sistema de Gestão de Restaurantes", pageWidth / 2, pageHeight - 7, { align: 'center' });
    
    // ===== SAVE PDF =====
    const filename = `relatorio_${restaurantName.replace(/\s+/g, '_')}_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`;
    doc.save(filename);
    
    toast({
      title: "PDF gerado com sucesso",
      description: `O relatório foi baixado: ${filename}`,
    });
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Relatório de Vendas</h1>
              <p className="text-muted-foreground">{restaurantName}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(totals.total)}</div>
              <p className="text-xs text-muted-foreground">
                {totals.count} pedidos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Completos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totals.completed}</div>
              <p className="text-xs text-muted-foreground">
                {totals.count > 0 ? ((totals.completed / totals.count) * 100).toFixed(1) : 0}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totals.pending}</div>
              <p className="text-xs text-muted-foreground">
                Em preparação ou novos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totals.count > 0 ? formatPrice(totals.total / totals.count) : formatPrice(0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Por pedido
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Filtros</CardTitle>
                <CardDescription>Filtre os pedidos por restaurante, período e método de pagamento</CardDescription>
              </div>
              <Button onClick={generatePDF} variant="default">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-6">
              {restaurants.length > 1 && (
                <Select value={selectedRestaurantId} onValueChange={handleRestaurantChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o restaurante" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de filtro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="year">Por Ano</SelectItem>
                  <SelectItem value="month">Por Mês</SelectItem>
                  <SelectItem value="day">Por Dia</SelectItem>
                  <SelectItem value="hour">Por Hora</SelectItem>
                </SelectContent>
              </Select>

              {filterType !== "all" && (
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {(filterType === "month" || filterType === "day" || filterType === "hour") && (
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {format(new Date(2024, month - 1, 1), "MMMM", { locale: ptBR })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {(filterType === "day" || filterType === "hour") && (
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {filterType === "hour" && (
                <Select value={selectedHour} onValueChange={setSelectedHour}>
                  <SelectTrigger>
                    <SelectValue placeholder="Hora" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as horas</SelectItem>
                    {hours.map((hour) => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {hour}:00 - {hour}:59
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Método de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os métodos</SelectItem>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.name}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos ({filteredOrders.length})</CardTitle>
            <CardDescription>Lista de todos os pedidos no período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhum pedido encontrado no período selecionado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="text-sm text-muted-foreground">{order.customer_phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          order.order_status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.order_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.order_status === 'new' ? 'Novo' :
                           order.order_status === 'preparing' ? 'Preparando' :
                           order.order_status === 'ready' ? 'Pronto' :
                           order.order_status === 'completed' ? 'Completo' :
                           'Cancelado'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{order.payment_method === 'cash' ? 'Dinheiro' : order.payment_method}</div>
                          <div className={`text-xs ${
                            order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {order.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(Number(order.total_amount))}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
