-- Create restaurant permissions table
CREATE TABLE IF NOT EXISTS public.restaurant_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id)
);

-- Enable RLS on restaurant_permissions
ALTER TABLE public.restaurant_permissions ENABLE ROW LEVEL SECURITY;

-- Create function to check if user has permission to manage a restaurant
CREATE OR REPLACE FUNCTION public.has_restaurant_permission(_user_id UUID, _restaurant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurant_permissions
    WHERE user_id = _user_id AND restaurant_id = _restaurant_id
  ) OR public.is_super_admin(_user_id);
$$;

-- Create function to get all restaurants a user has permission to manage
CREATE OR REPLACE FUNCTION public.get_user_restaurants(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT restaurant_id 
  FROM public.restaurant_permissions
  WHERE user_id = _user_id;
$$;

-- RLS policies for restaurant_permissions
CREATE POLICY "Super admins can manage all permissions"
ON public.restaurant_permissions
FOR ALL
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can view their own permissions"
ON public.restaurant_permissions
FOR SELECT
USING (auth.uid() = user_id);

-- Update restaurants RLS policies to include permission check
DROP POLICY IF EXISTS "Restaurant owners can view their restaurants" ON public.restaurants;
CREATE POLICY "Restaurant owners and permitted users can view restaurants"
ON public.restaurants
FOR SELECT
USING (
  owner_id = auth.uid() 
  OR public.has_restaurant_permission(auth.uid(), id)
  OR public.is_super_admin(auth.uid())
);

DROP POLICY IF EXISTS "Restaurant owners can update their restaurants" ON public.restaurants;
CREATE POLICY "Restaurant owners and permitted users can update restaurants"
ON public.restaurants
FOR UPDATE
USING (
  owner_id = auth.uid() 
  OR public.has_restaurant_permission(auth.uid(), id)
  OR public.is_super_admin(auth.uid())
);

-- Update menus RLS policies
DROP POLICY IF EXISTS "Restaurant staff can manage menus" ON public.menus;
CREATE POLICY "Restaurant staff with permission can manage menus"
ON public.menus
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = menus.restaurant_id 
    AND (
      r.owner_id = auth.uid()
      OR public.has_restaurant_permission(auth.uid(), r.id)
      OR public.is_super_admin(auth.uid())
    )
  )
);

-- Update categories RLS policies
DROP POLICY IF EXISTS "Restaurant staff can manage categories" ON public.categories;
CREATE POLICY "Restaurant staff with permission can manage categories"
ON public.categories
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM public.menus m
    JOIN public.restaurants r ON r.id = m.restaurant_id
    WHERE m.id = categories.menu_id 
    AND (
      r.owner_id = auth.uid()
      OR public.has_restaurant_permission(auth.uid(), r.id)
      OR public.is_super_admin(auth.uid())
    )
  )
);

-- Update menu_items RLS policies
DROP POLICY IF EXISTS "Restaurant staff can manage menu items" ON public.menu_items;
CREATE POLICY "Restaurant staff with permission can manage menu items"
ON public.menu_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM public.menus m
    JOIN public.restaurants r ON r.id = m.restaurant_id
    WHERE m.id = menu_items.menu_id 
    AND (
      r.owner_id = auth.uid()
      OR public.has_restaurant_permission(auth.uid(), r.id)
      OR public.is_super_admin(auth.uid())
    )
  )
);

-- Update tables RLS policies
DROP POLICY IF EXISTS "Restaurant staff can manage tables" ON public.tables;
CREATE POLICY "Restaurant staff with permission can manage tables"
ON public.tables
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = tables.restaurant_id 
    AND (
      r.owner_id = auth.uid()
      OR public.has_restaurant_permission(auth.uid(), r.id)
      OR public.is_super_admin(auth.uid())
    )
  )
);

-- Update orders RLS policies
DROP POLICY IF EXISTS "Restaurant staff can view and manage their orders" ON public.orders;
CREATE POLICY "Restaurant staff with permission can view and manage orders"
ON public.orders
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = orders.restaurant_id 
    AND (
      r.owner_id = auth.uid()
      OR public.has_restaurant_permission(auth.uid(), r.id)
      OR public.is_super_admin(auth.uid())
    )
  )
);