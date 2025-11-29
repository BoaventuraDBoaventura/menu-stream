import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import CreateRestaurant from "./pages/CreateRestaurant";
import MenuEditor from "./pages/MenuEditor";
import QRCodeManager from "./pages/QRCodeManager";
import CustomerMenu from "./pages/CustomerMenu";
import Checkout from "./pages/Checkout";
import OrderStatus from "./pages/OrderStatus";
import Kitchen from "./pages/Kitchen";
import NotFound from "./pages/NotFound";
import PlatformSettings from "./pages/PlatformSettings";
import TeamManagement from "./pages/TeamManagement";
import Reports from "./pages/Reports";
import { CartProvider } from "./contexts/CartContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/platform-settings" element={<PlatformSettings />} />
          <Route path="/team-management" element={<TeamManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/restaurant/create" element={<CreateRestaurant />} />
          <Route path="/menu/editor" element={<MenuEditor />} />
          <Route path="/qr-codes" element={<QRCodeManager />} />
          <Route path="/menu/:slug" element={
            <CartProvider>
              <CustomerMenu />
            </CartProvider>
          } />
          <Route path="/checkout" element={
            <CartProvider>
              <Checkout />
            </CartProvider>
          } />
          <Route path="/order-status" element={<OrderStatus />} />
          <Route path="/kitchen" element={<Kitchen />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
