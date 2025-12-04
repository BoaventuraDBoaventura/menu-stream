-- =====================================================
-- OTIMIZAÇÃO DE PERFORMANCE DAS POLÍTICAS RLS
-- =====================================================

-- =====================================================
-- 1. PROFILES - Consolidar e otimizar políticas SELECT
-- =====================================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Restaurant admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can create a profile on signup" ON public.profiles;

-- Criar política SELECT consolidada
CREATE POLICY "Users can view profiles" ON public.profiles
FOR SELECT USING (
  (SELECT auth.uid()) = id 
  OR public.is_super_admin((SELECT auth.uid()))
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = (SELECT auth.uid()) 
    AND role IN ('super_admin', 'restaurant_admin')
  )
);

-- Política UPDATE otimizada
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING ((SELECT auth.uid()) = id);

-- Política INSERT otimizada
CREATE POLICY "Anyone can create a profile on signup" ON public.profiles
FOR INSERT WITH CHECK (true);

-- =====================================================
-- 2. USER_ROLES - Consolidar e otimizar políticas
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;

-- Política SELECT consolidada
CREATE POLICY "Users can view roles" ON public.user_roles
FOR SELECT USING (
  (SELECT auth.uid()) = user_id 
  OR public.is_super_admin((SELECT auth.uid()))
);

-- Política ALL para super admins
CREATE POLICY "Super admins can manage all roles" ON public.user_roles
FOR ALL USING (public.is_super_admin((SELECT auth.uid())));

-- =====================================================
-- 3. RESTAURANTS - Consolidar e otimizar políticas
-- =====================================================

DROP POLICY IF EXISTS "Restaurant owners can create restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Restaurant owners and permitted users can view restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Restaurant owners and permitted users can update restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Super admins can delete restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Public can view active restaurants by slug" ON public.restaurants;

-- Política INSERT otimizada
CREATE POLICY "Restaurant owners can create restaurants" ON public.restaurants
FOR INSERT WITH CHECK (owner_id = (SELECT auth.uid()));

-- Política SELECT consolidada (autenticados + público)
CREATE POLICY "Users can view restaurants" ON public.restaurants
FOR SELECT USING (
  is_active = true
  OR owner_id = (SELECT auth.uid())
  OR public.has_restaurant_permission((SELECT auth.uid()), id)
  OR public.is_super_admin((SELECT auth.uid()))
);

-- Política UPDATE otimizada
CREATE POLICY "Authorized users can update restaurants" ON public.restaurants
FOR UPDATE USING (
  owner_id = (SELECT auth.uid())
  OR public.has_restaurant_permission((SELECT auth.uid()), id)
  OR public.is_super_admin((SELECT auth.uid()))
);

-- Política DELETE otimizada
CREATE POLICY "Super admins can delete restaurants" ON public.restaurants
FOR DELETE USING (public.is_super_admin((SELECT auth.uid())));

-- =====================================================
-- 4. RESTAURANT_PERMISSIONS - Consolidar políticas
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own permissions" ON public.restaurant_permissions;
DROP POLICY IF EXISTS "Super admins can manage all permissions" ON public.restaurant_permissions;
DROP POLICY IF EXISTS "Restaurant owners can add team members" ON public.restaurant_permissions;
DROP POLICY IF EXISTS "Restaurant owners can update team permissions" ON public.restaurant_permissions;
DROP POLICY IF EXISTS "Restaurant owners can remove team members" ON public.restaurant_permissions;
DROP POLICY IF EXISTS "Restaurant owners can view team permissions" ON public.restaurant_permissions;

-- Política SELECT consolidada
CREATE POLICY "Users can view permissions" ON public.restaurant_permissions
FOR SELECT USING (
  (SELECT auth.uid()) = user_id
  OR public.is_super_admin((SELECT auth.uid()))
  OR EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE restaurants.id = restaurant_permissions.restaurant_id
    AND restaurants.owner_id = (SELECT auth.uid())
  )
);

-- Política INSERT otimizada
CREATE POLICY "Owners and admins can add permissions" ON public.restaurant_permissions
FOR INSERT WITH CHECK (
  public.is_super_admin((SELECT auth.uid()))
  OR EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE restaurants.id = restaurant_permissions.restaurant_id
    AND restaurants.owner_id = (SELECT auth.uid())
  )
);

-- Política UPDATE otimizada
CREATE POLICY "Owners and admins can update permissions" ON public.restaurant_permissions
FOR UPDATE USING (
  public.is_super_admin((SELECT auth.uid()))
  OR EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE restaurants.id = restaurant_permissions.restaurant_id
    AND restaurants.owner_id = (SELECT auth.uid())
  )
);

-- Política DELETE otimizada
CREATE POLICY "Owners and admins can delete permissions" ON public.restaurant_permissions
FOR DELETE USING (
  public.is_super_admin((SELECT auth.uid()))
  OR EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE restaurants.id = restaurant_permissions.restaurant_id
    AND restaurants.owner_id = (SELECT auth.uid())
  )
);

-- =====================================================
-- 5. MENUS - Consolidar e otimizar políticas
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view active menus" ON public.menus;
DROP POLICY IF EXISTS "Restaurant staff with permission can manage menus" ON public.menus;

-- Política SELECT consolidada
CREATE POLICY "Users can view menus" ON public.menus
FOR SELECT USING (
  is_active = true
  OR EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = menus.restaurant_id
    AND (
      r.owner_id = (SELECT auth.uid())
      OR public.has_restaurant_permission((SELECT auth.uid()), r.id)
      OR public.is_super_admin((SELECT auth.uid()))
    )
  )
);

-- Política ALL para gerenciamento
CREATE POLICY "Staff can manage menus" ON public.menus
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = menus.restaurant_id
    AND (
      r.owner_id = (SELECT auth.uid())
      OR public.has_restaurant_permission((SELECT auth.uid()), r.id)
      OR public.is_super_admin((SELECT auth.uid()))
    )
  )
);

-- =====================================================
-- 6. CATEGORIES - Consolidar e otimizar políticas
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Restaurant staff with permission can manage categories" ON public.categories;

-- Política SELECT consolidada
CREATE POLICY "Users can view categories" ON public.categories
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.menus
    WHERE menus.id = categories.menu_id AND menus.is_active = true
  )
  OR EXISTS (
    SELECT 1 FROM public.menus m
    JOIN public.restaurants r ON r.id = m.restaurant_id
    WHERE m.id = categories.menu_id
    AND (
      r.owner_id = (SELECT auth.uid())
      OR public.has_restaurant_permission((SELECT auth.uid()), r.id)
      OR public.is_super_admin((SELECT auth.uid()))
    )
  )
);

-- Política ALL para gerenciamento
CREATE POLICY "Staff can manage categories" ON public.categories
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.menus m
    JOIN public.restaurants r ON r.id = m.restaurant_id
    WHERE m.id = categories.menu_id
    AND (
      r.owner_id = (SELECT auth.uid())
      OR public.has_restaurant_permission((SELECT auth.uid()), r.id)
      OR public.is_super_admin((SELECT auth.uid()))
    )
  )
);

-- =====================================================
-- 7. MENU_ITEMS - Consolidar e otimizar políticas
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view available menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Restaurant staff with permission can manage menu items" ON public.menu_items;

-- Política SELECT consolidada
CREATE POLICY "Users can view menu items" ON public.menu_items
FOR SELECT USING (
  is_available = true
  OR EXISTS (
    SELECT 1 FROM public.menus m
    JOIN public.restaurants r ON r.id = m.restaurant_id
    WHERE m.id = menu_items.menu_id
    AND (
      r.owner_id = (SELECT auth.uid())
      OR public.has_restaurant_permission((SELECT auth.uid()), r.id)
      OR public.is_super_admin((SELECT auth.uid()))
    )
  )
);

-- Política ALL para gerenciamento
CREATE POLICY "Staff can manage menu items" ON public.menu_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.menus m
    JOIN public.restaurants r ON r.id = m.restaurant_id
    WHERE m.id = menu_items.menu_id
    AND (
      r.owner_id = (SELECT auth.uid())
      OR public.has_restaurant_permission((SELECT auth.uid()), r.id)
      OR public.is_super_admin((SELECT auth.uid()))
    )
  )
);

-- =====================================================
-- 8. ORDERS - Consolidar e otimizar políticas
-- =====================================================

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view their recent orders by order number" ON public.orders;
DROP POLICY IF EXISTS "Restaurant staff with permission can view and manage orders" ON public.orders;

-- Política INSERT otimizada
CREATE POLICY "Anyone can create orders" ON public.orders
FOR INSERT WITH CHECK (true);

-- Política SELECT consolidada
CREATE POLICY "Users can view orders" ON public.orders
FOR SELECT USING (
  true
  OR EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = orders.restaurant_id
    AND (
      r.owner_id = (SELECT auth.uid())
      OR public.has_restaurant_permission((SELECT auth.uid()), r.id)
      OR public.is_super_admin((SELECT auth.uid()))
    )
  )
);

-- Política UPDATE/DELETE para staff
CREATE POLICY "Staff can manage orders" ON public.orders
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = orders.restaurant_id
    AND (
      r.owner_id = (SELECT auth.uid())
      OR public.has_restaurant_permission((SELECT auth.uid()), r.id)
      OR public.is_super_admin((SELECT auth.uid()))
    )
  )
);

-- =====================================================
-- 9. TABLES - Consolidar e otimizar políticas
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view active tables" ON public.tables;
DROP POLICY IF EXISTS "Restaurant staff with permission can manage tables" ON public.tables;

-- Política SELECT consolidada
CREATE POLICY "Users can view tables" ON public.tables
FOR SELECT USING (
  is_active = true
  OR EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = tables.restaurant_id
    AND (
      r.owner_id = (SELECT auth.uid())
      OR public.has_restaurant_permission((SELECT auth.uid()), r.id)
      OR public.is_super_admin((SELECT auth.uid()))
    )
  )
);

-- Política ALL para gerenciamento
CREATE POLICY "Staff can manage tables" ON public.tables
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = tables.restaurant_id
    AND (
      r.owner_id = (SELECT auth.uid())
      OR public.has_restaurant_permission((SELECT auth.uid()), r.id)
      OR public.is_super_admin((SELECT auth.uid()))
    )
  )
);

-- =====================================================
-- 10. PAYMENT_METHODS - Consolidar e otimizar políticas
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view enabled payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Restaurant staff with permission can manage payment methods" ON public.payment_methods;

-- Política SELECT consolidada
CREATE POLICY "Users can view payment methods" ON public.payment_methods
FOR SELECT USING (
  (is_enabled = true AND EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = payment_methods.restaurant_id AND r.is_active = true
  ))
  OR EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = payment_methods.restaurant_id
    AND (
      r.owner_id = (SELECT auth.uid())
      OR public.has_restaurant_permission((SELECT auth.uid()), r.id)
      OR public.is_super_admin((SELECT auth.uid()))
    )
  )
);

-- Política ALL para gerenciamento
CREATE POLICY "Staff can manage payment methods" ON public.payment_methods
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = payment_methods.restaurant_id
    AND (
      r.owner_id = (SELECT auth.uid())
      OR public.has_restaurant_permission((SELECT auth.uid()), r.id)
      OR public.is_super_admin((SELECT auth.uid()))
    )
  )
);

-- =====================================================
-- 11. PLATFORM_SETTINGS - Otimizar políticas
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Super admins can update platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Super admins can insert platform settings" ON public.platform_settings;

-- Política SELECT otimizada
CREATE POLICY "Anyone can view platform settings" ON public.platform_settings
FOR SELECT USING (true);

-- Política INSERT otimizada
CREATE POLICY "Super admins can insert platform settings" ON public.platform_settings
FOR INSERT WITH CHECK (public.is_super_admin((SELECT auth.uid())));

-- Política UPDATE otimizada
CREATE POLICY "Super admins can update platform settings" ON public.platform_settings
FOR UPDATE USING (public.is_super_admin((SELECT auth.uid())));

-- =====================================================
-- 12. ORDER_ITEMS - Otimizar políticas existentes
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

-- Política SELECT otimizada
CREATE POLICY "Anyone can view order items" ON public.order_items
FOR SELECT USING (true);

-- Política INSERT otimizada
CREATE POLICY "Anyone can create order items" ON public.order_items
FOR INSERT WITH CHECK (true);