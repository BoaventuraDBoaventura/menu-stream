-- =====================================================
-- PRATODIGITAL - SCHEMA COMPLETO DO BANCO DE DADOS
-- Para deploy em Supabase Self-Hosted
-- =====================================================

-- =====================================================
-- 1. EXTENSÕES
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 2. TIPOS ENUM
-- =====================================================
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('super_admin', 'restaurant_admin', 'staff');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 3. TABELAS
-- =====================================================

-- Profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    role app_role NOT NULL,
    max_restaurants INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Platform Settings
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    platform_name TEXT NOT NULL DEFAULT 'PratoDigital',
    support_email TEXT DEFAULT 'suporte@pratodigital.com',
    enable_registration BOOLEAN DEFAULT true,
    require_email_verification BOOLEAN DEFAULT false,
    maintenance_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Restaurants
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    address TEXT,
    phone TEXT,
    email TEXT,
    logo_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    currency TEXT DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Restaurant Permissions
CREATE TABLE IF NOT EXISTS public.restaurant_permissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    restaurant_id UUID NOT NULL,
    permissions JSONB DEFAULT '{"orders": true, "kitchen": true, "qr_codes": true, "settings": false, "menu_editor": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, restaurant_id)
);

-- Tables (restaurant tables for QR codes)
CREATE TABLE IF NOT EXISTS public.tables (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    qr_code_token TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Menus
CREATE TABLE IF NOT EXISTS public.menus (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Menu Items
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image_url TEXT,
    prep_time_minutes INTEGER DEFAULT 15,
    is_available BOOLEAN DEFAULT true,
    options JSONB DEFAULT '[]'::jsonb,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Payment Methods
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
    order_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    notes TEXT,
    payment_method TEXT DEFAULT 'cash',
    payment_status TEXT DEFAULT 'pending',
    order_status TEXT DEFAULT 'new',
    total_amount NUMERIC NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    options JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 4. ÍNDICES
-- =====================================================

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_restaurants_owner_id ON public.restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurant_permissions_user_id ON public.restaurant_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_permissions_restaurant_id ON public.restaurant_permissions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menus_restaurant_id ON public.menus(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_categories_menu_id ON public.categories(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_id ON public.menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON public.orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON public.order_items(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_tables_restaurant_id ON public.tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_restaurant_id ON public.payment_methods(restaurant_id);

-- =====================================================
-- 5. FUNÇÕES
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Função para verificar role do usuário
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Função para verificar se é super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT public.has_role(_user_id, 'super_admin')
$$;

-- Função para verificar permissão de restaurante
CREATE OR REPLACE FUNCTION public.has_restaurant_permission(_user_id UUID, _restaurant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.restaurant_permissions
        WHERE user_id = _user_id AND restaurant_id = _restaurant_id
    ) OR public.is_super_admin(_user_id);
$$;

-- Função para obter restaurantes do usuário
CREATE OR REPLACE FUNCTION public.get_user_restaurants(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT restaurant_id 
    FROM public.restaurant_permissions
    WHERE user_id = _user_id;
$$;

-- Função para gerar slug do restaurante
CREATE OR REPLACE FUNCTION public.generate_restaurant_slug(restaurant_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    base_slug := lower(regexp_replace(restaurant_name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    final_slug := base_slug;
    
    WHILE EXISTS (SELECT 1 FROM public.restaurants WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$;

-- Função para gerar número do pedido
CREATE OR REPLACE FUNCTION public.generate_order_number(restaurant_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
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
$$;

-- Função para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.profiles (id, name, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
        NEW.raw_user_meta_data->>'phone'
    );
    RETURN NEW;
END;
$$;

-- Função para atribuir role ao usuário
CREATE OR REPLACE FUNCTION public.assign_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    user_count INTEGER;
    default_role app_role;
BEGIN
    SELECT COUNT(*) INTO user_count FROM auth.users;
    
    IF user_count = 1 THEN
        default_role := 'super_admin';
    ELSE
        default_role := COALESCE(NEW.raw_user_meta_data->>'role', 'restaurant_admin')::app_role;
    END IF;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, default_role);
    
    RETURN NEW;
END;
$$;

-- Função para obter todos os usuários (apenas super admin)
CREATE OR REPLACE FUNCTION public.get_all_users_for_admin()
RETURNS TABLE(id UUID, email TEXT, created_at TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
    IF NOT public.is_super_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied: Super admin role required';
    END IF;

    RETURN QUERY
    SELECT 
        u.id,
        u.email::TEXT,
        u.created_at
    FROM auth.users u
    ORDER BY u.created_at DESC;
END;
$$;

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Trigger para criar profile ao registrar usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atribuir role ao usuário
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.assign_user_role();

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_restaurants_updated_at ON public.restaurants;
CREATE TRIGGER update_restaurants_updated_at
    BEFORE UPDATE ON public.restaurants
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_menus_updated_at ON public.menus;
CREATE TRIGGER update_menus_updated_at
    BEFORE UPDATE ON public.menus
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON public.menu_items
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_platform_settings_updated_at ON public.platform_settings;
CREATE TRIGGER update_platform_settings_updated_at
    BEFORE UPDATE ON public.platform_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7.1 POLICIES - PROFILES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can create a profile on signup" ON public.profiles;
CREATE POLICY "Anyone can create a profile on signup"
ON public.profiles FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
CREATE POLICY "Users can view profiles"
ON public.profiles FOR SELECT
USING (
    ((SELECT auth.uid()) = id) 
    OR is_super_admin((SELECT auth.uid())) 
    OR (EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = (SELECT auth.uid()) 
        AND user_roles.role = ANY (ARRAY['super_admin'::app_role, 'restaurant_admin'::app_role])
    ))
);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING ((SELECT auth.uid()) = id);

-- =====================================================
-- 7.2 POLICIES - USER_ROLES
-- =====================================================

DROP POLICY IF EXISTS "View roles" ON public.user_roles;
CREATE POLICY "View roles"
ON public.user_roles FOR SELECT
USING (((SELECT auth.uid()) = user_id) OR is_super_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "Insert roles" ON public.user_roles;
CREATE POLICY "Insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (is_super_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "Update roles" ON public.user_roles;
CREATE POLICY "Update roles"
ON public.user_roles FOR UPDATE
USING (is_super_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "Delete roles" ON public.user_roles;
CREATE POLICY "Delete roles"
ON public.user_roles FOR DELETE
USING (is_super_admin((SELECT auth.uid())));

-- =====================================================
-- 7.3 POLICIES - PLATFORM_SETTINGS
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view platform settings" ON public.platform_settings;
CREATE POLICY "Anyone can view platform settings"
ON public.platform_settings FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Super admins can insert platform settings" ON public.platform_settings;
CREATE POLICY "Super admins can insert platform settings"
ON public.platform_settings FOR INSERT
WITH CHECK (is_super_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "Super admins can update platform settings" ON public.platform_settings;
CREATE POLICY "Super admins can update platform settings"
ON public.platform_settings FOR UPDATE
USING (is_super_admin((SELECT auth.uid())));

-- =====================================================
-- 7.4 POLICIES - RESTAURANTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view restaurants" ON public.restaurants;
CREATE POLICY "Users can view restaurants"
ON public.restaurants FOR SELECT
USING (
    (is_active = true) 
    OR (owner_id = (SELECT auth.uid())) 
    OR has_restaurant_permission((SELECT auth.uid()), id) 
    OR is_super_admin((SELECT auth.uid()))
);

DROP POLICY IF EXISTS "Restaurant owners can create restaurants" ON public.restaurants;
CREATE POLICY "Restaurant owners can create restaurants"
ON public.restaurants FOR INSERT
WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Authorized users can update restaurants" ON public.restaurants;
CREATE POLICY "Authorized users can update restaurants"
ON public.restaurants FOR UPDATE
USING (
    (owner_id = (SELECT auth.uid())) 
    OR has_restaurant_permission((SELECT auth.uid()), id) 
    OR is_super_admin((SELECT auth.uid()))
);

DROP POLICY IF EXISTS "Super admins can delete restaurants" ON public.restaurants;
CREATE POLICY "Super admins can delete restaurants"
ON public.restaurants FOR DELETE
USING (is_super_admin((SELECT auth.uid())));

-- =====================================================
-- 7.5 POLICIES - RESTAURANT_PERMISSIONS
-- =====================================================

DROP POLICY IF EXISTS "Users can view permissions" ON public.restaurant_permissions;
CREATE POLICY "Users can view permissions"
ON public.restaurant_permissions FOR SELECT
USING (
    ((SELECT auth.uid()) = user_id) 
    OR is_super_admin((SELECT auth.uid())) 
    OR (EXISTS (
        SELECT 1 FROM restaurants
        WHERE restaurants.id = restaurant_permissions.restaurant_id 
        AND restaurants.owner_id = (SELECT auth.uid())
    ))
);

DROP POLICY IF EXISTS "Owners and admins can add permissions" ON public.restaurant_permissions;
CREATE POLICY "Owners and admins can add permissions"
ON public.restaurant_permissions FOR INSERT
WITH CHECK (
    is_super_admin((SELECT auth.uid())) 
    OR (EXISTS (
        SELECT 1 FROM restaurants
        WHERE restaurants.id = restaurant_permissions.restaurant_id 
        AND restaurants.owner_id = (SELECT auth.uid())
    ))
);

DROP POLICY IF EXISTS "Owners and admins can update permissions" ON public.restaurant_permissions;
CREATE POLICY "Owners and admins can update permissions"
ON public.restaurant_permissions FOR UPDATE
USING (
    is_super_admin((SELECT auth.uid())) 
    OR (EXISTS (
        SELECT 1 FROM restaurants
        WHERE restaurants.id = restaurant_permissions.restaurant_id 
        AND restaurants.owner_id = (SELECT auth.uid())
    ))
);

DROP POLICY IF EXISTS "Owners and admins can delete permissions" ON public.restaurant_permissions;
CREATE POLICY "Owners and admins can delete permissions"
ON public.restaurant_permissions FOR DELETE
USING (
    is_super_admin((SELECT auth.uid())) 
    OR (EXISTS (
        SELECT 1 FROM restaurants
        WHERE restaurants.id = restaurant_permissions.restaurant_id 
        AND restaurants.owner_id = (SELECT auth.uid())
    ))
);

-- =====================================================
-- 7.6 POLICIES - TABLES
-- =====================================================

DROP POLICY IF EXISTS "View tables" ON public.tables;
CREATE POLICY "View tables"
ON public.tables FOR SELECT
USING (
    (is_active = true) 
    OR (EXISTS (
        SELECT 1 FROM restaurants r
        WHERE r.id = tables.restaurant_id 
        AND (
            r.owner_id = (SELECT auth.uid()) 
            OR has_restaurant_permission((SELECT auth.uid()), r.id) 
            OR is_super_admin((SELECT auth.uid()))
        )
    ))
);

DROP POLICY IF EXISTS "Insert tables" ON public.tables;
CREATE POLICY "Insert tables"
ON public.tables FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM restaurants r
        WHERE r.id = tables.restaurant_id 
        AND (
            r.owner_id = (SELECT auth.uid()) 
            OR has_restaurant_permission((SELECT auth.uid()), r.id) 
            OR is_super_admin((SELECT auth.uid()))
        )
    )
);

DROP POLICY IF EXISTS "Update tables" ON public.tables;
CREATE POLICY "Update tables"
ON public.tables FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM restaurants r
        WHERE r.id = tables.restaurant_id 
        AND (
            r.owner_id = (SELECT auth.uid()) 
            OR has_restaurant_permission((SELECT auth.uid()), r.id) 
            OR is_super_admin((SELECT auth.uid()))
        )
    )
);

DROP POLICY IF EXISTS "Delete tables" ON public.tables;
CREATE POLICY "Delete tables"
ON public.tables FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM restaurants r
        WHERE r.id = tables.restaurant_id 
        AND (
            r.owner_id = (SELECT auth.uid()) 
            OR has_restaurant_permission((SELECT auth.uid()), r.id) 
            OR is_super_admin((SELECT auth.uid()))
        )
    )
);

-- =====================================================
-- 7.7 POLICIES - MENUS
-- =====================================================

DROP POLICY IF EXISTS "View menus" ON public.menus;
CREATE POLICY "View menus"
ON public.menus FOR SELECT
USING (
    (is_active = true) 
    OR (EXISTS (
        SELECT 1 FROM restaurants r
        WHERE r.id = menus.restaurant_id 
        AND (
            r.owner_id = (SELECT auth.uid()) 
            OR has_restaurant_permission((SELECT auth.uid()), r.id) 
            OR is_super_admin((SELECT auth.uid()))
        )
    ))
);

DROP POLICY IF EXISTS "Insert menus" ON public.menus;
CREATE POLICY "Insert menus"
ON public.menus FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM restaurants r
        WHERE r.id = menus.restaurant_id 
        AND (
            r.owner_id = (SELECT auth.uid()) 
            OR has_restaurant_permission((SELECT auth.uid()), r.id) 
            OR is_super_admin((SELECT auth.uid()))
        )
    )
);

DROP POLICY IF EXISTS "Update menus" ON public.menus;
CREATE POLICY "Update menus"
ON public.menus FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM restaurants r
        WHERE r.id = menus.restaurant_id 
        AND (
            r.owner_id = (SELECT auth.uid()) 
            OR has_restaurant_permission((SELECT auth.uid()), r.id) 
            OR is_super_admin((SELECT auth.uid()))
        )
    )
);

DROP POLICY IF EXISTS "Delete menus" ON public.menus;
CREATE POLICY "Delete menus"
ON public.menus FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM restaurants r
        WHERE r.id = menus.restaurant_id 
        AND (
            r.owner_id = (SELECT auth.uid()) 
            OR has_restaurant_permission((SELECT auth.uid()), r.id) 
            OR is_super_admin((SELECT auth.uid()))
        )
    )
);

-- =====================================================
-- 7.8 POLICIES - CATEGORIES
-- =====================================================

DROP POLICY IF EXISTS "View categories" ON public.categories;
CREATE POLICY "View categories"
ON public.categories FOR SELECT
USING (
    (EXISTS (SELECT 1 FROM menus WHERE menus.id = categories.menu_id AND menus.is_active = true)) 
    OR (EXISTS (
        SELECT 1 FROM menus m
        JOIN restaurants r ON r.id = m.restaurant_id
        WHERE m.id = categories.menu_id 
        AND (
            r.owner_id = (SELECT auth.uid()) 
            OR has_restaurant_permission((SELECT auth.uid()), r.id) 
            OR is_super_admin((SELECT auth.uid()))
        )
    ))
);

DROP POLICY IF EXISTS "Manage categories" ON public.categories;
CREATE POLICY "Manage categories"
ON public.categories FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM menus m
        JOIN restaurants r ON r.id = m.restaurant_id
        WHERE m.id = categories.menu_id 
        AND (
            r.owner_id = (SELECT auth.uid()) 
            OR has_restaurant_permission((SELECT auth.uid()), r.id) 
            OR is_super_admin((SELECT auth.uid()))
        )
    )
);

DROP POLICY IF EXISTS "Update categories" ON public.categories;
CREATE POLICY "Update categories"
ON public.categories FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM menus m
        JOIN restaurants r ON r.id = m.restaurant_id
        WHERE m.id = categories.menu_id 
        AND (
            r.owner_id = (SELECT auth.uid()) 
            OR has_restaurant_permission((SELECT auth.uid()), r.id) 
            OR is_super_admin((SELECT auth.uid()))
        )
    )
);

DROP POLICY IF EXISTS "Delete categories" ON public.categories;
CREATE POLICY "Delete categories"
ON public.categories FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM menus m
        JOIN restaurants r ON r.id = m.restaurant_id
        WHERE m.id = categories.menu_id 
        AND (
            r.owner_id = (SELECT auth.uid()) 
            OR has_restaurant_permission((SELECT auth.uid()), r.id) 
            OR is_super_admin((SELECT auth.uid()))
        )
    )
);

-- =====================================================
-- 7.9 POLICIES - MENU_ITEMS
-- =====================================================

DROP POLICY IF EXISTS "View menu items" ON public.menu_items;
CREATE POLICY "View menu items"
ON public.menu_items FOR SELECT
USING (
    (is_available = true) 
    OR (EXISTS (
        SELECT 1 FROM menus m
        JOIN restaurants r ON r.id = m.restaurant_id
        WHERE m.id = menu_items.menu_id 
        AND (
            r.owner_id = (SELECT auth.uid()) 
            OR has_restaurant_permission((SELECT auth.uid()), r.id) 
            OR is_super_admin((SELECT auth.uid()))
        )
    ))
);

DROP POLICY IF EXISTS "Insert menu items" ON public.menu_items;
CREATE POLICY "Insert menu items"
ON public.menu_items FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM menus m
        JOIN restaurants r ON r.id = m.restaurant_id
        WHERE m.id = menu_items.menu_id 
        AND (
            r.owner_id = (SELECT auth.uid()) 
            OR has_restaurant_permission((SELECT auth.uid()), r.id) 
            OR is_super_admin((SELECT auth.uid()))
        )
    )
);

DROP POLICY IF EXISTS "Update menu items" ON public.menu_items;
CREATE POLICY "Update menu items"
ON public.menu_items FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM menus m
        JOIN restaurants r ON r.id = m.restaurant_id
        WHERE m.id = menu_items.menu_id 
        AND (
            r.owner_id = (SELECT auth.uid()) 
            OR has_restaurant_permission((SELECT auth.uid()), r.id) 
            OR is_super_admin((SELECT auth.uid()))
        )
    )
);

DROP POLICY IF EXISTS "Delete menu items" ON public.menu_items;
CREATE POLICY "Delete menu items"
ON public.menu_items FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM menus m
        JOIN restaurants r ON r.id = m.restaurant_id
        WHERE m.id = menu_items.menu_id 
        AND (
            r.owner_id = (SELECT auth.uid()) 
            OR has_restaurant_permission((SELECT auth.uid()), r.id) 
            OR is_super_admin((SELECT auth.uid()))
        )
    )
);

-- =====================================================
-- 7.10 POLICIES - PAYMENT_METHODS
-- =====================================================

DROP POLICY IF EXISTS "View payment methods" ON public.payment_methods;
CREATE POLICY "View payment methods"
ON public.payment_methods FOR SELECT
USING (
    ((is_enabled = true) AND (EXISTS (
        SELECT 1 FROM restaurants r
        WHERE r.id = payment_methods.restaurant_id AND r.is_active = true
    ))) 
    OR (EXISTS (
        SELECT 1 FROM restaurants r
        WHERE r.id = payment_methods.restaurant_id 
        AND (
            r.owner_id = (SELECT auth.uid()) 
            OR has_restaurant_permission((SELECT auth.uid()), r.id) 
            OR is_super_admin((SELECT auth.uid()))
        )
    ))
);

DROP POLICY IF EXISTS "Insert payment methods" ON public.payment_methods;
CREATE POLICY "Insert payment methods"
ON public.payment_methods FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM restaurants r
        WHERE r.id = payment_methods.restaurant_id 
        AND (
            r.owner_id = (SELECT auth.uid()) 
            OR has_restaurant_permission((SELECT auth.uid()), r.id) 
            OR is_super_admin((SELECT auth.uid()))
        )
    )
);

DROP POLICY IF EXISTS "Update payment methods" ON public.payment_methods;
CREATE POLICY "Update payment methods"
ON public.payment_methods FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM restaurants r
        WHERE r.id = payment_methods.restaurant_id 
        AND (
            r.owner_id = (SELECT auth.uid()) 
            OR has_restaurant_permission((SELECT auth.uid()), r.id) 
            OR is_super_admin((SELECT auth.uid()))
        )
    )
);

DROP POLICY IF EXISTS "Delete payment methods" ON public.payment_methods;
CREATE POLICY "Delete payment methods"
ON public.payment_methods FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM restaurants r
        WHERE r.id = payment_methods.restaurant_id 
        AND (
            r.owner_id = (SELECT auth.uid()) 
            OR has_restaurant_permission((SELECT auth.uid()), r.id) 
            OR is_super_admin((SELECT auth.uid()))
        )
    )
);

-- =====================================================
-- 7.11 POLICIES - ORDERS
-- =====================================================

DROP POLICY IF EXISTS "View orders" ON public.orders;
CREATE POLICY "View orders"
ON public.orders FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Create orders" ON public.orders;
CREATE POLICY "Create orders"
ON public.orders FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Update orders" ON public.orders;
CREATE POLICY "Update orders"
ON public.orders FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM restaurants r
        WHERE r.id = orders.restaurant_id 
        AND (
            r.owner_id = (SELECT auth.uid()) 
            OR has_restaurant_permission((SELECT auth.uid()), r.id) 
            OR is_super_admin((SELECT auth.uid()))
        )
    )
);

DROP POLICY IF EXISTS "Delete orders" ON public.orders;
CREATE POLICY "Delete orders"
ON public.orders FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM restaurants r
        WHERE r.id = orders.restaurant_id 
        AND (
            r.owner_id = (SELECT auth.uid()) 
            OR has_restaurant_permission((SELECT auth.uid()), r.id) 
            OR is_super_admin((SELECT auth.uid()))
        )
    )
);

-- =====================================================
-- 7.12 POLICIES - ORDER_ITEMS
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;
CREATE POLICY "Anyone can view order items"
ON public.order_items FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Anyone can create order items"
ON public.order_items FOR INSERT
WITH CHECK (true);

-- =====================================================
-- 8. STORAGE BUCKETS
-- =====================================================

-- Criar buckets de storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-logos', 'restaurant-logos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-items', 'menu-items', true)
ON CONFLICT (id) DO NOTHING;

-- Policies para restaurant-logos
DROP POLICY IF EXISTS "Public can view restaurant logos" ON storage.objects;
CREATE POLICY "Public can view restaurant logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-logos');

DROP POLICY IF EXISTS "Authenticated users can upload restaurant logos" ON storage.objects;
CREATE POLICY "Authenticated users can upload restaurant logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'restaurant-logos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update restaurant logos" ON storage.objects;
CREATE POLICY "Authenticated users can update restaurant logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'restaurant-logos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete restaurant logos" ON storage.objects;
CREATE POLICY "Authenticated users can delete restaurant logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'restaurant-logos' AND auth.role() = 'authenticated');

-- Policies para menu-items
DROP POLICY IF EXISTS "Public can view menu item images" ON storage.objects;
CREATE POLICY "Public can view menu item images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-items');

DROP POLICY IF EXISTS "Authenticated users can upload menu item images" ON storage.objects;
CREATE POLICY "Authenticated users can upload menu item images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'menu-items' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update menu item images" ON storage.objects;
CREATE POLICY "Authenticated users can update menu item images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'menu-items' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete menu item images" ON storage.objects;
CREATE POLICY "Authenticated users can delete menu item images"
ON storage.objects FOR DELETE
USING (bucket_id = 'menu-items' AND auth.role() = 'authenticated');

-- =====================================================
-- 9. DADOS INICIAIS
-- =====================================================

-- Inserir configurações iniciais da plataforma
INSERT INTO public.platform_settings (platform_name, support_email)
VALUES ('PratoDigital', 'suporte@pratodigital.cloud')
ON CONFLICT DO NOTHING;

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
