-- Fix the get_all_users_for_admin function to properly cast types
DROP FUNCTION IF EXISTS public.get_all_users_for_admin();

CREATE OR REPLACE FUNCTION public.get_all_users_for_admin()
RETURNS TABLE(id uuid, email text, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  -- Only allow super admins to call this function
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Super admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.email::text,  -- Cast to text to match return type
    u.created_at
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;