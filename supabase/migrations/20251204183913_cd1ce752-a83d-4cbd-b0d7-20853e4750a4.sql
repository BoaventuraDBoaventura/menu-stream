-- =====================================================
-- CORREÇÃO: REMOVER POLÍTICAS DUPLICADAS SELECT/ALL
-- =====================================================

-- =====================================================
-- 1. CATEGORIES - Consolidar em política única SELECT
-- =====================================================

DROP POLICY IF EXISTS "Users can view categories" ON public.categories;
DROP POLICY IF EXISTS "Staff can manage categories" ON public.categories;

-- Política SELECT única consolidada
CREATE POLICY "View categories" ON public.categories
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.menus WHERE menus.id = categories.menu_id AND menus.is_active = true)
  OR EXISTS (
    SELECT 1 FROM public.menus m
    JOIN public.restaurants r ON r.id = m.restaurant_id
    WHERE m.id = categories.menu_id
    AND (r.owner_id = (SELECT auth.uid()) OR public.has_restaurant_permission((SELECT auth.uid()), r.id) OR public.is_super_admin((SELECT auth.uid())))
  )
);

-- Políticas separadas para INSERT/UPDATE/DELETE
CREATE POLICY "Manage categories" ON public.categories
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.menus m
    JOIN public.restaurants r ON r.id = m.restaurant_id
    WHERE m.id = categories.menu_id
    AND (r.owner_id = (SELECT auth.uid()) OR public.has_restaurant_permission((SELECT auth.uid()), r.id) OR public.is_super_admin((SELECT auth.uid())))
  )
);

CREATE POLICY "Update categories" ON public.categories
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.menus m
    JOIN public.restaurants r ON r.id = m.restaurant_id
    WHERE m.id = categories.menu_id
    AND (r.owner_id = (SELECT auth.uid()) OR public.has_restaurant_permission((SELECT auth.uid()), r.id) OR public.is_super_admin((SELECT auth.uid())))
  )
);

CREATE POLICY "Delete categories" ON public.categories
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.menus m
    JOIN public.restaurants r ON r.id = m.restaurant_id
    WHERE m.id = categories.menu_id
    AND (r.owner_id = (SELECT auth.uid()) OR public.has_restaurant_permission((SELECT auth.uid()), r.id) OR public.is_super_admin((SELECT auth.uid())))
  )
);

-- =====================================================
-- 2. MENU_ITEMS - Consolidar em política única SELECT
-- =====================================================

DROP POLICY IF EXISTS "Users can view menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Staff can manage menu items" ON public.menu_items;

CREATE POLICY "View menu items" ON public.menu_items
FOR SELECT USING (
  is_available = true
  OR EXISTS (
    SELECT 1 FROM public.menus m
    JOIN public.restaurants r ON r.id = m.restaurant_id
    WHERE m.id = menu_items.menu_id
    AND (r.owner_id = (SELECT auth.uid()) OR public.has_restaurant_permission((SELECT auth.uid()), r.id) OR public.is_super_admin((SELECT auth.uid())))
  )
);

CREATE POLICY "Insert menu items" ON public.menu_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.menus m
    JOIN public.restaurants r ON r.id = m.restaurant_id
    WHERE m.id = menu_items.menu_id
    AND (r.owner_id = (SELECT auth.uid()) OR public.has_restaurant_permission((SELECT auth.uid()), r.id) OR public.is_super_admin((SELECT auth.uid())))
  )
);

CREATE POLICY "Update menu items" ON public.menu_items
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.menus m
    JOIN public.restaurants r ON r.id = m.restaurant_id
    WHERE m.id = menu_items.menu_id
    AND (r.owner_id = (SELECT auth.uid()) OR public.has_restaurant_permission((SELECT auth.uid()), r.id) OR public.is_super_admin((SELECT auth.uid())))
  )
);

CREATE POLICY "Delete menu items" ON public.menu_items
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.menus m
    JOIN public.restaurants r ON r.id = m.restaurant_id
    WHERE m.id = menu_items.menu_id
    AND (r.owner_id = (SELECT auth.uid()) OR public.has_restaurant_permission((SELECT auth.uid()), r.id) OR public.is_super_admin((SELECT auth.uid())))
  )
);

-- =====================================================
-- 3. MENUS - Consolidar em política única SELECT
-- =====================================================

DROP POLICY IF EXISTS "Users can view menus" ON public.menus;
DROP POLICY IF EXISTS "Staff can manage menus" ON public.menus;

CREATE POLICY "View menus" ON public.menus
FOR SELECT USING (
  is_active = true
  OR EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = menus.restaurant_id
    AND (r.owner_id = (SELECT auth.uid()) OR public.has_restaurant_permission((SELECT auth.uid()), r.id) OR public.is_super_admin((SELECT auth.uid())))
  )
);

CREATE POLICY "Insert menus" ON public.menus
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = menus.restaurant_id
    AND (r.owner_id = (SELECT auth.uid()) OR public.has_restaurant_permission((SELECT auth.uid()), r.id) OR public.is_super_admin((SELECT auth.uid())))
  )
);

CREATE POLICY "Update menus" ON public.menus
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = menus.restaurant_id
    AND (r.owner_id = (SELECT auth.uid()) OR public.has_restaurant_permission((SELECT auth.uid()), r.id) OR public.is_super_admin((SELECT auth.uid())))
  )
);

CREATE POLICY "Delete menus" ON public.menus
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = menus.restaurant_id
    AND (r.owner_id = (SELECT auth.uid()) OR public.has_restaurant_permission((SELECT auth.uid()), r.id) OR public.is_super_admin((SELECT auth.uid())))
  )
);

-- =====================================================
-- 4. ORDERS - Consolidar políticas
-- =====================================================

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view orders" ON public.orders;
DROP POLICY IF EXISTS "Staff can manage orders" ON public.orders;

CREATE POLICY "View orders" ON public.orders
FOR SELECT USING (true);

CREATE POLICY "Create orders" ON public.orders
FOR INSERT WITH CHECK (true);

CREATE POLICY "Update orders" ON public.orders
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = orders.restaurant_id
    AND (r.owner_id = (SELECT auth.uid()) OR public.has_restaurant_permission((SELECT auth.uid()), r.id) OR public.is_super_admin((SELECT auth.uid())))
  )
);

CREATE POLICY "Delete orders" ON public.orders
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = orders.restaurant_id
    AND (r.owner_id = (SELECT auth.uid()) OR public.has_restaurant_permission((SELECT auth.uid()), r.id) OR public.is_super_admin((SELECT auth.uid())))
  )
);

-- =====================================================
-- 5. PAYMENT_METHODS - Consolidar em política única SELECT
-- =====================================================

DROP POLICY IF EXISTS "Users can view payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Staff can manage payment methods" ON public.payment_methods;

CREATE POLICY "View payment methods" ON public.payment_methods
FOR SELECT USING (
  (is_enabled = true AND EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = payment_methods.restaurant_id AND r.is_active = true))
  OR EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = payment_methods.restaurant_id
    AND (r.owner_id = (SELECT auth.uid()) OR public.has_restaurant_permission((SELECT auth.uid()), r.id) OR public.is_super_admin((SELECT auth.uid())))
  )
);

CREATE POLICY "Insert payment methods" ON public.payment_methods
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = payment_methods.restaurant_id
    AND (r.owner_id = (SELECT auth.uid()) OR public.has_restaurant_permission((SELECT auth.uid()), r.id) OR public.is_super_admin((SELECT auth.uid())))
  )
);

CREATE POLICY "Update payment methods" ON public.payment_methods
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = payment_methods.restaurant_id
    AND (r.owner_id = (SELECT auth.uid()) OR public.has_restaurant_permission((SELECT auth.uid()), r.id) OR public.is_super_admin((SELECT auth.uid())))
  )
);

CREATE POLICY "Delete payment methods" ON public.payment_methods
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = payment_methods.restaurant_id
    AND (r.owner_id = (SELECT auth.uid()) OR public.has_restaurant_permission((SELECT auth.uid()), r.id) OR public.is_super_admin((SELECT auth.uid())))
  )
);

-- =====================================================
-- 6. TABLES - Consolidar em política única SELECT
-- =====================================================

DROP POLICY IF EXISTS "Users can view tables" ON public.tables;
DROP POLICY IF EXISTS "Staff can manage tables" ON public.tables;

CREATE POLICY "View tables" ON public.tables
FOR SELECT USING (
  is_active = true
  OR EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = tables.restaurant_id
    AND (r.owner_id = (SELECT auth.uid()) OR public.has_restaurant_permission((SELECT auth.uid()), r.id) OR public.is_super_admin((SELECT auth.uid())))
  )
);

CREATE POLICY "Insert tables" ON public.tables
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = tables.restaurant_id
    AND (r.owner_id = (SELECT auth.uid()) OR public.has_restaurant_permission((SELECT auth.uid()), r.id) OR public.is_super_admin((SELECT auth.uid())))
  )
);

CREATE POLICY "Update tables" ON public.tables
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = tables.restaurant_id
    AND (r.owner_id = (SELECT auth.uid()) OR public.has_restaurant_permission((SELECT auth.uid()), r.id) OR public.is_super_admin((SELECT auth.uid())))
  )
);

CREATE POLICY "Delete tables" ON public.tables
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = tables.restaurant_id
    AND (r.owner_id = (SELECT auth.uid()) OR public.has_restaurant_permission((SELECT auth.uid()), r.id) OR public.is_super_admin((SELECT auth.uid())))
  )
);

-- =====================================================
-- 7. USER_ROLES - Consolidar políticas SELECT
-- =====================================================

DROP POLICY IF EXISTS "Users can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;

CREATE POLICY "View roles" ON public.user_roles
FOR SELECT USING (
  (SELECT auth.uid()) = user_id 
  OR public.is_super_admin((SELECT auth.uid()))
);

CREATE POLICY "Insert roles" ON public.user_roles
FOR INSERT WITH CHECK (public.is_super_admin((SELECT auth.uid())));

CREATE POLICY "Update roles" ON public.user_roles
FOR UPDATE USING (public.is_super_admin((SELECT auth.uid())));

CREATE POLICY "Delete roles" ON public.user_roles
FOR DELETE USING (public.is_super_admin((SELECT auth.uid())));