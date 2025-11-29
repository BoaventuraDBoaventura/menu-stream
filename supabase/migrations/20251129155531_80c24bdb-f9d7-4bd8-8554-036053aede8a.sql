-- Fix security warnings: Set search_path for all functions

-- Drop and recreate update_updated_at_column with proper search_path
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON public.menus FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Recreate generate_order_number with proper search_path
DROP FUNCTION IF EXISTS generate_order_number(UUID);
CREATE OR REPLACE FUNCTION generate_order_number(restaurant_id UUID)
RETURNS TEXT AS $$
DECLARE
  order_count INTEGER;
  today_date TEXT;
BEGIN
  today_date := TO_CHAR(NOW(), 'YYYYMMDD');
  
  SELECT COUNT(*) INTO order_count
  FROM public.orders
  WHERE orders.restaurant_id = generate_order_number.restaurant_id
  AND DATE(created_at) = CURRENT_DATE;
  
  RETURN today_date || '-' || LPAD((order_count + 1)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SET search_path = public;