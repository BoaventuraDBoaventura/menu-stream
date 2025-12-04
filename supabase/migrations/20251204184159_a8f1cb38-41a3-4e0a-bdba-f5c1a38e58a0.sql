-- =====================================================
-- ADICIONAR ÍNDICES EM FOREIGN KEYS E LIMPAR ÍNDICES NÃO UTILIZADOS
-- =====================================================

-- Adicionar índice em order_items.menu_item_id
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON public.order_items(menu_item_id);

-- Adicionar índice em orders.table_id
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON public.orders(table_id);

-- Adicionar índice em restaurant_permissions.restaurant_id
CREATE INDEX IF NOT EXISTS idx_restaurant_permissions_restaurant_id ON public.restaurant_permissions(restaurant_id);

-- Remover índice não utilizado
DROP INDEX IF EXISTS public.idx_user_roles_role;