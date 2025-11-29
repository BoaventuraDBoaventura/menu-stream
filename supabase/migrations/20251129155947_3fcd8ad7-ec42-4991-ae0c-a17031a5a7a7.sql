-- Create enum for application roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'restaurant_admin', 'staff');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if a user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'super_admin')
$$;

-- Function to assign role to first user or default role
CREATE OR REPLACE FUNCTION public.assign_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
  default_role app_role;
BEGIN
  -- Count existing users in auth.users
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  -- If this is the first user, make them super_admin
  IF user_count = 1 THEN
    default_role := 'super_admin';
  ELSE
    -- Otherwise assign restaurant_admin as default
    default_role := COALESCE(NEW.raw_user_meta_data->>'role', 'restaurant_admin')::app_role;
  END IF;
  
  -- Insert the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, default_role);
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-assign role on user creation
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_user_role();

-- Drop old policies that reference profiles.restaurant_id
DROP POLICY IF EXISTS "Restaurant owners can view their restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Restaurant owners can update their restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Restaurant staff can manage menus" ON public.menus;
DROP POLICY IF EXISTS "Restaurant staff can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Restaurant staff can manage menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Restaurant staff can manage tables" ON public.tables;
DROP POLICY IF EXISTS "Restaurant staff can manage their orders" ON public.orders;

-- Now we can safely remove the columns
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role CASCADE;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS restaurant_id CASCADE;

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage all roles" 
  ON public.user_roles 
  FOR ALL 
  USING (public.is_super_admin(auth.uid()));

-- Create new restaurants RLS policies
CREATE POLICY "Restaurant owners can view their restaurants" 
  ON public.restaurants 
  FOR SELECT 
  USING (
    owner_id = auth.uid() OR 
    public.is_super_admin(auth.uid())
  );

CREATE POLICY "Restaurant owners can update their restaurants" 
  ON public.restaurants 
  FOR UPDATE 
  USING (
    owner_id = auth.uid() OR 
    public.is_super_admin(auth.uid())
  );

CREATE POLICY "Super admins can delete restaurants" 
  ON public.restaurants 
  FOR DELETE 
  USING (public.is_super_admin(auth.uid()));

-- Update menus policies
CREATE POLICY "Restaurant staff can manage menus" 
  ON public.menus 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r 
      WHERE r.id = menus.restaurant_id 
      AND r.owner_id = auth.uid()
    ) OR
    public.is_super_admin(auth.uid())
  );

-- Update categories policies
CREATE POLICY "Restaurant staff can manage categories" 
  ON public.categories 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.menus m 
      INNER JOIN public.restaurants r ON r.id = m.restaurant_id 
      WHERE m.id = categories.menu_id 
      AND r.owner_id = auth.uid()
    ) OR
    public.is_super_admin(auth.uid())
  );

-- Update menu_items policies
CREATE POLICY "Restaurant staff can manage menu items" 
  ON public.menu_items 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.menus m 
      INNER JOIN public.restaurants r ON r.id = m.restaurant_id 
      WHERE m.id = menu_items.menu_id 
      AND r.owner_id = auth.uid()
    ) OR
    public.is_super_admin(auth.uid())
  );

-- Update tables policies
CREATE POLICY "Restaurant staff can manage tables" 
  ON public.tables 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r 
      WHERE r.id = tables.restaurant_id 
      AND r.owner_id = auth.uid()
    ) OR
    public.is_super_admin(auth.uid())
  );

-- Update orders policies
CREATE POLICY "Restaurant staff can view and manage their orders" 
  ON public.orders 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r 
      WHERE r.id = orders.restaurant_id 
      AND r.owner_id = auth.uid()
    ) OR
    public.is_super_admin(auth.uid())
  );

-- Create indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);